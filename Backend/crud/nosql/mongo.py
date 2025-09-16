from pymongo import MongoClient
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from fastapi import APIRouter, Form, HTTPException
from jose import JWTError, jwt
from dotenv import load_dotenv
import json
import re
import os



load_dotenv()

global chat_history
chat_history = []

router = APIRouter()

table_names_prompt = PromptTemplate(
    input_variables=["question", "collection_names"],
    template="""## System Role
You are a MongoDB collection selector specialist. Your sole task is to identify which collection names are relevant to answer a natural language question.

## Input Context
- **Available Collections**: {collection_names}
- **User Question**: {question}

## Task Requirements
1. Analyze the user's question carefully
2. Examine all available collection names
3. Identify which collections would likely contain data relevant to answering the question
4. Return only the names of relevant collections

## Output Specifications

### If question relates to one or more collections:
Return a JSON array containing only the relevant collection names. No explanations, no additional text.

### If question is unrelated to any collections:
Return exactly: []

## Valid Output Format Examples

### Single Collection:
```json
["users"]
```

### Multiple Collections:
```json
["orders", "products", "inventory"]
```

### No Relevant Collections:
```json
[]
```

## Selection Criteria
- Consider semantic relationships between question keywords and collection names
- Include collections that might contain:
  - Direct answers to the question
  - Related data needed for joins or lookups
  - Supporting information for comprehensive answers
- Be inclusive rather than exclusive when relevance is uncertain

## Critical Rules
- Output MUST be valid JSON array format
- Include ONLY collection names that exist in the provided list
- Do NOT include explanations or reasoning
- Do NOT create or suggest new collection names
- If uncertain about relevance, include the collection
- Case-sensitive: use exact collection names as provided

## Response Template
[Generate only the JSON array of collection names here, nothing else]""",
)


query_prompt = PromptTemplate(
    input_variables=["question", "collection_names"],
    template="""## System Role
You are a MongoDB aggregation query generator specialist. Your task is to generate aggregation pipelines that can be executed directly in MongoDB based on the user's question and the relevant collection names.
## Input Context
- **User Question**: {question}
- **Relevant Collections**: {collection_names}

## Task Requirements
1. Analyze the user's question and identify the correct collection(s) to use.
2. Generate a **MongoDB aggregation pipeline** that answers the question.
3. Include any necessary stages:
   - `$match` for filtering
   - `$lookup` for joining other collections
   - `$project` to select specific fields
   - `$unwind` if needed
4. Ensure the pipeline is **runnable directly in MongoDB** (avoid `$filter` on external collections or invalid `$match` expressions).
5. Use only relevant collections from `{collection_names}`.
6. Return all output as a **valid JSON object**.

## Output Specifications
- The output must be a JSON object with the following structure:

```json
{{
    "collection": "{{choose one from relevant_collections}}",
    "query": {{ /* optional $match stage */ }},
    "lookup": [ /* optional $lookup stages */ ],
    "project": {{ /* optional $project stage */ }}
}}```
""",
)


response_prompt = PromptTemplate(
    input_variables=["question", "response"],
    template="""## System Role
You are a professional SQL Agent Response Explainer. Your role is to interpret SQL query results and provide clear, direct answers to user questions.

## Instructions
- Answer the user's question directly using the provided SQL results
- Present information in a natural, conversational manner
- Do not reference this prompt or mention that you're interpreting SQL results
- Focus on the key insights and findings from the data
- Use clear formatting when presenting numerical data or lists
- If the results are empty or null, acknowledge this appropriately
- Provide context and explanation when the data might be unclear

## User Question
{question}

## SQL Query Results
{response}

## Your Response
Based on the data provided, here is the answer to your question:"""
)


model_2 = ChatOpenAI(temperature=0.3, model="gpt-4o")

model_1 = ChatOpenAI(temperature=0.3, model="gpt-4o-mini")

parser = StrOutputParser()

table_names_chain = table_names_prompt | model_1 | parser

query_chain = query_prompt | model_2 | parser

response_chain = response_prompt | model_1 | parser


@router.post("/mongo_pipeline/client")
async def get_mongo_client(
    connection_nickname: str = Form(...),
    db_url: str = Form(...),
    db_name: str = Form(...)
):
    try:
        # Use provided URL or fallback to environment variable
        mongo_url = db_url 
        mongo_db_name = db_name 
        
        client = MongoClient(mongo_url)
        db = client[mongo_db_name]
        collection_names = db.list_collection_names()
        
        return {
            "connection_nickname": connection_nickname,
            "db_url": mongo_url,
            "db_name": mongo_db_name,
            "collection_names": collection_names,
            "status": "connected"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"MongoDB connection failed: {str(e)}")


async def parse_collections_output(output) -> list:
    """Normalize LLM output that lists collection names into a Python list.

    Accepts strings with code fences, raw JSON arrays, bracketed lists like [Users],
    or already a Python list.
    """
    if output is None:
        return []

    # If already a list, return stringified elements
    if isinstance(output, list):
        return [str(x) for x in output]

    s = str(output).strip()

    # Remove triple-backtick code fences and their contents if present
    s = re.sub(r'```[\s\S]*?```', lambda m: m.group(0).replace('`', ''), s)

    # Remove leftover backticks
    s = s.replace('`', '')

    # Try JSON parse
    try:
        parsed = json.loads(s)
        if isinstance(parsed, list):
            return [str(x) for x in parsed]
    except Exception:
        pass

    # Try to extract contents inside first square brackets [ ... ]
    m = re.search(r'\[([^\]]+)\]', s)
    if m:
        inner = m.group(1)
        parts = [p.strip().strip('"\'') for p in inner.split(',') if p.strip()]
        return parts

    # Fallback: split by commas
    parts = [p.strip().strip('"\'') for p in s.split(',') if p.strip()]
    return parts


async def create_mongo_connection(db_url: str, db_name: str):
    """Internal function to create MongoDB connection"""
    try:
        # Use provided URL or fallback to environment variable
        mongo_url = db_url 
        mongo_db_name = db_name

        client = MongoClient(mongo_url)
        db = client[mongo_db_name]
        collection_names = db.list_collection_names()
        return {"client": client, "db": db, "collection_names": collection_names}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"MongoDB connection failed: {str(e)}")


async def get_collection_info(db, collection_names: list):
    schema_map = {}
    for name in collection_names:
        sample_doc = db[name].find_one()
        schema_map[name] = sample_doc if sample_doc else {}
    return schema_map



async def run_mongo_query(connection_nickname: str, db_url: str, db_name: str, question: str):
    workflow = {}
    db_info = await create_mongo_connection(db_url, db_name)
    collection_names = db_info["collection_names"]

    workflow["collection_names"] = collection_names


    # Step 1: Find relevant collections (LLM may return JSON, code fences, or plain text)
    relevant_collections_raw = table_names_chain.invoke(
        {
            "question": question,
            "collection_names": collection_names
        }
    )

    # Step 2: Parse LLM output into a clean list of collection names
    relevant_collections_list = await parse_collections_output(relevant_collections_raw)

    # Step 3: Get schema info for the relevant collections
    relevant_schemas = await get_collection_info(db_info["db"], relevant_collections_list)

    # Step 3: Generate query spec (LLM output)
    query_response = query_chain.invoke(
        {
            "question": question,
            "collection_names": relevant_schemas
        }
    )


    # Step 4: Clean and parse JSON
    cleaned = (
        query_response.replace("```json", "")
        .replace("```", "")
        .strip()
    )
    query_dict = json.loads(cleaned)
    # Step 5: Build aggregation pipeline
    pipeline = []

    if "query" in query_dict and query_dict["query"]:
        q = query_dict["query"]
        if "$match" in q:  # unwrap if LLM wrapped it
            pipeline.append(q)  # already a valid $match stage
        else:
            pipeline.append({"$match": q})

    if "lookup" in query_dict and query_dict["lookup"]:
        for lookup_stage in query_dict["lookup"]:
            pipeline.append({"$lookup": lookup_stage})

    if "project" in query_dict and query_dict["project"]:
        pipeline.append({"$project": query_dict["project"]})

    workflow["aggregation_pipeline"] = pipeline

    # Step 6: Run the aggregation on MongoDB 
    collection_name = query_dict["collection"]
    collection = db_info["db"][collection_name]
    results = list(collection.aggregate(pipeline))
    return {"results": results, "workflow": workflow}


@router.post("/mongo/query")
async def generate_response(
    connection_nickname: str = Form(...),
    db_url: str = Form(...),
    db_name: str = Form(...),
    question: str = Form(...)
):
    try:
        result = await run_mongo_query(connection_nickname, db_url, db_name, question)
        response = response_chain.invoke(
            {
                "question": question,
                "response": result
            }
        )
        return {"response": response, "query_workflow": result["workflow"], "results": str(result["results"])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB query failed: {str(e)}")
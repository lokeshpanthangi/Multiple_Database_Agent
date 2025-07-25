import os
import json
from dotenv import load_dotenv
from typing import List, Dict
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_community.utilities import SQLDatabase
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone.vectorstores import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec

# === LOAD ENV VARIABLES ===
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_INDEX = "table-metadata-index-v2"

# === INITIALIZE MODELS ===
llm = ChatOpenAI(model="gpt-4", temperature=0.2, openai_api_key=OPENAI_API_KEY)
embedding_model = OpenAIEmbeddings(
    model="text-embedding-3-small",
    openai_api_key=OPENAI_API_KEY
)

# === INIT PINECONE ===
pc = Pinecone(api_key=PINECONE_API_KEY)

# Check if index exists, if not create it
if not pc.has_index(PINECONE_INDEX):
    print(f"⚠️ Index '{PINECONE_INDEX}' not found. Please run vectordb_update.py first to create and populate the index.")
    exit(1)

index = pc.Index(PINECONE_INDEX)
vector_store = PineconeVectorStore(index=index, embedding=embedding_model)

# === FUNCTION TO SEARCH TABLES BASED ON USER QUERY ===
def search_relevant_tables(user_query: str, k=10):
    return vector_store.similarity_search(user_query, k=k)

# === FUNCTION TO GENERATE SQL JSON PER DB ===
def generate_sql_json(user_query: str, table_schemas) -> List[Dict]:
    # Handle Document objects from vector search
    formatted_tables = "\n\n".join([
        f"DB: {doc.metadata['db_url']}\n{doc.page_content}"
        for doc in table_schemas
    ])
    prompt = ChatPromptTemplate.from_template(
        """
Given the user's query and the following database schemas, write SQL queries for each relevant DB.

Return your answer as a JSON list with this format:
[
  {{"db_url": "...", "query": "SELECT ...;"}} ,
  ...
]

### USER QUERY:
{query}

### RELEVANT SCHEMAS:
{schemas}
"""
    )
    response = (prompt | llm).invoke({
        "query": user_query,
        "schemas": formatted_tables
    })
    return json.loads(response.content)

# === FUNCTION TO EXECUTE QUERIES ===
def run_queries(query_plan: List[Dict]) -> List[Dict]:
    results = []
    for plan in query_plan:
        try:
            db = SQLDatabase.from_uri(plan["db_url"])
            output = db.run(plan["query"])
            results.append({
                "db_url": plan["db_url"],
                "query": plan["query"],
                "result": output
            })
        except Exception as e:
            results.append({
                "db_url": plan["db_url"],
                "query": plan["query"],
                "result": f"Error: {e}"
            })
    return results

# === FUNCTION TO SUMMARIZE RESULTS ===
def format_final_result(user_query: str, results: List[Dict]) -> str:
    prompt = ChatPromptTemplate.from_template(
        """
Summarize the following results based on the user query:

Query: {query}
Results:
{results}
"""
    )
    return (prompt | llm).invoke({
        "query": user_query,
        "results": json.dumps(results)
    }).content.strip()

# === MAIN LOGIC ===
def run_sql_agent(user_query: str):
    print("\n>> USER QUERY:", user_query)

    try:
        relevant_tables = search_relevant_tables(user_query)
        print(f"\n>> {len(relevant_tables)} RELEVANT TABLES FOUND")
        
        if not relevant_tables:
            print("❌ No relevant tables found for your query. Please try a different query.")
            return

        sql_json = generate_sql_json(user_query, relevant_tables)
        print("\n>> GENERATED SQL JSON:\n", json.dumps(sql_json, indent=2))

        raw_results = run_queries(sql_json)
        print("\n>> RAW RESULTS:\n", json.dumps(raw_results, indent=2))

        final_response = format_final_result(user_query, raw_results)
        print("\n>> FINAL OUTPUT:\n", final_response)
        
    except Exception as e:
        print(f"❌ Error processing query: {e}")
        print("Please ensure the vector database is properly initialized by running vectordb_update.py first.")

if __name__ == "__main__":
    
    try:
        while True:
            query = input("\n🔍 Enter your query (or 'exit'): ")
            if query.lower() in ['exit', 'quit', 'q']:
                print("👋 Goodbye!")
                break
            if query.strip() == "":
                print("⚠️ Please enter a valid query.")
                continue
                
            run_sql_agent(query)
            
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        print("Please check your configuration and try again.")

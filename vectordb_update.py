import os
import json
from dotenv import load_dotenv
from sqlalchemy import text, create_engine, inspect
from langchain_community.utilities import SQLDatabase
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone.vectorstores import PineconeVectorStore
from pinecone import Pinecone, ServerlessSpec

# === LOAD ENV VARIABLES ===
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PINECONE_INDEX = "table-metadata-index-v2"

# === CONFIG ===
DB_URLS = [
    "postgresql://postgres:A7roQuTF6e9ukWAv@db.omlmucbtdwfdcypzddkb.supabase.co:5432/postgres?sslmode=require&connect_timeout=10"
]

# === EMBEDDING MODEL INIT ===
embedding_model = OpenAIEmbeddings(
    openai_api_key=OPENAI_API_KEY,
    model="text-embedding-3-small"
)

# === INIT PINECONE ===
pc = Pinecone(api_key=PINECONE_API_KEY)
if not pc.has_index(PINECONE_INDEX):
    pc.create_index(
        name=PINECONE_INDEX,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
index = pc.Index(PINECONE_INDEX)
vector_store = PineconeVectorStore(index=index, embedding=embedding_model)

# === FETCH ALL TABLE NAMES ===
def fetch_all_table_names(db) -> list:
    query = """
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
    """
    with db._engine.connect() as connection:
        result = connection.execute(text(query))
        return [row[0] for row in result]

# === FETCH COLUMNS FOR A TABLE ===
def fetch_table_columns(engine, table_name) -> list:
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name)
    return [col['name'] for col in columns]

# === GENERATE DESCRIPTION STRING ===
def generate_description(db_name, table_name, columns):
    col_str = ", ".join(columns)
    return f"Table '{table_name}' in database '{db_name}' contains columns: {col_str}."

# === MAIN: EMBED ALL TABLE METADATA ===
def embed_all_tables():
    for db_url in DB_URLS:
        try:
            print(f"🔗 Attempting to connect to database...")
            print(f"   Host: db.omlmucbtdwfdcypzddkb.supabase.co")
            print(f"   User: postgres")
            print(f"   Database: postgres")
            
            db = SQLDatabase.from_uri(db_url)
            engine = create_engine(db_url)
            db_name = db_url.split("@")[-1].split(".")[0]
            print(f"✅ Successfully connected to database!")
            
        except Exception as connection_error:
            print(f"❌ Database connection failed: {connection_error}")
            print("Please verify:")
            print("  - Password is correct")
            print("  - Database is not paused")
            print("  - Network connectivity")
            continue

        try:
            tables = fetch_all_table_names(db)
            for table_name in tables:
                columns = fetch_table_columns(engine, table_name)
                description = generate_description(db_name, table_name, columns)

                metadata = {
                    "table_name": table_name,
                    "columns": columns,
                    "db_name": db_name,
                    "db_url": db_url,
                    "description": description
                }

                content = f"{table_name} ({', '.join(columns)}): {description}"
                vector_store.add_texts([content], metadatas=[metadata])
                print(f"✅ Embedded table: {table_name} from DB: {db_name}")

        except Exception as e:
            print(f"❌ Error processing DB {db_url}: {e}")

# === RUN SCRIPT ===
if __name__ == "__main__":
    print("🔄 Updating vector DB with all table metadata...")
    embed_all_tables()
    print("✅ Vector DB update complete.")

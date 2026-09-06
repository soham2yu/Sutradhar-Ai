import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

# Load environment variables
load_dotenv()

# Use Postgres URL from .env, fallback to SQLite if not provided
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite+aiosqlite:///./sutradhar.db")

# For SQLite we need check_same_thread=False. Postgres does not.
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)

SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

Base = declarative_base()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


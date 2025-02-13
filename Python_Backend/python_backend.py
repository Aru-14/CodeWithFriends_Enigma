from fastapi import FastAPI, WebSocket
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, TIMESTAMP, func
from sqlalchemy.ext.declarative import declarative_base
import asyncio

# MySQL Database Configuration
DATABASE_URL = "mysql+aiomysql://root:Anu14aug@localhost/REAL_TIME_DIGITS"
engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

# Define the Database Model
class NumberRecord(Base):
    __tablename__ = "numbers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    digit = Column(Integer, nullable=False)
    timestamp = Column(TIMESTAMP, server_default=func.now())

# Initialize Database
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# FastAPI App
app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ WebSocket Connected")

    async with SessionLocal() as session:
        while True:
            try:
                data = await websocket.receive_text()  # Receive data from client
                print(f"📥 Received: {data}")

                # Store Data in MySQL
                new_record = NumberRecord(digit=int(data))
                session.add(new_record)
                await session.commit()
                print("✅ Data Stored in MySQL")

                # Send Confirmation to Client
                await websocket.send_text(f"📩 Stored: {data}")

            except Exception as e:
                print("❌ WebSocket Disconnected:", e)
                break

# Run Database Initialization
asyncio.run(init_db())

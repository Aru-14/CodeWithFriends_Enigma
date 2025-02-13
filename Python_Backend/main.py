from fastapi import FastAPI, WebSocket
import uvicorn

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("✅ WebSocket Connected")

    try:
        while True:
            data = await websocket.receive_text()  # Receive data from client
            print(f"📥 Received: {data}")
            await websocket.send_text(f"📩 Server Response: {data}")  # Send back acknowledgment
    except Exception as e:
        print("❌ WebSocket Disconnected:", e)

# Run the server (for local testing)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

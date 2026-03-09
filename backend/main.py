from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio

from services.ai_mock import process_audio_and_generate_response

app = FastAPI(title="Smart Mirror Backend MVP")

# Allow CORS for local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print("New connection established.")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print("Connection closed.")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Smart Mirror Backend API MVP running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    audio_buffer = b""
    try:
        while True:
            # We use receive to handle both text and bytes
            message = await websocket.receive()
            
            if "bytes" in message:
                # Accumulate audio chunks
                audio_buffer += message["bytes"]
                
                # Send immediate acknowledgement on first chunk
                if len(audio_buffer) == len(message["bytes"]):
                    await manager.send_personal_message(
                        json.dumps({"type": "STATUS", "message": "Listening..."}), 
                        websocket
                    )
            
            elif "text" in message:
                # In real scenario, frontend could send a "STOP_RECORDING" text message
                data = message["text"]
                print(f"Received control message: {data}")
            
            # Simple simulation: if we have enough audio, trigger processing.
            # (In a real app, you'd use Voice Activity Detection (VAD) or a STOP message)
            if len(audio_buffer) > 50000: # Arbitrary threshold for MVP meaning 'done speaking'
                await manager.send_personal_message(
                    json.dumps({"type": "STATUS", "message": "Processing..."}), 
                    websocket
                )
                
                # Send the accumulated audio to the AI pipeline
                response_data = await process_audio_and_generate_response(audio_buffer)
                
                # Send the AI response (Text + Widget metadata)
                await manager.send_personal_message(
                     json.dumps({"type": "AI_RESPONSE", "payload": response_data}),
                     websocket
                )
                
                # Reset buffer for next utterance
                audio_buffer = b""
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print("Client disconnected normally.")
    except Exception as e:
        print(f"Error handling websocket: {e}")
        manager.disconnect(websocket)


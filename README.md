# AI Smart Mirror MVP

An AI-powered smart mirror system designed to provide real-time glanceable information (weather, schedule, clock) and interactive voice assistance through a sleek, pure black web interface that blends invisibly behind a two-way mirror.

This repository contains the software MVP, separated into a robust Python/FastAPI backend and a modern Next.js frontend, communicating in real-time via WebSockets.

## Features

- **Pure Kiosk UI**: A Next.js frontend with a zero-margin `#000000` background designed to float seamlessly on a two-way mirror glass.
- **Real-Time Voice Capture**: Uses the browser's `MediaRecorder` API to stream actual microphone bytes directly to the backend.
- **Streaming Pipeline**: A FastAPI WebSocket server that handles incoming audio streams in real-time.
- **AI Integration**: Powered by OpenAI. Transcribes audio using **Whisper**, and generates contextual responses and triggers widgets using **GPT-4o-mini** function calling.
- **Dynamic Widgets**: React components (Clock, Weather, Schedule) that appear smoothly on the mirror based on the user's conversational intent.

---

## 🏗️ Architecture Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Zustand, Lucide Icons.
- **Backend**: Python 3, FastAPI, Uvicorn, WebSockets.
- **AI Services**: OpenAI (Whisper, GPT-4o-mini).

---

## 🚀 Quick Start Guide

You will need two terminal windows to run both the frontend and backend servers simultaneously.

### 1. Backend Setup (FastAPI)

The backend requires Python 3.9+.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your OpenAI API Key
mv .env.example .env
# Edit .env and insert your API key: OPENAI_API_KEY=sk-your-key
```

**Run the Backend Server:**
```bash
uvicorn main:app --reload --port 8000
```
*The WebSocket server will start listening on `ws://localhost:8000/ws`.*

> **No API Key?** If you run without an active `OPENAI_API_KEY`, the backend will gracefully failover to a Mock AI service that returns random simulated responses, so you can still test the UI!

### 2. Frontend Setup (Next.js)

The frontend requires Node.js and `npm`.

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

**Run the Frontend Server:**
```bash
npm run dev
```

### 3. Usage

1. Open a modern browser (preferably Chrome/Edge for microphone support) and navigate to [http://localhost:3000](http://localhost:3000).
2. You should see the sleek clock interface.
3. Click the **Microphone Icon** in the bottom right corner (you may need to grant browser microphone permissions).
4. **Speak your request** (e.g., *"What is the weather like?"* or *"What does my day look like?"*).
5. Click the microphone icon again to stop recording.
6. The AI will process the audio, display your transcribed text as a subtitle, and pop up the corresponding Widget!

---

## 🛣️ Future Roadmap

This software MVP is Phase 1. The next steps for hardware integration include:

1. **Hardware Assembly**: Mounting a high-contrast monitor behind two-way acrylic/glass.
2. **Edge Processing**: Running the Next.js app on a Raspberry Pi 5 in Chromium Kiosk mode.
3. **Local Wake Word**: Replacing the manual UI button with local wake-word detection (e.g., using Porcupine) to trigger recording completely hands-free.
4. **IoT Integrations**: Connecting local MQTT brokers to control physical smart home devices (vanity lights, IoT sensors).

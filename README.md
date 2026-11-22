# CHATBOT – AI-Powered Conversational Assistant

An intelligent AI chatbot designed to provide natural, interactive conversations and helpful responses to user queries. Built using React, FastAPI, Python and Groq LLM APIs, the application offers a clean, ChatGPT-inspired conversational experience.

## 🚀 Features

- **Interactive AI Chat:** Communicate with an AI assistant through natural language.
- **Intelligent Responses:** Generate fast and relevant answers using Groq-powered LLMs.
- **Chat History:** Maintain and manage previous conversations.
- **User-Friendly Interface:** Clean and responsive ChatGPT-inspired design.
- **Real-Time Interaction:** Get AI-generated responses without unnecessary delays.
- **Full-Stack Architecture:** React frontend integrated with a FastAPI backend.
- **Easy Deployment:** Supports Docker-based deployment and cloud hosting.

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite |
| Backend | Python, FastAPI |
| AI Integration | Groq API |
| Language Models | LLMs |
| Styling | CSS |
| Deployment | Docker, Render |

## 📁 Project Structure

```text
CHATBOT/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── config.py
│   │   └── main.py
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── Dockerfile
├── render.yaml
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/haripriya67537/CHATBOT.git
cd CHATBOT
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your Groq API key in the `.env` file.

Start the backend:

```bash
python run.py
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in your terminal to access the chatbot.

## 🔑 Environment Variables

Create a `.env` file in the backend directory:

```env
GROQ_API_KEY=your_api_key_here
```

Get your API key from [Groq Console](https://console.groq.com/).

## 🐳 Docker Deployment

Build the Docker image:

```bash
docker build -t chatbot .
```

Run the application:

```bash
docker run -p 8000:8000 chatbot
```

## 🎯 Project Goal

The goal of this project is to build an intelligent conversational assistant that makes AI-powered interactions simple, accessible and user-friendly through a modern chat interface.

---

**Developed by:** Hari Priya Dwaram
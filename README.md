# node-whisper-haystack-llm

A Node.js integration combining OpenAI's Whisper for speech-to-text, and LLM for intelligent responses at Local with CPU.

## Features

- Summerize youtube video (chrome extension, web app)

## Installation

```
docker compose build
docker compose up -d
```

## Quick Start

- **Speech Recognition**: Convert audio to text using Whisper
- **LLM Integration**: Generate intelligent responses based on retrieved context

## Stack

- **Speech Recognition**
- - Using openai/whisper with https://huggingface.co/ggerganov/whisper.cpp
- - Run docker image onerahmet/openai-whisper-asr-webservice for webservice

- **LLM Integration**
- - llama.cpp server (REST API) — local run with LLM (ghcr.io/ggerganov/llama.cpp:server)
- - Get model from https://huggingface.co/bartowski (Instruct)
- - Model using "Meta-Llama-3.1-8B-Instruct-Q4_K_M"

- **Get youtube**
- - Using yt-dlp ffmpeg lib

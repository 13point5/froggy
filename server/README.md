# Froggy Server

A FastAPI server with WebSocket support for code execution using E2B sandbox.

## Setup

1. Install dependencies:

   ```
   poetry install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the required values.

## Running the Server

Start the FastAPI server:

```
poetry run uvicorn main:app --reload
```

The server will be available at http://localhost:8000.

## Testing the WebSocket Endpoint

There are two ways to test the WebSocket endpoint:

### 1. Simple Test Script

Run the simple test script that sends a predefined code snippet:

```
poetry run python test_websocket.py
```

This will connect to the WebSocket endpoint, send a simple Python code snippet, and display the response.

### 2. Interactive Test Client

For a more interactive experience, use the interactive test client:

```
poetry run python interactive_test.py
```

This client allows you to:

- Enter Python code interactively
- Type `run` on a new line to execute the code
- Type `exit` to quit the client

## API Endpoints

- `GET /`: Simple health check endpoint
- `GET /e2b`: Test endpoint for E2B sandbox
- `WebSocket /ws/code`: WebSocket endpoint for code execution

## WebSocket Protocol

The WebSocket endpoint accepts JSON messages with the following format:

```json
{
  "type": "code_execute",
  "payload": "print('Hello, world!')"
}
```

The response will be a JSON message with the following format:

```json
{
  "status": "success",
  "logs": "Hello, world!\n"
}
```

Or in case of an error:

```json
{
  "status": "error",
  "message": "Error message"
}
```

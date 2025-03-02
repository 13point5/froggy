#!/usr/bin/env python3
import asyncio
import json
import websockets


async def test_request(request):
    # Connect to the WebSocket endpoint
    uri = "ws://localhost:8000/ws/game"

    print("Connecting to WebSocket server...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected successfully!")

            # Send the request as JSON
            print("Sending request...")
            await websocket.send(json.dumps(request))
            print("Request sent successfully!")

            # Receive the response
            print("Waiting for response...")
            response = await websocket.recv()
            response_data = json.loads(response)

            print("\nReceived response:")
            print(response_data)

            # Wait a moment to ensure all messages are processed
            await asyncio.sleep(1)

    except websockets.exceptions.ConnectionClosed as e:
        msg = "\nWebSocket connection closed: "
        print(f"{msg}{e.code} - {e.reason}")
    except Exception as e:
        print(f"\nError occurred: {str(e)}")


if __name__ == "__main__":
    print("Starting WebSocket test client...")
    asyncio.run(
        test_request(
            {
                "type": "user",
                "prompt": "A simple 2d flappy bird",
            }
        )
    )

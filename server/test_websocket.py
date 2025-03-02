#!/usr/bin/env python3
import asyncio
import json
import websockets


async def test_code_execution():
    # Connect to the WebSocket endpoint
    uri = "ws://localhost:8000/ws/code"

    async with websockets.connect(uri) as websocket:
        # Create a code execution request
        request = {
            "type": "code_execute",
            "payload": (
                "print('Hello from WebSocket test!')\n"
                "for i in range(3):\n"
                "    print(f'Count: {i}')"
            ),
        }

        # Send the request as JSON
        await websocket.send(json.dumps(request))
        print(f"Sent request: {request}")

        # Receive and print the response
        response = await websocket.recv()
        print(f"Received response: {json.loads(response)}")


async def test_request(request):
    # Connect to the WebSocket endpoint
    uri = "ws://localhost:8000/ws/code"

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
            print("Status:", response_data.get("status"))
            print("\nGenerated code:")
            print(response_data.get("code"))

            if response_data.get("status") == "success":
                print("\nExecution output:")
                if response_data.get("stdout"):
                    print("Standard output:")
                    print(response_data.get("stdout"))
                if response_data.get("stderr"):
                    print("Standard error:")
                    print(response_data.get("stderr"))
                if response_data.get("files"):
                    print("\nFiles:")
                    for file in response_data.get("files"):
                        print(
                            f"Name: {file.get('name')}, Path: {file.get('path')}"
                        )
            else:
                print("\nError:", response_data.get("message"))

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
                "type": "init_project",
            }
        )
    )

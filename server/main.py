import os
from fastapi import FastAPI, WebSocket
from dotenv import load_dotenv
from e2b_code_interpreter import Sandbox
from llm import generate_game_code, modify_game_code
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()


app = FastAPI()

# Configure CORS
frontend_urls = os.getenv("FRONTEND_URL", "https://froggydev.vercel.app").split(
    ","
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_urls,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.websocket("/ws/game")
async def websocket_game_endpoint(websocket: WebSocket):
    await websocket.accept()

    # Create a sandbox instance
    sandbox = Sandbox(timeout=60 * 30)

    # Keep track of current files and game URL
    current_files = {}
    game_url = None

    try:
        while True:
            # Receive JSON data from the client
            data = await websocket.receive_json()

            try:
                if data["type"] == "user":
                    try:
                        if not current_files:
                            # First message - generate initial files
                            files, response = generate_game_code(data["prompt"])

                            # Upload template files on first message
                            for file_path in os.listdir("template_files"):
                                with open(
                                    f"template_files/{file_path}", "rb"
                                ) as file:
                                    sandbox.files.write(
                                        f"/home/user/{file_path}", file
                                    )

                            # Start the server only on first message
                            sandbox.commands.run(
                                "node server.js",
                                background=True,
                            )

                            # Get and store URL
                            host = sandbox.get_host(3000)
                            game_url = f"https://{host}"
                        else:
                            # Subsequent messages - modify existing files
                            files, response = modify_game_code(
                                data["prompt"], current_files
                            )

                        # Update current files with any modified ones
                        current_files.update(files)

                        # Write all files to sandbox
                        for file_name, file_content in files.items():
                            print(f"file_name: {file_name}")
                            sandbox.files.write(
                                f"/home/user/{file_name}", file_content
                            )

                        # Send success response with stored URL
                        await websocket.send_json(
                            {
                                "status": "success",
                                "url": game_url,
                                "response": response,
                            }
                        )

                        print(f"Code execution completed. URL: {game_url}")

                    except Exception as e:
                        error_msg = f"Error executing code: {str(e)}"
                        print(error_msg)
                        await websocket.send_json(
                            {
                                "status": "error",
                                "message": error_msg,
                            }
                        )
                else:
                    await websocket.send_json(
                        {"status": "error", "message": "Invalid request type"}
                    )
            except Exception as e:
                # Handle validation errors or other exceptions
                await websocket.send_json(
                    {"status": "error", "message": str(e)}
                )
    except Exception as e:
        # Handle WebSocket disconnection or other errors
        print(f"WebSocket error: {str(e)}")

import os
from fastapi import FastAPI, WebSocket
from dotenv import load_dotenv
from e2b_code_interpreter import Sandbox
from llm import generate_game_code
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


@app.get("/e2b")
def e2b_test():
    sbx = Sandbox()  # By default the sandbox is alive for 5 minutes
    execution = sbx.run_code(
        "print('hello world')"
    )  # Execute Python inside the sandbox
    print(execution.logs)

    files = sbx.files.list("/")
    print(files)

    sbx.kill()
    return {"files": files, "logs": execution.logs}


@app.websocket("/ws/game")
async def websocket_game_endpoint(websocket: WebSocket):
    await websocket.accept()

    # Create a sandbox instance
    sandbox = Sandbox(timeout=60 * 10)

    try:
        while True:
            # Receive JSON data from the client
            data = await websocket.receive_json()

            print(f"data: {data}")

            # Parse the data using the Pydantic model
            try:

                if data["type"] == "user":
                    try:
                        files = generate_game_code(data["prompt"])

                        for file_name, file_content in files.items():
                            print(f"file_name: {file_name}")
                            sandbox.files.write(
                                f"/home/user/{file_name}", file_content
                            )

                        # Upload template files
                        for file_path in os.listdir("template_files"):
                            with open(
                                f"template_files/{file_path}", "rb"
                            ) as file:
                                sandbox.files.write(
                                    f"/home/user/{file_path}", file
                                )

                        # List files in /home/user
                        files = sandbox.files.list("/home/user")
                        print(f"files: {files}")

                        sandbox.commands.run(
                            "node server.js",
                            background=True,
                        )

                        host = sandbox.get_host(3000)
                        url = f"https://{host}"

                        # Send both the generated code and execution results
                        await websocket.send_json(
                            {"status": "success", "url": url}
                        )

                        print(f"Code execution completed. URL: {url}")

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
    # finally:
    # Close the sandbox when done
    # sandbox.kill()

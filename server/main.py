from fastapi import FastAPI, WebSocket
from dotenv import load_dotenv
from e2b_code_interpreter import Sandbox
from llm import generate_code
from utils import PROJECT_SETUP_COMMANDS

load_dotenv()


app = FastAPI()


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


@app.websocket("/ws/code")
async def websocket_code_endpoint(websocket: WebSocket):
    await websocket.accept()

    # Create a sandbox instance
    sandbox = Sandbox()

    try:
        while True:
            # Receive JSON data from the client
            data = await websocket.receive_json()

            print(f"data: {data}")

            # Parse the data using the Pydantic model
            try:

                if data["type"] == "init_project":
                    # Execute the code using E2B
                    try:
                        # Execute initial commands and list files
                        command = PROJECT_SETUP_COMMANDS[0]
                        execution = sandbox.run_code(command, language="bash")
                        # print(f"execution: {execution}")

                        files = sandbox.files.list("/")
                        files_dicts = [
                            {
                                "name": item.name,
                                "path": item.path,
                            }
                            for item in files
                        ]

                        stdout = execution.logs.stdout
                        stderr = execution.logs.stderr
                        # Send both the generated code and execution results
                        await websocket.send_json(
                            {
                                "status": "success",
                                "files": files_dicts,
                                "stdout": stdout,
                                "stderr": stderr,
                            }
                        )

                        print(
                            f"Code execution completed. "
                            f"Stdout: {stdout}, Stderr: {stderr}"
                        )

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
    finally:
        # Close the sandbox when done
        sandbox.kill()

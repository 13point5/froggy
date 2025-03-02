from fastapi import FastAPI
from dotenv import load_dotenv
from e2b_code_interpreter import Sandbox

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
    return {"files": files, "logs": execution.logs}

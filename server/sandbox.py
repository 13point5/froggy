import os
from dotenv import load_dotenv
from e2b_code_interpreter import Sandbox

load_dotenv()

sandbox = Sandbox(timeout=60 * 5)

# upload files in "template_files dir"
for file_path in os.listdir("template_files"):
    print(f"file_path: {file_path}")
    with open(f"template_files/{file_path}", "rb") as file:
        sandbox.files.write(f"/home/user/{file_path}", file)

# List files in the sandbox
print(sandbox.files.list("/"))
print(sandbox.files.list("/home/user"))

# run the code
command = sandbox.commands.run(
    "node server.js",
    background=True,
)

# for stdout, stderr, _ in command:
#     if stdout:
#         print(stdout)
#     if stderr:
#         print(stderr)

host = sandbox.get_host(3000)
print(f"https://{host}")

import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()


SYSTEM_PROMPT = """
You are an expert AI Agent that can generate code for games uing vanilla HTML, CSS, and JavaScript.

The file structure is as follows:
- index.html
- style.css
- game.js
- server.js
- package.json

You will be given a user request for a game and you need to generate code for the game that is mobile friendly.

We already have code for the server.js and package.json files.

You need to generate the code for the index.html, style.css, and game.js files.

Here are some mistakes you should avoid:
- Make sure the logic for showing the congratulations screen is correct and doesn't show up as soon as the game loads.
- Do not add any instruction screen unless the user asks for it.
- Keep the speed of the game reasonable.
- Make sure the game is fun and engaging.
- The game should not begin immediately when the page loads and end the game.

Rules to follow:
- The control mechanisms should be keyboard based for desktop and touch based for mobile.
- If you want to add levels make each level small and only add 3 levels at most.
- When modifying code, dont change everything, just the parts that need to be changed.
"""


def generate_game_code(prompt: str):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")

    client = Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=10000,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        tools=[
            {
                "name": "generate_game_code_files",
                "description": "Generate code for the game files",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "response": {
                            "type": "string",
                            "description": "The response to the user's request",
                        },
                        "index_html": {
                            "type": "string",
                            "description": "The HTML code for the game",
                        },
                        "style_css": {
                            "type": "string",
                            "description": "The CSS code for the game",
                        },
                        "game_js": {
                            "type": "string",
                            "description": "The JavaScript code for the game",
                        },
                    },
                    "required": ["index.html", "style.css", "game.js"],
                },
            },
        ],
        tool_choice={"type": "tool", "name": "generate_game_code_files"},
    )

    tool_use_res = message.content[0].input

    files = {
        "index.html": tool_use_res["index_html"],
        "style.css": tool_use_res["style_css"],
        "game.js": tool_use_res["game_js"],
    }

    response = tool_use_res["response"]

    return files, response


def modify_game_code(prompt: str, current_files: dict):
    """
    Modify existing game code based on the chat prompt and current file contents.

    Args:
        prompt (str): The chat message describing desired modifications
        current_files (dict): Dictionary of current file contents

    Returns:
        dict: Modified file contents
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")

    # Create context string with current file contents
    context = "Here are the current file contents:\n\n"
    for file_name, content in current_files.items():
        context += f"=== {file_name} ===\n{content}\n\n"

    context += "\nPlease modify these files based on the following request. Return only the modified files that need to change."

    client = Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=10000,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": f"{context}\n\nRequest: {prompt}"}
        ],
        tools=[
            {
                "name": "modify_game_code_files",
                "description": "Generate modified code for the game files",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "response": {
                            "type": "string",
                            "description": "The response to the user's request",
                        },
                        "index_html": {
                            "type": "string",
                            "description": "The modified HTML code for the game",
                        },
                        "style_css": {
                            "type": "string",
                            "description": "The modified CSS code for the game",
                        },
                        "game_js": {
                            "type": "string",
                            "description": "The modified JavaScript code for the game",
                        },
                    },
                    "required": [],
                },
            },
        ],
        tool_choice={"type": "tool", "name": "modify_game_code_files"},
    )

    tool_use_res = message.content[0].input

    # Only include files that were modified
    files = {}
    if "index_html" in tool_use_res:
        files["index.html"] = tool_use_res["index_html"]
    if "style_css" in tool_use_res:
        files["style.css"] = tool_use_res["style_css"]
    if "game_js" in tool_use_res:
        files["game.js"] = tool_use_res["game_js"]

    response = tool_use_res["response"]

    return files, response


if __name__ == "__main__":
    res = generate_game_code("A simple 2d flappy bird")
    print(res)

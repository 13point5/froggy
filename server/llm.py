import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()


def generate_code(prompt: str) -> str:
    """
    Generate code using Anthropic's Claude API based on the given prompt.

    Args:
                                                                    prompt (str): The prompt describing the code to generate

    Returns:
                                                                    str: The generated code

    Raises:
                                                                    ValueError: If ANTHROPIC_API_KEY is not set
                                                                    Exception: For any API errors
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable is not set")

    client = Anthropic(api_key=api_key)

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-latest",
            max_tokens=4096,
            temperature=0,
            system=(
                "You are an expert programmer. Generate only the code "
                "requested, without any explanation or markdown formatting."
            ),
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Generate code for the following request: {prompt}"
                    ),
                }
            ],
        )
        return message.content[0].text
    except Exception as e:
        raise Exception(f"Error generating code: {str(e)}")


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

    return files


if __name__ == "__main__":
    res = generate_game_code("A simple 2d flappy bird")
    print(res)

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

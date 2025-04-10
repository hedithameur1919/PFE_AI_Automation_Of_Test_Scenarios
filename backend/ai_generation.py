import requests

# OpenRouter API configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_API_KEY = "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"  # Replace with your actual key

def generate_gherkin_scenario(requirement: str) -> str:
    """Generate a Gherkin test scenario using OpenRouter API."""
    
    prompt = f"Give me a Gherkin test scenario for the following requirement. Only provide the Gherkin scenario, nothing else.\n\nRequirement: {requirement}"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek/deepseek-r1:free",  # Change this to the correct model you're using
        "messages": [
            {"role": "system", "content": "You are an AI that generates Gherkin test scenarios."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload)
        response_data = response.json()

        # Check if response contains valid choices
        if "choices" in response_data and response_data["choices"]:
            return response_data["choices"][0]["message"]["content"].strip()
        else:
            return "Error: No valid response from AI."

    except Exception as e:
        return f"Error occurred: {str(e)}"

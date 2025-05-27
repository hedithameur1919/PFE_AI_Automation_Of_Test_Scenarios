'''
(old vi api)
and now new with llama.cpp'''

import requests

# OpenRouter API configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_API_KEY = "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"  # Replace with your actual key

def generate_gherkin_scenario(requirement: str, type: str = "positive") -> str:
    """Generate a Gherkin test scenario using OpenRouter API."""
    
    scenario_type_text = "a positive test case" if type == "positive" else "a negative test case"
    prompt = f"Generate {scenario_type_text} in Gherkin syntax for the following requirement. Only provide the Gherkin scenario, nothing else.\n\nRequirement: {requirement}"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek/deepseek-r1:free",
        "messages": [
            {"role": "system", "content": "You are an AI that generates Gherkin test scenarios."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload)
        response_data = response.json()

        if "choices" in response_data and response_data["choices"]:
            return response_data["choices"][0]["message"]["content"].strip()
        else:
            return "Error: No valid response from AI."

    except Exception as e:
        return f"Error occurred: {str(e)}"

        
'''from llama_cpp import Llama

llm = Llama(model_path="models/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf")

response = llm.create_chat_completion(
    messages=[
        {"role": "user", "content": "What is FastAPI?"}
    ]
)

print(response.choices[0].message["content"])'''




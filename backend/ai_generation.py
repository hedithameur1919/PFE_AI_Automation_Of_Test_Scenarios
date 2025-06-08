import requests

# OpenRouter API configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_API_KEY = "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"  # Replace with your actual key


#English a logic 
# Basic keyword blacklist to detect inappropriate content
BANNED_KEYWORDS = ['stupid', 'dumb', 'lazy', 'racist', 'sexist', 'nazi', 'hate', 'kill']

def contains_offensive_language(text: str) -> bool:
    """ Check for offensive or biased content using a simple keyword blacklist. """
    text_lower = text.lower()
    return any(bad_word in text_lower for bad_word in BANNED_KEYWORDS)

def is_valid_gherkin_structure(text: str) -> bool:
    """ Check if the text starts with 'Scenario:' and contains Given, When, Then. """
    return text.strip().lower().startswith("scenario:") and \
        "Given" in text and "When" in text and "Then" in text

def generate_gherkin_scenario(requirement: str, type: str = "positive") -> str:
    """ Generate a Gherkin test scenario using OpenRouter API with enhanced validation and formatting.  """

    if not requirement.strip():
        return "Error: Requirement cannot be empty."

    scenario_type_text = "a positive test case" if type == "positive" else "a negative test case"
    prompt = (
        f"Generate {scenario_type_text} in Gherkin syntax for the following requirement. "
        f"Respond only in English. Output must start with 'Scenario:' and contain one test case with Given, When, Then steps. "
        f"Only provide the Gherkin scenario. Do not include explanations or formatting outside the scenario.\n\n"
        f"Requirement: {requirement}"
    )

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek/deepseek-r1:free",
        "messages": [
            {
                "role": "system",
                "content": "You are an AI that generates Gherkin test scenarios. "
                            "Always respond in English. Always start with 'Scenario:' and include Given, When, Then steps. "
                            "Use single quotes (' ') instead of double quotes (\" \")."
            },
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload)
        response_data = response.json()

        if "choices" in response_data and response_data["choices"]:
            raw_output = response_data["choices"][0]["message"]["content"].strip()
            clean_output = raw_output.replace('"', "'")

            if not is_valid_gherkin_structure(clean_output):
                return "Error: Generated scenario does not follow Gherkin structure (Scenario:, Given, When, Then)."

            if contains_offensive_language(clean_output):
                return "Error: Generated content may contain inappropriate or biased language."

            return clean_output

        else:
            return "Error: No valid response from AI."

    except Exception as e:
        return f"Error occurred: {str(e)}" 
        

""" def generate_gherkin_scenario(requirement: str, type: str = "positive") -> str:
    Generate a Gherkin test scenario in French using OpenRouter API.

    if not requirement.strip():
        return "Erreur : La spécification ne peut pas être vide."

    scenario_type_text = "un cas de test positif" if type == "positive" else "un cas de test négatif"

    prompt = (
    f"Génère {scenario_type_text} en syntaxe Gherkin pour l'exigence suivante. "
    f"La sortie doit être uniquement en français. Fournis uniquement le scénario Gherkin sans aucune explication. "
    f"N'utilise que des guillemets simples (' ') au lieu des guillemets doubles (\" \"). "
    f"Donne un seul scénario. "
    f"Assure-toi que le scénario utilise les mots suivants : 'Scénario', 'Étant donné que', 'Lorsque', 'Alors'.\n\n"
    f"Exigence : {requirement}"
    )


    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek/deepseek-r1:free",
        "messages": [
            {
                "role": "system",
                "content": "Tu es une IA spécialisée dans la génération de scénarios de test Gherkin. "
                            "Réponds toujours en français. N'utilise que des guillemets simples (' '). "
                            "Ne fournis qu'un seul scénario clair sans explication supplémentaire."
            },
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload)
        response_data = response.json()

        if "choices" in response_data and response_data["choices"]:
            raw_output = response_data["choices"][0]["message"]["content"].strip()
            clean_output = raw_output.replace('"', "'")
            return clean_output
        else:
            return "Erreur : Aucune réponse valide reçue de l'IA."

    except Exception as e:
        return f"Erreur lors de la génération : {str(e)}" """
# squash_api.py

import requests

SQUASH_API_BASE_URL = "http://localhost:8081/api/rest/latest"
SQUASH_USERNAME = "admin"
SQUASH_PASSWORD = "admin"

def create_test_case(test_case_data):
    url = f"{SQUASH_API_BASE_URL}/test-cases"
    auth = (SQUASH_USERNAME, SQUASH_PASSWORD)

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    response = requests.post(url, json=test_case_data, auth=auth, headers=headers)

    if response.status_code == 201:
        return response.json()
    else:
        print("Erreur Squash:", response.status_code, response.text)
        return None

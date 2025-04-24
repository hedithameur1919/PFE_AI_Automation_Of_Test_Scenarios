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
    
'''
@app.post("/add-to-squash")
def add_test_case_to_squash(payload: TestCasePayload):
    test_case_data = {
        "_type": "test-case",
        "name": payload.name,
        "parent": {
            "_type": "project",
            "id": payload.parent_id
        },
        "importance": "MEDIUM",
        "status": "UNDER_REVIEW",
        "nature": { "code": "NAT_FUNCTIONAL_TESTING" },
        "type": { "code": "TYP_COMPLIANCE_TESTING" },
        "prerequisite": "",
        "description": payload.name,
        "steps": [step.dict() for step in payload.steps]
    }

    response = create_test_case(test_case_data)

    if response is None:
        raise HTTPException(status_code=500, detail="Échec de la création du test case dans Squash")

    return { "message": "Test case ajouté à Squash avec succès", "data": response }


# Function to fetch project by ID
@app.get("/get-project/{project_id}")
def get_project(project_id: int):
    project_url = f"{SQUASH_API_BASE_URL}/{project_id}"

    # Send GET request to Squash API using requests
    response = requests.get(project_url)

    if response.status_code != 200:
        # If the response code is not 200, raise an HTTPException
        raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch project {project_id}")

    # Return the project details
    return response.json()

import requests

def test_squash_connection():
    response = requests.get('http://localhost:8081/api/rest/latest/projects')
    if response.status_code == 200:
        print("Connection to Squash is successful.")
    else:
        print(f"Failed to connect to Squash. Status code: {response.status_code}")

test_squash_connection()
'''

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import logging
import secrets
from pydantic import BaseModel
from database import engine, SessionLocal
from models import Base, User
from passlib.context import CryptContext
import jwt
import datetime
from fastapi.security import OAuth2PasswordBearer
from ai_generation import generate_gherkin_scenario  # Import the function
from squash_api import create_test_case
import requests
SQUASH_API_BASE_URL = "http://localhost:8081/api/rest/latest/projects"
SQUASH_USERNAME = "admin"
SQUASH_PASSWORD = "admin"

# Initialize FastAPI app
app = FastAPI(title="Auth API", version="2.0")

# Allow CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("uvicorn")

class Step(BaseModel):
    _type: str
    action: str
    expected_result: str

class TestCasePayload(BaseModel):
    name: str
    parent_id: int
    steps: list[Step]


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



# Generate a random SECRET_KEY for JWT
SECRET_KEY = "your_secret_key_here"  # Replace with an actual secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Create database tables
Base.metadata.create_all(bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class TestScenarioRequest(BaseModel):
    requirement: str

class TestScenarioResponse(BaseModel):
    gherkin_scenario: str

# User authentication
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: int):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=expires_delta)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ✅ User Registration
@app.post("/register")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed_password = hash_password(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    return {"message": "User registered successfully"}

# ✅ User Login & Token Generation
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.username}, ACCESS_TOKEN_EXPIRE_MINUTES)
    return {"access_token": token, "token_type": "bearer"}

# ✅ Protected Route (Only for Authenticated Users)
@app.get("/protected-route")
def protected_route(current_user: User = Depends(get_current_user)):
    return {"message": f"Hello {current_user.username}, you're authorized!"}

# ✅ AI-Generated Gherkin Test Scenario Route
@app.post("/generate-test-scenario/", response_model=TestScenarioResponse)
def generate_test_scenario(request: TestScenarioRequest):
    scenario = generate_gherkin_scenario(request.requirement)
    if scenario.startswith("Error"):
        raise HTTPException(status_code=500, detail=scenario)
    return {"gherkin_scenario": scenario}

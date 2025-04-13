from fastapi import FastAPI, HTTPException, Depends, status, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import models
from database import SessionLocal
from ai_generation import generate_gherkin_scenario
#from squash_api import create_test_case
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
SECRET_KEY = "6c3fd78f765d0a5002e323b0fa5f8e7ee31328031bb5f1afd31ed3b4f5b92858"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Your Gmail credentials
GMAIL_USER = "hedithameur1919@gmail.com"
GMAIL_APP_PASSWORD = "eelvkasudqcybckc"

# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Helper Functions ----------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password, password):
    return pwd_context.verify(plain_password, password)

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(models.User).filter(models.User.username == username).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------- Pydantic Models ----------------
class UserLogin(BaseModel):
    email: EmailStr
    username: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class TestScenarioRequest(BaseModel):
    requirement: str

class TestScenarioResponse(BaseModel):
    gherkin_scenario: str


# ---------------- Auth Logic ----------------
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.email == user.email,
        models.User.username == user.username
    ).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.username}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": token, "token_type": "bearer", "role": db_user.role}


@app.get("/admin/dashboard")
def admin_dashboard(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return {"message": f"Welcome to the Admin Dashboard, {current_user.username}"}


@app.get("/user/dashboard")
def user_dashboard(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="User access only")
    return {"message": f"Welcome to the User Dashboard, {current_user.username}"}


# ---------------- Forgot/Reset Password ----------------

def send_password_reset_email(to_email: str, reset_link: str):
    try:
        # Create the email content
        message = MIMEMultipart()
        message["From"] = GMAIL_USER
        message["To"] = to_email
        message["Subject"] = "Password Reset Request"

        body = f"Please click the link below to reset your password:\n\n{reset_link}"
        message.attach(MIMEText(body, "plain"))

        # Connect to Gmail SMTP server
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()  # Secure the connection
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, to_email, message.as_string())
        server.quit()

        logging.info(f"Password reset email sent to {to_email}")
        
    except Exception as e:
        logging.error(f"Failed to send password reset email: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email")


@app.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered")

    reset_token = create_access_token({"sub": user.username}, timedelta(minutes=15))

    # Password reset link (use your actual production domain, not localhost)
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"

    # Send the email with the reset link using background task
    background_tasks.add_task(send_password_reset_email, user.email, reset_link)

    return {"message": "Password reset link has been sent to your email"}



@app.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    if request.new_password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user = db.query(models.User).filter(models.User.username == username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.password = hash_password(request.new_password)
        db.commit()
        return {"message": "Password has been reset successfully"}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Reset link expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid reset token")


# ---------------- AI Test Scenario ----------------
@app.post("/generate-test-scenario", response_model=TestScenarioResponse)
def generate_test_scenario(request: TestScenarioRequest):
    scenario = generate_gherkin_scenario(request.requirement)
    if scenario.startswith("Error"):
        raise HTTPException(status_code=500, detail=scenario)
    return {"gherkin_scenario": scenario}


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


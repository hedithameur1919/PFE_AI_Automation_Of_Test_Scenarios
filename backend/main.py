from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, HTTPBasic, HTTPBasicCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from jose import JWTError, jwt
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import models
from models import Requirement, TestScenario, Rating, User
from database import SessionLocal
from ai_generation import generate_gherkin_scenario
from typing import List, Optional
from requests.auth import HTTPBasicAuth
import requests



# ---------------- FastAPI App Setup ----------------
app = FastAPI()
security = HTTPBasic()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Constants ----------------
SECRET_KEY = "6c3fd78f765d0a5002e323b0fa5f8e7ee31328031bb5f1afd31ed3b4f5b92858"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Squash url
SQUASH_BASE_URL = "http://localhost:8081/squash/api/rest/latest"


# Gmail credentials
GMAIL_USER = "hedithameur1919@gmail.com"
GMAIL_APP_PASSWORD = "eelvkasudqcybckc"

# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
#------- Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ---------------- Pydantic Models ----------------
class UserLogin(BaseModel):
    email: EmailStr
    username: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    username: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class TestScenarioRequest(BaseModel):
    requirement: str

class TestScenarioResponse(BaseModel):
    gherkin_scenario: str
    
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: str 

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    role: str
    
class RequirementRequest(BaseModel):
    requirement_text: str
    
class ScenarioRequest(BaseModel):
    requirement_id: int
    scenario_text: str

class RatingRequest(BaseModel):
    scenario_id: int
    rating: int
    
class RequirementResponse(BaseModel):
    id: int
    user_id: int
    requirement_text: str
    
    class Config:
        from_attributes = True


# ---------------- Get the current user's informations ----------------
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user

    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------------- Authentication Endpoints ----------------
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(
        User.email == user.email,
        User.username == user.username
    ).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.username}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": token, "token_type": "bearer", "role": db_user.role}

@app.get("/admin/dashboard")
def admin_dashboard(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return {"message": f"Welcome to the Admin Dashboard, {current_user.username}"}

@app.get("/user/dashboard")
def user_dashboard(current_user: User = Depends(get_current_user)):
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="User access only")
    return {"message": f"Welcome to the User Dashboard, {current_user.username}"}

# ---------------- Password Reset ----------------
def send_password_reset_email(to_email: str, reset_link: str):
    try:
        message = MIMEMultipart()
        message["From"] = GMAIL_USER
        message["To"] = to_email
        message["Subject"] = "Password Reset Request"
        body = f"Please click the link below to reset your password:\n\n{reset_link}"
        message.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, to_email, message.as_string())
        server.quit()

        logging.info(f"Password reset email sent to {to_email}")

    except Exception as e:
        logging.error(f"Failed to send password reset email: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email")

@app.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == request.email,
        User.username == request.username
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found with this email and username")

    reset_token = create_access_token({"sub": user.username}, timedelta(minutes=15))
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    background_tasks.add_task(send_password_reset_email, user.email, reset_link)

    return {"message": "Password reset link has been sent to your email"}

@app.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    if request.new_password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        user = db.query(User).filter(User.username == username).first()
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
'''
thi function is without the type of scenario positve/negative
@app.post("/generate-test-scenario", response_model=TestScenarioResponse)
def generate_test_scenario(request: TestScenarioRequest):
    scenario = generate_gherkin_scenario(request.requirement)
    if scenario.startswith("Error"):
        raise HTTPException(status_code=500, detail=scenario)
    return {"gherkin_scenario": scenario}'''

@app.post("/generate-test-scenario/")
def generate_test_scenario(requirement: str = Body(...), type: str = Body("positive")):
    scenario = generate_gherkin_scenario(requirement, type)
    if scenario.startswith("Error"):
        raise HTTPException(status_code=500, detail=scenario)
    return {"gherkin_scenario": scenario}

# -----------Squash Part -----------
@app.post("/squash/login")
def login_squash(credentials: HTTPBasicCredentials = Depends(security)):
    try:
        response = requests.get(
            f"{SQUASH_BASE_URL}/projects?page=0&size=1",
            auth=HTTPBasicAuth(credentials.username, credentials.password),
            timeout=5
        )
        if response.status_code == 200:
            return {"message": "Login successful"}
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except requests.RequestException:
        raise HTTPException(status_code=500, detail="Error connecting to Squash TM")

@app.post("/squash/projects")
def get_squash_projects(credentials: HTTPBasicCredentials = Depends(security)):
    try:
        response = requests.get(
            f"{SQUASH_BASE_URL}/projects?page=0&size=20",
            auth=HTTPBasicAuth(credentials.username, credentials.password),
            timeout=5
        )
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Unauthorized")

        data = response.json()
        projects = data.get("_embedded", {}).get("projects", [])
        return [{"id": p["id"], "name": p["name"]} for p in projects]

    except requests.RequestException:
        raise HTTPException(status_code=500, detail="Error retrieving projects from Squash TM")

# ---------------- Requirement, Test scenarios and ratings in the frontend by the user ----------------

@app.post("/requirements/")
def create_requirement(req: RequirementRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    requirement = Requirement(requirement_text=req.requirement_text, user_id=current_user.id)
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return {"requirement_id": requirement.id}


@app.post("/test-scenarios/")
def create_scenario(req: ScenarioRequest, db: Session = Depends(get_db)):
    scenario = TestScenario(
        requirement_id=req.requirement_id,
        scenario_text=req.scenario_text
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return {"scenario_id": scenario.id, "scenario_text": scenario.scenario_text}


@app.post("/ratings/")
def create_rating(req: RatingRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if req.rating not in [1, 2, 3, 4, 5]:
        raise HTTPException(status_code=400, detail="Invalid rating value")

    existing_rating = db.query(Rating).filter(Rating.scenario_id == req.scenario_id).first()
    if existing_rating:
        raise HTTPException(status_code=400, detail="Rating already exists for this scenario")

    new_rating = Rating(user_id=current_user.id, scenario_id=req.scenario_id, rating=req.rating)
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)
    return {"rating_id": new_rating.id}




# ---------------- Admin Stats ----------------
@app.get("/admin/stats")
def get_admin_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    user_count = db.query(User).count()
    scenario_count = db.query(models.TestScenario).count()
    requirement_count = db.query(models.Requirement).count()
    rating_count = db.query(models.Rating).count()
    avg_rating = db.query(func.avg(models.Rating.rating)).scalar() or 0.0
    avg_rating = round(avg_rating, 2)

    return {
        "users": user_count,
        "scenarios": scenario_count,
        "requirements": requirement_count,
        "ratings": rating_count,
        "average_rating": avg_rating
    } 


# ---------------- Manage Users in the admin ----------------
@app.get("/admin/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    users = db.query(User).all()
    return users

@app.post("/admin/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    hashed_password = hash_password(user.password)
    new_user = User(
        email=user.email,
        username=user.username,
        password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.put("/admin/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.email is not None:
        user.email = user_update.email
    if user_update.username is not None:
        user.username = user_update.username
    if user_update.password is not None:
        user.password = hash_password(user_update.password)
    if user_update.role is not None:
        user.role = user_update.role

    db.commit()
    db.refresh(user)
    return user


@app.delete("/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# ---------------- Manage Test Requirements in the admin ----------------

@app.get("/admin/requirements", response_model=List[RequirementResponse])
def get_requirements(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    requirements = db.query(Requirement).all()
    return requirements

@app.delete("/admin/requirements/{requirement_id}")
def delete_requirement(requirement_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    requirement = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not requirement:
        raise HTTPException(status_code=404, detail="Requirement not found")

    db.delete(requirement)
    db.commit()
    return {"message": "Requirement deleted successfully"}

# ---------------- Manage Test Scenarios in the admin ----------------

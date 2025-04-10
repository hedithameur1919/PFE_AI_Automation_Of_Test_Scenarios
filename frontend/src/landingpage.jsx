import { useNavigate } from "react-router-dom";
import "./LandingPage.css"; // Import LandingPage.css

function LandingPage() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="landing-container">
      <h1>Welcome to AI Automation in Squash</h1>
      <div className="button-group">
        <button onClick={handleSignIn} className="landing-button">Sign In</button>
        <button onClick={handleSignUp} className="landing-button">Sign Up</button>
      </div>
    </div>
  );
}

export default LandingPage;
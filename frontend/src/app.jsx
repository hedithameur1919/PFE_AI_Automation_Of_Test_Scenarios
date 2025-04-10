import { useState, useEffect } from "react"; 
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import './global.css';
import ProtectedRoute from "./protectedroute";
import Login from "./login";
import SignUp from "./signup";
import LandingPage from "./landingpage"; // Import LandingPage

function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/landing");
  };

  const generateScenario = async () => {
    if (!input.trim()) {
      alert("Please enter a requirement first!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/generate-test-scenario/", {
        requirement: input
      });

      let generatedScenario = response.data.gherkin_scenario || "No scenario generated.";

      // Remove any triple backticks to clean up formatting
      generatedScenario = generatedScenario.replace(/```gherkin|```/g, "").trim();

      setOutput(generatedScenario);
    } catch (error) {
      console.error("Generation error:", error);
      alert("Error generating scenario!");
    }
    setLoading(false);
  };

  // EXPORT FUNCTIONS

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(`Requirement,Generated Scenario\n"${input}","${output}"`);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "generated_scenario.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToTXT = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "generated_scenario.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Requirement:\n${input}\n\nGenerated Scenario:\n${output}`, 10, 10);
    doc.save("generated_scenario.pdf");
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <h1>AI Automation in Squash</h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </nav>

      <div className="main-content">
        <div className="input-section">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your requirement here..."
            className="text-area"
          />
        </div>

        <div className="generate-section">
          <button onClick={generateScenario} disabled={loading} className="generate-button">
            {loading ? "Generating..." : "Generate ➡️"}
          </button>
        </div>

        <div className="output-section">
          <pre className="output-area">{output || "Generated scenarios will appear here..."}</pre>
        </div>

        {output && (
          <div className="export-buttons">
            <button onClick={exportToCSV}>Export CSV</button>
            <button onClick={exportToTXT}>Export TXT</button>
            <button onClick={exportToPDF}>Export PDF</button>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={isAuthenticated ? <ProtectedRoute><Home /></ProtectedRoute> : <Navigate to="/landing" />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/landing" />} />
      </Routes>
    </Router>
  );
}

export default App;

import { useState, useEffect } from "react"; 
import {BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Button, TextareaAutosize, Typography, Box } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ProtectedRoute from "./protectedroute";
import Login from "./login";
import LandingPage from "./landingpage"; 
import ForgotPassword from "./forgotpassword";
import ResetPassword from "./resetpassword"; 
import { jsPDF } from "jspdf";
import axios from 'axios';
import { translateToFrench } from "./translate";


// Define custom MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#007bff", // Blue
    },
    secondary: {
      main: "#6c757d", // Grey
    },
    background: {
      default: "#f8f9fa", // Light Background
    },
    text: {
      primary: "#212529", // Dark text
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [translatedOutput, setTranslatedOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
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
        requirement: input,
      });

      let generatedScenario = response.data.gherkin_scenario || "No scenario generated.";
      generatedScenario = generatedScenario.replace(/```gherkin|```/g, "").trim();

      setOutput(generatedScenario);
      setTranslatedOutput(""); // reset translated version on new generation
    } catch (error) {
      console.error("Generation error:", error);
      alert("Error generating scenario!");
    }
    setLoading(false);
  };

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const translated = await translateToFrench(output);
      setTranslatedOutput(translated);
    } catch (error) {
      console.error("Error translating scenario!", error);
    }
    setTranslating(false);
  };

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
    <Box sx={{ maxWidth: 900, margin: "50px auto", padding: 2, background: "white", borderRadius: 2, boxShadow: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 2, backgroundColor: theme.palette.primary.main, color: "white", borderRadius: 1 }}>
        <Typography variant="h5">AI Automation in Squash</Typography>
        <Button variant="outlined" sx={{ color: theme.palette.primary.main }} onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Box sx={{ marginTop: 2 }}>
        <TextareaAutosize
          minRows={4}
          placeholder="Enter your requirement here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: "100%", padding: "10px", border: "1px solid #ced4da", borderRadius: "5px", fontSize: "18px" }}
        />
        <Button variant="contained" sx={{ width: "100%", marginTop: 2 }} onClick={generateScenario} disabled={loading}>
          {loading ? "Generating..." : "Generate ➡️"}
        </Button>

        <Box sx={{ backgroundColor: "white", borderRadius: 1, padding: 2, boxShadow: 2, minHeight: "100px", marginTop: 2 }}>
          <pre style={{ fontFamily: "monospace", fontSize: "18px" }}>{output || "Generated scenarios will appear here..."}</pre>
        </Box>

        {output && (
          <Box sx={{ textAlign: "center", marginTop: 2 }}>
            <Button variant="contained" sx={{ marginRight: 1 }} onClick={exportToCSV}>Export CSV</Button>
            <Button variant="contained" sx={{ marginRight: 1 }} onClick={exportToTXT}>Export TXT</Button>
            <Button variant="contained" sx={{ marginRight: 1 }} onClick={exportToPDF}>Export PDF</Button>
            <Button variant="contained" color="secondary" onClick={handleTranslate} disabled={translating}>
              {translating ? "Translating..." : "Translate to French 🇫🇷"}
            </Button>
          </Box>
        )}

        {translatedOutput && (
          <Box sx={{ backgroundColor: "#f1f1f1", borderRadius: 1, padding: 2, boxShadow: 1, minHeight: "100px", marginTop: 2 }}>
            <Typography variant="h6">Translated Scenario (French):</Typography>
            <pre style={{ fontFamily: "monospace", fontSize: "18px" }}>{translatedOutput}</pre>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={isAuthenticated ? <ProtectedRoute><Home /></ProtectedRoute> : <Navigate to="/landing" />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/landing" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

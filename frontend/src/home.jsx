import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextareaAutosize,
  Typography,
  Box,
  Container,
  AppBar,
  Toolbar,
  CssBaseline,
  Paper,
  Grid,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { jsPDF } from "jspdf";
import axios from "axios";
import { translateToFrench } from "./translate";
import LogoutIcon from "@mui/icons-material/Logout";
import DownloadIcon from "@mui/icons-material/Download";
import TranslateIcon from "@mui/icons-material/Translate";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StarIcon from "@mui/icons-material/Star";

function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [translatedOutput, setTranslatedOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [scenarioId, setScenarioId] = useState(null);
  const [ratingValue, setRatingValue] = useState("");
  const [squashUsername, setSquashUsername] = useState("");
  const [squashPassword, setSquashPassword] = useState("");
  const [squashProjects, setSquashProjects] = useState([]);
  const [showSquashSection, setShowSquashSection] = useState(false);
  const [loadingSquash, setLoadingSquash] = useState(false);
  const [scenarioType, setScenarioType] = useState("positive");


  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const axiosInstance = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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
      const reqResponse = await axiosInstance.post("/requirements/", {
        requirement_text: input,
      });
      const newRequirementId = reqResponse.data.requirement_id;

      const scenarioResponse = await axios.post("http://localhost:8000/generate-test-scenario/", {
        requirement: input,
        type: scenarioType,
      });

      let generatedScenario = scenarioResponse.data.gherkin_scenario || "No scenario generated.";
      generatedScenario = generatedScenario.replace(/```gherkin|```/g, "").trim();

      setOutput(generatedScenario);
      setTranslatedOutput("");

      const saveScenarioResponse = await axiosInstance.post("/test-scenarios/", {
        requirement_id: newRequirementId,
        scenario_text: generatedScenario,
      });

      setScenarioId(saveScenarioResponse.data.scenario_id);
    } catch (error) {
      console.error("Generation error:", error);
      alert("Error generating scenario!");
    }
    setLoading(false);
  };
  //squash 
  const handleSquashIntegration = async () => {
    if (!squashUsername || !squashPassword) {
      alert("Please enter Squash TM credentials");
      return;
    }

    setLoadingSquash(true);
    try {
      // First: Login check
      const loginRes = await axios.post("http://localhost:8000/squash/login", {}, {
        auth: {
          username: squashUsername,
          password: squashPassword,
        },
      });

      if (loginRes.data.message === "Login successful") {
        // Second: Fetch projects
        const projectsRes = await axios.post("http://localhost:8000/squash/projects", {}, {
          auth: {
            username: squashUsername,
            password: squashPassword,
          },
        });

        setSquashProjects(projectsRes.data || []);
      }
    } catch (error) {
      console.error("Squash Integration Error:", error);
      alert("Failed to connect to Squash TM. Check credentials.");
    }
    setLoadingSquash(false);
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
    const csvContent =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent(`Requirement,Generated Scenario\n"${input}","${output}"`);
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

  const submitRating = async (star) => {
    if (!scenarioId) {
      alert("You need to generate a scenario first.");
      return;
    }
    if (star < 1 || star > 5) {
      alert("Please enter a rating between 1 and 5.");
      return;
    }

    try {
      await axiosInstance.post("/ratings/", {
        scenario_id: scenarioId,
        rating: star,
      });
      setRatingValue(star);
      alert(`Rating of ${star} submitted successfully!`);
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert(error.response?.data?.detail || "Error submitting rating.");
    }
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight="600">
            🧠 AI Squash — Scenario Generator
          </Typography>
          <Tooltip title="Sign Out">
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth={false} sx={{ mt: 5 }}>
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 6 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                📌 Requirement
              </Typography>
              <TextareaAutosize
                minRows={15}
                placeholder="Describe your requirement..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "1px solid #ced4da",
                  borderRadius: "8px",
                  fontSize: "20px",
                  resize: "none",
                  fontFamily: "Roboto, sans-serif",
                }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="scenario-type-label">Scenario Type</InputLabel>
                <Select
                  labelId="scenario-type-label"
                  value={scenarioType}
                  label="Scenario Type"
                  onChange={(e) => setScenarioType(e.target.value)}
                >
                  <MenuItem value="positive">Positive</MenuItem>
                  <MenuItem value="negative">Negative</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={generateScenario}
                  disabled={loading}
                  startIcon={<PlayArrowIcon />}
                  sx={{ minWidth: 150 }}
                >
                  {loading ? "Generating..." : "Generate"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={exportToCSV}
                  sx={{ minWidth: 150 }}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={exportToTXT}
                  sx={{ minWidth: 150 }}
                >
                  Export TXT
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={exportToPDF}
                  sx={{ minWidth: 150 }}
                >
                  Export PDF
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleTranslate}
                  disabled={translating}
                  startIcon={<TranslateIcon />}
                  sx={{ minWidth: 150 }}
                >
                  {translating ? "Translating..." : "Translate"}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                ✅ Generated Scenario
              </Typography>
              <Box
                sx={{
                  bgcolor: "#f9f9f9",
                  borderRadius: 2,
                  p: 2,
                  height: "400px",
                  overflowY: "auto",
                }}
              >
                <pre style={{ fontFamily: "monospace", fontSize: "20px", margin: 0 }}>
                  {output || "Generated scenario will appear here..."}
                </pre>
              </Box>

              {translatedOutput && (
                <Box sx={{ bgcolor: "#e6f4ea", borderRadius: 2, p: 2, mt: 2 }}>
                  <Typography variant="subtitle1" fontWeight="600">
                    🇫🇷 Translated
                  </Typography>
                  <pre style={{ fontFamily: "monospace", fontSize: "20px", margin: 0 }}>
                    {translatedOutput}
                  </pre>
                </Box>
              )}

              {output && (
                <>
                  <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconButton
                        key={star}
                        onClick={() => submitRating(star)}
                        sx={{ color: star <= ratingValue ? "#FFD700" : "#ccc", p: 0.5 }}
                      >
                        <StarIcon />
                      </IconButton>
                    ))}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => setShowSquashSection(!showSquashSection)}
                    >
                      {showSquashSection ? "Hide Squash Integration" : "Add to Squash"}
                    </Button>
                  </Box>
                </>
              )}


              {showSquashSection && (
                <Box sx={{ mt: 2, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight="600">
                    🔐 Squash TM Credentials
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <input
                      type="text"
                      placeholder="Username"
                      value={squashUsername}
                      onChange={(e) => setSquashUsername(e.target.value)}
                      style={{ padding: 8, borderRadius: 4, border: "1px solid #aaa", fontSize: 16 }}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={squashPassword}
                      onChange={(e) => setSquashPassword(e.target.value)}
                      style={{ padding: 8, borderRadius: 4, border: "1px solid #aaa", fontSize: 16 }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSquashIntegration}
                      disabled={loadingSquash}
                    >
                      {loadingSquash ? "Connecting..." : "Fetch Projects"}
                    </Button>
                  </Box>

                  {squashProjects.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        📁 Available Projects
                      </Typography>
                      <ul>
                        {squashProjects.map((project) => (
                          <li key={project.id}>
                            <strong>{project.name}</strong> (ID: {project.id})
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </Box>
              )}

            </Grid>
          </Grid>
        </Paper>

        <Typography variant="body2" align="center" sx={{ mt: 4, color: "text.secondary" }}>
          © {new Date().getFullYear()} AI Squash. All rights reserved.
        </Typography>
      </Container>
    </>
  );
}

export default Home;

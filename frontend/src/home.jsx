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
  //TextField,
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
  //const [requirementId, setRequirementId] = useState(null);
  const [scenarioId, setScenarioId] = useState(null);
  const [ratingValue, setRatingValue] = useState("");

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
      // Save the requirement
      const reqResponse = await axiosInstance.post("/requirements/", {
        requirement_text: input,
      });

      const newRequirementId = reqResponse.data.requirement_id;
      //setRequirementId(newRequirementId);

      // Generate the scenario
      const scenarioResponse = await axios.post("http://localhost:8000/generate-test-scenario/", {
        requirement: input,
      });

      let generatedScenario = scenarioResponse.data.gherkin_scenario || "No scenario generated.";
      generatedScenario = generatedScenario.replace(/```gherkin|```/g, "").trim();

      setOutput(generatedScenario);
      setTranslatedOutput("");

      // Save the generated scenario
      const saveScenarioResponse = await axiosInstance.post("/test-scenarios/", {
        requirement_id: newRequirementId,
        scenario_text: generatedScenario,
      });

      const newScenarioId = saveScenarioResponse.data.scenario_id;
      setScenarioId(newScenarioId);

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

      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 6 }}>
          <Grid container spacing={4}>
            {/* Input Section */}
            <Grid item xs={12} md={5}>
              <Typography variant="h6" gutterBottom>
                📌 Requirement
              </Typography>
              <TextareaAutosize
                minRows={12}
                placeholder="Describe your requirement..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "1px solid #ced4da",
                  borderRadius: "8px",
                  fontSize: "16px",
                  resize: "vertical",
                  fontFamily: "Roboto, sans-serif",
                }}
              />
            </Grid>

            {/* Action Buttons */}
            <Grid
              item
              xs={12}
              md={2}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={generateScenario}
                disabled={loading}
                startIcon={<PlayArrowIcon />}
              >
                {loading ? "Generating..." : "Generate"}
              </Button>

              {output && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportToCSV}
                  >
                    CSV
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportToTXT}
                  >
                    TXT
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportToPDF}
                  >
                    PDF
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleTranslate}
                    disabled={translating}
                    startIcon={<TranslateIcon />}
                  >
                    {translating ? "Translating..." : "Translate"}
                  </Button>
                </>
              )}
            </Grid>

            {/* Output Section */}
            <Grid item xs={12} md={5}>
              <Typography variant="h6" gutterBottom>
                ✅ Generated Scenario
              </Typography>
              <Box
                sx={{
                  bgcolor: "#f9f9f9",
                  borderRadius: 2,
                  p: 2,
                  minHeight: "250px",
                  overflow: "auto",
                }}
              >
                <pre
                  style={{
                    fontFamily: "monospace",
                    fontSize: "16px",
                    margin: 0,
                  }}
                >
                  {output || "Generated scenario will appear here..."}
                </pre>
              </Box>

              {translatedOutput && (
                <Box
                  sx={{
                    bgcolor: "#e6f4ea",
                    borderRadius: 2,
                    p: 2,
                    mt: 2,
                  }}
                >
                  <Typography variant="h6">🇫🇷 Translated Scenario</Typography>
                  <pre
                    style={{
                      fontFamily: "monospace",
                      fontSize: "16px",
                      margin: 0,
                    }}
                  >
                    {translatedOutput}
                  </pre>
                </Box>
              )}

              {output && (
                <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1 }}>
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
              
              )}
            </Grid>
          </Grid>
        </Paper>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 4, color: "text.secondary" }}
        >
          © {new Date().getFullYear()} AI Squash. All rights reserved.
        </Typography>
      </Container>
    </>
  );
}

export default Home;

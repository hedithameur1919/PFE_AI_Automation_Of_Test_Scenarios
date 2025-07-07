import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextareaAutosize,
  Typography,
  Box,
  Container,
  CssBaseline,
  Paper,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { jsPDF } from "jspdf";
import axios from "axios";
import { translateToFrench } from "./translate";
import DownloadIcon from "@mui/icons-material/Download";
import TranslateIcon from "@mui/icons-material/Translate";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StarIcon from "@mui/icons-material/Star";
import HomeNavbar from './components/HomeNavbar';
import HomeHero from './components/HomeHero';
import HomeFooter from './components/HomeFooter';
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
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [testCaseProjectId, setTestCaseProjectId] = useState("");
  const [testStepCaseId, setTestStepCaseId] = useState("");
  const [testCaseFolderId, setTestCaseFolderId] = useState("");
  const [jiraUsername, setJiraUsername] = useState("");
  const [jiraPassword, setJiraPassword] = useState("");
  const [jiraIssueKey, setJiraIssueKey] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

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
    setShowSquashSection(true);
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
  //Add test case squash part
  const handleAddToSquash = async () => {
    if (!output || !selectedProjectId || !squashUsername || !squashPassword) {
      alert("Please make sure a scenario is generated, a project is selected, and credentials are provided.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/squash/add-test-case", {
        project_id: selectedProjectId,
        gherkin_script: output
      }, {
        auth: {
          username: squashUsername,
          password: squashPassword,
        },
      });

      if (response.data.message === "Test case added successfully") {
        alert("Scenario added to Squash TM successfully!");
      } else {
        alert("Failed to add scenario to Squash.");
      }
    } catch (error) {
      console.error("Error adding scenario to Squash:", error);
      alert("Error adding scenario to Squash. Check credentials or project selection.");
    }
  };
  const handleAddTestCase = async () => {
  if (!output || !testCaseProjectId || !squashUsername || !squashPassword) {
    alert("Missing data for test case creation");
    return;
  }

  try {
    await axios.post("http://localhost:8000/squash/add-test-case", {
      project_id: parseInt(testCaseProjectId),
      gherkin_script: output
    }, {
      auth: {
        username: squashUsername,
        password: squashPassword,
      },
    });

    alert("Test case added to Squash successfully!");
  } catch (error) {
    console.error("Add Test Case Error:", error);
    alert("Failed to add test case to Squash");
  }
  };

  const handleAddTestCaseToFolder = async () => {
  if (!output || !testCaseFolderId || !squashUsername || !squashPassword) {
    alert("Missing data for test case folder creation");
    return;
  }

  try {
    await axios.post("http://localhost:8000/squash/add-test-case-to-folder", {
      folder_id: parseInt(testCaseFolderId),
      gherkin_script: output
    }, {
      auth: {
        username: squashUsername,
        password: squashPassword,
      },
    });

    alert("Test case added to folder successfully!");
  } catch (error) {
    console.error("Add Test Case to Folder Error:", error);
    alert("Failed to add test case to folder");
  }
  };

  const handleAddTestStep = async () => {
  if (!output || !testStepCaseId || !squashUsername || !squashPassword) {
    alert("Missing data for test step creation");
    return;
  }

  try {
    await axios.post("http://localhost:8000/squash/add-test-step", {
      test_case_id: parseInt(testStepCaseId),
      gherkin_script: output
    }, {
      auth: {
        username: squashUsername,
        password: squashPassword,
      },
    });

    alert("Test step added to Squash successfully!");
  } catch (error) {
    console.error("Add Test Step Error:", error);
    alert("Failed to add test step to Squash");
  }
  };

  const handleAddFromJira = async () => {
  if (!jiraUsername || !jiraPassword || !jiraIssueKey) {
    return alert("Please enter Jira credentials and issue key.");
  }
  try {
    const res = await axiosInstance.post(
      "/jira/fetch-issue",
      { issue_key: jiraIssueKey },
      {
        auth: { username: jiraUsername, password: jiraPassword },
      }
    );
    setInput(res.data.prompt);
    setOutput("");
    setTranslatedOutput("");
    alert("Imported requirement from Jira!");
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.detail || "Failed to fetch Jira issue");
  }
};


  //Squash part ends here

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
      {/* <AppBar position="static" color="primary" elevation={2}>
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
      </AppBar> */}
      <HomeNavbar username={username} onLogout={handleLogout} />
      <HomeHero />
      <Container maxWidth={false} /* sx={{ mt: 5 }} */
        sx={{ zoom: '70%'}}>
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 6 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={2} sm={4}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                📌 Requirement
              </Typography>
              <Box sx={{ mt: 2, p: 2, border: "1px dashed #888", borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight="600">
                  ⚙️ Add Requirement from Jira
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <input
                    type="text"
                    placeholder="Jira Username"
                    value={jiraUsername}
                    onChange={(e) => setJiraUsername(e.target.value)}
                    style={{ padding: 8, flex: 1 }}
                  />
                  <input
                    type="password"
                    placeholder="Jira Password / API Token"
                    value={jiraPassword}
                    onChange={(e) => setJiraPassword(e.target.value)}
                    style={{ padding: 8, flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="Issue Key"
                    value={jiraIssueKey}
                    onChange={(e) => setJiraIssueKey(e.target.value)}
                    style={{ padding: 8, flex: 1 }}
                  />
                  <Button variant="contained" onClick={handleAddFromJira}>
                    Add the Issue
                  </Button>
                </Box>
              </Box>
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

            <Grid item xs={12} md={10} sm={8}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                ✅ Generated Scenario
              </Typography>
              <Box
                sx={{
                  bgcolor: "#f9f9f9",
                  borderRadius: 2,
                  p: 2,
                  height: "500px",
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
                  <>
                    <Box mt={2}>
                      <Typography variant="h6">Add Test Case</Typography>
                      <input
                        type="number"
                        placeholder="Enter Project ID"
                        value={testCaseProjectId}
                        onChange={(e) => setTestCaseProjectId(e.target.value)}
                      />
                      <Button variant="contained" onClick={handleAddTestCase} style={{ marginLeft: '10px' }}>
                        Add Test Case
                      </Button>
                    </Box>
                    <Box mt={2}>
                      <Typography variant="h6">Add Test Case to Folder</Typography>
                      <input
                        type="number"
                        placeholder="Enter Folder ID"
                        value={testCaseFolderId}
                        onChange={(e) => setTestCaseFolderId(e.target.value)}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddTestCaseToFolder}
                        style={{ marginLeft: '10px' }}
                        >
                        Add Test Case to Folder
                      </Button>
                    </Box>
                    <Box mt={2}>
                      <Typography variant="h6">Add Test Step</Typography>
                      <input
                        type="number"
                        placeholder="Enter Test Case ID"
                        value={testStepCaseId}
                        onChange={(e) => setTestStepCaseId(e.target.value)}
                      />
                      <Button variant="contained" onClick={handleAddTestStep} style={{ marginLeft: '10px' }}>
                        Add Test Step
                      </Button>
                    </Box>
                  </>

                  {squashProjects.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        📁 Available Projects
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                        {squashProjects.map((project) => (
                          <Button
                            key={project.id}
                            variant={selectedProjectId === project.id ? "contained" : "outlined"}
                            color="secondary"
                            onClick={() => setSelectedProjectId(project.id)}
                          >
                            {project.name}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {output && selectedProjectId && (
                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleAddToSquash}
                      >
                        ➕ Add Scenario to Selected Project
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
        {/* <Typography variant="body2" align="center" sx={{ mt: 4, color: "text.secondary" }}>
          © {new Date().getFullYear()} AI Squash. All rights reserved.
        </Typography> */}
        <HomeFooter />
      </Container>
    </>
  );
}

export default Home;

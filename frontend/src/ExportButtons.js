import "react";
import { jsPDF } from "jspdf";

// eslint-disable-next-line react/prop-types
const ExportButtons = ({ requirement, scenario }) => {
  
  // Export as CSV
  const exportToCSV = () => {
    const csvContent = `data:text/csv;charset=utf-8,Requirement,Generated Scenario\n"${requirement}","${scenario}"`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "generated_scenario.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as TXT
  const exportToTXT = () => {
    const textContent = `Requirement:\n${requirement}\n\nGenerated Scenario:\n${scenario}`;
    const blob = new Blob([textContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "generated_scenario.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as PDF (with formatting)
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    
    // Handle long text properly with line breaks
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const maxWidth = pageWidth - 2 * margin;

    doc.text("Requirement:", margin, 10);
    doc.text(requirement, margin, 20, { maxWidth });

    doc.text("Generated Scenario:", margin, 40);
    doc.text(scenario, margin, 50, { maxWidth });

    doc.save("generated_scenario.pdf");
  };

  return (
    <div className="export-buttons">
      <button onClick={exportToCSV}>Export CSV</button>
      <button onClick={exportToTXT}>Export TXT</button>
      <button onClick={exportToPDF}>Export PDF</button>
    </div>
  );
};

export default ExportButtons;

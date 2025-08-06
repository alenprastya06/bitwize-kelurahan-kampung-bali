const fs = require("fs");
const path = require("path");
const pdf = require("html-pdf");

const renderHtmlTemplate = (templateHtml, data) => {
  let renderedHtml = templateHtml;
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      const value =
        data[key] !== null && data[key] !== undefined ? data[key] : "";
      renderedHtml = renderedHtml.replace(regex, value);
    }
  }
  return renderedHtml;
};

const generatePdfFromHtml = async (htmlContent, outputPath) => {
  const options = {
    // Changed format from "A4" to "Legal"
    format: "Legal",
    border: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
    },
    type: "pdf",
    orientation: "portrait",
    timeout: 30000,
    quality: "100",
    renderDelay: 1500,
    dpi: 300,
    zoomFactor: 1,
    phantomArgs: [
      "--load-images=yes",
      "--ignore-ssl-errors=yes",
      "--ssl-protocol=any",
      "--web-security=false",
    ],
    header: {
      height: "0mm",
    },
    footer: {
      height: "0mm",
    },
  };

  return new Promise((resolve, reject) => {
    pdf.create(htmlContent, options).toFile(outputPath, (err, res) => {
      if (err) {
        console.error("Error generating PDF with html-pdf:", err);
        return reject(new Error(`PDF generation failed: ${err.message}`));
      }
      console.log(`PDF generated successfully at: ${res.filename}`);
      resolve(res.filename);
    });
  });
};
const ensureDirectoryExists = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const readTemplate = (templatePath) => {
  try {
    return fs.readFileSync(templatePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to read template: ${error.message}`);
  }
};
const generatePdfFromTemplate = async (templatePath, data, outputPath) => {
  try {
    ensureDirectoryExists(outputPath);
    const templateHtml = readTemplate(templatePath);
    const renderedHtml = renderHtmlTemplate(templateHtml, data);
    return await generatePdfFromHtml(renderedHtml, outputPath);
  } catch (error) {
    console.error("Error in PDF generation pipeline:", error);
    throw error;
  }
};

module.exports = {
  renderHtmlTemplate,
  generatePdfFromHtml,
  generatePdfFromTemplate,
  readTemplate,
  ensureDirectoryExists,
};

// utils/pdfGenerator.js
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const renderHtmlTemplate = (templateHtml, data) => {
  let renderedHtml = templateHtml;
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      renderedHtml = renderedHtml.replace(regex, data[key]);
    }
  }
  return renderedHtml;
};

const generatePdfFromHtml = async (htmlContent, outputPath) => {
  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    await page.pdf({
      path: outputPath,
      format: "A4",
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
      printBackground: true,
    });

    console.log(`PDF generated successfully at: ${outputPath}`);
    return outputPath;
  } catch (err) {
    console.error("Error generating PDF with Puppeteer:", err);
    throw new Error(`PDF generation failed: ${err.message}`);
  } finally {
    await browser.close();
  }
};

module.exports = {
  renderHtmlTemplate,
  generatePdfFromHtml,
};

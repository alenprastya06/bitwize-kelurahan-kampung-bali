const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const db = require("../config/db");

const templatesDir = path.join(__dirname, "../templates");

class DocumentGeneratorController {
  constructor() {
    this.generateDocument = this.generateDocument.bind(this);
    this.getAvailableTemplates = this.getAvailableTemplates.bind(this);
    this.previewDocument = this.previewDocument.bind(this);
    this.previewEditable = this.previewEditable.bind(this);
    this.renderBodyPreview = this.renderBodyPreview.bind(this);
    this.downloadGenerated = this.downloadGenerated.bind(this);
  }

  async generateDocument(req, res) {
    const { templateName, data, user_id, id_pengajuan, application_id } = req.body;

    if (!templateName || !data || !user_id || !id_pengajuan || !application_id) {
      return res.status(400).json({ message: "Template name, data, user_id, id_pengajuan, and application_id are required." });
    }

    try {
      // Rule 1: Ensure only one generated document per application_id
      const [existingDocs] = await db.query(
        "SELECT id FROM documents WHERE application_id = ? AND document_type = 'generated_document'",
        [application_id]
      );

      if (existingDocs.length > 0) {
        return res.status(409).json({
          message: "A generated document already exists for this application.",
          documentId: existingDocs[0].id,
        });
      }

      const templatePath = path.join(templatesDir, templateName);
      if (!fs.existsSync(templatePath)) {
        return res.status(404).json({ message: "Template not found." });
      }

      const templateHtml = fs.readFileSync(templatePath, "utf8");
      const template = handlebars.compile(templateHtml);
      const compiledHtml = template(data);

      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(compiledHtml, { waitUntil: "networkidle0", timeout: 60000 });
      const pdfBuffer = await page.pdf({ format: "A4" });
      await browser.close();

      const fileName = `generated_${templateName.replace(".html", "")}_${Date.now()}.pdf`;
      const filePath = path.join(process.cwd(), "uploads", fileName);
      fs.writeFileSync(filePath, pdfBuffer);

      // Stop inserting into documents table here. This is now handled by generatedDocumentController.
      // The generated document is now considered a 'result' of the application, not a 'requirement' document.

      res.status(200).json({
        message: "Document generated successfully!",
        fileName: fileName,
        filePath: `/uploads/${fileName}`,
      });
    } catch (error) {
      console.error("Error generating document:", error);
      res.status(500).json({ message: "Error generating document", error: error.message });
    }
  }

  async getAvailableTemplates(req, res) {
    try {
      const files = await fs.promises.readdir(templatesDir);
      const templates = files.filter(file => file.endsWith(".html"));
      res.status(200).json({ templates });
    } catch (error) {
      console.error("Error listing templates:", error);
      res.status(500).json({ message: "Error listing templates", error: error.message });
    }
  }

  async previewDocument(req, res) {
    const { templateName, data } = req.body;

    if (!templateName || !data) {
      return res.status(400).json({ message: "Template name and data are required." });
    }

    try {
      const templatePath = path.join(templatesDir, templateName);
      if (!fs.existsSync(templatePath)) {
        return res.status(404).json({ message: "Template not found." });
      }

      const templateHtml = fs.readFileSync(templatePath, "utf8");
      const template = handlebars.compile(templateHtml);
      const compiledHtml = template(data);

      res.status(200).send(compiledHtml);
    } catch (error) {
      console.error("Error previewing document:", error);
      res.status(500).json({ message: "Error previewing document", error: error.message });
    }
  }

  async previewEditable(req, res) {
    const { templateName } = req.query;
    if (!templateName) {
      return res.status(400).json({ message: "Template name is required." });
    }
    try {
      const templatePath = path.join(templatesDir, templateName);
      if (!fs.existsSync(templatePath)) {
        return res.status(404).json({ message: "Template not found." });
      }
      const templateHtml = fs.readFileSync(templatePath, "utf8");
      // For editable preview, we might want to send the raw template and some sample data structure
      res.status(200).json({
        templateHtml: templateHtml,
        sampleData: { /* provide sample data structure based on template expectations */ },
      });
    } catch (error) {
      console.error("Error fetching editable preview:", error);
      res.status(500).json({ message: "Error fetching editable preview", error: error.message });
    }
  }

  async renderBodyPreview(req, res) {
    const { htmlSnippet, data } = req.body;
    if (!htmlSnippet || !data) {
      return res.status(400).json({ message: "HTML snippet and data are required." });
    }
    try {
      const template = handlebars.compile(htmlSnippet);
      const compiledHtml = template(data);
      res.status(200).send(compiledHtml);
    } catch (error) {
      console.error("Error rendering body preview:", error);
      res.status(500).json({ message: "Error rendering body preview", error: error.message });
    }
  }

  async downloadGenerated(req, res) {
    const { fileName } = req.query;
    if (!fileName) {
      return res.status(400).json({ message: "File name is required." });
    }
    const filePath = path.join(process.cwd(), "uploads", fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found." });
    }
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ message: "Error downloading file", error: err.message });
      }
    });
  }
}

module.exports = new DocumentGeneratorController();

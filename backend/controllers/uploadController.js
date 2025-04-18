const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

const runPdfToImages = (pdfBuffer, fileName) => {
  const tempPdfPath = path.join(__dirname, '..', 'tmp', fileName);

  // Ensure tmp directory exists
  const tmpDir = path.dirname(tempPdfPath);
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  fs.writeFileSync(tempPdfPath, pdfBuffer);
  console.log("Temp PDF saved at:", tempPdfPath);

  return new Promise((resolve, reject) => {
    const python = spawn('python', [path.join(__dirname, '..', 'convert.py'), tempPdfPath]);

    python.stdout.on('data', data => {
      console.log(`Python stdout: ${data}`);
    });

    python.stderr.on('data', data => {
      console.error(`Python stderr: ${data}`);
    });

    python.on('close', (code) => {
      if (code !== 0) return reject('PDF to image conversion failed');
      fs.unlinkSync(tempPdfPath); // Delete temp PDF
      resolve();
    });
  });
};

const runOCR = async (imagePath) => {
  const result = await Tesseract.recognize(imagePath, 'eng', {
    psm: 6,
    logger: m => console.log(`OCR: ${m.status} ${Math.round(m.progress * 100)}%`)
  });
  return result.data.text;
};

const processAllPages = async () => {
  const imageFiles = fs.readdirSync('./tmp').filter(f => f.endsWith('.png'));
  let combinedText = '';

  for (const file of imageFiles) {
    const text = await runOCR(path.join('./tmp', file));
    combinedText += text + '\n';
    fs.unlinkSync(path.join('./tmp', file)); // Delete image after OCR
  }

  return combinedText;
};

const processPDF = async (req, res) => {
  try {
    const pdfBuffer = req.file?.buffer;
    if (!pdfBuffer) throw new Error("No PDF buffer found in request");

    const fileName = `temp-${Date.now()}.pdf`;
    console.log("Starting PDF to PNG conversion...");

    await runPdfToImages(pdfBuffer, fileName);
    console.log("PDF successfully converted to images.");

    const fullText = await processAllPages();
    console.log("OCR completed. Preview of extracted text:\n", fullText.slice(0, 500));

    const prompt = `
You must parse the given input into the below JSON format. Only output valid JSON.

[
  {
    "question_text": "What is 2 + 2?",
    "marks": 1,
    "negative_marks": 0.25,
    "options": [
      { "option_text": "3", "is_correct": false },
      { "option_text": "4", "is_correct": true },
      { "option_text": "5", "is_correct": false },
      { "option_text": "6", "is_correct": false }
    ]
  }
]

Now parse this:
${fullText}
`;

    console.log("Sending prompt to local Ollama server...");

    const response = await axios.post('http://127.0.0.1:11434/api/generate', {
      model: 'codellama',
      prompt,
      stream: false
    });

    const raw = response?.data?.response;
    console.log("Ollama raw response received.");

    if (!raw || typeof raw !== 'string') {
      throw new Error("Invalid response from language model");
    }

    const jsonStart = raw.indexOf('[');
    const jsonEnd = raw.lastIndexOf(']') + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("No valid JSON array found in model response");
    }

    let structured;
    try {
      structured = JSON.parse(raw.slice(jsonStart, jsonEnd));
    } catch (err) {
      console.error("Error parsing JSON:", err.message);
      throw new Error("Failed to parse JSON: " + err.message);
    }

    res.json({ structured });

  } catch (e) {
    console.error("Error in processing PDF:", e);
    const errMsg = e?.message || e?.toString() || "Unknown error";
    res.status(500).json({ error: errMsg });
  }
};

module.exports = { processPDF };

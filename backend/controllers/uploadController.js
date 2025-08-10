const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Tesseract = require('tesseract.js');
const pdf = require('pdf-poppler');

const convertPdfToImages = async (pdfBuffer, baseName) => {
  const tmpDir = path.join(__dirname, '..', 'tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const pdfPath = path.join(tmpDir, `${baseName}.pdf`);
  fs.writeFileSync(pdfPath, pdfBuffer);

  const options = {
    format: 'png',
    out_dir: tmpDir,
    out_prefix: baseName,
    page: null,
  };

  await pdf.convert(pdfPath, options);
  fs.unlinkSync(pdfPath); 
};

const runOCR = async (imagePath) => {
  const result = await Tesseract.recognize(imagePath, 'eng', { psm: 6 });
  return result.data.text;
};

const processAllPages = async (baseName) => {
  const tmpDir = path.join(__dirname, '..', 'tmp');
  const imageFiles = fs.readdirSync(tmpDir)
    .filter(f => f.startsWith(baseName) && f.endsWith('.png'));

  let combinedText = '';
  for (const file of imageFiles) {
    const text = await runOCR(path.join(tmpDir, file));
    combinedText += text + '\n';
    fs.unlinkSync(path.join(tmpDir, file));
  }
  return combinedText;
};

const processPDF = async (req, res) => {
  try {
    const pdfBuffer = req.file?.buffer;
    const { test_id } = req.body;
    if (!pdfBuffer) throw new Error("No PDF provided");
    if (!test_id) throw new Error("Test ID missing");

    const baseName = `temp-${Date.now()}`;
    await convertPdfToImages(pdfBuffer, baseName);
    const fullText = await processAllPages(baseName);

    const prompt = `
You must parse ONLY the following text into valid JSON array format shown below.
Make sure to REMOVE any leading option labels like "A.", "B.", "C.", "a) ","b) ", etc. from option_text fields. Only include the actual option content.
Sometimes if question text is not clear then you may put in what is the best fit there
Below is the format in which u should send not the exact question u should put
Format:
[
  {
    "question_text": "What is 2 + 2?",
    "options": [
      { "option_text": "3", "is_correct": false },
      { "option_text": "4", "is_correct": true },
      { "option_text": "5", "is_correct": false },...
    ]
  }
]

Now parse this text:
${fullText}
`;


    const response = await axios.post('http://127.0.0.1:11434/api/generate', {
      model: 'codellama',
      prompt,
      stream: false
    });

    const raw = response?.data?.response;
    const jsonStart = raw.indexOf('[');
    const jsonEnd = raw.lastIndexOf(']') + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("No valid JSON array found in model response");
    }

    const structured = JSON.parse(raw.slice(jsonStart, jsonEnd)).map((q, index) => ({
      questionText: q.question_text,
      options: q.options.map(opt => opt.option_text),
      correctOption: q.options.find(opt => !!opt.is_correct)?.option_text || '',
      image: null,
      questionNumber: index + 1
    }));

    res.json({ parsed: structured });

  } catch (err) {
    console.error("Error processing PDF:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};

module.exports = { processPDF };

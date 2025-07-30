const express = require("express");
const router = express.Router();
const axios = require("axios");


// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;
module.exports = function createAnsGenerateRoute(perplexityService) {

router.post("/generate-answer-key", async (req, res) => {
  const questions = req.body.questionPaper?.questions || [];

  if (!questions.length) {
    return res.status(400).json({ error: "No questions provided" });
  }

  const prompt = generatePrompt(questions, req.body.questionPaper?.subject);

  try {
    // const geminiRes = await axios.post(GEMINI_ENDPOINT, {
    //   contents: [
    //     {
    //       role: "user",
    //       parts: [{ text: prompt }]
    //     }
    //   ]
    // });

    // const responseText = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;
    const responseText = await perplexityService.generateWithPerplexity(prompt);

    // Parse only if it's clean JSON, or return as raw for safety
    let parsed = responseText;
    try {
      parsed = JSON.parse(responseText);
    } catch (_) {
      // Fallback to raw
    }

    return res.json({ answerKey: parsed });
  } catch (err) {
    console.error("Error generating answer key:", err);
    return res.status(500).json({ error: "Failed to generate answer key" });
  }
});

function generatePrompt(questions, subject = null) {
    const subjectLine = subject ? ` for the subject: ${subject}` : '';
    return `
  You are a senior university examiner${subjectLine}. Evaluate each exam question and generate an answer key in raw JSON with:
  
  - "question": original question,
  - "keywords": list of key points or keywords (2–3 points for ≤3 marks, 4–6 for >3 marks),
  - "totalMarks": total marks for the question,
  - Each keyword must be important and include its allocated marks,
  - Do not include markdown or backticks.
  
  Example:
  [
    {
      "question": "Explain polymorphism in OOP.",
      "keywords": [
        { "point": "Definition of polymorphism", "marks": 1 },
        { "point": "Types: compile-time and run-time", "marks": 1 },
        { "point": "Method overloading example", "marks": 1 },
        { "point": "Method overriding example", "marks": 1 },
        { "point": "Real-world analogy", "marks": 1 }
      ],
      "totalMarks": 5
    }
  ]
  
  Questions:
  ${questions.map(q => `Q: ${q.text} (Marks: ${q.marks})`).join('\n')}
  `;
  }

  return router;
};

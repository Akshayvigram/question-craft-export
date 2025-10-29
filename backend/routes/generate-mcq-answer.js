const express = require("express");
const router = express.Router();

module.exports = function createMCQAnswerKeyRoute(perplexityService) {
  // Route for MCQ Answer Key
  router.post("/generate-mcq-answer-key", async (req, res) => {
    const { questions, subjectName, quizTitle } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "No MCQ questions provided" });
    }

    const allAnswerKeys = [];

    for (const question of questions) {
      const { text, options, correctOption, marks, difficulty, unit } = question;

      if (!text || !options || !correctOption) {
        allAnswerKeys.push({
          id: question.id || `fallback-${Date.now()}`,
          question: text || "Invalid question",
          answer: "No valid correct answer",
          marks: marks || 1,
          explanation: "Invalid question data - please check configuration."
        });
        continue;
      }

      const correctAnswer = options.find(opt => opt.startsWith(correctOption))?.split(': ')[1] || "Unknown";
      const optionsText = options.map(opt => opt.trim()).join(', ');

      const prompt = `
You are a senior university examiner for the subject "${subjectName}" in the quiz "${quizTitle || 'General Quiz'}".

Task:
- This is an MCQ question: "${text}"
- Options: ${optionsText}
- Correct Answer: ${correctAnswer} (${correctOption})
- Difficulty: ${difficulty || 'Medium'}
- Marks: ${marks || 1}

Generate a concise explanation (2-4 sentences) for why the correct answer is right, and briefly why the other options are incorrect distractors. Keep it educational and spoiler-free for students.

Output ONLY a JSON object in this exact format (no markdown, no backticks):
{
  "explanation": "Your explanation here (concise, 2-4 sentences)."
}
`;

      try {
        const responseText = await perplexityService.generateWithPerplexity(prompt);

        // Parse the JSON response
        let explanationData;
        try {
          let jsonText = responseText.replace(/```json|```/g, "").trim();
          if (jsonText.startsWith('{')) {
            explanationData = JSON.parse(jsonText);
          } else {
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              explanationData = JSON.parse(jsonMatch[0]);
            } else {
              throw new Error("No valid JSON found in response");
            }
          }
        } catch (parseError) {
          console.error("❌ JSON Parse Error for explanation:", parseError.message, "Raw response:", responseText);
          explanationData = { explanation: "AI generation failed - using fallback. Correct answer: " + correctAnswer };
        }

        allAnswerKeys.push({
          id: question.id || `mcq-${Date.now()}-${allAnswerKeys.length}`,
          question: text,
          answer: `${correctOption}: ${correctAnswer}`,  // Updated: Include the option letter (A, B, C, D)
          marks: marks || 1,
          explanation: explanationData.explanation || "No explanation available.",
          options: options,  // Include for reference (optional)
          correctOption: correctOption
        });
      } catch (error) {
        console.error("❌ AI Explanation Error:", error.message);
        allAnswerKeys.push({
          id: question.id || `fallback-${Date.now()}`,
          question: text,
          answer: `${correctOption}: ${correctAnswer}`,  // Updated: Include the option letter (A, B, C, D)
          marks: marks || 1,
          explanation: `Failed to generate explanation for this question (Difficulty: ${difficulty}, Unit: ${unit || 'N/A'}). Correct answer: ${correctOption}: ${correctAnswer}.`
        });
      }
    }

    if (allAnswerKeys.length === 0) {
      return res.status(500).json({ error: "No answer keys generated. Check questions configuration." });
    }

    return res.json({ answerKey: allAnswerKeys });
  });

  return router;
};
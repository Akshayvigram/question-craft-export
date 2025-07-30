const express = require("express");
const axios = require("axios");
const router = express.Router();

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;
module.exports = function createGenerateRoute(perplexityService) {

function formatUnitLabel(unit) {
  if (typeof unit === "string" && unit.toLowerCase().startsWith("unit")) {
    return `UNIT ${unit.slice(4).trim()}`;
  }
  return `UNIT ${unit}`;
}

// Utility: Try both lowercase 'unitX' and raw keys like 'UNIT I'
function getUnitContent(unitTopics, unit) {
  const unitKey = `unit${unit}`.toLowerCase();
  let content = unitTopics[unitKey] || unitTopics[unit];

  // If it's an array, join it; else use as string
  if (Array.isArray(content)) {
    return content.join("\n").trim();
  } else if (typeof content === "string") {
    return content.trim();
  }

  return "";
}

router.post("/generate-questions", async (req, res) => {
  const { subjectName, sections, unitTopics } = req.body;

  if (!sections?.length || !unitTopics) {
    return res.status(400).json({ error: "Missing sections or unitTopics" });
  }

  const allQuestions = [];

  for (const section of sections) {
    const {
      id: sectionId,
      individualConfig,
      autoConfig
    } = section;

    // --- Individual Mode ---
    if (individualConfig) {
      const {
        aiQuestionCount,
        defaultDifficulty,
        defaultMarks,
        defaultUnit,
        defaultSubQuestionsCount
      } = individualConfig;

      const unitContent = getUnitContent(unitTopics, defaultUnit);

      if (!unitContent) {
        allQuestions.push({
          section: sectionId,
          unit: formatUnitLabel(defaultUnit),
          text: `⚠️ No syllabus found for ${formatUnitLabel(defaultUnit)}`
        });
        continue;
      }

      const prompt = `
You are an AI exam question generator for the course "${subjectName}".

Task:
- Generate ${aiQuestionCount} questions from the content below.
- Difficulty: ${defaultDifficulty}
- Marks: ${defaultMarks}
- Keep the question aligned with academic standards.

Only output:
- A numbered list of ${aiQuestionCount} questions.
- No notes, no formatting, no instructions.

Content:
${unitContent}
      `;

      try {
        // const response = await axios.post(GEMINI_ENDPOINT, {
        //   contents: [{ parts: [{ text: prompt }] }],
        //   generationConfig: {
        //     temperature: 0.7,
        //     topK: 40,
        //     topP: 0.95,
        //     maxOutputTokens: 1024
        //   }
        // });

        // const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const text = await perplexityService.generateWithPerplexity(prompt);

        const questions = text.split(/\n+/).filter(line => line.trim()).map((line, index) => {
          const match = line.match(/^\d+[\).]?\s*(.*)$/);
          return {
            section: sectionId,
            unit: formatUnitLabel(defaultUnit),
            text: match ? match[1] : line,
            marks: defaultMarks,
            difficulty: defaultDifficulty,
            isAIGenerated: true,
            subQuestionsCount: defaultSubQuestionsCount
          };
        });

        allQuestions.push(...questions);
      } catch (error) {
        console.error("❌ AI Gen Error:", error.message);
        allQuestions.push({
          section: sectionId,
          unit: formatUnitLabel(defaultUnit),
          text: `❌ Failed to generate questions for ${formatUnitLabel(defaultUnit)}`
        });
      }

      continue; // skip bulk mode
    }

    // --- Auto (bulk) mode ---
    if (autoConfig) {
      const {
        questionCount,
        marksPerQuestion,
        difficulty,
        units,
        subQuestionsCount
      } = autoConfig;

      const totalUnits = units?.length || 0;
      const questionsPerUnit = Math.floor(questionCount / totalUnits);
      const remainder = questionCount % totalUnits;

      for (let i = 0; i < totalUnits; i++) {
        const unit = units[i];
        const unitContent = getUnitContent(unitTopics, unit);

        if (!unitContent) {
          allQuestions.push({
            section: sectionId,
            unit: formatUnitLabel(unit),
            text: `⚠️ No syllabus found for ${formatUnitLabel(unit)}`
          });
          continue;
        }

        const unitQuestionCount = questionsPerUnit + (i < remainder ? 1 : 0);

        const complexity = {
          easy: "definition or concept-based question",
          medium: "application-based question with explanation",
          hard: "analytical or scenario-based question"
        }[difficulty?.toLowerCase()] || "conceptual question";

        const prompt = `
Generate ${unitQuestionCount} academic questions from this syllabus for course "${subjectName}".

- Difficulty: ${complexity}
- Marks: ${marksPerQuestion}
- Use ONLY the content provided.
- Output as a numbered list without explanation or metadata.

Syllabus Content:
${unitContent}
        `;

        try {
          // const response = await axios.post(GEMINI_ENDPOINT, {
          //   contents: [{ parts: [{ text: prompt }] }],
          //   generationConfig: {
          //     temperature: 0.7,
          //     topK: 40,
          //     topP: 0.95,
          //     maxOutputTokens: 1024
          //   }
          // });

          // const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

          const text = await perplexityService.generateWithPerplexity(prompt);

          const questions = text.split(/\n+/).filter(line => line.trim()).map(line => {
            const match = line.match(/^\d+[\).]?\s*(.*)$/);
            return {
              section: sectionId,
              unit: formatUnitLabel(unit),
              text: match ? match[1] : line,
              marks: marksPerQuestion,
              difficulty,
              isAIGenerated: true,
              subQuestionsCount
            };
          });

          allQuestions.push(...questions);
        } catch (error) {
          console.error("❌ Error generating questions:", {
            section: sectionId,
            unit,
            error: error.message
          });

          allQuestions.push({
            section: sectionId,
            unit: formatUnitLabel(unit),
            text: `❌ Failed to generate questions for ${formatUnitLabel(unit)}`
          });
        }
      }
    }
  }

  if (allQuestions.length === 0) {
    return res.status(500).json({ error: "No questions generated. Check syllabus or configuration." });
  }
  const groupedSections = sections.map((section) => {
    const sectionQuestions = allQuestions.filter(q => q.section === section.id);
    return {
      name: section.name || `Section ${section.id}`,
      questions: sectionQuestions
    };
  });

  return res.json({ sections: groupedSections });
});

return router;
};

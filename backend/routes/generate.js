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

  // Route for Descriptive Questions (Original Logic)
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

  // New Route for MCQ Questions
  router.post("/generate-mcq-questions", async (req, res) => {
    const { subjectName, sections, unitTopics, type } = req.body;

    if (!sections?.length || !unitTopics || type !== "mcq") {
      return res.status(400).json({ error: "Missing sections, unitTopics, or invalid type (must be 'mcq')" });
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
          defaultOptionCount
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
- Generate ${aiQuestionCount} multiple-choice questions (MCQs) from the content below.
- Difficulty: ${defaultDifficulty}
- Marks: ${defaultMarks}
- Each question must have a single-word correct answer.
- Provide exactly ${defaultOptionCount} options, labeled as A, B, C, D (e.g., "A: Apple", "B: Banana", "C: Orange", "D: Grape").
- One correct option (single word), and the rest plausible distractors (also single words).
- Output as a JSON array of objects: [{"text": "Question text?", "options": ["A: Word1", "B: Word2", "C: Word3", "D: Word4"], "correctOption": "A", "unit": "UNIT I"}]

Content:
${unitContent}
        `;

        try {
          const text = await perplexityService.generateWithPerplexity(prompt);

          // Parse the JSON response
          let questionsData;
          try {
            questionsData = JSON.parse(text.replace(/```json|```/g, "").trim());
          } catch (parseError) {
            console.error("❌ JSON Parse Error:", parseError.message);
            return res.status(500).json({ error: "Failed to parse AI response as JSON" });
          }

          const questions = questionsData.map((q, index) => ({
            section: sectionId,
            unit: formatUnitLabel(defaultUnit),
            text: q.text,
            options: q.options,
            correctOption: q.correctOption,
            marks: defaultMarks,
            difficulty: defaultDifficulty,
            isAIGenerated: true,
            optionCount: defaultOptionCount
          }));

          allQuestions.push(...questions);
        } catch (error) {
          console.error("❌ AI Gen Error:", error.message);
          allQuestions.push({
            section: sectionId,
            unit: formatUnitLabel(defaultUnit),
            text: `❌ Failed to generate MCQs for ${formatUnitLabel(defaultUnit)}`
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
          optionCount
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

          const prompt = `
Generate ${unitQuestionCount} multiple-choice questions (MCQs) from this syllabus for course "${subjectName}".

- Difficulty: ${difficulty}
- Marks: ${marksPerQuestion}
- Each question must have a single-word correct answer.
- Provide exactly ${optionCount} options, labeled as A, B, C, D (e.g., "A: Apple", "B: Banana", "C: Orange", "D: Grape").
- One correct option (single word), and the rest plausible distractors (also single words).
- Output as a JSON array of objects: [{"text": "Question text?", "options": ["A: Word1", "B: Word2", "C: Word3", "D: Word4"], "correctOption": "A", "unit": "UNIT I"}]

Syllabus Content:
${unitContent}
          `;

          try {
            const text = await perplexityService.generateWithPerplexity(prompt);

            // Parse the JSON response
            let questionsData;
            try {
              questionsData = JSON.parse(text.replace(/```json|```/g, "").trim());
            } catch (parseError) {
              console.error("❌ JSON Parse Error:", parseError.message);
              return res.status(500).json({ error: "Failed to parse AI response as JSON" });
            }

            const questions = questionsData.map((q) => ({
              section: sectionId,
              unit: formatUnitLabel(unit),
              text: q.text,
              options: q.options,
              correctOption: q.correctOption,
              marks: marksPerQuestion,
              difficulty,
              isAIGenerated: true,
              optionCount
            }));

            allQuestions.push(...questions);
          } catch (error) {
            console.error("❌ Error generating MCQs:", {
              section: sectionId,
              unit,
              error: error.message
            });

            allQuestions.push({
              section: sectionId,
              unit: formatUnitLabel(unit),
              text: `❌ Failed to generate MCQs for ${formatUnitLabel(unit)}`
            });
          }
        }
      }
    }

    if (allQuestions.length === 0) {
      return res.status(500).json({ error: "No MCQs generated. Check syllabus or configuration." });
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
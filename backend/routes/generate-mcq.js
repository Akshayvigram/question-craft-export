const express = require("express");
const router = express.Router();

// Define a consistent batch size (5 is a good balance for stability/speed)
const AI_BATCH_SIZE = 5; 

module.exports = function createMCQGenerateRoute(perplexityService) {
  function formatUnitLabel(unit) {
    if (typeof unit === "string" && unit.toLowerCase().startsWith("unit")) {
      return `UNIT ${unit.slice(4).trim()}`;
    }
    return `UNIT ${unit}`;
  }

  function getUnitContent(unitTopics, unit, subjectName, quizTitle, quizTopic) {
    const aptitudeTopics = [
      "Quantitative Aptitude",
      "Logical Reasoning",
      "Verbal Ability",
      "Data Interpretation"
    ];
    const isAptitude = aptitudeTopics.includes(subjectName);

    if (isAptitude) {
      return quizTopic || subjectName || "General aptitude topics";
    }

    // Normalize key for robustness
    const normalizedUnit = String(unit).replace(/[^a-z0-9]/gi, '').toLowerCase(); 
    let content = unitTopics[unit] || unitTopics[normalizedUnit] || unitTopics[`unit${normalizedUnit}`];

    if (Array.isArray(content)) {
      return content.join("\n").trim();
    } else if (typeof content === "string") {
      return content.trim();
    }

    return quizTopic || subjectName || `General topics for ${quizTitle}`;
  }

  // --- Improved Prompt Generator Function (STRICT FORMAT) ---
  function generatePrompt(count, difficulty, marks, optionCount, subjectName, quizTitle, unitContent, unitName) {
    return `
You are an AI exam question generator. Your single goal is to produce a list of formatted multiple-choice questions.

Subject: "${subjectName}"
Quiz Title: "${quizTitle || 'General Quiz'}"
Unit/Topic: ${unitName}

**INSTRUCTIONS:**
1. Generate EXACTLY ${count} unique, single-choice MCQs.
2. Content Focus: Generate questions strictly from the content below.
3. Difficulty: ${difficulty}
4. Marks: ${marks} per question.
5. Provide exactly ${optionCount} options. Options must be labelled A, B, C, D, etc., with a full-phrase option text.
6. Each question must have a single correct answer.
7. For each question, list the correct answer option letter (e.g., A, B, C, D) IMMEDIATELY after the options, in the exact format: (Correct: X)

**Output Format (STRICTLY REQUIRED):**
- Output ONLY a numbered list of questions, options, and correct answers.
- DO NOT include any introductory text, concluding remarks, notes, or explanations.
- Example Line: 1. Which device converts light energy into electrical energy? A: Motor B: Battery C: Solar Cell D: Generator (Correct: C)

--- CONTENT FOR QUESTION GENERATION ---
${unitContent}
    `;
  }

  // --- AI Response Parser (More Robust) ---
  function parseQuestions(text, sectionId, unit, marks, difficulty, optionCount) {
    const lines = text.split(/\n+/).filter(line => line.trim());
    const questions = [];

    // Regex: Capture (1) Full text before (Correct: X) and (2) the Correct Letter ([A-Z])
    const regex = /^\s*\d+\.\s*(.+?)\s*\((?:Correct:\s*([A-Z]))\)\s*$/i;

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const match = line.match(regex);

      if (!match) {
        questions.push({
          section: sectionId,
          unit: formatUnitLabel(unit),
          text: `⚠️ Malformed AI MCQ ${index + 1}. Raw output: ${line.substring(0, 100)}...`,
          options: [],
          correctOption: "A",
          marks: marks,
          difficulty: difficulty,
          isAIGenerated: true,
          optionCount: optionCount
        });
        continue;
      }

      const fullQuestionWithOptions = match[1];
      const correctOptionLetter = match[2]?.toUpperCase() || 'A';
      const options = [];

      // Find the starting point of the options (first capital letter followed by a colon)
      const optionsStartIndex = fullQuestionWithOptions.search(/[A-Z]:/);

      if (optionsStartIndex === -1) {
        questions.push({
          section: sectionId, unit: formatUnitLabel(unit), marks, difficulty, isAIGenerated: true, optionCount,
          text: `⚠️ Missing options in question ${index + 1}: ${fullQuestionWithOptions.substring(0, 100)}...`,
          options: [], correctOption: "A"
        });
        continue;
      }
      
      const questionText = fullQuestionWithOptions.substring(0, optionsStartIndex).trim().replace(/\?$/, '?');
      const optionsString = fullQuestionWithOptions.substring(optionsStartIndex);
      
      // Iterative parsing of options based on expected labels
      const optionLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.substring(0, optionCount).split('');
      for (let i = 0; i < optionCount; i++) {
        const label = optionLabels[i];
        const nextLabel = optionLabels[i + 1];
        
        // Regex to find the current option text, stopping at the next label or end of string
        const currentOptionRegex = new RegExp(`^${label}:\\s*(.*?)(?=\\s*${nextLabel}:|$)`, 'i');
        const optionTextMatch = optionsString.substring(optionsString.search(new RegExp(`${label}:`, 'i'))).match(currentOptionRegex);
        
        let optionText = optionTextMatch ? optionTextMatch[1].trim() : `Placeholder ${label}`;
        
        options.push(`${label}: ${optionText}`);
      }

      questions.push({
        section: sectionId,
        unit: formatUnitLabel(unit),
        text: questionText || `MCQ Question ${index + 1}`,
        options: options,
        correctOption: correctOptionLetter,
        marks: marks,
        difficulty: difficulty,
        isAIGenerated: true,
        optionCount: optionCount
      });
    }
    return questions;
  }

  router.post("/generate-mcq-questions", async (req, res) => {
    // Increase request timeout for long-running AI tasks (e.g., 5 minutes)
    req.setTimeout(300000); 

    const { subjectName, sections, unitTopics, type, quizTitle, quizTopic } = req.body;

    if (!sections?.length || !unitTopics || type !== "mcq") {
      return res.status(400).json({ error: "Missing sections, unitTopics, or invalid type (must be 'mcq')" });
    }

    const allQuestions = [];

    // Helper function to execute AI calls (Handles both modes)
    const executeAIGeneration = async (sectionId, unit, count, marks, difficulty, optionCount) => {
      const unitContent = getUnitContent(unitTopics, unit, subjectName, quizTitle, quizTopic);

      if (!unitContent || count === 0) {
        if (count > 0) {
          allQuestions.push({
            section: sectionId,
            unit: formatUnitLabel(unit),
            text: `⚠️ No content found for ${formatUnitLabel(unit)}`,
            marks: marks, difficulty: difficulty, isAIGenerated: false,
          });
        }
        return;
      }

      const batches = Math.ceil(count / AI_BATCH_SIZE);
      
      for (let j = 0; j < batches; j++) {
        const batchQuestionCount = Math.min(AI_BATCH_SIZE, count - (j * AI_BATCH_SIZE));
        
        if (batchQuestionCount <= 0) continue;

        const prompt = generatePrompt(
          batchQuestionCount, difficulty, marks, optionCount, subjectName, 
          quizTitle, unitContent, formatUnitLabel(unit)
        );

        try {
          // console.log(`Attempting batch ${j + 1}/${batches} (${batchQuestionCount} Qs) for ${formatUnitLabel(unit)}...`);
          const text = await perplexityService.generateWithPerplexity(prompt);
          
          const newQuestions = parseQuestions(text, sectionId, unit, marks, difficulty, optionCount);
          allQuestions.push(...newQuestions);
          
          await new Promise(resolve => setTimeout(resolve, 150)); // Small delay to prevent rate limits

        } catch (error) {
          console.error(`❌ AI Gen Error (Batch ${j + 1}/${batches}, ${formatUnitLabel(unit)}):`, error.message);
          
          // Use the error message in the client question to help diagnose
          const errorMessage = error.message ? error.message.substring(0, 100) : "Unknown AI Error.";

          allQuestions.push({
            section: sectionId,
            unit: formatUnitLabel(unit),
            text: `❌ Failed to generate batch of MCQs. Error: ${errorMessage}`,
            marks: marks, difficulty: difficulty, isAIGenerated: false,
          });
          break; // Stop generating for this unit if a batch fails
        }
      }
    };

    for (const section of sections) {
      const { id: sectionId, individualConfig, autoConfig } = section;

      // --- Individual Mode ---
      if (individualConfig && !section.isAutoGenerate) {
        const { aiQuestionCount, defaultDifficulty, defaultMarks, defaultUnit, defaultOptionCount } = individualConfig;

        // 1. Generate AI Questions (Batched)
        await executeAIGeneration(sectionId, defaultUnit, aiQuestionCount, defaultMarks, defaultDifficulty, defaultOptionCount);

        // 2. Include Manual Questions from the original request payload
        if (section.questions) {
          const manualQuestions = section.questions.filter(q => !q.isAIGenerated);
          allQuestions.push(...manualQuestions);
        }
        continue;
      }

      // --- Auto (bulk) mode ---
      if (autoConfig && section.isAutoGenerate) {
        const { questionCount, marksPerQuestion, difficulty, units, optionCount } = autoConfig;
        const totalUnits = units?.length || 0;
        
        if (totalUnits === 0 && questionCount > 0) {
          // If no units selected, generate all from the general topic
          await executeAIGeneration(sectionId, "UNIT I", questionCount, marksPerQuestion, difficulty, optionCount);
        } else if (questionCount > 0 && totalUnits > 0) {
          // Distribute questions across selected units
          const questionsPerUnit = Math.floor(questionCount / totalUnits);
          let remainder = questionCount % totalUnits;

          for (let i = 0; i < totalUnits; i++) {
            const unit = units[i];
            const unitQuestionCount = questionsPerUnit + (remainder-- > 0 ? 1 : 0);

            await executeAIGeneration(sectionId, unit, unitQuestionCount, marksPerQuestion, difficulty, optionCount);
          }
        }
      }
    }

    if (allQuestions.length === 0) {
      return res.status(500).json({ error: "No MCQs generated. Check content, AI service, or configuration." });
    }

    // Re-group the generated questions back into their original sections
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
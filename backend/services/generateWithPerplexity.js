// services/perplexityService.js

const axios = require('axios');

/**
 * Creates a service for interacting with the Perplexity API.
 * @param {object} config - The application configuration object containing Perplexity credentials.
 * @returns {object} An object containing the generateWithPerplexity function.
 */
module.exports = function createPerplexityService(config) {
  
  /**
   * Generates content using the Perplexity API with the provided configuration.
   * @param {string} prompt - The user prompt to send to the API.
   * @returns {Promise<string>} The generated text content.
   */
  async function generateWithPerplexity(prompt) {
    // Get credentials from the config object passed into the factory
    const apiKey = config.PERPLEXITY_API_KEY;
    const endpoint = config.PERPLEXITY_ENDPOINT;
    const model = config.PERPLEXITY_MODEL;

    if (!apiKey || !endpoint || !model) {
      console.error("❌ Perplexity service is not configured. Check your environment variables.");
      throw new Error("Perplexity API is not configured.");
    }

    try {
      const response = await axios.post(endpoint, {
        model: model,
        messages: [
          { role: "system", content: "You are an expert academic question generator." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1024,
        temperature: 0.7
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });
  
      return response.data?.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.error("❌ Perplexity API Error:", error.response?.data || error.message);
      throw new Error("Perplexity API request failed");
    }
  }

  // Return an object containing the function(s) for this service
  return { generateWithPerplexity };
};
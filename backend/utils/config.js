const { getSecret } = require("./env_extractor");

// Create and export an async function that builds the config object
module.exports = async function loadConfig() {
try {
  const config = {
    DB_HOST: await getSecret('DB_HOST'),
    DB_USER: await getSecret('DB_USER'),
    DB_PASSWORD: await getSecret('DB_PASSWORD'),
    DB_NAME: await getSecret('DB_NAME'),
    PORT: await getSecret('PORT'),
    EMAIL_USER: await getSecret('EMAIL_USER'),
    EMAIL_PASS: await getSecret('EMAIL_PASS'),
    REGION_AWS: await getSecret('REGION_AWS'),
    ACCESS_KEY_ID_AWS: await getSecret('ACCESS_KEY_ID_AWS'),
    SECRET_ACCESS_KEY_AWS: await getSecret('SECRET_ACCESS_KEY_AWS'),
    S3_BUCKET_NAME: await getSecret('S3_BUCKET_NAME'),
    FRONTEND_URL: await getSecret('FRONTEND_URL'),
    PERPLEXITY_API_KEY: await getSecret('PERPLEXITY_API_KEY'),
    PERPLEXITY_ENDPOINT: await getSecret('PERPLEXITY_ENDPOINT'),
    PERPLEXITY_MODEL: await getSecret('PERPLEXITY_MODEL'),
    SLACK_WEBHOOK_URL: await getSecret('SLACK_WEBHOOK_URL'),
    
  };
  
  return config;
} catch (error) {
    // When an error is caught, re-throw it to stop the server startup
    console.error("❌ Failed to load configuration from secret manager.");
    throw error; // This will be caught by the try/catch in server.js
  }
};
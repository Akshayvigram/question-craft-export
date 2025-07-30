// utils/env_extractor.js

const { SSMClient, GetParameterCommand } = require("@aws-sdk/client-ssm");

// 1. Create the SSM client ONCE, outside the function, to be reused.
const ssmClient = new SSMClient({ region: "us-east-1" });

/**
 * Fetches a parameter from AWS SSM Parameter Store.
 * @param {string} parameterName - The name of the parameter to fetch.
 * @returns {Promise<string>} The value of the parameter.
 */
async function getSecret(parameterName) {

  const command = new GetParameterCommand({
    Name: parameterName,
    // Set to 'true' only if the parameter is a 'SecureString' type.
    // For 'String' type, this is correctly set to 'false'.
    WithDecryption: false,
  });

  try {

    // Use the single, shared client to send the command.
    const response = await ssmClient.send(command);

    if (response.Parameter && response.Parameter.Value) {
      return response.Parameter.Value;
    } else {
      // This is a critical failure, so we throw an error.
      throw new Error(`Parameter '${parameterName}' not found or value is empty.`);
    }
  } catch (error) {
    console.error(`❌ Error fetching parameter '${parameterName}': ${error.name}`);
    // 2. Re-throw the error. This will stop the server startup process,
    // which is what you want if a critical config value is missing.
    throw error;
  }
}

module.exports = { getSecret };
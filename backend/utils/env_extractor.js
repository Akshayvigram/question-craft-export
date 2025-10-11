require('dotenv').config();
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

/**
 * Fetch secret from environment or GCP Secret Manager.
 * @param {string} parameterName - The name of the secret key.
 */
async function getSecret(parameterName) {
  // 1. Check environment variable first (useful for local dev)
  if (process.env[parameterName]) {
    return process.env[parameterName];
  }

  // 2. Try fetching from GCP Secret Manager
  try {
    const projectId = process.env.GCP_PROJECT_ID;
    if (!projectId) {
      throw new Error('Missing GCP_PROJECT_ID in environment');
    }

    // Each secret version path looks like: projects/<project-id>/secrets/<name>/versions/latest
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${parameterName}/versions/latest`,
    });

    const secretValue = version.payload.data.toString('utf8');
    console.log(`🔐 Loaded ${parameterName} from Secret Manager`);
    return secretValue;

  } catch (err) {
    console.error(`❌ Error fetching parameter '${parameterName}': ${err.message}`);
    const error = new Error(`Critical parameter '${parameterName}' not found or failed to load`);
    error.name = 'ConfigurationError';
    throw error;
  }
}

module.exports = { getSecret };

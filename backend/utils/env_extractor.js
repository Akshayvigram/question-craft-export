async function getSecret(parameterName) {
  const value = process.env[parameterName];

  if (value) {
    return value;
  } else {
    // If the value is not found, throw an error to halt the startup sequence.
    const error = new Error(`Critical parameter '${parameterName}' not found in environment.`);
    error.name = 'ConfigurationError';
    
    console.error(`❌ Error fetching parameter '${parameterName}': ${error.name}`);
    throw error;
  }
}

// NOTE: Since the old file exported { getSecret }, we keep that structure.
module.exports = { getSecret };
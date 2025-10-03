const { AzureOpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

// Enhanced debugging
console.log("Azure OpenAI Configuration:");
console.log("Endpoint:", endpoint ? `${endpoint.substring(0, 20)}...` : 'NOT SET');
console.log("API Key:", apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET');
console.log("API Version:", apiVersion || 'NOT SET');
console.log("Deployment:", deployment || 'NOT SET');

if (!endpoint || !apiKey || !apiVersion || !deployment) {
  console.error("❌ Missing Azure OpenAI configuration:");
  console.error("Missing:", {
    endpoint: !endpoint,
    apiKey: !apiKey,
    apiVersion: !apiVersion,
    deployment: !deployment
  });
}

// Validate endpoint URL format
if (endpoint && !endpoint.startsWith('https://')) {
  console.error("❌ Invalid endpoint format. Should start with 'https://'");
  console.error("Current endpoint:", endpoint);
}

const client = new AzureOpenAI({
  apiKey,
  endpoint,
  apiVersion,
});

exports.bloggen = async (title) => {
  console.log("🚀 Starting blog generation for title:", title);
  
  if (!endpoint || !apiKey || !apiVersion || !deployment) {
    const missing = [];
    if (!endpoint) missing.push('endpoint');
    if (!apiKey) missing.push('apiKey');
    if (!apiVersion) missing.push('apiVersion');
    if (!deployment) missing.push('deployment');
    
    console.error("❌ Missing Azure OpenAI configuration:", missing.join(', '));
    return { 
      error: "Azure OpenAI configuration incomplete", 
      missing: missing 
    };
  }

  // Validate endpoint URL
  try {
    new URL(endpoint);
  } catch (urlError) {
    console.error("❌ Invalid endpoint URL:", endpoint);
    console.error("URL Error:", urlError.message);
    return { 
      error: "Invalid Azure OpenAI endpoint URL", 
      endpoint: endpoint 
    };
  }

  console.log("✅ Azure OpenAI configuration validated");

  const prompt = `
You are an expert blog writer and SEO specialist.
Write a 100% original, high-quality, SEO-optimized blog post based on the title:

"${title}"

Return the output strictly in valid JSON format with the following keys:

{
  "excerpt": "Plain text, short 1–2 sentence summary to hook the reader.",
  "content": "Full blog content in clean and semantic HTML5 format ONLY. Use <h1> (only once), <h2>, <h3> for headings, include <p>, <ul>, <ol>, <strong>, <em>, <blockquote>, <a>, <code>, <table>, etc., wherever appropriate. Add FAQ sections, examples, and tips as needed. Ensure good structure and readability. Minimum length: 800–1200 words.",
  "tags": ["List", "of", "5–10", "relevant", "tags"],
  "metaTitle": "Plain text, max 60 characters",
  "metaDescription": "Plain text, max 160 characters",
  "keywords": ["List", "of", "primary", "and", "secondary", "keywords"]
}

Rules:
- The output must be **only valid JSON**.
- Do not wrap JSON inside \`\`\`json or any code block markers.
- Do not include any explanations, notes, or text outside of the JSON.
- The "content" field must contain raw HTML only.
- All other fields must be plain text or arrays.
`;

  try {
    console.log("📡 Making request to Azure OpenAI...");
    
    const response = await client.chat.completions.create({
      model: deployment,
      messages: [
        { role: "system", content: "You are an expert blog writer and SEO specialist." },
        { role: "user", content: prompt },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    console.log("✅ Received response from Azure OpenAI");
    
    const rawOutput = response.choices[0]?.message?.content?.trim();
    if (!rawOutput) {
      console.error("❌ Empty response from model");
      console.error("Response object:", JSON.stringify(response, null, 2));
      return { error: "No content generated" };
    }

    console.log("📝 Raw output length:", rawOutput.length);
    console.log("📝 Raw output preview:", rawOutput.substring(0, 200) + "...");

    let parsed;
    try {
      parsed = JSON.parse(rawOutput);
      console.log("✅ Successfully parsed JSON response");
    } catch (err) {
      console.error("❌ Failed to parse JSON:", err.message);
      console.error("Raw output:", rawOutput);
      return { error: "Invalid JSON returned by model", raw: rawOutput };
    }

    return parsed;
  } catch (error) {
    console.error("❌ Error generating blog:");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);
    
    // Handle specific Azure OpenAI errors
    if (error.code === 'ENOTFOUND') {
      return { error: "Azure OpenAI endpoint not found. Check your endpoint URL." };
    }
    if (error.code === 'ECONNREFUSED') {
      return { error: "Connection refused. Check your endpoint URL and network." };
    }
    if (error.message.includes('Invalid URL')) {
      return { error: "Invalid Azure OpenAI endpoint URL format." };
    }
    if (error.status === 401) {
      return { error: "Unauthorized. Check your API key." };
    }
    if (error.status === 404) {
      return { error: "Deployment not found. Check your deployment name." };
    }
    
    return { error: "Server error", details: error.message };
  }
};
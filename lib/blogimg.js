const axios = require("axios");
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

exports.bloggen = async (title) => {
    console.log("title:", title);

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
        const azureUrl = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

        const response = await axios.post(
            azureUrl,
            {
                messages: [
                    { role: "system", content: "You are an expert blog writer and SEO specialist." },
                    { role: "user", content: prompt },
                ],
                max_tokens: 4000, // increase to allow full blog
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": apiKey,
                },
            }
        );

        const rawOutput = response.data?.choices?.[0]?.message?.content?.trim();
        if (!rawOutput) {
            console.error("Error: Empty response from model", response.data);
            return { error: "No content generated" };
        }

        let parsed;
        try {
            parsed = JSON.parse(rawOutput);
        } catch (err) {
            console.error("Failed to parse JSON:", err.message);
            console.error("Raw output:", rawOutput);
            return { error: "Invalid JSON returned by model", raw: rawOutput };
        }

        return parsed;

    } catch (error) {
        console.error("Error generating blog:", error.message || error);
        return { error: "Server error" };
    }
};

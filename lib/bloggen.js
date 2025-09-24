const axios = require("axios");
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

exports.bloggen = async (title) => {
    console.log("title:", title);
    
    const prompt = `
**You are an expert blog writer and SEO specialist.**
Write a 100% original, high-quality, SEO-optimized blog post based on the title:

**"${title}"**

Structure the output with the following sections:

1. **Excerpt:** (Plain text)
   A short 1–2 sentence summary to hook the reader.

2. **Content:** (HTML format ONLY)
   Write the full blog content in **clean and semantic HTML5**.

* Use <h1> (only once), <h2>, <h3> for headings
* Include <p>, <ul>, <ol>, <strong>, <em>, <blockquote>, <a>, <code>, <table>, etc., wherever appropriate
* Add FAQ sections, examples, and tips as needed
* Ensure good structure and readability
* Minimum length: **800–1200 words**

3. **Tags:** (Plain text list of 5–10 relevant tags)

4. **Meta Title:** (Plain text, max 60 characters)

5. **Meta Description:** (Plain text, max 160 characters)

6. **Keywords:** (Plain text list of primary and secondary keywords)

**Tone:** Friendly, informative, and professional
**Important:** Only the **Content** section should be in HTML. All other fields must be in **plain text** and clearly separated.
    `;
    // console.log("prompt:", prompt);

    try {
        const azureUrl = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
        // console.log("azureUrl:", azureUrl);

        const response = await axios.post(
            azureUrl,
            {
                messages: [
                    { role: "system", content: "You are an expert blog writer and SEO specialist" },
                    { role: "user", content: prompt },
                ],
                max_tokens: 2048,
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": apiKey,
                },
            }
        );
        // console.log("response:", response);
        if (!response.data || !response.data.choices) {
            console.error('Error generating blog: Invalid response format', response.data);
            return { error: 'Invalid response from Azure OpenAI' };
        }

        const notes = response.data.choices?.[0]?.message?.content || "No notes generated.";
        // console.log("Generated notes:", notes);
        return notes
    } catch (error) {
        console.error('Error generating blog:', error.message || error);
        return { error: 'Server error' };
    }
};
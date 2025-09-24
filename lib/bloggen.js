const axios = require("axios");
const { json } = require("express");
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;


exports.bloggen = async (title) => {
    if (!endpoint || !apiKey || !apiVersion || !deployment) {
        return json({ error: 'Missing Azure OpenAI API credentials' }, { status: 500 });
    }
    const prompt = `

> **You are an expert blog writer and SEO specialist.**
> Write a 100% original, high-quality, SEO-optimized blog post based on the title:
>
> **"{{${title}}}"**
>
> Structure the output with the following sections:
>
> 1. **Excerpt:** (Plain text)
>    A short 1–2 sentence summary to hook the reader.
>
> 2. **Content:** (HTML format ONLY)
>    Write the full blog content in **clean and semantic HTML5**.
>
> * Use `<h1>` (only once), `<h2>`, `<h3>` for headings
>
> * Include `<p>`, `<ul>`, `<ol>`, `<strong>`, `<em>`, `<blockquote>`, `<a>`, `<code>`, `<table>`, etc., wherever appropriate
>
> * Add FAQ sections, examples, and tips as needed
>
> * Ensure good structure and readability
>
> * Minimum length: **800–1200 words**
>
> 3. **Tags:** (Plain text list of 5–10 relevant tags)
>
> 4. **Meta Title:** (Plain text, max 60 characters)
>
> 5. **Meta Description:** (Plain text, max 160 characters)
>
> 6. **Keywords:** (Plain text list of primary and secondary keywords)
>
> **Tone:** Friendly, informative, and professional
> **Important:** Only the **Content** section should be in HTML. All other fields must be in **plain text** and clearly separated.

      `;
    try {
        const azureUrl = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
        const response = await fetch(azureUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey,
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are an expert blog writer and SEO specialist" },
                    { role: "user", content: prompt },
                ],
                max_tokens: 1024,
                temperature: 0.7,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            console.error('Error generating blog:', error);
        }
        const data = await response.json();
        const notes = data.choices?.[0]?.message?.content || "No notes generated.";
        return notes;
    } catch (error) {
        console.error('Error generating blog:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
};  
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const axios = require("axios");
const FormData = require("form-data");
dotenv.config();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.AZURE_OPENAI_ENDPOINT_IMG,
  defaultHeaders: {
    "api-key": process.env.OPENAI_API_KEY,
  },
  defaultQuery: {
    "api-version": "2025-04-01-preview",
  },
});
async function loginAndGetToken() {
  try {
    console.log("🔐 Logging in to get new token...");
    const response = await axios.post("http://localhost:8000/api/auth/login", {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    console.log("✅ Logged in successfully"+response.data.token);
    return response.data.token; // adjust this key if your API returns token in a different field
  } catch (err) {
    console.error("❌ Login failed:", err.response?.data || err.message);
    throw new Error("Login failed, cannot get token");
  }
}

exports.generateImage = async function (title) {
  try {

    console.log("title",title)
    const token = await loginAndGetToken();
    const prompt = `
Create a high-quality, realistic digital graphic illustrating the concept of "${title}". The scene should visually represent the theme using modern design elements, relevant technology icons, and vibrant colors. Include a bold title text in a clean, professional font, with a subtle gradient background (preferably dark or branded tones). Use iconography, lighting, and composition that align with the topic — for example, futuristic tech visuals, AI chips, people interacting with technology, or conference settings.
Maintain a 16:9 aspect ratio (1200x630), ensure clear readability, and keep the design professional and shareable for a tech blog cover image.
--ar 16:9 --style modern --lighting soft --mood professional --v 6 --quality 2
follow this must
-Include a bold title text in a clean, professional font, with a subtle gradient background (preferably dark or branded tones)
`;
    const result = await client.images.generate({
      model: "FLUX-1.1-pro",
      prompt,
      size: "1344x768",
      n: 1,
    });
    // Extract base64 string
    const base64Image = result.data[0].b64_json;
    // console.log(base64Image);
    const imageBuffer = Buffer.from(base64Image, "base64");
    console.log(imageBuffer);
    // Create output path
    const form = new FormData();
    form.append("image", imageBuffer, {
      filename: "flux-image.png",
      contentType: "image/png",
    });
    console.log("☁️ Uploading to your server...");
    const response = await axios.post(
      "http://localhost:8000/api/upload",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`, // ✅ use fresh token here
        },
      }
    );
    console.log("✅ Uploaded successfully:", response.data.url);
    return response.data.url;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
  
};


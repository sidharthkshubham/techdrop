const { bloggen } = require("../lib/bloggen");
const assert = require("assert");
require("dotenv").config();

async function testBloggen(req,res) {
    try {
        const result = await bloggen("AI in the field of Robotics");
        console.log("Bloggen output:", result);

        // Basic test case to check if bloggen returns expected structure
        assert.ok(result, "Bloggen did not return any result");
        assert.ok(result.excerpt, "Excerpt is missing in bloggen output");
        assert.ok(result.content, "Content is missing in bloggen output");
        assert.ok(Array.isArray(result.tags), "Tags should be an array");
        assert.ok(result.metaTitle, "Meta title is missing");
        assert.ok(result.metaDescription, "Meta description is missing");
        assert.ok(Array.isArray(result.keywords), "Keywords should be an array");

        console.log("✅ Bloggen test passed");
        res.json({
            msg:"✅ Bloggen test passed"
        })
    } catch (error) {
        console.error("❌ Bloggen test failed:", error.message || error);
    }
}

module.exports = { testBloggen };
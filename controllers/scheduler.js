
const { bloggen } = require("../lib/bloggen");
const Blog = require("../models/Blog");
const Title = require("../models/Title")

exports.scheduler = async (req,res)=>{
    try {
        const title=await Title.find({status:"pending"})
        console.log("title is ",title)
        console.log(title)
        if(!title){
            res.status(404).json({
                success: false,
                message: 'Title not found',
            });
        }
        console.log("title name is ",title[0].name)
        const bloggenn=await bloggen(title[0].name)
        console.log("bloggenn is ",bloggenn)
        const blog=await Blog.create({
            title:title[0].name,
            content:bloggenn.content,
            excerpt:bloggenn.excerpt,
            category:"AI",
            tags:bloggenn.tags,
            author:"67f4fb962c153e478dcdb98a",
            seo:{
                metaTitle:bloggenn.metaTitle,
                metaDescription:bloggenn.metaDescription,
                keywords:bloggenn.keywords.join(","),
            },
            status:"Published",

        })
        title[0].status="used"
        await title[0].save()
        res.json({
            blog:blog
        })

    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message
        });
    }
}

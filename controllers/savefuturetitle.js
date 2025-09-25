const Title = require("../models/Title");

exports.savetitle= async (req,res) => {
    try {
        const title =req.body.title;
    console.log(title)
    
    const createtitle=await Title.create({name:title})
    res.json({
        msg:createtitle
    })
    } catch (error) {
        console.error('Error creating title:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message
        });
    }
}
exports.gettitle=async (req,res) => {
    try {
    const title=await Title.find()
    res.json({
        title
    })
    } catch (error) {
        console.error('Error creating title:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message
        });
    }
}
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
exports.deletetitle=async(req,res)=>{

try{
    const title=await Title.findOne({_id:req.params.id});

if(!title){
res.status(404).json({
    success: false,
    message: 'Title not found',
});
}

await title.deleteOne();

res.status(200).json({
    success: true,
    message: 'Title deleted successfully',
});
}catch(error){
console.error('Error deleting title:', error);
res.status(500).json({
    success: false,
    message: 'Server error',
    error: error.message,
}); 
}}
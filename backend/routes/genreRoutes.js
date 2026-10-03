const express = require("express");
const{getGenre} = require("../services/genreServices");

const router = express.Router();

router.get("/genre", async (req,res)=>{
    const {song,artist} = req.query;
    if(!song||!artist){
        return res.status(400).json({
            message:"Song and artist are required"
        });
    }
    try{
        const result = await getGenre(song,artist);
        res.json(result);
    }catch(error){
        res.status(500).json({
            error:"Failed to get genre"
        });
    }
});

module.exports = router;
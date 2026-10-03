require("dotenv").config();
const cors = require("cors");
const express = require("express");
const genreRoutes = require("./routes/genreRoutes");
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;
app.use("/api", genreRoutes);

app.get("/",(req,res)=>{
    res.json({
        message:"Music genre backend is running"
    });
});

app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});
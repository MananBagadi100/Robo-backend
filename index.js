const express = require("express");
const cors = require("cors");
require("dotenv").config();

const aiRoutes = require("./routes/aiRoutes");

//Middlewares for cors handling and parsing json into readable format
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/ai", aiRoutes);

const PORT = 3000; 
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
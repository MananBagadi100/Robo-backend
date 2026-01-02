const express = require("express");
const cors = require("cors");
require("dotenv").config();

const aiRoutes = require("./routes/aiRoutes");

//Middlewares for cors handling and parsing json into readable format
const app = express();
const corsOptions = {
    origin : ["http://localhost:5173","http://localhost:4173",process.env.FRONTEND_URL]
}
app.use(cors(corsOptions));
app.use(express.json());

//Testing 
app.use('/api/test',(req,res) => {
    console.log(req.connection.remoteAddress)
    res.json({msg : "Hello from server !"})
})
// Routes
app.use("/api/ai", aiRoutes);

const PORT = 3000; 
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
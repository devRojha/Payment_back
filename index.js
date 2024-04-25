const express = require("express");
const mainRouter = require("./routes/index")
const cors = require("cors")

const app = express();

app.use("/api/v1", mainRouter)

app.use(cors())

app.use(express.json());


app.listen(3000, ()=>{
    console.log('online');
})
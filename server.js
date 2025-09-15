require ('dotenv').config();

const express = require('express');
const mongoose  = require('mongoose');
const PORT = process.env.PORT || 1234
const db = process.env.DATABASE_URI
const userRouter = require('./routes/userRouter')

const app = express()
app.use(express.json())
app.use("/api/v1/",userRouter)

mongoose.connect(db).then(()=>{
    console.log(`Connected to DB`);
    app.listen(PORT, ()=>{
    console.log(`Server is runing on PORT: ${PORT}`);
})
})
.catch((error) =>{
    console.log('db connection error:', error);    
});



//chamadas iniciais 
require('dotenv').config(); 
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')

//rotas 


//conexão com o mongoDB 
const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DBNAME}`; 

mongoose.connect(url)
.then(() => { 
    console.log("Running MONGODB")
})
.catch((err) => {
    console.log("ERROR MONGODB connection" + err.message); 
})

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());



module.exports = app;

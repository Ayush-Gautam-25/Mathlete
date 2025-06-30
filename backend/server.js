// backend/server.js

const userRoutes = require('./routes/userRoutes');
const pool = require('./config/database');

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express(); 
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const _ = require('lodash');
const fs = require("fs")

app.use(cors({
    origin: 'http://localhost:3000', // your frontend origin
    credentials: true                // ⬅️ allows cookies to be accepted
  }));
  
pool.connect();
app.use(express.json())
app.use("/api", userRoutes)
app.use(cookieParser()); 


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


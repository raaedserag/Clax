const express = require('express');
const app = express();
const mongoose = require('mongoose');

//**** Configuration Module
require('dotenv').config();
const configuration = require('./startup/config');

//**** Data Base Module : have connect() & close() methods(should be used with async & await)
const db = require('./models/db');
require('./startup/routes')(app);

//import Routes
// const complainRoute=require('./routes/complains');

//Route Middlewares
// app.use('/api/user',complainRoute);

//require('./models/complaintsModel');

//****Example To get port(), jwtKeys(), or connectionString(), use startup configuration
const port = configuration.port();
//**** Example to connect Data base
db.connect();

//app.listen(port,()=>console.log(`server start at port: ${port}`));
app.listen(port, () => console.log(`server start at port: 3000`));
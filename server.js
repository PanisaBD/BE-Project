const express = require('express');
const dotenv = require('dotenv');
const cookieParser=require('cookie-parser');
const connectDB = require('./config/db');

//Load env vars
dotenv.config({ path: './config/config.env' });

//body parser
const app = express();
app.use(express.json());

//Cookie parser
app.use (cookieParser());

//connect db
connectDB();

//Route files
const campgrounds = require ('./routes/campgrounds');
const bookings =require('./routes/bookings');
const auth = require('./routes/Auth');

app.use('/api/v1/campgrounds', campgrounds)
app.use('/api/v1/bookings',bookings);
app.use('/api/v1/auth',auth);
 app.get('/', (req,res) => {
   //1. res.send(<h1>Hello from express</h1>');
    //res.send({name:'Brad'});
   res.status(200).json({success:true, data:{id:1}});
 });

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port', PORT));

//Handle unhandled promise rejections 
process.on('unhandledRejection', (err,promise)=>{
    console.log( `Error: ${err.message}` );
     //Close server & exit process 
    server.close(()=>process.exit(1));
    });
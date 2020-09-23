const express =require('express')
const app=express()
const path=require('path')
const mongoose=require('mongoose')
const sgMail = require('@sendgrid/mail');
//const unirest = require('unirest')
const OTPmodel=require('./otp.schema.js')
//const { response } = require('express')
require('dotenv').config();

mongoose.connect(process.env.MONGO_ID,{useUnifiedTopology:true,useNewUrlParser:true,}).then(()=>{
    console.log("mongo is connected");
}).catch(()=>{
    console.log("cannot connected");
})
app.use(express.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname+"/public/index.html"));
})
app.get("/check",(req,res)=>{
    res.sendFile(path.join(__dirname+"/public/check.html"));
})


app.post("/otp",function(req,res){
   
const otpid = Math.floor(Math.random()*100000);
sgMail.setApiKey(process.env.sendgrid_api);
const msg = {
  to: req.body.email,
  from: 'soumyadipc25@gmail.com',
  subject: 'Sending with SendGrid is Fun',
  text: 'donot share your otp with anyone OTP:'+otpid,
  html: '<strong>donot share your otp with anyone OTP: </strong>'+otpid,
};
sgMail.send(msg).then((response) => {
  console.log('Message sent');
  OTPmodel.create({
      email:req.body.email,
      otp:otpid,
  })
  res.json(response);
}).catch((error) => {
  console.log(error.response.body)
  // console.log(error.response.body.errors[0].message)
  res.json({
      error: "error occured",
  });
});

})

app.post("/check",function(req,res){
const otp  = req.body.otp;
const email = req.body.email;

OTPmodel.find({email,otp}).lean().then(function(responseCheck){
    console.log(responseCheck);
    if(responseCheck){
        res.json(responseCheck);
    }
}).catch(function(error){
    res.json({
        error:"error occured",
    })
})

})


app.listen(3000,()=>{
    console.log("app started");
})
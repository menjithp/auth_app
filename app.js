const axios =require('axios')
const dayjs=require('dayjs')
const express = require('express');
const {google} = require('googleapis');
const app=express();
const tokens=""
const {v4}=require("uuid");
const path=require("path")
const cors=require("cors");

require("dotenv").config({path:"./.env"})

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration
const oauth2Client = new google.auth.OAuth2(
   process.env.CLIENT_ID,process.env.CLIENT_SECRET,process.env.REDIRECT_URL
);

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
  'https://www.googleapis.com/auth/calendar'
];

const calendar = google.calendar({version : "v3",auth:"AIzaSyAQhXUCt4yrSuzG7_AWrKT6d4SCIELmA48"});

app.get("/",(req,res)=>{

    res.sendFile(path.join(__dirname, '/public/index.html'));
})

app.get("/google",(req,res)=>{


    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
      });
      res.redirect(url)
})
app.get("/google/redirect",async(req,res)=>{


    const token=req.query.code
    const {tokens} = await oauth2Client.getToken(token)
    oauth2Client.setCredentials(tokens);

    res.redirect("/events")
  
})


app.get("/events",async(req,res)=>{

    console.log("ui",process.env.CLIENT_ID,process.env.CLIENT_SECRET,process.env.REDIRECT_URL)


   if(!oauth2Client.credentials.access_token){
       res.send({redirect:true})
       return 
   }


    let response=await calendar.events.insert({
        calendarId: 'primary',
        auth:oauth2Client,
        conferenceDataVersion: 1,
        resource:{
            summary:"this is test",
            description: 'A chance to hear more about Google\'s developer products.',
            start: {
                'dateTime': dayjs(new Date()).add(1,'day').toISOString(),
                'timeZone': 'Asia/Kolkata',
              },   
              end: {
                'dateTime': dayjs(new Date()).add(1,'day').add(1,'hour').toISOString(),
                'timeZone': 'Asia/Kolkata',
              },   
              conferenceData: {
                createRequest: {
                  conferenceSolutionKey: {
                    type: 'hangoutsMeet'
                  },
                  requestId: 'coding-calendar-demo'
                }
              },
            attendees:[{email:"menjithchandra2000@gmail.com"},{email:"biohackering@gmail.com"}]             
        },
      });


    res.send({
        msg:response.data.hangoutLink
    })
})



app.listen(3000,()=>{
    console.log("Server at 3000")
})
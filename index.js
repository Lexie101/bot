// const express = require('express');
// const app = express();
// const dia = require('dialogflow-fulfillment');

// app.get('/', (req, res)=>{
//   res.send('live on port 4000')
// });
// app.post('/',express.json(), (req, res)=>{
// const agent = dia.WebhookClient({
//   request:req,
//   express : res
// });

// function chat(agent){
//   agent.add('this is a response from webbook server')
// }
// var intentMap = new Map();
// intentMap.set('get_email',chat)
// });
// app.listen(4000,()=>console.log('server is running on port 4000'));
const express = require("express");
const bodyParser = require("body-parser");
const { WebhookClient } = require("dialogflow-fulfillment");
const { google } = require("googleapis");
const app = express();
app.use(bodyParser.json());

// GOOGLE SHEETS CONFIG
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; // from URL

async function appendToSheet(email) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:A",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[email]],
    },
  });
}

// DIALOGFLOW ENDPOINT
app.post("/webhook", (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  function captureEmail(agent) {
    const email = agent.parameters.email;
    return appendToSheet(email).then(() => {
      agent.add(`Thanks! I've saved your email: ${email}`);
    });
  }

  let intentMap = new Map();
  intentMap.set("CaptureEmailIntent", captureEmail); // Match Dialogflow intent name
  agent.handleRequest(intentMap);
});

app.listen(4000, () => console.log("Server running on port 4000"));

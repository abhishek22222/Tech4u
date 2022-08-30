const express = require("express");
const AWS = require("aws-sdk");
const fileupload = require("express-fileupload");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();


AWS.config.update({
  region: "ap-south-1",
  endpoint: "http://dynamodb.ap-south-1.amazonaws.com",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

AWS.config.getCredentials(function (err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log(1);
    console.log("Access key:", AWS.config.credentials.accessKeyId);
  }
});

const docClient = new AWS.DynamoDB.DocumentClient();

const port = 5000;

const res = require("express/lib/response");

const app = express();
app.use(cors({ origin: [`${process.env.CLIENT_URL}`, `${process.env.HOME_URL}`, `${process.env.DEVELOPMENT}`, `${process.env.TEST_1_URL}`], credentials: true }));
app.use((req, res, next) => {
  const allowedOrigins = [
    `${process.env.CLIENT_URL}`,
    `${process.env.HOME_URL}`,
    `${process.env.DEVELOPMENT}`,
    `${process.env.TEST_1_URL}`
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // res.header("Access-Control-Allow-Origin", `${process.env.CLIENT_URL}`);
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
app.use(
  fileupload({
    limits: { fileSize: 100 * 1024 * 1024 },
  })
);
app.use(express.static("files"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.post("/contactUs", async (req, res) => {
  const name = req.body.name;
  console.log(name);
  const phone = req.body.phone;
  const message = req.body.message;
  const cid = name + uuidv4();


  const params = {
    TableName: "detailsContactUs",
    Item: {
      cid: cid,
      name: name,
      phone: phone,
      message: message,
    },
  };

  try {
    const response = await docClient.put(params).promise();
    res.json({ message: "The data has beeen successfully stored", status: 200 });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }

});

app.post("/faqAdd",async(req,res) =>{
  const title = req.body.question;
  const content = req.body.answer;
  const qid = uuidv4();

  const params ={
    TableName:"faq",
    Item:{
      qid:qid,
      title:title,
      content:content
    }
  }
  try {
    const response = await docClient.put(params).promise();
    res.json({ message: "The data has beeen successfully stored", status: 200 });
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
})
app.get("/getFaq",async(req,res)=>{
  const params ={
    TableName:"faq",
    ProjectionExpression :" title, content",

  }
  try {
    const reportData = await docClient.scan(params).promise();
  
    return res.status(200).json(reportData.Items );
  }
  catch (err) {
    return res.status(401).json({ message: err.message })
  }
})

app.post("/update/:qid", async(req,res) =>{
  const qid = req.params.qid;
  const question = req.body.question;
  const answer = req.body.answer;
  

  const params1 = {
    TableName:"faq",
    KeyConditionExpression:"#qid = :qid",
    ExpressionAttributeNames:{
      "#qid":"qid"
    },
    ExpressionAttributeValues:{
      ":qid":qid,
      
    }
  }
  try {
    let data = await docClient.query(params1).promise();
    if (data.Items.length <= 0) {
      const error = new Error("data not found");
      error.code = 401;
      throw error;
    }
    console.log(data);
    const params={
      TableName:"faq",
      Item:{
        title:question,
        content:answer,
        qid:qid
      }
    };
    const response = await docClient.put(params).promise();
    return res.status(200).json({ message: "data stored sucessfully" });
  }
  catch (err) {
    return res.status(401).json({ error: err.message });
  }
})
app.post("/deleteItem/:qid", async(req,res) =>{
  const qid = req.params.qid;
  const params = {
    TableName: "faq",
    Key: {
      "qid": qid,
    },
  };
  try {
    const data = await docClient.delete(params).promise();
    
    return res.json({ message: "Success - item deleted", status: 200 });
  } catch (err) {
    console.log("Error", err);
  }
});
// testing purpose
app.get("/", (req, res) => res.send("test api running from : " + new Date()));

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
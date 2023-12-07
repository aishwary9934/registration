const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
const env = require("dotenv");
env.config();

app.use(cors());
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const JWT_SECRET = "dytfdtyfukyduyolfvuiklhiut6dt45153()guy";


mongoose
  .connect(process.env.DB_connection, {
    useNewUrlParser: true,
  })


  .then(() => {
    console.log("connected to database");
  })
  .catch((e) => console.log(e));

require("./user");

const User = mongoose.model("UserInfo");

app.post("/register", async (req, res) => {
  const { fname, lname, email, password } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);

  try {
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.send({ error: "User Exists" });
    }
    await User.create({
      fname,
      lname,
      email,
      password: encryptedPassword,
    });
    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "error" });
  }
});

app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!User) {
    return res.json({ error: "User not found" });
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign({email:user.email}, JWT_SECRET, {
      expiresIn:"24h"
    });

    if (res.status(201)) {
      return res.json({ status: "ok", data: token });
    } else {
      return res.json({ error: "error" });
    }
  }
  res.json({ status: "error", error: "Invalid Password" });
});

app.post("/userData", async(req,res)=>{
  const {token}=req.body;
  try {
    const user=jwt.verify(token,JWT_SECRET,(err,res)=>{
        if (err) {
          return "Token expired";
        }
        return res;
    });
console.log(user);
      if(user==="Token expired"){
        return  res.send({ status: "error" , data: "Token expired"})
      }
    
    const useremail = user.email;
    User.findOne({email:useremail})
    .then((data)=>{
      res.send({status:"ok", data: data});
    })
  .catch ((error) => {
    res.send({status: "error", data: error});
  });
}
catch (error) {}
});

app.listen(5000, () => {
  console.log("server started");
});

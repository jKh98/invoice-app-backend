const express = require("express")
const app = express();

const bodyParser = require("body-parser")
const {mongoose} = require("./db/db");

const userController = require("./controllers/userController")

app.use(bodyParser.urlencoded({encoded: false}));
app.use(bodyParser.json());

app.use("/user", userController)

app.listen(3333, () => {
    console.log("server sunning on 3333")
})

const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate")
const {User} = require("../models/user")

// router.get("/", (req, res) => {
//     res.send("This is a user route")
// })

router.post("/register", (req, res) => {
    const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    }
    const user = new User(userData)
    user.save().then(() => {
        if (user) {
            return user.generateAuthToken()
        } else
            res.sendStatus(400)
    }).then((token) => {
        res.header({"x-auth": token}).send(user)
    }).catch((e) => {
        res.status(400).send(e);
    })
})

router.post("/login", (req, res) => {
    User.findUserByCredentials(req.body.email, req.body.password).then((user) => {
        if (user) {
            user.generateAuthToken().then((token) => {
                res.header({"x-auth": token}).send(user);
            });
        } else {
            throw "Wrong Email or Password";
        }
    }).catch((e) => {
        res.status(400).send(e)
    });
})

router.delete("/logout", authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send("user logged out")
    }).catch((e) => {
        res.status(401).send(e)
    })
})

router.get("/user", authenticate, (req, res) => {
    res.send(req.user);
})

module.exports = router;


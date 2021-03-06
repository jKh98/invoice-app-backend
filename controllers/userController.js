const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate")
const {User} = require("../models/user")

router.post("/register", (req, res) => {
    const userData = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        company: req.body.company,
        phone: req.body.phone,
        address: req.body.address,
        base_currency: req.body.base_currency,
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

router.post("/edit", authenticate, (req, res) => {
    const query = {
        _id: req.user._id
    }
    const userData = {
        $set: {
            company: req.body.company,
            phone: req.body.phone,
            address: req.body.address,
            base_currency: req.body.base_currency,
        }
    }
    const options = {upsert: true, new: true, useFindAndModify: false, rawResult: true};
    User.findOneAndUpdate(query, userData, options).then((rawResult) => {
        res.send(rawResult);
    }).catch((error) => {
        res.status(500).send(error);
    });
})


router.post("/login", (req, res) => {
    User.findUserByCredentials(req.body.email, req.body.password).then((user) => {
        if (user) {
            user.generateAuthToken().then((token) => {
                res.header({"x-auth": token}).send(user);
            });
        } else {
            throw Error;
        }
    }).catch((e) => {
        res.status(400).send("Wrong Email or Password")
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


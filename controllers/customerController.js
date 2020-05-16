const express = require("express");
const router = express.Router();
const {User} = require("../models/user")
const {Customer} = require("../models/customer")
const authenticate = require("../middlewares/authenticate")


router.post("/edit", authenticate, (req, res) => {

    const query = {
        email: req.body.email,
        merchant: req.user
    }
    const customerData = {
        $set: {
            name: req.body.name,
            email: req.body.email,
            company: req.body.company,
            phone: req.body.phone,
            mobile: req.body.mobile,
            merchant: req.user
        }
    }
    const options = {upsert: true, new: true, useFindAndModify: false};
    Customer.findOneAndUpdate(query, customerData, options).then((customer) => {
        console.log(customer)
        if (customer) {
            res.send(customer);
        } else {
            throw "Changes were not saved."
        }
    }).catch((error) => {
        res.status(500).send(error);
    });


    // const user = new User(userData)
    // user.save().then(() => {
    //     if (user) {
    //         return user.generateAuthToken()
    //     } else
    //         res.sendStatus(400)
    // }).then((token) => {
    //     res.header({"x-auth": token}).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e);
    // })
});

module.exports = router;

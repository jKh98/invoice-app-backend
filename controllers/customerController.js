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
        if (customer) {
            res.send(customer);
        } else {
            throw "Changes were not saved."
        }
    }).catch((error) => {
        res.status(500).send(error);
    });
});

router.get("/all", authenticate, (req, res) => {
    const query = {
        merchant: req.user
    }
    Customer.find(query).then((customers) => {
        console.log(customers)
        if (customers) {
            res.send(customers);
        } else {
            res.status(500).send("No data available");
        }
    }).catch((error) => {
        res.status(500).send(error);
    })
})

module.exports = router;

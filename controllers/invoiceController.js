const express = require("express");
const router = express.Router();
const {Invoice} = require("../models/invoice")
const authenticate = require("../middlewares/authenticate")


router.post("/edit", authenticate, (req, res) => {
    const query = {
        number: req.body.number,
        customer: req.body.customer,
        merchant: req.user
    }
    const invoiceData = {
        $set: {
            number: req.body.number,
            customer: req.body.customer,
            issued: req.body.issued,
            due: req.body.due,
            items: req.body.items,
            subtotal: req.body.subtotal,
            discount: req.body.discount,
            total: req.body.total,
            paid: req.body.paid,
        }
    }
    const options = {upsert: true, new: true, useFindAndModify: false};
    Invoice.findOneAndUpdate(query, invoiceData, options).then((item) => {
        if (item) {
            res.send(item);
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
    Invoice.find(query).then((invoices) => {
        console.log(invoices)
        if (invoices) {
            res.send(invoices);
        } else {
            res.status(500).send("No data available");
        }
    }).catch((error) => {
        res.status(500).send(error);
    })
})

module.exports = router;

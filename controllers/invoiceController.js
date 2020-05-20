const express = require("express");
const router = express.Router();
const {Invoice} = require("../models/invoice")
const {Customer} = require("../models/customer")
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
            payment: req.body.payment,
        }
    }
    const options = {upsert: true, new: true, useFindAndModify: false, rawResult: true};
    Invoice.findOneAndUpdate(query, invoiceData, options).then((rawResult) => {
        if (rawResult.lastErrorObject.updatedExisting) {
            res.send(rawResult);
        } else {
            Customer.update({_id: req.body.customer},
                {$inc: {number_invoices: 1, total: req.body.total}}).then(() => {
                res.send(rawResult);
            }).catch((e) => {
                throw e;
            });
        }
    }).catch((error) => {
        res.status(500).send(error);
    });
});

router.get("/all", authenticate, (req, res) => {
    const query = {
        merchant: req.user
    }
    // .populate("customer").populate("items.item")
    Invoice.find(query).populate("payment").then((invoices) => {
        if (invoices) {
            res.send(invoices);
        } else {
            res.status(500).send("No data available");
        }
    }).catch((error) => {
        res.status(500).send(error);
    })
})


router.post("/send", authenticate, (req, res) => {
    const query = {
        number: req.body.number,
        customer: req.body.customer,
        merchant: req.user
    }
    Invoice.findOne(query).then((invoice) => {
        if (invoice) {
            res.send(invoice);
            //TODO add url email

        } else {
            res.status(500).send("No data available");
        }
    }).catch((error) => {
        res.status(500).send(error);
    })
});


module.exports = router;

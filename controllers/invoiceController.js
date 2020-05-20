const express = require("express");
const router = express.Router();
const {Invoice} = require("../models/invoice")
const {Customer} = require("../models/customer")
const {Payment} = require("../models/payment")
const authenticate = require("../middlewares/authenticate")
let nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'invoiceappserver@gmail.com',
        pass: 'invoice@ppSender' //Should be set up with env variables
    }
});

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
        payment: req.body.payment
    }
    Payment.findOne(query).populate({
        path: 'invoice',
        model: 'Invoice',
        populate: {
            path: 'customer',
            model: 'Customer'
        }
    }).then((payment) => {
        if (payment) {
            console.log(payment)
            let mailOptions = {
                from: 'invoiceappserver@gmail.com',
                to: payment.invoice.customer.email,
                subject: `Invoice number ${payment.invoice.number}`,
                text: 'That was easy!'
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.status(500).send("Something went wrong, email was not sent.");
                } else {
                    console.log('Email sent: ' + info.response);
                    res.send("Email sent successfully");
                }
            });

        } else {
            throw Error;
        }
    }).catch((error) => {
        res.status(500).send("Something went wrong, email was not sent.");
    })
});


module.exports = router;

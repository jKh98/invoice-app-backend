const express = require("express");
const router = express.Router();
const {Invoice} = require("../models/invoice")
const {Customer} = require("../models/customer")
const {Payment} = require("../models/payment")
const authenticate = require("../middlewares/authenticate")
let path = require('path');
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
        populate: [
            {
                path: 'customer',
                model: 'Customer'
            },
            {
                path: 'items.item',
                model: 'Item'
            }],
    }).then((payment) => {
        if (payment) {
            let fullUrl = `${req.protocol}://${req.get('host')}/payment/id/${payment._id}`;
            invoiceToPdf(req.user, payment.invoice);
            let mailOptions = {
                from: 'invoiceappserver@gmail.com',
                to: payment.invoice.customer.email,
                subject: `Invoice number ${payment.invoice.number}`,
                text: `Pay your latest invoice here ${fullUrl}`,
                attachments: [{
                    filename: 'invoice.pdf',
                    path: path.join(path.resolve('attachments'), 'invoice.pdf'),
                    contentType: 'application/pdf'
                }]
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


const invoiceToPdf = (user, invoice) => {
    const pdfInvoice = require('pdf-invoice')
    const document = pdfInvoice({
        company: {
            phone: user.phone,
            email: user.email,
            address: user.address,
            name: user.name,
        },
        customer: {
            name: invoice.customer.name,
            email: invoice.customer.email,
        },
        items: invoice.items.map(i => {
            return {amount: i.subtotal, name: i.item.name, description: i.item.description, quantity: i.quantity}
        })
    })
    console.log(invoice.items.map(i => {
        return {amount: i.subtotal, name: i.item.name, description: i.item.description, quantity: i.quantity}
    }))
    const fs = require('fs')
    document.generate() // triggers rendering
    document.pdfkitDoc.pipe(fs.createWriteStream(path.join(path.resolve('attachments'), 'invoice.pdf')))
}

module.exports = router;

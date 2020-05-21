const express = require("express");
const {Payment} = require("../models/payment")
const {Invoice} = require("../models/invoice")
const authenticate = require("../middlewares/authenticate")
let path = require('path');
let views = path.resolve('views');
const stripe = require("stripe")("sk_test_UsyZgjl89d3vybFAaCjp1SmO00GtvBsaUL");

const router = express.Router();

router.post("/new", authenticate, (req, res) => {
    const paymentData = {
        $set: {
            invoice: req.body.invoice,
            status: req.body.status,
            paid_on: req.body.paid_on,
            amount_paid: req.body.amount_paid,
            amount_due: req.body.amount_due,
        }
    }

    const options = {upsert: true, new: true, useFindAndModify: false, rawResult: true};
    Payment.findOneAndUpdate({}, paymentData, options).then((payment) => {
        res.send(payment);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

router.use('/id/:_id', express.static("views", {index: false}));
router.get('/id/:_id', (req, res, next) => {
    let _id = req.params._id;
    return Payment.findOne({_id}).populate({
        path: 'invoice',
        model: 'Invoice',
        populate: {
            path: 'merchant',
            model: 'User'
        }
    }).then((payment) => {
        if (!payment) {
            throw Error;
        } else {
            if (payment.status) {
                res.status(200).send("Invoice already paid.");
            } else {
                res.render(path.join(views, 'index.html'),
                    {
                        payment_id: payment._id,
                        invoice_id: payment.invoice._id,
                        currency: payment.invoice.merchant.base_currency,
                        amount: payment.amount_due
                    });
                next();
            }
        }
    }).catch((e) => {
        res.render(path.join(views, '404.html'),);
    })
});


router.get("/stripe-key", (req, res) => {
    res.send({publicKey: 'pk_test_FV9xZrXldD4HdpzeanB6kLlv00ah51eqsV'});
});

router.post("/pay", async (req, res) => {
    const {token, payment_id, invoice_id, amount, currency} = req.body;
    // Create a charge with the token sent by the client
    console.log(token, payment_id, invoice_id, amount, currency)
    stripe.charges.create({
        amount: amount * 100,
        currency: currency,
        source: token
    }).then((charge) => {
        Payment.update({_id: payment_id},
            {
                status: true,
                amount_due: 0,
                amount_paid: amount,
                paid_on: Date.now()
            }).then(() => {
            res.send(charge);
        }).catch((e) => {
            throw e;
        })
    }).catch((e) => {
        res.send({error: e.message});
    });
});

module.exports = router;

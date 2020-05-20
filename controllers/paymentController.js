const express = require("express");
const {Payment} = require("../models/payment")
const {Invoice} = require("../models/invoice")
const authenticate = require("../middlewares/authenticate")
const router = express.Router();

router.post("/new", authenticate, (req, res) => {
    const paymentData = {
        invoice: req.body.invoice,
        status: req.body.status,
        paid_on: req.body.paid_on,
        amount_paid: req.body.amount_paid,
        amount_due: req.body.amount_due,
    }

    const payment = new Payment(paymentData)

    payment.save().then((doc) => {
        if (doc) {
            res.send(doc)
        } else
            res.sendStatus(400)
    }).catch((e) => {
        res.status(400).send(e);
    })
})


router.get('/:_id', (req, res) => {
    let _id = req.params._id;
    return Payment.findOne({_id}).then((user) => {
        if (!user) {
            throw "Page Not Found."
        } else {
            if (user.status) {
                throw "No Payments Available."
            }
            res.send(_id)
        }
    }).catch((e) => {
        res.status(400).send(e);
    })
});

module.exports = router;

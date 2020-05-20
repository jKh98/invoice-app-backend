const express = require("express");
const {Payment} = require("../models/payment")
const {Invoice} = require("../models/invoice")
const authenticate = require("../middlewares/authenticate")
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
    Payment.findOneAndUpdate({},paymentData,options).then((rawResult) => {
            res.send(rawResult)
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
            } else {
                res.send(_id)
            }
        }
    }).catch((e) => {
        res.status(400).send(e);
    })
});

module.exports = router;

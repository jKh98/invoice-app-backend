const express = require("express");
const {Payment} = require("../models/payment")
const {Invoice} = require("../models/invoice")
const authenticate = require("../middlewares/authenticate")
const {resolve} = require("path");
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
    Payment.findOneAndUpdate({}, paymentData, options).then((rawResult) => {
        res.send(rawResult)
    }).catch((e) => {
        res.status(400).send(e);
    })
})

router.get('/id/:_id', (req, res, next) => {
    let _id = req.params._id;
    return Payment.findOne({_id}).then((user) => {
        if (!user) {
            throw Error;
        } else {
            if (user.status) {
                throw Error;
            } else {
                // const path = resolve(express.static("views/index.html"));
                // res.sendFile(path);
                next();
                // res.send(_id)
            }
        }
    }).catch((e) => {
        // const path = resolve(express.static("views/404.html"));
        // res.render(path);
        res.status(400).send("Page Not Found");
        // res.end(e);
        // next('route');
    })
});
router.use('/id/:_id', express.static("views"));

router.get("/stripe-key", (req, res) => {
    res.send({publicKey: 'pk_test_FV9xZrXldD4HdpzeanB6kLlv00ah51eqsV'});
});

router.post("/pay", async (req, res) => {
    const {token, items} = req.body;
    try {
        // Create a charge with the token sent by the client
        const charge = await stripe.charges.create({
            amount: 1400,
            currency: "usd",
            source: token
        });
        res.send(charge);
    } catch (e) {
        res.send({error: e.message});
    }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const {Item} = require("../models/item")
const authenticate = require("../middlewares/authenticate")


router.post("/edit", authenticate, (req, res) => {
    const query = {
        name: req.body.name,
        merchant: req.user
    }
    const itemData = {
        $set: {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            merchant: req.user
        }
    }
    const options = {upsert: true, new: true, useFindAndModify: false, rawResult: true};
    Item.findOneAndUpdate(query, itemData, options).then((rawResult) => {
        if (rawResult.updatedExisting) {
            res.send(rawResult);
        } else {
            res.send(rawResult);
        }
    }).catch((error) => {
        res.status(500).send(error);
    });
});

router.get("/all", authenticate, (req, res) => {
    const query = {
        merchant: req.user
    }
    Item.find(query).then((items) => {
        if (items) {
            res.send(items);
        } else {
            res.status(500).send("No data available");
        }
    }).catch((error) => {
        res.status(500).send(error);
    })
})

module.exports = router;

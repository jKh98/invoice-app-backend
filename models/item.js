const mongoose = require("mongoose");
const Schema = mongoose.Schema
const _ = require("lodash")

const ItemSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 4
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        trim: true,
        required: false,
    },
    merchant: {
        type: Schema.ObjectId,
        ref: 'User'
    }
})

ItemSchema.methods.toJSON = function () {
    const item = this;
    const itemObject = item.toObject();
    return _.pick(itemObject, ["_id", "name", "price", "description", "merchant"]);
}

const Item = mongoose.model('Item', ItemSchema, 'items')

module.exports = {Item};

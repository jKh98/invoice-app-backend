const mongoose = require("mongoose");
const Schema = mongoose.Schema
const _ = require("lodash")

const PaymentSchema = new Schema({
    invoice: {
        type: Schema.ObjectId,
        ref: 'Invoice',
        required: true,
        unique: true,
    },
    status: {
        type: Boolean,
        default: false,
        required: true,
    },
    paid_on: {
        type: Date,
        required: true,
        default: Date.now
    },
    amount_paid: {
        min: 0,
        type: Number,
        required: true,
    },
    amount_due: {
        min: 0,
        type: Number,
        required: true,
    },

})

PaymentSchema.methods.toJSON = function () {
    const item = this;
    const itemObject = item.toObject();
    return _.pick(itemObject, ["_id", "invoice", "status", "paid_on", "amount_paid", "amount_due"]);
}

const Payment = mongoose.model('Payment', PaymentSchema, 'payments')

module.exports = {Payment};

const mongoose = require("mongoose");
const Schema = mongoose.Schema
const _ = require("lodash")

const CustomerSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: 4
    },
    company: {
        type: String,
        trim: true,
        required: false,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        minlength: 7
    },
    phone: {
        type: String,
        trim: true,
        required: true,
        minlength: 8
    },
    mobile: {
        type: String,
        trim: true,
        required: false,
        minlength: 8
    },
    merchant: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    addresses: [{
            type: String,
            required: true,
        },
    ]
})

CustomerSchema.index({email: 1, sweepstakes_id: 1}, {unique: true});

CustomerSchema.methods.toJSON = function () {
    const customer = this;
    const customerObject = customer.toObject();
    return _.pick(customerObject, ["_id", "name", "email", "company", "phone", "mobile", "addresses", "merchant"]);
}


const Customer = mongoose.model('Customer', CustomerSchema, 'customers')

module.exports = {Customer};

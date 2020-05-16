const mongoose = require("mongoose");

let password = 'LTFmQfZMQiqTZCvJ'
const mongodb_url = `mongodb+srv://jihad:${password}@cluster0-otqbz.mongodb.net/invoice-app?retryWrites=true&w=majority`

mongoose.connect(mongodb_url, {useNewUrlParser: true,useUnifiedTopology: true})

module.exports = {mongoose}

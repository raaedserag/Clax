const mongoose = require("mongoose");

// Paypal Model
const paypalSchema = new mongoose.Schema({
    intent: { type: String },
    payer: {


        payment_method: { type: String }
    },
    redirect_urls: {
        return_url: { type: String },
        cancel_url: { type: String }
    },
    transactions: [
        {
            item_list: {
                items: [{
                    name: { type: String },
                    sku: { type: Number },
                    price: { type: String },
                    currency: { type: String },
                    quantity: { type: String },

                }
                ]
            },
            amount: {
                currency: { type: String },
                total: { type: String },

            },
            description: { type: String }
        }],

});

module.exports.Paypal = mongoose.model("Paypal", paypalSchema);

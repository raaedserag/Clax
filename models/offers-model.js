// Modules
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require('joi-objectid')(Joi)


//****************** Offers Model ******************
// Schema
const offerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 64
    },
    code: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    start:{
        type: Date,
        default: Date.now
    },
    end: {
        type: Date,
        required: true
    },
    is_public: {type: Boolean, default: false},
    offerType: {
        type: String, 
        required: true,
        enum: ["freeTrips", "cash", "discount"]
    },
    tripsCount: {
        type: Number,
        default: 0,
        min: 0,
        validate:
          [
            {
                validator: (c)=> {return Number.isInteger(c);},
                message: "tripsCount should be an integer"
            }
            /*,
            {
                validator: (c)=> {return !(c > 0 && this.offerType !== "freeTrips");},
                message: "tripsCount can be only set if the offerType is 'freeTrips'"
            }
            */
          ]
    },
    cashAmount: {
        type: Number,
        min: 0,
        default: 0
        /*,
        validate:{
            validator: (a)=> {return !(a > 0 && this.offerType !== "cash");},
            message: "cashAmount can be only set if the offerType is ''"
        }
          */
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
        validate:[    
            {
                validator: (d)=> {return Number.isInteger(d);},
                message: "discount should be an integer"
            }
            /*
            ,
            {
                validator: (d)=> {return !(d > 0 && this.offerType !== "discount");},
                message: "discount can be only set if the offerType is 'discount'"
            }
            */
            ]
        },
    _line:{
        type: mongoose.ObjectId, ref: 'Lines',
        validate:{
            validator: ()=> {return (this.offerType === "freeTrips" || 
            this.offerType === "discount");},
            message: "line can be only set if the offerType is 'freeTrip' or 'discount'"
        }
    },
    _passengers: [{type: mongoose.ObjectId, ref: 'Passengers'}]
});


////****************** Passenger Validation  ******************
// Set Validation Schema 
const validationSchema = Joi.object().keys({
    title: Joi.string()
    .required()
    .trim()
    .min(4)
    .max(64),
    code: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(30),
    start: Joi.date(),
    end: Joi.date(),
    offerType: Joi.string()
    .required()
    .valid("freeTrips", "cash", "discount"),
    tripsCount: Joi.number()
    .integer()
    .min(0),
    cashAmount: Joi.number()
    .min(0),
    discount: Joi.number()
    .integer()
    .min(0)
    .max(100),
    _line: Joi.objectId(),
    _passengers: Joi.array().items(Joi.objectId())
});
const validateOffer = function(offer){
    return validationSchema.validate(offer);
}

module.exports.Offers = mongoose.model("Offers", offerSchema);
module.exports.validateOffer = validateOffer;
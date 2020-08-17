// Modules
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

//****************** Offers Model ******************
// Offer Schema
const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 4,
    maxlength: 64,
  },
  code: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  description: {
    type: String,
    required: true,

    minlength: 10,
    maxlength: 300,
  },
  start: {
    type: Date,
    default: Date.now,
  },
  end: {
    type: Date,
    required: true,
  },

  offerType: {
    type: String,
    required: true,
    enum: ["Free Trips", "Cash Amount", "Discount"],
  },
  value: {
    type: Number,
    default: 0,
    min: 0,
    validate: [
      {
        validator: (c) => {
          return Number.isInteger(c);
        },
        message: "value should be an integer",
      },
      /*,
            {
                validator: (c)=> {return !(c > 0 && this.offerType !== "freeTrips");},
                message: "tripsCount can be only set if the offerType is 'freeTrips'"
            }
            */
    ],
  },
  _line: {
    type: mongoose.ObjectId,
    ref: "Lines",
    validate: {
      validator: () => {
        return this.offerType === "freeTrips" || this.offerType === "discount";
      },
      message:
        "line can be only set if the offerType is 'freeTrip' or 'discount'",
    },
  },
  _passengers: [{ type: mongoose.ObjectId, ref: "Passengers" }],
});

////****************** Passenger Validation  ******************
// Set Validation Schema
const validationSchema = Joi.object().keys({
  title: Joi.string().required().trim().min(4).max(64),
  code: Joi.string().required().trim().min(3).max(30),
  description: Joi.string().required().min(10).max(300),
  start: Joi.date(),
  end: Joi.date(),
  offerType: Joi.string()
    .required()
    .valid("Free Trips", "Cash Amount", "Discount"),
  value: Joi.number().integer().min(0),
  _line: Joi.objectId(),
  _passengers: Joi.array().items(Joi.objectId()),
});

const validateOffer = function (offer) {
  return validationSchema.validate(offer);
};

const validateOfferCode = function (offer) {
  const codeSchema = Joi.object().keys({
    code: Joi.string().required().trim().min(3).max(6),
  });
  return codeSchema.validate(offer);
};

module.exports.Offers = mongoose.model("Offers", offerSchema);
module.exports.validateOffer = validateOffer;
module.exports.validateOfferCode = validateOfferCode;

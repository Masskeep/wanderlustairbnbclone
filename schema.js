const Joi = require('joi');

// Define Joi schema for validating listing data.
const listingSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required(),
        images: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string()
        )
    }).required()
});
    
const joi = require('joi');


module.exports.contentSchema=joi.object({
    Content : joi.object({
        title : joi.string().required(),
        author :joi.string().required(),
        category :joi.string().required(),
        content : joi.string().required()
}).required(),
});

module.exports.reviewSchema=joi.object({
    review : joi.object({
        rating : joi.number().required(),
        comment : joi.string().required()
    }).required(),
})
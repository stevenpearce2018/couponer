const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    address: String,
    city: String,
    amountCoupons: Number,
    lengthInDays: Number,
    currentPrice: Number,
    discountedPrice: Number,
    category: String,
    textarea: String,
    base64image: String,
    superCoupon: String,
    couponCodes: { type : Array , "default" : [] },
    couponStillValid: Boolean
})

module.exports = mongoose.model('Coupon', couponSchema)
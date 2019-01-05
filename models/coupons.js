const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, text: true },
    address: String,
    city: String,
    amountCoupons: Number,
    // lengthInDays: Number,
    currentPrice: Number,
    discountedPrice: Number,
    category: String,
    textarea: { type: String, text: true },
    base64image: String,
    superCoupon: String,
    couponCodes: { type : Array , "default" : [] },
    couponStillValid: Boolean,
    longitude: Number,
    latitude: Number,
    loc: {
        type: { type: String },
        coordinates: [Number]
    }
})
// couponSchema.ensureIndex({ "loc": "2dsphere" });
// couponSchema.index({ "loc": "2dsphere" });
// couponSchema.dropIndexes();
// couponSchema.createIndex({ loc: '2dsphere' });

module.exports = mongoose.model('Coupon', couponSchema)
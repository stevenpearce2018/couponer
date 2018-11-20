// This will remove the coupon codes to prevent them from being sent to the client
const cleanCoupons = Coupons => {
    let couponObject = Coupons;
    const CouponsLength = Coupons ? Coupons.length : 0;
    let i = 0;
    if (CouponsLength > 0) {
        for(;i < CouponsLength; i++) couponObject[i].couponCodes = null;
    }
    return couponObject;
}

module.exports = cleanCoupons;
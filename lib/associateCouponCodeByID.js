const associateCouponCodeByID = (IdCouponCodePairs, Coupons) => {
    let couponObject = Coupons;
    const CouponsLength = Coupons ? Coupons.length : 0;
    const arraySize = IdCouponCodePairs ? IdCouponCodePairs.length : 0;
    let i = 0;
    let j;
    if (CouponsLength > 0 && arraySize > 0) {
        for(;i < CouponsLength; i++){
          for(j = 0; j < arraySize; j++){
            if(couponObject[i]._id.toString() === IdCouponCodePairs[j]._id) {
                // console.log(IdCouponCodePairs[j].couponCode)
                // couponObject[i].couponCode = IdCouponCodePairs[j].couponCode;
                couponObject[i].couponCodes = IdCouponCodePairs[j].couponCode;
                // console.log(couponObject[i].couponCode)
                break;
            }
          }
        }
    }
    // console.log(couponObject[0].couponCode)
    return couponObject;
}

module.exports = associateCouponCodeByID;
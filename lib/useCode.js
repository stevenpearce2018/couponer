const useCode = (couponCode, couponCodess) => {
    let i = 0;
    const iMax = codes.length;
    let couponCodes = couponCodess;
    for (; i< iMax ; i++) {
      if(couponCodes[i].couponCode.substring(0, couponCodes[i].couponCode.length - 1) === couponCode) {
        couponCodes[i].couponCode = couponCode.substring(0, couponCode.length - 1) + "u";
        break;
      }
    }
    return couponCodes;
  }
module.exports = useCode;
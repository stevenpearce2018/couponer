const claimCode = codes => {
    let i = 0;
    const iMax = codes.length;
    let couponCodes = codes;
    for (; i< iMax ; i++) {
      if(couponCodes[i].substr(-1) === "a") {
        couponCodes[i] = couponCodes[i].substring(0, couponCodes[i].length - 1) + "c";
        break;
      }
    }
    return couponCodes;
}

module.exports = claimCode;
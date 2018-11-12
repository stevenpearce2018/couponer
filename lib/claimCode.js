const claimCode = codes => {
    let i = 0;
    const iMax = codes.length;
    let couponCodes = codes;
    let claimed = false;
    for (; i< iMax ; i++) {
      if(couponCodes[i].substr(-1) === "a" && claimed === false) {
        couponCodes[i] = couponCodes[i].substring(0, couponCodes[i].length - 1) + "c";
        break;
      }
    }
    return couponCodes;
}

module.exports = claimCode;
const useCode = (couponCode, couponCodes) => {
  let i = 0;
  const couponCodesLength = couponCodes.length;
  let claimedCode = couponCodes;
  for (; i < couponCodesLength; i++ ) {
    if(couponCodes[i].couponCode === couponCode) {
      claimedCode[i].couponCode = couponCode.slice(0, -1) + "u";
      break;
    }
  }
  return claimedCode;
}
module.exports = useCode;
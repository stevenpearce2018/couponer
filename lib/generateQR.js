const QRCode = require('qrcode');
const generateQR = async text => {
    try {
      return await QRCode.toDataURL(text)
    } catch (err) {
      console.error("Failed to make qrcode: " + err)
    }
}

module.exports = generateQR;
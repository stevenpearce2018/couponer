const configureStripe = require('stripe');
const stripe = configureStripe(process.env.STRIPEKEY);

module.exports = stripe;
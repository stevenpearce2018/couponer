const configureStripe = require('stripe');
// !todo, use secret key in production
// create production account
const STRIPE_SECRET_KEY = process.env.NODE_ENV === 'production'
    ? 'sk_live_MY_SECRET_KEY'
    : 'sk_test_MY_SECRET_KEY';

const stripe = configureStripe("sk_test_E5U0FgmC6Bw87z8onWvWzLZM");

module.exports = stripe;
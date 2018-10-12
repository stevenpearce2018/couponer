import React from 'react'
import StripeCheckout from 'react-stripe-checkout';

const CURRENCY = 'USD';

const fromEuroToCent = amount => amount * 100;

const successPayment = data => {
  alert('Payment Successful');
  console.log(data);
};

const errorPayment = data => {
  alert('Payment Error');
  console.log(data);
};

const onToken = (amount, description) => (token) => {
  const data = {
    description,
    source: token.id,
    currency: CURRENCY,
    amount: fromEuroToCent(amount)
  }
  const url = '/api/charge'
  fetch(url, {
  method: "POST", // *GET, POST, PUT, DELETE, etc.
  mode: "cors", // no-cors, cors, *same-origin
  cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
  credentials: "same-origin", // include, same-origin, *omit
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    // "Content-Type": "application/x-www-form-urlencoded",
  },
  body: JSON.stringify(data),
  }).then(successPayment)
  .catch(errorPayment);

}


const Checkout = ({ name, description, amount }) =>
  <StripeCheckout
    name={name}
    description={description}
    amount={fromEuroToCent(amount)}
    token={onToken(amount, description)}
    currency={CURRENCY}
    stripeKey={"pk_test_1grvOEC6DvjC9afFJN2OxhWI"}
  />

export default Checkout;
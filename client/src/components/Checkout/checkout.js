import React, { Component } from 'react'
import StripeCheckout from 'react-stripe-checkout';

const CURRENCY = 'USD';

const fromEuroToCent = amount =>  {
  amount * 100;
}
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
  this.props.parentMethod(data)
}

  class Checkout extends Component {
    constructor(props) {
      super(props);
    }
    render() {
      return (
        <StripeCheckout
        name={this.props.name}
        parentMethod = {this.props.parentMethod}
        description={this.props.description}
        amount={fromEuroToCent(this.props.amount)}
        token={onToken(this.props.amount, this.props.description).bind(this)}
        currency={CURRENCY}
        stripeKey={"pk_test_1grvOEC6DvjC9afFJN2OxhWI"}
        panelLabel={this.props.panelLabel}
        alipay
        bitcoin
      />
      );
    }
}

export default Checkout;
import React, { Component } from 'react'
import StripeCheckout from 'react-stripe-checkout';
import { toast } from 'react-toastify';


const CURRENCY = 'USD';
  class Checkout extends Component {
    constructor(props) {
      super(props);
      this.successPayment = this.successPayment.bind(this);
      this.errorPayment = this.errorPayment.bind(this);
      this.onToken = this.onToken.bind(this);
    }

    fromEuroToCent = amount => amount * 100;

    successPayment = data => toast.success('Payment Successful');

    errorPayment = data => toast.error('Payment Error');

    onToken = (amount, description) => token => {
        const data = {
          description,
          source: token.id,
          currency: CURRENCY,
          amount: this.fromEuroToCent(amount)
        }
        this.props.parentMethod(data)
    }
    render() {
      return (
        <StripeCheckout
        name={this.props.name}
        parentMethod = {this.props.parentMethod}
        description={this.props.description}
        amount={this.fromEuroToCent(this.props.amount)}
        token={this.onToken(this.props.amount, this.props.description)}
        currency={this.props.CURRENCY}
        stripeKey={"pk_live_BL9smKhY7sQofwy88ZNH9q2D"}
        panelLabel={this.props.panelLabel}
        alipay
        bitcoin
      />
      );
    }
}

export default Checkout;
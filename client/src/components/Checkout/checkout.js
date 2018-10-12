import React, { Component } from 'react'
import StripeCheckout from 'react-stripe-checkout';

const CURRENCY = 'USD';

// const fromEuroToCent = amount => amount * 100;

// const successPayment = data => {
//   alert('Payment Successful');
//   console.log(data);
// };

// const errorPayment = data => {
//   alert('Payment Error');
//   console.log(data);
// };

// const onToken = (amount, description) => (token) => {
//   const data = {
//     description,
//     source: token.id,
//     currency: CURRENCY,
//     amount: fromEuroToCent(amount)
//   }
//   const url = '/api/charge'
//   fetch(url, {
//   method: "POST", // *GET, POST, PUT, DELETE, etc.
//   mode: "cors", // no-cors, cors, *same-origin
//   cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
//   credentials: "same-origin", // include, same-origin, *omit
//   headers: {
//     "Content-Type": "application/json; charset=utf-8",
//     // "Content-Type": "application/x-www-form-urlencoded",
//   },
//   body: JSON.stringify(data),
//   }).then(successPayment)
//   .catch(errorPayment);
// }


// const Checkout = ({ name, description, amount }) =>
//   <StripeCheckout
//     name={name}
//     description={description}
//     amount={fromEuroToCent(amount)}
//     token={onToken(amount, description)}
//     currency={CURRENCY}
//     stripeKey={"pk_test_1grvOEC6DvjC9afFJN2OxhWI"}
//   />


  class Checkout extends Component {
    constructor(props) {
      super(props);
      this.successPayment = this.successPayment.bind(this);
      this.errorPayment = this.errorPayment.bind(this);
      this.onToken = this.onToken.bind(this);
    }

    fromEuroToCent = amount => amount * 100;

    successPayment = data => {
      alert('Payment Successful');
      console.log(data);
    };

    errorPayment = data => {
      alert('Payment Error');
      console.log(data);
    };

    onToken = (amount, description) => (token) => {
      const result = this.props.parentMethod()
      if (result !== true) {
        alert('Failed')
      } else {
        const data = {
          description,
          source: token.id,
          currency: CURRENCY,
          amount: this.fromEuroToCent(amount)
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
        }).then(this.successPayment)
        .catch(this.errorPayment);
      }
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
        stripeKey={"pk_test_1grvOEC6DvjC9afFJN2OxhWI"}
        image="https://www.vidhub.co/assets/logos/vidhub-icon-2e5c629f64ced5598a56387d4e3d0c7c.png"
        panelLabel="Give Money" 
        alipay
        bitcoin
      />
      );
    }
}

export default Checkout;
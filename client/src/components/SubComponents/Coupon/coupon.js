import React, { Component } from 'react';
import './coupon.css';

class Coupon extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div className="coupon">
        <link rel="stylesheet" href="path/to/font-awesome/css/font-awesome.min.css"></link>
          <h1 className = "exampleTitle">{this.props.title}</h1>
          <div className = "exampleImage" ><img className = "exampleImage" src={this.props.imagePreviewUrl} /></div>
          <div className="pricing">
            <div className='oldPrice'>
                Was: {(this.props.currentPrice - 0).toFixed(2)}$
            </div>
            <div className='percentOff'>
                {(((this.props.currentPrice - this.props.discountedPrice)/this.props.currentPrice)*100).toFixed(2)}% Percent Off!
            </div>
            <br/>
            <div className='newPrice'>
                Now: {(this.props.discountedPrice - 0).toFixed(2)}$
            </div>
            <div className='savings'>
                Save: {(this.props.currentPrice - this.props.discountedPrice).toFixed(2)}$
            </div>
            <br/>
            <hr/>
            <div className="amountLeft">
                Only {this.props.amountCoupons} Coupons Left!
            </div>
          <hr/>
          <div className="description">
          <br/>
            <p>{this.props.textarea}</p>
            <br/>
            <hr/>
            <br/>
            <p className="timeLeft"> Don't delay, only <strong>{this.props.length}</strong> left until these coupons expire! </p>
            <hr/>
            <br/>
            <p>{this.props.address}</p>
            <hr/>
            <br/>
          <button className="getCoupon"> Get Coupon </button>
          <button className="declineCoupon"> No Thanks </button>
          </div>
          <br/>
        </div>
      </div>
    )
  }
}



export default Coupon; 
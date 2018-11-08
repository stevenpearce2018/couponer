import React, { Component } from 'react';

class Coupon extends Component {
  render() {
    return (
        <div className="coupon">
          <h1 className = "exampleTitle">{this.props.title}</h1>
          <div className = "exampleImage" ><img className = "exampleImage" src={this.props.imagePreviewUrl} alt={this.props.textarea}/></div>
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
            <p>{this.props.address}</p>
            <br/>
            <p>{this.props.distance}</p>
            <hr/>
            <br/>
          <button className="getCoupon"><strong>Get Coupon</strong></button>
          </div>
          <br/>
        </div>
      </div>
    )
  }
}



export default Coupon; 
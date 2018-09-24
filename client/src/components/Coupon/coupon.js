import React, { Component } from 'react';
import './coupon.css';

class Coupon extends Component {
  constructor(props) {
    super(props);
    this.props = {
      title: 'Rent your very own kitten today!',
      longitude: '',
      latitude: '',
      address: '123 Cuddle Street, Kittentown, MA. 0 Miles Away.',
      amountCoupons: '100',
      currentPrice: '10.00',
      discountedPrice: '5.00',
      length: '1 day ',
      superCoupon: 'Make a Selection',
      textarea: 'Ever want to have a kitten without the responsibility of actually owning it? Want to sneak a kitten into your apartment for a week without your pesky landlord knowing? Now you can! Call 1-8000-RENT-CAT now to rent your very own kitten today.',
      file: '',
      imagePreviewUrl: 'http://www.petsworld.in/blog/wp-content/uploads/2014/09/cute-kittens.jpg',
      category: '',
      city: '',
    };
  }

  render() {
    return (
      <div className="flextape">
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800" rel="stylesheet"></link>
        <link href="https://netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet"></link>
        <div className='formHeader'>
          <h1 className='formHeaderText'> Coupon details</h1>
        </div>
        <div className="coupon">
          <h1 className = "exampleTitle">{this.props.title}</h1>
          <div className = "exampleImage" >
          <img src={this.props.imagePreviewUrl} />
          </div>
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
        </div>
    )
  }
}



export default Coupon; 
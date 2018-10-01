import React, { Component } from 'react';

// class CouponsMaker extends Component {
//     constructor(props) {
//         super(props);
//         this.state = { 
//       };
//       this.getCoupon = this.getCoupon.bind(this);
//       this.declineCoupon = this.declineCoupon.bind(this);
//     }
//     getCoupon(_id){
//         alert(_id)
//     }
//     declineCoupon(_id){
//         alert(_id)
//     }

//     render () {
//         return (
//                 <div className="coupon">
//                     <h1 className = "exampleTitle">{this.props.title}</h1>
//                     <img  className = "exampleImage" src={this.props.base64image} />
//                     <div className="pricing">
//                     <div className='oldPrice'>
//                         Was: {(this.props.currentPrice - 0).toFixed(2)}$
//                     </div>
//                     <div className='percentOff'>
//                         {(((this.props.currentPrice - this.props.discountedPrice)/this.props.currentPrice)*100).toFixed(2)}% Percent Off!
//                     </div>
//                     <br/>
//                     <div className='newPrice'>
//                         Now: {(this.props.discountedPrice - 0).toFixed(2)}$
//                     </div>
//                     <div className='savings'>
//                         Save: {(this.props.currentPrice - this.props.discountedPrice).toFixed(2)}$
//                     </div>
//                     <br/>
//                     <hr/>
//                     <div className="amountLeft">
//                         Only {this.props.amountCoupons} Coupons Left!
//                     </div>
//                     <hr/>
//                     <div className="description">
//                     <br/>
//                     <p>{this.props.textarea}</p>
//                     <br/>
//                     <hr/>
//                     <br/>
//                     <p className="timeLeft"> Don't delay, only <strong>{this.props.lengthInDays}</strong> left until these coupons expire! </p>
//                     <hr/>
//                     <br/>
//                     <p>{this.props.address}</p>
//                     <hr/>
//                     <br/>
//                     <button className="getCoupon" data-param={this.props.couponData} onClick={this.getCoupon(this.props._id)}> Get Coupon </button>
//                     <button className ="declineCoupon"> No Thanks </button>
//                     </div>
//                     <br/>
//                 </div>
//             </div>
//         )
//       }
// }

const CouponsMaker = (props) => {
    const content = props.map((coupons) =>
    <div className="coupon">
    <h1 className = "exampleTitle">{coupons.title}</h1>
    <img  className = "exampleImage" src={coupons.base64image} />
    <div className="pricing">
      <div className='oldPrice'>
          Was: {(coupons.currentPrice - 0).toFixed(2)}$
      </div>
      <div className='percentOff'>
          {(((coupons.currentPrice - coupons.discountedPrice)/coupons.currentPrice)*100).toFixed(2)}% Percent Off!
      </div>
      <br/>
      <div className='newPrice'>
          Now: {(coupons.discountedPrice - 0).toFixed(2)}$
      </div>
      <div className='savings'>
          Save: {(coupons.currentPrice - coupons.discountedPrice).toFixed(2)}$
      </div>
      <br/>
      <hr/>
      <div className="amountLeft">
          Only {coupons.amountCoupons} Coupons Left!
      </div>
    <hr/>
    <div className="description">
    <br/>
      <p>{coupons.textarea}</p>
      <br/>
      <hr/>
      <br/>
      <p className="timeLeft"> Don't delay, only <strong>{coupons.lengthInDays}</strong> left until these coupons expire! </p>
      <hr/>
      <br/>
      <p>{coupons.address}</p>
      <hr/>
      <br/>
    <button className="getCoupon" onClick={this.getCoupons}> Get Coupon </button>
    <button className ="declineCoupon"> No Thanks </button>
    </div>
    <br/>
  </div>
</div>
    );
    return (
    <div className='flextape'>
        {content}
      </div>
    );
  }

export default CouponsMaker;
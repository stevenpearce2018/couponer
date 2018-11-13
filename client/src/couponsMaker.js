import React, { Component } from 'react';
import capitalizeCase from './capitalizeCase';
import uppcaseFirstWord from './uppcaseFirstWord';
import HaversineInMiles from './HaversineInMiles';
import postRequest from './postReqest';

const latitude = sessionStorage.getItem('couponlatitude');
const longitude = sessionStorage.getItem('couponlongitude');

const getCoupons = async(_id) => {
  const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey') ? sessionStorage.getItem('UnlimitedCouponerKey').replace('"', '').replace('"', '') : null;
  const email = sessionStorage.getItem('UnlimitedCouponerEmail') ? sessionStorage.getItem('UnlimitedCouponerEmail') : null;
  if (!loggedInKey || !email) {
    alert('You are not logged in!')
    window.location.href = '/Login'
  }
  else {
    const data = {
      _id: _id,
      loggedInKey: loggedInKey,
      email: email
    }
    const url = `/api/getCoupon`
    const json = await postRequest(url, data)
    alert(JSON.stringify(json))
  }
}

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
    try {
      const content = props.map((coupons) =>
      <div className="coupon" id={coupons._id}>
      <h1 className = "exampleTitle">{coupons.title}</h1>
      <img  className = "exampleImage" src={coupons.base64image} alt="Example showing how your custom upload will appear on the coupon"/>
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
        <p>{uppcaseFirstWord(coupons.textarea)}</p>
        <br/>
        <hr/>
        <br/>
        <p>{capitalizeCase(coupons.address)}</p>
        <br/>
        <p>{capitalizeCase(coupons.city)}</p>
        <br/>
        <p>{HaversineInMiles(latitude, longitude, coupons.latitude, coupons.longitude)}</p>
        <hr/>
        <button className="getCoupon" onClick={ () => getCoupons(coupons._id)}> Get Coupon </button>
      {/* <button className="getCoupon" onClick={this.props.parentMethod(coupons._id)}> Get Coupon </button> */}
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
    } catch (error) {
      return (
      <div className='center'>
      <br/>
      <h2>Unable to automatically search for coupons. Try searching manually.</h2>
      </div>
      )
    }
  }

export default CouponsMaker;
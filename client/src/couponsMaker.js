import React, { Component } from 'react';
import capitalizeCase from './capitalizeCase';
import uppcaseFirstWord from './uppcaseFirstWord';
import HaversineInMiles from './HaversineInMiles';
import postRequest from './postReqest';

const latitude = sessionStorage.getItem('couponlatitude');
const longitude = sessionStorage.getItem('couponlongitude');
const buisnessOwner = sessionStorage.getItem('buisnessOwner');

const showCode = (code) => {
  alert(JSON.stringify(code))
}

const getCoupons = async(_id) => {
  const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey') ? sessionStorage.getItem('UnlimitedCouponerKey').replace('"', '').replace('"', '') : null;
  const email = sessionStorage.getItem('UnlimitedCouponerEmail') ? sessionStorage.getItem('UnlimitedCouponerEmail') : null;
  if (!loggedInKey || !email) {
    alert('You are not logged in!')
    // window.location.href = '/Login'
    window.history.pushState(null, '', decodeURIComponent(`/Login`));
  }
  else {
    const data = {
      _id: _id,
      loggedInKey: loggedInKey,
      email: email
    }
    const url = `/api/getCoupon`
    const json = await postRequest(url, data)
    const couponsCurrentlyClaimed = Number(sessionStorage.getItem('couponsCurrentlyClaimed')) + 1;
    sessionStorage.setItem('couponsCurrentlyClaimed', couponsCurrentlyClaimed )
    alert(JSON.stringify(json))
  }
}

const CouponsMaker = props => {
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
        <p>{capitalizeCase(coupons.address)}, {capitalizeCase(coupons.city)}</p>
        <br/>
        <p>{HaversineInMiles(latitude, longitude, coupons.latitude, coupons.longitude)}</p>
        <hr/>
        <br/>
        {
          (window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length).toLowerCase() === "mycoupons" && buisnessOwner === "true") ?
            <button className="getCoupon" onClick={ () => getCoupons(coupons._id)}> Validate Customer Codes </button> :
          (window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length).toLowerCase() === "mycoupons" && buisnessOwner === "false") ? 
            <button className="getCoupon" onClick={ () => showCode(coupons.couponCodes[0])}> Show Your Coupon Code </button> :
            <button className="getCoupon" onClick={ () => getCoupons(coupons._id)}> Get Coupon </button>
        }
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
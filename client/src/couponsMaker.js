import React from 'react';

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
                <button className="getCoupon"> Get Coupon </button>
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
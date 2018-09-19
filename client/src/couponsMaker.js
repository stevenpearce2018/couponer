import React from 'react';

const CouponsMaker = (props) => {
    const content = props.map((coupons) =>
    <div className='coupons'>
        <div className='coupons'><h3>{coupons.title}</h3></div>
        <div className='coupons'><img src={coupons.base64image} /></div>
        <div className='coupons'><p>{coupons.category}</p></div>
        <div className='coupons'><p>{coupons.textarea}</p></div>
        <div className='coupons'><p>{coupons.category}</p></div>
        <div className='coupons'><p>{coupons.city}</p></div>
        <div className='coupons'><p>{coupons.address}</p></div>
        <div className='coupons'><p>{coupons.currentPrice}</p></div>
        <div className='coupons'><p>{coupons.discountedPrice}</p></div>
        <div className='coupons'><p>{coupons.lengthInDays}</p></div>
    </div>
    );
    return (
    <div className='couponsHolder'>
        {content}
      </div>
    );
  }

export default CouponsMaker;
import React from 'react';

const Coupon = props => {
    return (
        <div className="coupon">
          <h2 className = "exampleTitle">{props.title}</h2>
          <div className = "exampleImage" ><img className = "exampleImage" src={props.imagePreviewUrl} alt={props.textarea}/></div>
          <div className="pricing">
            <div className='oldPrice'>
                Was: {(props.currentPrice - 0).toFixed(2)}$
            </div>
            <div className='percentOff'>
                {(((props.currentPrice - props.discountedPrice)/props.currentPrice)*100).toFixed(2)}% Percent Off!
            </div>
            <br/>
            <div className='newPrice'>
                Now: {(props.discountedPrice - 0).toFixed(2) === "0.00" ? "FREE" : (props.discountedPrice - 0).toFixed(2) + "$"}
            </div>
            <div className='savings'>
                Save: {(props.currentPrice - props.discountedPrice).toFixed(2)}$
            </div>
            <br/>
            <hr/>
            <div className="amountLeft">
                Only {props.amountCoupons} Coupons Left!
            </div>
          <hr/>
          <div className="description">
          <br/>
            <p>{props.textarea}</p>
            <br/>
            <hr/>
            <p>{props.address}</p>
            <br/>
            <p>{props.distance}</p>
            <hr/>
            <br/>
          <button className="getCoupon"><strong>Get Coupon</strong></button>
          </div>
          <br/>
        </div>
      </div>
    )
}



export default Coupon; 
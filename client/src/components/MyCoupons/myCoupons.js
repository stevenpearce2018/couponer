 
import React, { Component } from 'react';
import './myCoupons.css';

class MyCoupons extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
        geolocation: '',
        latitude: '',
        longitude: '',
        coupons: <div className="loaderContainer"><div className="loader"></div></div>
    };
    this.getCoupons = this.getCoupons.bind(this);
  }
  async componentDidMount () {
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
          <button className="getCoupon" onClick={this.getCoupons.bind(this, coupons._id)}> Get Coupon </button>
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
        alert("Unable to automatically search for coupons. Try searching manually.")
      }
    }
    const loggedInKey = sessionStorage.getItem('couponerkey')
    if (!loggedInKey) {
        window.location.pathname = '/Home';
        alert('You are not logged in!')
    }
    else {
      const data = {
        loggedinkeykey: loggedInKey
      }
      const url = `/api/getYourCoupons`
      const response = await fetch(url, {
        method: "POST", 
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      this.setState({coupons: CouponsMaker(json.coupons)})
    }
  }
  async getCoupons(id) {
    this.props.parentMethod(id)
  }
  render() {
    return (
      <div>
          <h2 className="center">Here are your coupons</h2>
          {this.state.coupons}
      </div>
    );
  }
}

export default MyCoupons;
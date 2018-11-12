import React, { Component } from 'react';
import './accountsettings.css';
import InputField from '../SubComponents/InputField/inputField';
import postRequest from '../../postReqest';
import HaversineInMiles from '../../HaversineInMiles';

class AccountSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldPassword: '',
      newPassword:'',
      city: '',
      buisnessName: '',
      phoneNumber:'',
      latitude: '',
      longitude: '',
      coupons: <div className="loaderContainer"><div className="loader"></div></div>,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  async componentDidMount() {
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(showPosition);
    const that = this;
    const google = window.google
    // eslint-disable-next-line
    const geocoder = new google.maps.Geocoder;
    function showPosition(position) {
      that.setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    }
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
          <br/>
          <p>{HaversineInMiles(this.state.latitude, this.state.longitude, coupons.latitude, coupons.longitude)}</p>
          <hr/>
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
    const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey');
    const email = sessionStorage.getItem('UnlimitedCouponerEmail');
    this.setState({loggedInKey:loggedInKey})
    if (!loggedInKey || loggedInKey.substr(-1) !== "b" && loggedInKey.substr(-1) !== "c") {
      window.location.pathname = '/Home';
      alert('You are not logged in!')
    }
    else {
      const data = {
        loggedInKey: loggedInKey,
        email: email
      }
      const url = `/api/getYourCoupons`
      const json = await postRequest(url, data)
      this.setState({coupons: CouponsMaker(json && json.coupons)})
    }
  }
  handleChange = (event) => {
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }
  async handleSubmit(e){
    e.preventDefault();
    const data = {
      buisnessName: this.state.buisnessName,
      phoneNumber: this.state.phoneNumber,
      city: this.state.city,
      oldPassword: this.state.oldPassword,
      newPassword: this.state.newPassword,
      email: this.state.email,
    }
    this.props.updateAccountSettings(data)
  }

  render() {
    return (
    <div className="container text-center">
      <form className="accountForm" method="post">
      <div className="adjustAccountSettings">
        <h2>Change Account Settings</h2>
      </div>
      <InputField
        htmlFor="Password"
        type="password"
        labelHTML="Change Password"
        name="newPassword"
        placeholder="New Password"
        onChange={this.handleChange}
      />
      <InputField
        htmlFor="Password"
        type="password"
        name="oldPassword"
        labelHTML="Old Password"
        placeholder="Old Password"
        onChange={this.handleChange}
      />
      <InputField
        htmlFor="Phone Number"
        type="number"
        name="phoneNumber"
        labelHTML="Phone Number"
        placeholder="+1 123-456-7890"
        onChange={this.handleChange}
      />        
      <InputField
        htmlFor="City"
        type="text"
        labelHTML="City"
        name="city"
        placeholder="Coupon Town"
        onChange={this.handleChange}
      />
      <InputField
        htmlFor="Buisness Name"
        type="text"
        labelHTML="Buisness Name"
        name="buisnessName"
        placeholder="Buisness Name"
        onChange={this.handleChange}
      /> 
      <button value="send" className="updatebtn" onClick={this.handleSubmit}><strong>Update Info</strong></button>
      </form>

      <div className="center">
        <br/>
        <h2>Your Coupons</h2>
        {this.state.coupons}
      </div>
    </div>
    )
  }
}

export default AccountSettings;
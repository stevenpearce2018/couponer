 
import React, { Component } from 'react';
import './myCoupons.css';
import postRequest from '../../postReqest';
import CouponsMaker from '../../couponsMaker';
import InputField from '../SubComponents/InputField/inputField';
import capitalizeCase from '../../capitalizeCase';
import { toast } from 'react-toastify';
import getPosition from "../../getPosition";

class MyCoupons extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
        geolocation: '',
        latitude: '',
        longitude: '',
        coupons: <div className="loaderContainer"><div className="loader"></div></div>,
        popupClass: 'hiddenOverlay',
        isBusinessOwner: false,
        id: '',
        couponCode: ''
    };
    this.togglePopup = this.togglePopup.bind(this);
    this.showPopup = this.showPopup.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validateCode = this.validateCode.bind(this);
  }
  async componentDidMount () {
    const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey') ? sessionStorage.getItem('UnlimitedCouponerKey').replace('"', '').replace('"', '') : null;
    if (!loggedInKey || loggedInKey.slice(-1) !== "b" && loggedInKey.slice(-1) !== "c") {
      this.props.setMainHome();
      return toast.error('You are not logged in!')
    }
    const couponlatitude = sessionStorage.getItem('couponlatitude');
    const couponlongitude = sessionStorage.getItem('couponlongitude');
    if (!couponlatitude && !couponlongitude && navigator.geolocation) getPosition(gotPosition);
    else this.setState({latitude: couponlatitude, longitude: couponlongitude})
    const that = this;
    function gotPosition(position) {
      that.setState({
        latitude: position.latitude,
        longitude: position.longitude,
      })
    }
    loggedInKey.slice(-1) === "b" ? this.setState({isBusinessOwner: true}) : this.setState({isBusinessOwner: false})
    const email = sessionStorage.getItem('UnlimitedCouponerEmail') ? sessionStorage.getItem('UnlimitedCouponerEmail') : null;
    const data = {
      loggedInKey: loggedInKey,
      email: email
    }
    const json = await postRequest(`/api/getYourCoupons`, data)
    if(json && json.coupons) this.setState({coupons: CouponsMaker(json.coupons, this.props.updateCouponsClaimed, this.showPopup)})
    else this.setState({coupons: <div className="center"><br/><h2>No coupons found, claim/create some coupons today!</h2></div>})
  }
  togglePopup = () => this.state.popupClass === "hiddenOverlay" ? this.setState({popupClass: "overlay"}) : this.setState({popupClass: "hiddenOverlay"})
  showPopup = (id, title) => {
    this.setState({id: id, title: title})
    this.togglePopup()
  }
  handleChange = event => {
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }
  async validateCode(){
    if (this.state.email === "" || this.state.couponCode === "") return toast.error('Please fill out both fields!');
    const data = {
      id: this.state.id,
      email: this.state.email,
      couponCode: this.state.couponCode + ":c"
    }
    const json = await postRequest(`/api/validateCode`, data)
    if(json.response === "Coupon is valid!") {
      this.togglePopup()
      toast.success(json.response)
    } else toast.error(json.response)
  }
  render() {
    return (
      <div>
        <div className={this.state.popupClass}>
          <div className="popup">
            <h2 className="popupheader">{this.state.isBusinessOwner === true ? "Validate codes for: " + capitalizeCase(this.state.title) : "Your coupon code for " + capitalizeCase(this.state.title) + " is:"}</h2>
            <a className="close" onClick={this.togglePopup}>&times;</a>
            {
              this.state.isBusinessOwner === true ?
              <div className="popupcontent fivedigit">
                <InputField
                  htmlFor="Coupon Code"
                  type="text"
                  labelHTML="Coupon Code"
                  placeholder="Coupon Code"
                  name="couponCode"
                  onChange={this.handleChange}
                  required
                />
                <InputField
                  htmlFor="Customer Email"
                  type="text"
                  labelHTML="Customer Email"
                  placeholder="Customer Email"
                  name="email"
                  onChange={this.handleChange}
                  required
                />
                <div className="popupbtn">
                  <button className='signupbtn signupbtnn' value="send" onClick={this.validateCode}><strong>Submit</strong></button>
                </div>
              </div> : 
              <div>
                <br/>
                <strong>
                  {this.state.id.slice(0, -2)}
                </strong>
                <br/>
              </div>
            }

          </div>
        </div>
          <h2 className="center">Here are your coupons</h2>
          {this.state.coupons}
      </div>
    );
  }
}

export default MyCoupons;
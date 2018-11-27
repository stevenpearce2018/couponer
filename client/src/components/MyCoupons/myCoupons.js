 
import React, { Component } from 'react';
import './myCoupons.css';
import postRequest from '../../postReqest';
import CouponsMaker from '../../couponsMaker';
import InputField from '../SubComponents/InputField/inputField';
import capitalizeCase from '../../capitalizeCase';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(showPosition);
    const that = this;
    function showPosition(position) {
      that.setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
      sessionStorage.setItem('couponlatitude', position.coords.latitude);
      sessionStorage.setItem('couponlongitude', position.coords.longitude);
    }
    const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey') ? sessionStorage.getItem('UnlimitedCouponerKey').replace('"', '').replace('"', '') : null;
    const email = sessionStorage.getItem('UnlimitedCouponerEmail') ? sessionStorage.getItem('UnlimitedCouponerEmail') : null;
    if (!loggedInKey || loggedInKey.slice(-1) !== "b" && loggedInKey.slice(-1) !== "c") {
      this.props.setMainHome()
      window.history.pushState(null, '', '/Home');
      toast.error('You are not logged in!')
    }
    else {
      loggedInKey.slice(-1) === "b" ? this.setState({isBusinessOwner: true}) : this.setState({isBusinessOwner: false})
      const data = {
        loggedInKey: loggedInKey,
        email: email
      }
      const json = await postRequest(`/api/getYourCoupons`, data)
      if(json && json.coupons) this.setState({coupons: CouponsMaker(json.coupons, null, this.showPopup)})
      else this.setState({coupons: <div className="center"><br/><h2>No coupons found, claim/create some coupons today!</h2></div>})
    }
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
    const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey') ? sessionStorage.getItem('UnlimitedCouponerKey').replace('"', '').replace('"', '') : null;
    const email = sessionStorage.getItem('UnlimitedCouponerEmail') ? sessionStorage.getItem('UnlimitedCouponerEmail') : null;
    const data = {
      id: this.state.id,
      loggedInKey: loggedInKey,
      email: email,
      couponCode: this.state.couponCode
    }
    const json = await postRequest(`/api/validateCode`, data)
    console.log(json.response)
    // if(json && json.coupons) this.setState({coupons: CouponsMaker(json.coupons, null, this.showPopup)})
    // else this.setState({coupons: <div className="center"><br/><h2>No coupons found, claim/create some coupons today!</h2></div>})
  }
  render() {
    return (
      <div>
        <ToastContainer />
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
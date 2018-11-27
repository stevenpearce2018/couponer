import React, { Component } from 'react';
import './accountsettings.css';
import InputField from '../SubComponents/InputField/inputField';
import postRequest from '../../postReqest';
import CouponsMaker from '../../couponsMaker';
import Checkout from '../Checkout/checkout';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const buisnessOwner = sessionStorage.getItem('buisnessOwner');

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
      numberOfMonths: '',
      membershipExperationDate: '',
      coupons: <div className="loaderContainer"><div className="loader"></div></div>,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.updateMembershipExperationDate = this.updateMembershipExperationDate.bind(this)
    this.addMonths = this.addMonths.bind(this);
  }
  
  async componentDidMount() {
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
    const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey');
    const email = sessionStorage.getItem('UnlimitedCouponerEmail');
    if (!loggedInKey || loggedInKey.substr(-1) !== "b" && loggedInKey.substr(-1) !== "c") {
      this.props.setMainHome()
      window.history.pushState(null, '', '/Home');
      toast.error('You are not logged in!')
    }
    else {
      const data = {
        loggedInKey: loggedInKey,
        email: email
      }
      const json = await postRequest(`/api/getYourCoupons`, data)
      this.setState({coupons: CouponsMaker(json && json.coupons)})
    }
  }
  handleChange = event => {
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }
  updateMembershipExperationDate(event){
    let d = new Date();
    d.setMonth( d.getMonth() + Number(event.target.value));
    this.setState({numberOfMonths: Number(event.target.value), membershipExperationDate: d})
  }
  async handleSubmit(e){
    e.preventDefault();
    const data = {
      buisnessName: this.state.buisnessName,
      phoneNumber: this.state.phoneNumber,
      city: this.state.city,
      oldPassword: this.state.oldPassword,
      newPassword: this.state.newPassword,
    }
    this.props.updateAccountSettings(data)
  }
  async addMonths(dataFromStripe){
    const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey');
    const email = sessionStorage.getItem('UnlimitedCouponerEmail');
    const data = {
      membershipExperationDate: this.state.membershipExperationDate,
      description: dataFromStripe.description,
      source: dataFromStripe.source,
      currency: dataFromStripe.currency,
      amount: dataFromStripe.amount,
      loggedInKey: loggedInKey,
      email: email
    }
    const json = await postRequest(`/api/addMonths`, data)
  }

  render() {
    return (
    <div className="container text-center">
        <section id="portfolio" className="content">
          <h2 className="textHeader">How to update your account settings</h2>
          <p className="text">In order to add more months of membership you must pay 4.99$ per month. You must validate your new phone number once again in order to change your phone number. To change your password simply type your current password and the new password you would like. To update your city or other information, simply fill out the form and click the update info button below!</p>
        </section>
        <br/>
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
      {buisnessOwner === "false" ?
        <div>
          <InputField
            htmlFor="Add more months to your subscription"
            type="text"
            labelHTML="Add more months to your subscription"
            name="numberOfMonths"
            placeholder="4.99$ per additional month for unlimited coupons"
            onChange={this.updateMembershipExperationDate}
          />
        <br/>
        </div> : 
        <div></div>
      }
      {buisnessOwner === "false" && this.state.numberOfMonths !== "" && this.state.numberOfMonths !== 0 ?
      <div className="checkout-account-settings">
        <Checkout
          parentMethod = {this.addMonths}
          name={'UnlimitedCouponer Membership'}
          description={this.state.numberOfMonths + ' Month(s) of Unlimted Coupons'}
          amount={this.state.numberOfMonths * 4.99}
          panelLabel="Get membership"
        />
      </div> : 
      <div></div>
      }

      <br/>
      <button value="send" className="updatebtn" onClick={this.handleSubmit}><strong>Update Info</strong></button>
      </form>
      <div className={this.state.checkout}>
      <br/>
      <br/>
    </div>
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
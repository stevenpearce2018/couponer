import React, { Component } from 'react';
import './signup.css';
import PhoneCode from 'react-phone-code';
import InputField from '../SubComponents/InputField/inputField'
// import Checkout from '../Checkout/checkout';
import validateEmail from '../../validateEmail';
import postRequest from '../../postReqest';
import { toast } from 'react-toastify';
import checkPasswordStrength from '../../checkPasswordStrength';

class SignUp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      customerOrbusiness: [
        ' Customer',
        ' Business Owner',
      ],
      email: '',
      password: '',
      passwordConfirm: '',
      businessName: '',
      yourPick: ' Customer',
      showOrHideBuisInput: 'hideBuissnessIfCustomer',
      showSignUp: 'hideBuissnessIfCustomer',
      showOrHideAccountMem: 'showBuissnessIfCustomer',
      // membershipExperationDate: '',
      numberOfMonths: 0,
      fiveDigitCode: '',
      country: "+1",
      phoneNumber: '',
      popupClass: 'hiddenOverlay',
      boolValidPhoneNumber: false,
      validPhoneNumber: <span className="icon red">&#x2718;</span>,
      validPassword: <span className="icon red">&#x2718;</span>,
      showOrHidePhoneValidationButton:'signupbtn',
      checkout: "hidden"
    }
    this.handleSingup = this.handleSingup.bind(this);
    this.updateMembershipExperationDate = this.updateMembershipExperationDate.bind(this);
    this.validatePhone = this.validatePhone.bind(this);
    // this.handleCustomerSignup = this.handleCustomerSignup.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.validatePhoneNumber = this.validatePhoneNumber.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }
  componentWillMount() {
    if(sessionStorage.getItem('UnlimitedCouponerEmail') && sessionStorage.getItem('UnlimitedCouponerKey')) {
      this.props.setMainHome()
      toast.error("You are already logged in!")
    }
  }
  handleChange = event => {
    const { target: { name, value } } = event
    this.setState({ [name]: value })
    if(name === "passwordConfirm" && value === this.state.password && checkPasswordStrength(value)) this.setState({validPassword: <span className="green icon">&#10003;</span>})
    else if(name === "password" && value === this.state.passwordConfirm && checkPasswordStrength(value)) this.setState({validPassword: <span className="green icon">&#10003;</span>})
  }
  async validatePhoneNumber(){
    const data = {
      phoneNumber: this.state.country + this.state.phoneNumber,
      randomNumber: this.state.fiveDigitCode,
    }
    const json = await postRequest(`/api/phoneTestValidateNumber`, data)
    if (json && json.success) {
      toast.success("Phone number is valid, woohoo!")
      this.setState({checkout: "showBuissnessIfCustomer", showOrHidePhoneValidationButton: 'hidden', boolValidPhoneNumber: true, validPhoneNumber: <span className="green icon">&#10003;</span>})
      this.setState({showSignUp:"showBuissnessIfCustomer", checkout: "hidden"})
      this.togglePopup();
    }
    else toast.error("The number you have entered is incorrect")
  }
  updateMembershipExperationDate = event => {
    let d = new Date();
    d.setMonth( d.getMonth() + Number(event.target.value));
    this.setState({numberOfMonths: Number(event.target.value), membershipExperationDate: d})
  }
  async validatePhone(){
    if(this.state.phoneNumber === "") {
      toast.error("You need to enter your phone number!")
      return false;
    }
    else {
      this.togglePopup()
      const data = {
        phoneNumber: this.state.country + this.state.phoneNumber,
      }
      await postRequest(`/api/phoneTest`, data)
    }
  }

  validState = state => state.email && state.yourPick !== '' && state.password === state.passwordConfirm && state.phoneNumber ? true : false;

  async handleSingup(e){
    // if(this.state.boolValidPhoneNumber === false) return toast.error("You must validate your phone number!")
    e.preventDefault();
    const data = {
      businessName: this.state.businessName,
      email: this.state.email,
      yourPick: this.state.yourPick,
      password: this.state.password,
      phoneNumber: this.state.country + this.state.phoneNumber,
      randomNumber: Number(this.state.fiveDigitCode)
    }
    if (!checkPasswordStrength(this.state.password)) return toast.error("Your password is not valid!")
    if (validateEmail(this.state.email) && this.validState(this.state)){
      const json = await postRequest(`/api/signupCustomer`, data)
      if (json && json.loggedInKey) {
        this.props.parentMethod(json && json.loggedInKey, this.state.email);
        sessionStorage.setItem('UnlimitedCouponerKey', json.loggedInKey)
      }
    } else toast.error("There was an error with your submission!")
  }
  // async handleCustomerSignup(dataFromStripe){
  //   const data = {
  //     email: this.state.email,
  //     yourPick: this.state.yourPick,
  //     password: this.state.password,
  //     phoneNumber: this.state.country + this.state.phoneNumber,
  //     membershipExperationDate: this.state.membershipExperationDate,
  //     numberOfMonths: this.state.numberOfMonths,
  //     description: dataFromStripe.description,
  //     randomNumber: Number(this.state.fiveDigitCode),
  //     source: dataFromStripe.source,
  //     currency: dataFromStripe.currency,
  //     amount: dataFromStripe.amount,
  //   }
  //   if (!checkPasswordStrength(this.state.password)) return toast.error("Your password is not valid!")
  //   if (validateEmail(this.state.email) && this.validState(this.state)){
  //     const json = await postRequest(`/api/signupCustomer`, data)
  //     if (json && json.loggedInKey) {
  //       this.props.parentMethod(json.loggedInKey, this.state.email, json.couponsCurrentlyClaimed, json.membershipExperationDate)
  //       sessionStorage.setItem('UnlimitedCouponerKey', json.loggedInKey)
  //       toast.success("Welcome " + this.state.email + "!")
  //     } else toast.error(json.resp)
  //   } else toast.error("Invalid Email Address.")
  // }

  togglePopup = () => this.state.popupClass === "hiddenOverlay" ? this.setState({popupClass: "overlay"}) : this.setState({popupClass: "hiddenOverlay"})

  handleToggle = value => {
    if (value === ' Customer') {
      if(this.state.boolValidPhoneNumber) this.setState({checkout:"showBuissnessIfCustomer", showSignUp:'showBuissnessIfCustomer'})
      this.setState({
        yourPick: value,
        showOrHideBuisInput: 'hideBuissnessIfCustomer',
        showOrHideAccountMem: 'showBuissnessIfCustomer',
      })
    }
    else if(value === ' Business Owner') {
      if (this.state.boolValidPhoneNumber) this.setState({showSignUp:'showBuissnessIfCustomer'})
      this.setState({
        yourPick: value,
        showOrHideBuisInput: 'showBuissnessIfCustomer',
        showOrHideAccountMem: 'hideBuissnessIfCustomer',
        checkout: "hidden"
      })
    }
  }

  render() {
    return (
      <div className="container text-center">
        <section id="portfolio" className="content">
          <h2 className="textHeader">Sign up</h2>
          <p className="text">First, validate your phone number. UnlimitedCouponer needs your phone number in order to text you claimed coupons and to allow easy verification of coupons. Then if you are a customer, choose your membership plan. Membership will be needed to claim coupons and you can claim unlimited coupons so long as you actually use them! Business Owners cannot claim coupons but do not have a membership fee. <strong>Your password will require 1 uppercase letter, 1 lowercase letter, 8 total characters, 1 number, and one special character.</strong> </p>
        </section>
        <div className="row">
          <hr />
          <br/>
          <div className='signinForm'>
            <button className={ this.state.yourPick === " Customer" ? "signupbtn toggle" : "signupbtn toggle notselected"} onClick={() => this.handleToggle(" Customer")}><strong>Customer</strong></button>
            <button className={ this.state.yourPick === " Business Owner" ?  "signupbtn toggle" :  "signupbtn toggle notselected" } onClick={() => this.handleToggle(" Business Owner")}><strong>Business Owner</strong></button>
          </div>
        </div>
          <form className='signinForm'>
          <InputField
            htmlFor="Email"
            type="email"
            name="email"
            labelHTML="Email"
            placeholder="ProSaver@UnlimitedCouponer.com"
            onChange={this.handleChange}
            required
          />
          <InputField
            htmlFor="Password"
            type="password"
            name="password"
            labelHTML="Password"
            placeholder="Example123!"
            onChange={this.handleChange}
            required
          />
          <div className="phoneIcon overRight">
          {this.state.validPassword}
          </div>
          <InputField
            htmlFor="Password"
            type="password"
            name="passwordConfirm"
            labelHTML="Confirm Password"
            placeholder="Confirm Password"
            onChange={this.handleChange}
            required
          />
      <div className={this.state.showOrHideBuisInput}>
      <InputField
        htmlFor="Business Name"
        type="text"
        name="businessName"
        labelHTML="Business Name"
        placeholder="Bob's Kitten Rentals"
        onChange={this.handleChange}
      /> 
      </div>
      {/* <div className={this.state.showOrHideAccountMem}>
        <InputField
          htmlFor="Subscription Length"
          type="text"
          labelHTML="Subscription Length"
          name="numberOfMonths"
          placeholder="Subscription Length 4.99$ per month for unlimited coupons"
          onChange={this.updateMembershipExperationDate}
        />
      </div> */}
      {/* <div className="phoneHolder"> */}
      <div className="signupBox">
      <label className="signupLabel" htmlFor="Country"><strong>Country</strong></label>
        <PhoneCode
          onSelect={code => this.setState({country: code})} // required
          showFirst={['US', 'UK', 'IN']}
          defaultValue='select county'
          id='some-id'
          name='some-name'
          className='some class name'
          optionClassName='some option class name'
      />
      </div>
      <InputField
        htmlFor="Phone Number"
        type="number"
        name="phoneNumber"
        labelHTML="Phone Number"
        placeholder="123-456-7189"
        onChange={this.handleChange}
      />
  </form>

  <div className='buttonAndForgot'>
    {/* <button type="submit" value="Submit" className={this.state.showOrHidePhoneValidationButton} onClick={this.validatePhone}><strong>Validate Phone Number</strong></button> */}
    {/* <div className={this.state.popupClass}>
            <div className="popup">
              <h2 className="popupheader">Please Enter Your 5 digit security code</h2>
              <a className="close" onClick={this.togglePopup}>&times;</a>
              <div className="popupcontent fivedigit">
              <InputField
                htmlFor="5 digit code"
                type="number"
                labelHTML="5 digit code"
                placeholder="12345"
                name="fiveDigitCode"
                onChange={this.handleChange}
                required
              />
              <div className="popupbtn">
              <button className='signupbtn signupbtnn' value="send" onClick={this.validatePhoneNumber}><strong>Submit</strong></button>
              </div>
              </div>
            </div>
          </div> */}
    <div className={this.state.checkout}>
      <br/>
      <br/>
    </div>
    {/* {this.state.boolValidPhoneNumber && this.state.yourPick === " Customer" ?
    <div className="center">
          <Checkout
          parentMethod = {this.handleCustomerSignup}
          name={'UnlimitedCouponer Membership'}
          description={this.state.numberOfMonths + ' Month(s) of Unlimted Coupons'}
          amount={this.state.numberOfMonths * 0.99}
          panelLabel="Get membership"
        />
    </div> : <div></div>} */}

    {/* <div className={this.state.showSignUp}> */}
      <button type="submit" value="Submit" className="signupbtn" onClick={this.handleSingup}><strong>Sign up!</strong></button>
    {/* </div> */}
    </div>
    </div>
    )
  }
}

export default SignUp;

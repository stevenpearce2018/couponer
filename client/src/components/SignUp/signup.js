import React, { Component } from 'react';
import './signup.css';
// import ReactPhoneInput from 'react-phone-input-2'
import PhoneCode from 'react-phone-code';
// import 'react-flags-select/css/react-flags-select.css';
// import 'react-phone-number-input/style.css'
import InputField from '../SubComponents/InputField/inputField'
import Checkout from '../Checkout/checkout';
import validateEmail from '../../validateEmail';
import postRequest from '../../postReqest';
import { toast } from 'react-toastify';
import checkPasswordStrength from '../../checkPasswordStrength';

// Checkout button is clicked
// Check if info inputted is valid                 // if failed break
// Check number by sending twilio sms 5 digit code // if Xed out then break. Allow retries
// If number is valid save result unless number changes
// Attempt credit card checkout

class SignUp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      customerOrBuisness: [
        ' Customer',
        ' Buisness Owner',
      ],
      email: '',
      password: '',
      passwordConfirm: '',
      city: '',
      buisnessName: '',
      yourPick: '',
      showOrHideBuisInput: 'hideBuissnessIfCustomer',
      showSignUp: 'hideBuissnessIfCustomer',
      showOrHideAccountMem: 'showBuissnessIfCustomer',
      membershipExperationDate: '',
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
    this.handleRadio = this.handleRadio.bind(this);
    this.validatePhone = this.validatePhone.bind(this);
    this.handleCustomerSignup = this.handleCustomerSignup.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.validatePhoneNumber = this.validatePhoneNumber.bind(this);
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
    if (this.state.password === this.state.passwordConfirm && checkPasswordStrength(this.state.password)) this.setState({validPassword: <span className="green icon">&#10003;</span>})
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
      if (this.state.yourPick === " Buisness Owner") this.setState({showSignUp:"showBuissnessIfCustomer", checkout: "hidden"})
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

  validState = state => state.city && state.email && state.yourPick !== '' && state.password === state.passwordConfirm && state.phoneNumber ? true : false;

  async handleSingup(e){
    if(this.state.boolValidPhoneNumber === false) return toast.error("You must validate your phone number!")
    e.preventDefault();
    const data = {
      buisnessName: this.state.buisnessName,
      city: this.state.city,
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
  async handleCustomerSignup(dataFromStripe){
    const data = {
      city: this.state.city,
      email: this.state.email,
      yourPick: this.state.yourPick,
      password: this.state.password,
      phoneNumber: this.state.country + this.state.phoneNumber,
      membershipExperationDate: this.state.membershipExperationDate,
      numberOfMonths: this.state.numberOfMonths,
      description: dataFromStripe.description,
      randomNumber: Number(this.state.fiveDigitCode),
      source: dataFromStripe.source,
      currency: dataFromStripe.currency,
      amount: dataFromStripe.amount,
    }
    if (!checkPasswordStrength(this.state.password)) return toast.error("Your password is not valid!")
    if (validateEmail(this.state.email) && this.validState(this.state) ){
      const json = await postRequest(`/api/signupCustomer`, data)
      if (json && json.loggedInKey) {
        this.props.parentMethod(json && json.loggedInKey, this.state.email, json.couponsCurrentlyClaimed, json.membershipExperationDate)
        sessionStorage.setItem('UnlimitedCouponerKey', json.loggedInKey)
      }
    } else toast.error("Your email is not valid!")
  }

  togglePopup = () => this.state.popupClass === "hiddenOverlay" ? this.setState({popupClass: "overlay"}) : this.setState({popupClass: "hiddenOverlay"})

  render() {
    const options = this.state.customerOrBuisness.map((loan, key) => {
      const isCurrent = this.state.yourPick === loan
      return (
        <div className='center_radio' id={key}>
            <label id={key}
              className={
                isCurrent ? 
                  'radioPad__wrapper radioPad__wrapper--selected' :
                  'radioPad__wrapper'
                }
            >
              <input
                className="radioPad__radio"
                type="radio" 
                name="customerOrBuisness" 
                id={loan} 
                value={loan}
                onChange={this.handleRadio}
              />
              <strong className='radioHTML'>{loan}</strong>
            </label>
            </div>
      )
    })
    return (
      <div className="container text-center">
        <section id="portfolio" className="content">
          <h2 className="textHeader">Sign up</h2>
          <p className="text">First, validate your phone number. UnlimitedCouponer needs your phone number in order to text you claimed coupons and to allow easy verification of coupons. Then if you are a customer, choose your membership plan. Membership will be needed to claim coupons and you can claim unlimited coupons so long as you actually use them! Business owners cannot claim coupons but do not have a membership fee. <strong>Your password will require 1 uppercase letter, 1 lowercase letter, 8 total characters, 1 number, and one special character.</strong> </p>
        </section>
        <div className="row">
          <hr />
          <br/>
          {options}
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
          <InputField
            htmlFor="City"
            type="text"
            labelHTML="City"
            name="city"
            placeholder="Coupon Town"
            onChange={this.handleChange}
            required
          />
      <div className={this.state.showOrHideBuisInput}>
      <InputField
        htmlFor="Buisness Name"
        type="text"
        name="buisnessName"
        labelHTML="Buisness Name"
        placeholder="Bob's Kitten Rentals"
        onChange={this.handleChange}
      /> 
      </div>
      <div className={this.state.showOrHideAccountMem}>
        <InputField
          htmlFor="Subscription Length"
          type="text"
          labelHTML="Subscription Length"
          name="numberOfMonths"
          placeholder="Subscription Length 4.99$ per month for unlimited coupons"
          onChange={this.updateMembershipExperationDate}
        />
      </div>
      {/* <div className="phoneHolder"> */}
      <div class="signupBox">
      <label class="signupLabel" for="Country"><strong>Country</strong></label>
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
      <div className="float">
      <InputField
        htmlFor="Phone Number"
        type="number"
        name="phoneNumber"
        labelHTML="Phone Number"
        placeholder="123-456-7189"
        onChange={this.handleChange}
      /> 
      </div>
      {/* </div> */}
      <div className="phoneIcon">
          {this.state.validPhoneNumber}
        </div>
  </form>

    {/* <ReactPhoneInput
      placeholder="Enter phone number"
      value={ this.state.phoneNumber }
      defaultCountry={'us'}
      onChange={ phoneNumber => this.setState({ phoneNumber: phoneNumber, validPhoneNumber: <span className="icon red">&#x2718;</span>, showOrHidePhoneValidationButton: "signupbtn"}) } 
    /> */}
  <div className='buttonAndForgot'>
    <button type="submit" value="Submit" className={this.state.showOrHidePhoneValidationButton} onClick={this.validatePhone}><strong>Validate Phone Number</strong></button>
    <div className={this.state.popupClass}>
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
          </div>
    <div className={this.state.checkout}>
    <div className="center">
      <Checkout
        parentMethod = {this.handleCustomerSignup}
        name={'UnlimitedCouponer Membership'}
        description={this.state.numberOfMonths + ' Month(s) of Unlimted Coupons'}
        amount={this.state.numberOfMonths * 4.99}
        panelLabel="Get membership"
      />
    </div>
      <br/>
      <br/>
    </div>
    <div className={this.state.showSignUp}>
      <button type="submit" value="Submit" className="signupbtn" onClick={this.handleSingup}><strong>Sign up!</strong></button>
    </div>
    </div>
    </div>
    )
  }
  handleRadio(e) {
    if (e.target.value === ' Customer') {
      if(this.state.boolValidPhoneNumber === true) this.setState({checkout:"showBuissnessIfCustomer"})
      this.setState({
        yourPick: e.target.value,
        showOrHideBuisInput: 'hideBuissnessIfCustomer',
        showOrHideAccountMem: 'showBuissnessIfCustomer',
        showSignUp:'hideBuissnessIfCustomer'
      })
    }
    else if(e.target.value === ' Buisness Owner') {
      if (this.state.boolValidPhoneNumber) this.setState({showSignUp:'showBuissnessIfCustomer'})
      this.setState({
        yourPick: e.target.value,
        showOrHideBuisInput: 'showBuissnessIfCustomer',
        showOrHideAccountMem: 'hideBuissnessIfCustomer',
        checkout: "hidden"
      })
    }
  }
}

export default SignUp;

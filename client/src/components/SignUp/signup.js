import React, { Component } from 'react';
import './signup.css';
import { ReCaptcha } from 'react-recaptcha-google';
import PhoneInput from 'react-phone-number-input'
 
//import css module
import 'react-flags-select/css/react-flags-select.css';
import 'react-phone-number-input/style.css'
import InputField from '../SubComponents/InputField/inputField'
import Checkout from '../Checkout/checkout';
import validateEmail from '../../validateEmail';

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
      showOrHideAccountMem: 'showBuissnessIfCustomer',
      recaptchaToken: '',
      membershipExperationDate: '',
      numberOfMonths: 0,
      fiveDigitCode: '',
      phoneNumber: '',
      popupClass: 'hiddenOverlay',
      boolValidPhoneNumber: false,
      validPhoneNumber: <img className='icon moveUp' src='https://storage.googleapis.com/csstest/invalid.svg' alt="Phone number not validated"></img>,
      showOrHidePhoneValidationButton:'signupbtn'
    }
    this.handleSingup = this.handleSingup.bind(this);
    this.updateMembershipExperationDate = this.updateMembershipExperationDate.bind(this);
    this.updateBuisnessName = this.updateBuisnessName.bind(this);
    this.handleRadio = this.handleRadio.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.updateFiveDigitCode = this.updateFiveDigitCode.bind(this);
    this.updateCity = this.updateCity.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.updatePasswordConfirmation = this.updatePasswordConfirmation.bind(this);
    this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
    this.checkInfo = this.checkInfo.bind(this);
    this.handleCustomerSignup = this.handleCustomerSignup.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.validatePhoneNumber = this.validatePhoneNumber.bind(this);
  }
  componentDidMount() {
      if (this.captchaDemo) {
        this.captchaDemo.reset();
        this.captchaDemo.execute();
    }
  }
  onLoadRecaptcha() {
    if (this.captchaDemo) {
      this.captchaDemo.reset();
      this.captchaDemo.execute();
    }
  }
  verifyCallback(recaptchaToken) {
    this.setState({recaptchaToken: recaptchaToken})
  }
  updatePassword(event) {
    this.setState({password : event.target.value})
  }
  updatePasswordConfirmation(event) {
    this.setState({passwordConfirm : event.target.value})
  }
  updateEmail(event) {
    this.setState({email : event.target.value})
  }
  async validatePhoneNumber(){
    const data = {
      phoneNumber: this.state.phoneNumber,
      randomNumber: this.state.fiveDigitCode,
      recaptchaToken: this.state.recaptchaToken
    }
    const url = `/api/phoneTestValidateNumber`
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, same-origin, *omit
      headers: {
          "Content-Type": "application/json; charset=utf-8",
          // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify(data),
    })
    const json = await response.json()
    if (json.success) {
      alert("Phone number is valid, woohoo!")
      this.setState({showOrHidePhoneValidationButton: 'hidden', boolValidPhoneNumber: true, validPhoneNumber:<img className='icon moveUp' src='https://storage.googleapis.com/csstest/valid.svg' alt="Phone number not validated"></img>})
      this.togglePopup();
    }
    else {
      alert("The number you have entered is incorrect")
    }
  }
  updateFiveDigitCode(event) {
    this.setState({fiveDigitCode : event.target.value})
  }
  updateCity(event) {
    this.setState({city : event.target.value})
  }
  updateMembershipExperationDate(event){
    let d = new Date();
    d.setMonth( d.getMonth() + Number(event.target.value));
    this.setState({numberOfMonths: Number(event.target.value), nembershipExperationDate: d})
  }
  updateBuisnessName(event){
    this.setState({buisnessName : event.target.value})
  }
  async checkInfo(data){
    const that = this;
    this.togglePopup()
    if(this.state.phoneNumber[0] !== "+") return false;
    else {
      const data = {
        phoneNumber: that.state.phoneNumber,
        recaptchaToken: that.state.recaptchaToken
      }
      const url = `/api/phoneTest`
      const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (this.state.city && this.state.email && this.state.yourPick === ' Customer' && this.state.password === this.state.passwordConfirm && this.state.phoneNumber &&this.state.membershipExperationDate) return true;
      else return false;
    }
  }

  async handleSingup(e){
    if(this.state.boolValidPhoneNumber === false) return alert("You must validate your phone number!")
    e.preventDefault();
    const data = {
      buisnessName: this.state.buisnessName,
      city: this.state.city,
      email: this.state.email,
      yourPick: this.state.yourPick,
      password: this.state.password,
      phoneNumber: this.state.phoneNumber,
      membershipExperationDate: this.state.membershipExperationDate,
    }
    if (validateEmail(this.state.email)){
      const url = `/api/signupCustomer`
      const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (json.loggedInKey) {
        this.props.parentMethod();
        sessionStorage.setItem('credsCoupon', JSON.stringify(json.loggedInKey))
      }
    } else alert("Your email is not valid!")
  }
  async handleCustomerSignup(dataFromStripe){
    if(this.state.boolValidPhoneNumber === false) return alert("You must validate your phone number!")
    const data = {
      buisnessName: this.state.buisnessName,
      city: this.state.city,
      email: this.state.email,
      yourPick: this.state.yourPick,
      password: this.state.password,
      phoneNumber: this.state.phoneNumber,
      membershipExperationDate: this.state.membershipExperationDate,
      description: dataFromStripe.description,
      source: dataFromStripe.source,
      currency: dataFromStripe.currency,
      amount: dataFromStripe.amount
    }
    if (validateEmail(this.state.email)){
      const url = `/api/signupCustomer`
      const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        body: JSON.stringify(data),
      })
      const json = await response.json()
      if (json.loggedInKey) {
        this.props.parentMethod();
        sessionStorage.setItem('credsCoupon', JSON.stringify(json.loggedInKey))
      }
    } else alert("Your email is not valid!")
  }

  togglePopup(){
    let newClass = "hiddenOverlay";
    if(this.state.popupClass === "hiddenOverlay") newClass = "overlay";
    this.setState({popupClass: newClass})
  }
  render() {
    const yourPick = this.state.yourPick
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
          <p className="text">First, validate your phone number. UnlimitedCouponer needs your phone number in order to text you claimed coupons and to allow easy verification of coupons. Then if you are a customer, choose your membership plan. Membership will be needed to claim coupons and you can claim unlimited coupons so long as you actually use them! Business owners cannot claim coupons but do not have a membership fee.  </p>
        </section>
        <div className="row">
          <hr />
          <br/>
          {options}
        </div>
        <div className={this.state.popupClass}>
            <div className="popup">
              <h2>Please Enter Your 5 digit security code</h2>
              <a className="close" onClick={this.togglePopup}>&times;</a>
              <div className="popupcontent">
              <InputField
              htmlFor="5 digit code"
              type="number"
              labelHTML="5 digit code"
              placeholder="12345"
              onChange={this.updateFiveDigitCode}
              required
              />
              <div className="popupbtn">
              <button className='signupbtn signupbtnn' value="send" onClick={this.validatePhoneNumber}><strong>Submit</strong></button>
              </div>
              </div>
            </div>
          </div>
          <form className='signinForm'>
          <InputField
          htmlFor="Email"
          type="email"
          labelHTML="Email"
          placeholder="ProSaver@UnlimitedCouponer.com"
          onChange={this.updateEmail}
          required
          />
          <InputField
          htmlFor="Password"
          type="password"
          labelHTML="Password"
          placeholder="Your Password Here"
          onChange={this.updatePassword}
          required
          />
          <InputField
          htmlFor="Password"
          type="password"
          labelHTML="Confirm Password"
          placeholder="Confirm Password"
          onChange={this.updatePasswordConfirmation}
          required
          />

          <InputField
          htmlFor="City"
          type="text"
          labelHTML="City"
          placeholder="Coupon Town"
          onChange={this.updateCity}
          required
          />
      <div className={this.state.showOrHideBuisInput}>
      <InputField
        htmlFor="Buisness Name"
        type="text"
        labelHTML="Buisness Name"
        placeholder="Bob's Kitten Rentals"
        onChange={this.updateBuisnessName}
      /> 
      </div>
      <div className={this.state.showOrHideAccountMem}>
      <InputField
        htmlFor="Subscription Length"
        type="text"
        labelHTML="Subscription Length"
        placeholder="Subscription Length 4.99$ per month for unlimited coupons"
        onChange={this.updateMembershipExperationDate}
      />
      </div>
  </form>
  <div className="phoneHolder">
    <PhoneInput
      placeholder="Enter phone number"
      value={ this.state.phoneNumber }
      onChange={ phoneNumber => this.setState({ phoneNumber: phoneNumber, validPhoneNumber: <img className='icon moveUp' src='https://storage.googleapis.com/csstest/invalid.svg' alt="Phone number not validated"></img>, showOrHidePhoneValidationButton: "signupbtn"}) } 
    />
    <div className="phoneImage">{this.state.validPhoneNumber}</div>
  </div>
  <div className='buttonAndForgot'>
    <button type="submit" value="Submit" className={this.state.showOrHidePhoneValidationButton} onClick={this.checkInfo}><strong>Validate Phone Number</strong></button>
    <div className={this.state.showOrHideAccountMem}>
      <Checkout
      parentMethod = {this.handleCustomerSignup}
      name={'UnlimitedCouponer Membership'}
      description={this.state.numberOfMonths + ' Month(s) of Unlimted Coupons'}
      amount={this.state.numberOfMonths * 4.99}
      panelLabel="Get membership"
      />
      <br/>
      <br/>
    </div>
    <div className={this.state.showOrHideBuisInput}>
      <button type="submit" value="Submit" className="signupbtn" onClick={this.handleSingup}><strong>Sign up!</strong></button>
    </div>
    </div>
      <ReCaptcha
        ref={(el) => {this.captchaDemo = el;}}
        size="invisible"
        render="explicit"
        sitekey="6Lf9D3QUAAAAAFdm98112C_RrKJ47-j68Oimnslb"
        data-theme="dark"
        onloadCallback={this.onLoadRecaptcha}
        verifyCallback={this.verifyCallback}
      />
    </div>
    )
  }
  handleRadio(e) {
    if (e.target.value === ' Customer') {
      this.setState({
        yourPick: e.target.value,
        membershipExperationDate: '',
        showOrHideBuisInput: 'hideBuissnessIfCustomer',
        showOrHideAccountMem: 'showBuissnessIfCustomer'
      })
    }
    else if(e.target.value === ' Buisness Owner') {
      this.setState({
        yourPick: e.target.value,
        membershipExperationDate: 'notCustomer',
        showOrHideBuisInput: 'showBuissnessIfCustomer',
        showOrHideAccountMem: 'hideBuissnessIfCustomer'
      })
    }
  }
}

export default SignUp;

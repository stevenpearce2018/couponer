import React, { Component } from 'react';
import './signup.css';
import PhoneInput from 'react-phone-number-input'
import 'react-flags-select/css/react-flags-select.css';
import 'react-phone-number-input/style.css'
import InputField from '../SubComponents/InputField/inputField'
import Checkout from '../Checkout/checkout';
import validateEmail from '../../validateEmail';
import postRequest from '../../postReqest';

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
      validPhoneNumber: <span className="icon red">&#x2718;</span>,
      showOrHidePhoneValidationButton:'signupbtn',
      checkout: "hidden"
    }
    this.handleSingup = this.handleSingup.bind(this);
    this.updateMembershipExperationDate = this.updateMembershipExperationDate.bind(this);
    this.handleRadio = this.handleRadio.bind(this);
    this.checkInfo = this.checkInfo.bind(this);
    this.handleCustomerSignup = this.handleCustomerSignup.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.validatePhoneNumber = this.validatePhoneNumber.bind(this);
  }
  componentDidMount() { }
  handleChange = (event) => {
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }
  async validatePhoneNumber(){
    const data = {
      phoneNumber: this.state.phoneNumber,
      randomNumber: this.state.fiveDigitCode,
    }
    const url = `/api/phoneTestValidateNumber`
    const json = await postRequest(url, data)
    if (json.success) {
      alert("Phone number is valid, woohoo!")
      this.setState({checkout: "showBuissnessIfCustomer", showOrHidePhoneValidationButton: 'hidden', boolValidPhoneNumber: true, validPhoneNumber: <span className="green icon">&#10003;</span>})
      this.togglePopup();
    }
    else alert("The number you have entered is incorrect")
  }
  updateMembershipExperationDate(event){
    let d = new Date();
    d.setMonth( d.getMonth() + Number(event.target.value));
    this.setState({numberOfMonths: Number(event.target.value), membershipExperationDate: d})
  }
  async checkInfo(data){
    const that = this;
    this.togglePopup()
    if(this.state.phoneNumber[0] !== "+") return false;
    else {
      const data = {
        phoneNumber: that.state.phoneNumber,
        // recaptchaToken: that.state.recaptchaToken
      }
      const url = `/api/phoneTest`
      await postRequest(url, data)
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
      randomNumber: Number(this.state.fiveDigitCode)
    }
    if (validateEmail(this.state.email)){
      const url = `/api/signupCustomer`
      const json = await postRequest(url, data)
      if (json.loggedInKey) {
        this.props.parentMethod(json.loggedInKey, this.state.email);
        sessionStorage.setItem('UnlimitedCouponerKey', json.loggedInKey)
      }
    } else alert("Your email is not valid!")
  }
  async handleCustomerSignup(dataFromStripe){
    const data = {
      city: this.state.city,
      email: this.state.email,
      yourPick: this.state.yourPick,
      password: this.state.password,
      phoneNumber: this.state.phoneNumber,
      membershipExperationDate: this.state.membershipExperationDate,
      description: dataFromStripe.description,
      randomNumber: Number(this.state.fiveDigitCode),
      source: dataFromStripe.source,
      currency: dataFromStripe.currency,
      amount: dataFromStripe.amount,
    }
    if (validateEmail(this.state.email)){
      const url = `/api/signupCustomer`
      const json = await postRequest(url, data)
      if (json.loggedInKey) {
        this.props.parentMethod(json.loggedInKey, this.state.email)
        sessionStorage.setItem('UnlimitedCouponerKey', json.loggedInKey)
      }
    } else alert("Your email is not valid!")
  }
  togglePopup(){
    let newClass = "hiddenOverlay";
    if(this.state.popupClass === "hiddenOverlay") newClass = "overlay";
    this.setState({popupClass: newClass})
  }
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
          <p className="text">First, validate your phone number. UnlimitedCouponer needs your phone number in order to text you claimed coupons and to allow easy verification of coupons. Then if you are a customer, choose your membership plan. Membership will be needed to claim coupons and you can claim unlimited coupons so long as you actually use them! Business owners cannot claim coupons but do not have a membership fee.  </p>
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
            placeholder="Your Password Here"
            onChange={this.handleChange}
            required
          />
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
  </form>
  <div className="phoneHolder">
    <PhoneInput
      placeholder="Enter phone number"
      value={ this.state.phoneNumber }
      onChange={ phoneNumber => this.setState({ phoneNumber: phoneNumber, validPhoneNumber: <span className="icon red">&#x2718;</span>, showOrHidePhoneValidationButton: "signupbtn"}) } 
    />
    <div className="phoneImage">{this.state.validPhoneNumber}</div>
  </div>
  <div className='buttonAndForgot'>
    <button type="submit" value="Submit" className={this.state.showOrHidePhoneValidationButton} onClick={this.checkInfo}><strong>Validate Phone Number</strong></button>
    <div className={this.state.popupClass}>
            <div className="popup">
              <h2>Please Enter Your 5 digit security code</h2>
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
    <div className={this.state.showOrHideBuisInput}>
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
        showOrHideAccountMem: 'showBuissnessIfCustomer'
      })
    }
    else if(e.target.value === ' Buisness Owner') {
      this.setState({
        yourPick: e.target.value,
        membershipExperationDate: '',
        numberOfMonths: '',
        showOrHideBuisInput: 'showBuissnessIfCustomer',
        showOrHideAccountMem: 'hideBuissnessIfCustomer',
        checkout: "hidden"
      })
    }
  }
}

export default SignUp;

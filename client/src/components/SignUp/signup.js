import React, { Component } from 'react';
import './signup.css';
import ReactFlagsSelect from 'react-flags-select';
import { ReCaptcha } from 'react-recaptcha-google';
 
//import css module
import 'react-flags-select/css/react-flags-select.css';
import InputField from '../SubComponents/InputField/inputField'

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
      address: '',
      cardNumber: '',
      cardholderName: '',
      CCV: '',
      city: '',
      experationDate: '',
      zipCode: '',
      buisnessName: '',
      yourPick: '',
      showOrHideBuisInput: 'hideBuissnessIfCustomer',
      phoneNumber: '',
      country: 'US',
      region: '',
      showOrHideAccountMem: 'showBuissnessIfCustomer',
      monthLength: '',
      validAddress: '',
      latitude:'',
      longitude:'',
      recaptchaToken: ''
    }
    this.handleSingup = this.handleSingup.bind(this);
    this.updateMonthLength = this.updateMonthLength.bind(this);
    this.updateBuisnessName = this.updateBuisnessName.bind(this);
    this.handleRadio = this.handleRadio.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.updateRegion =this.updateRegion.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.updateCCV = this.updateCCV.bind(this);
    this.updatePhoneNumber = this.updatePhoneNumber.bind(this);
    this.updateZipcode = this.updateZipcode.bind(this);
    this.updateCity = this.updateCity.bind(this);
    this.updateCardNumber = this.updateCardNumber.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.updateExperationDate = this.updateExperationDate.bind(this);
    this.onSelectFlag = this.onSelectFlag.bind(this);
    this.updateCardholderName = this.updateCardholderName.bind(this);
    this.updatePasswordConfirmation = this.updatePasswordConfirmation.bind(this);
    this.setInitialState = this.setInitialState.bind(this);
    this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
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
  setInitialState () {
    this.setState({validAddress: <img className="icon" src='https://storage.googleapis.com/csstest/invalid.svg' alt="Invalid address"></img>})
  }
  componentDidMount () {
    this.setInitialState();
  }
  updateCountry (e) {
    this.setState({ country: e.target.value });
  }
  onSelectFlag(countryCode){
    this.setState({ country: countryCode});
}
  updateRegion (e) {
    this.setState({ region: e.target.value });
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
  updateAddress(event) {
    this.setState({address : event.target.value})
    let that = this;
    if (event.target.value === '') this.setState({ address: '123 Cuddle Street, KittenTown MA. 0 Miles Away.'})
    else this.setState({address: event.target.value})
    const google = window.google
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': this.state.address}, async (results, status) => {
    try {
      if (results[0] && that.state.address.length > 5) {
        that.setState({
          latitude:results[0].geometry.location.lat(),
          longitude: results[0].geometry.location.lng(),
          validAddress: <img className="icon" src='https://storage.googleapis.com/csstest/valid.svg' alt="Address is valid"></img>
        })
      }
    }
    catch (error) { that.setState({validAddress: <img className="icon" src='https://storage.googleapis.com/csstest/invalid.svg' alt="Invalid address"></img>}) }
    });
  }
  updateCardNumber(event) {
    this.setState({cardNumber : event.target.value})
  }
  updateCardholderName(event) {
    this.setState({cardholderName : event.target.value})
  }
  updateCCV(event) {
    this.setState({CCV : event.target.value})
  }
  updateCity(event) {
    this.setState({city : event.target.value})
  }
  updateExperationDate(event) {
    this.setState({experationDate : event.target.value});
  }
  updateZipcode(event) {
    this.setState({zipCode : event.target.value})
  }
  updateBuisnessName(event) {
    this.setState({buisnessName : event.target.value})
  }
  updatePhoneNumber(event){
    this.setState({phoneNumber : event.target.value})
  }
  updateMonthLength(event){
    this.setState({monthLength : event.target.value})
  }
  async handleSingup(e){
    e.preventDefault();
    const data = {
      address: this.state.address,
      buisnessName: this.state.buisnessName,
      cardholderName: this.state.cardholderName,
      cardNumber: this.state.cardNumber,
      CCV: this.state.CCV,
      city: this.state.city,
      email: this.state.email,
      region: this.state.region,
      experationDate: this.state.experationDate,
      yourPick: this.state.yourPick,
      password: this.state.password,
      zipCode: this.state.zipCode,
      phoneNumber: this.state.phoneNumber,
      country: this.state.country,
      monthLength: this.state.monthLength
    }
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
        <div className="row">
          <p className="lead">
            <strong>I am a{yourPick}</strong>
            {yourPick ? 
              '' : '...'
            }
          </p>
          <hr />
          <br/>
          {options}
        </div>
          <form className='signinForm'>
          <InputField
          htmlFor="Email"
          type="email"
          labelHTML="Email"
          placeholder="ProSaver@Couponer.com"
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
          htmlFor="Phone Number"
          type="number"
          labelHTML="Full Phone Number"
          placeholder="(1)123-456-7890"
          onChange={this.updatePhoneNumber}
          required
          />
          <InputField
          htmlFor="Credit Card Number"
          type="number"
          labelHTML="Credit Card Number"
          placeholder="0000-0000-0000-0000"
          onChange={this.updateCardNumber}
          required
          />
          <InputField
          htmlFor="CCV"
          type="number"
          labelHTML="CCV"
          placeholder="555"
          onChange={this.updateCCV}
          required
          />
          <InputField
          htmlFor="Zip Code"
          type="number"
          labelHTML="Zip Code"
          placeholder="55555"
          onChange={this.updateZipcode}
          required
          />
          <InputField
          htmlFor="Experation Date"
          type="text"
          labelHTML="Experation Date"
          placeholder="MM/YY"
          onChange={this.updateExperationDate}
          required
          />
          <InputField
          htmlFor="Street"
          type="text"
          labelHTML="Full Address"
          icon={this.state.validAddress}
          placeholder="12345 189th Savings St"
          onChange={this.updateAddress}
          required
          />
          <InputField
          htmlFor="Cardholder Name"
          type="text"
          labelHTML="Cardholder Name"
          placeholder="Billy Bob"
          onChange={this.updateCardholderName}
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
      <InputField
        htmlFor="State/Provience"
        type="text"
        labelHTML="State/Provience"
        placeholder="New York"
        onChange={this.updateRegion}
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
        onChange={this.updateMonthLength}
      />
      </div>
      
      <div className="signupBox">
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="City">
          <strong>Country</strong>
        </label>
        </div>
        <ReactFlagsSelect
          defaultCountry="US"
          onSelect={this.onSelectFlag} 
          required />
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
  </form>
  <div className='buttonAndForgot'>
    <button type="submit" value="Submit" className="signupbtn" onClick={this.handleSingup}><strong>Submit</strong></button>
  </div>
      <div className='forgotPass'>
        <strong>Forgot Password?</strong>
      </div>
      
    </div>
    )
  }
  handleRadio(e) {
    if (e.target.value === ' Customer') {
      this.setState({
        yourPick: e.target.value,
        monthLength: 0,
        showOrHideBuisInput: 'hideBuissnessIfCustomer',
        showOrHideAccountMem: 'showBuissnessIfCustomer'
      })
    }
    else if(e.target.value === ' Buisness Owner') {
      this.setState({
        yourPick: e.target.value,
        monthLength: 'notCustomer',
        showOrHideBuisInput: 'showBuissnessIfCustomer',
        showOrHideAccountMem: 'hideBuissnessIfCustomer'
      })
    }
  }
}

export default SignUp;

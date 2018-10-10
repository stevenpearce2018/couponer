import React, { Component } from 'react';
import './accountsettings.css';
import InputField from '../SubComponents/InputField/inputField';
import { ReCaptcha } from 'react-recaptcha-google';

class AccountSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      oldPassword: '',
      newPassword:'',
      address: '',
      cardNumber: '',
      cardholderName: '',
      CCV: '',
      city: '',
      state: '',
      experationDate: '',
      zipCode: '',
      buisnessName: 'off',
      phoneNumber:'',

    };
    this.updateEmail = this.updateEmail.bind(this);
    this.updateOldPassword = this.updateOldPassword.bind(this);
    this.updateNewPassword = this.updateNewPassword.bind(this);
    this.updateAddress= this.updateAddress.bind(this);
    this.updateCardNumber = this.updateCardNumber.bind(this);
    this.updateCardholderName= this.updateCardholderName.bind(this);
    this.updateCCV = this.updateCCV.bind(this);
    this.updateCity = this.updateCity.bind(this);
    this.updateState = this.updateState.bind(this);
    this.updateExperationDate = this.updateExperationDate.bind(this);
    this.updateZipcode = this.updateZipcode.bind(this);
    this.updateBuisnessName = this.updateBuisnessName.bind(this);
    this.updatePhoneNumber = this.updatePhoneNumber.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    // this.updateInput = this.updateInput.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
    this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
  }

  // updateInputField(event, fieldBeingUpdated) {
  //   this.setState({
  //     [fieldBeingUpdated] : event.target.value
  //   })
  // }
  componentDidMount() {
    if (this.captchaDemo) {
        console.log("started, just a second...")
        this.captchaDemo.reset();
        this.captchaDemo.execute();
    }
    this.onLoadRecaptcha();
  }
  onLoadRecaptcha() {
    if (this.captchaDemo) {
        this.captchaDemo.reset();
        this.captchaDemo.execute();
    }
  }
  verifyCallback(recaptchaToken) {
    // Here you will get the final recaptchaToken!!!  
    console.log(recaptchaToken, "<= your recaptcha token")
  }
  updatePhoneNumber(event) {
    this.setState({phoneNumber: event.target.value}) 
  }

  updateOldPassword(event) {
    this.setState({oldPassword : event.target.value})
  }
  updateNewPassword(event) {
    this.setState({newPassword : event.target.value})
  }
  updateEmail(event) {
    this.setState({email : event.target.value})
  }
  updateAddress(event) {
    this.setState({address : event.target.value})
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
  updateState(event) {
    this.setState({state : event.target.value})
  }
  updateExperationDate(event) {
    this.setState({experationDate : event.target.value})
  }
  updateZipcode(event) {
    this.setState({zipCode : event.target.value})
  }
  updateBuisnessName(event) {
    this.setState({buisnessName : event.target.value})
  }
  updateIsCustomer(event) {
    this.setState({
      isCustomer : event.target.value,
      isBuisnessOwner: 'off'
    })
  }
  updateIsBuisnessOwner(event) {
    this.setState({
      isBuisnessOwner : event.target.value,
      isCustomer: 'off'
    })
  }
  async handleSubmit(e){
    e.preventDefault();
    const url = `api/updateAccount`
    const response = await fetch(url, {
      body: this.state,
      method: 'post',
      headers: {
        Accept: 'application/json',
      },
    })
    const json = await response.json()
    sessionStorage.setItem('credsCoupon', JSON.stringify(json))
  }

  render() {
    return (
<div className="container text-center">
      <form className="accountForm" method="post">
      <div className="adjustAccountSettings">
        
        <h2>Change Account Settings</h2>
          {/* <div className="inputGroup">
            <input id="radio1" name="radio" type="radio" value="checked" checked onChange={this.updateIsCustomer.bind(this)}/>
            <label>Customer</label>
            <input id="radio2" name="radio" type="radio" onChange={this.updateIsBuisnessOwner.bind(this)}/>
            <label> Buisness Owner</label> 
          </div> */}
          </div>
        
          <InputField
          htmlFor="Email"
          type="email"
          labelHTML="Email"
          placeholder="ProSaver@Couponer.com"
          onChange={this.updateEmail}
          />

          <InputField
          htmlFor="Password"
          type="password"
          labelHTML="Old Password"
          placeholder="Old Password"
          onChange={this.updateOldPassword}
          />

          <InputField
          htmlFor="Password"
          type="password"
          labelHTML="Password"
          placeholder="Password"
          onChange={this.updateOldPassword}
          />

          <InputField
          htmlFor="Phone Number"
          type="number"
          labelHTML="Phone Number"
          placeholder="+1 123-456-7890"
          onChange={this.updatePhoneNumber}
          />
          
          <InputField
          htmlFor="Address"
          type="text"
          labelHTML="Address"
          placeholder="13389 Savings Street"
          onChange={this.updateAddress}
          />
          
          <InputField
          htmlFor="Card Number"
          type="text"
          labelHTML="Card Number"
          placeholder="0000-0000-0000-0000"
          onChange={this.updateCardNumber}
          />
          
          <InputField
          htmlFor="Cardholder Name"
          type="text"
          labelHTML="Cardholder Name"
          placeholder="Billy Bob"
          onChange={this.updateCardholderName}
          />
        
          <InputField
          htmlFor="CCV"
          type="number"
          labelHTML="CCV"
          placeholder="555"
          onChange={this.updateCCV}
          />        
          
          <InputField
          htmlFor="City"
          type="text"
          labelHTML="City"
          placeholder="Coupon Town"
          onChange={this.updateCity}
          />   
          
          <InputField
          htmlFor="State"
          type="text"
          labelHTML="State"
          placeholder="York"
          onChange={this.updateState}
          />      
          
          <InputField
          htmlFor="Experation Date"
          type="text"
          labelHTML="Experation Date"
          placeholder="MM/YY"
          onChange={this.updateExperationDate}
          />

          <InputField
          htmlFor="Experation Date"
          type="text"
          labelHTML="Experation Date(MM/YY)"
          placeholder="MM/YY"
          onChange={this.updateExperationDate}
          />   
          
          <InputField
          htmlFor="Zip Code"
          type="number"
          labelHTML="Zip Code"
          placeholder="55555"
          onChange={this.updateZipcode}
          />  

          <InputField
          htmlFor="Buisness Name"
          type="text"
          labelHTML="Buisness Name"
          placeholder="Buisness Name"
          onChange={this.updateBuisnessName}
          /> 

          <button value="send" className="updatebtn" onClick={this.handleSubmit}> Update Info</button>
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
        </div>
    )
  }
}

export default AccountSettings;
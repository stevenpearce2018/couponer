import React, { Component } from 'react';
import './signup.css';
import ReactFlagsSelect from 'react-flags-select';
 
//import css module
import 'react-flags-select/css/react-flags-select.css';

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
      monthLength: ''
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
  updateExperationDate(event) {
    this.setState({experationDate : event.target.value})
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
  GetLocation() {
    const google=window.google
    var geocoder = new google.maps.Geocoder();
    let that = this;
    geocoder.geocode({ 'address': that.state.address }, (results, status) => {
          if (status == google.maps.GeocoderStatus.OK) {
              var latitude = results[0].geometry.location.lat();
              var longitude = results[0].geometry.location.lng();
              alert("Latitude: " + latitude + "\nLongitude: " + longitude);
          } else {
              alert("Request failed.")
          }
      });
  };
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
    alert('works')
    const url = `api/signupCustomer`
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
    alert(json)
    localStorage.setItem('credsCoupon', JSON.stringify(json))
}
  render() {
    const yourPick = this.state.yourPick
    const options = this.state.customerOrBuisness.map((loan, key) => {
      const isCurrent = this.state.yourPick === loan
      return (
        
        <div 
          key={key} 
          className="radioPad"
        >
          <div className='radioButtonsSignup'>
            <label 
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
              {loan}
            </label>
          </div>
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
          <strong>{options}</strong>
        </div>
          <form className='signinForm'>
      <div className="signupBox">
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="Email">
          <strong>Email</strong>
        </label>
        </div>
        <input className='signupInput' type="email" placeholder="ProSaver@Couponer.com" onChange={this.updateEmail} required/>
      </div>
    <div className="signupBox">
        <div className='inputLabel'>
        <label htmlFor="password">
          <strong>Password</strong>
        </label>
    </div>
        <input className='signupInput' type="password" placeholder="Your Password Here" required onChange={this.updatePassword}/>
      </div>
      <div className="signupBox"> 
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="Phone Number">
          <strong>Full Phone Number</strong>
        </label>
        </div>
        <input className='signupInput' type="number" placeholder="(1)123-456-7890" onChange={this.updatePhoneNumber} required/>
      </div>
      <div className="signupBox"> 
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="Credit Card Number">
          <strong>Credit Card Number</strong>
        </label>
        </div>
        <input className='signupInput' type="number" placeholder="0000-0000-0000-0000" onChange={this.updateCardNumber} required/>
      </div>
          <div className="signupBox"> 
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="Credit Card Number">
          <strong>CCV</strong>
        </label>
        </div>
        <input className='signupInput' type="number" placeholder="555" onChange={this.updateCCV} required/>
      </div>
    
          <div className="signupBox"> 
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="Zipcode">
          <strong>Zip code</strong>
        </label>
        </div>
        <input className='signupInput' type="number" placeholder="55555" onChange={this.updateZipcode} required/>
      </div>
    
              <div className="signupBox"> 
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="Experation Date">
          <strong>Experation Date</strong>
        </label>
        </div>
        <input className='signupInput' type="text" placeholder="MM/YY" onChange={this.updateExperationDate} required/>
      </div>
    
        <div className="signupBox"> 
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="Street">
          <strong>Address</strong>
        </label>
        </div>
        <input className='signupInput' type="text" placeholder="12345 189th Savings St" onChange={this.updateAddress} required/>
      </div>

      <div className="signupBox"> 
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="cardholder name">
          <strong>Cardholder Name</strong>
        </label>
        </div>
        <input className='signupInput' type="text" placeholder="Bob billy johnson" onChange={this.updateCardholderName.bind(this)} required/>
      </div>
          <div className="signupBox">
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="City">
          <strong>City</strong>
        </label>
        </div>
        <input className='signupInput' type="text" placeholder="Coupon Town" required onChange={this.updateCity}/>
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
      <div className="signupBox">
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="City">
          <strong>State/Provience</strong>
        </label>
        </div>
        <input className='signupInput' type="text" placeholder="Florida" required onChange={this.updateRegion} />
      </div>
      <div className={this.state.showOrHideBuisInput}>
      <div className="buisnessNameSignup"> 
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="buisness name">
          <strong>Buisness Name</strong>
        </label>
        </div>
        <input className='signupInput' type="text" placeholder="Bob's Kitten Rentals" onChange={this.updateBuisnessName}/>
      </div>
      </div>
      <div className={this.state.showOrHideAccountMem}>
        <div className='inputLabel'>
        <label className='signupLabel' htmlFor="Subscription Length">
          <strong>Subscription Length 4.99$ per month for unlimited coupons</strong>
        </label>
        </div>
        <input className='signupInput' type="nubmer" placeholder="Amount of months" onChange={this.updateMonthLength}/>
      </div>
  </form>
  <br/>

  <div className='buttonAndForgot'>
        <button type="submit" value="Submit" className="signupbtn" onClick={this.handleSingup}><strong>Submit</strong></button>
        <br/>
      <a className='forgotPass' href="#">
        <strong>Forgot Password?</strong>
      </a>
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

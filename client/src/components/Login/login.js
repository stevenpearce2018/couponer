 
import React, { Component } from 'react';
import './login.css';
import InputField from '../SubComponents/InputField/inputField'
import validateEmail from '../../validateEmail';
import postRequest from '../../postReqest';
import { toast } from 'react-toastify';
import checkPasswordStrength from '../../checkPasswordStrength';

class Login extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
        email: '',
        password: '',
        popupClass: 'hiddenOverlay',
        recoveryEmail: '',
        recoverEmailSent: false,
        recoveryCode: '',
        newPassword: '',
        validPassword: <span className="icon red">&#x2718;</span>
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.sendRecovery = this.sendRecovery.bind(this);
    this.validateCode = this.validateCode.bind(this);
  }
  handleChange = event => {
    const { target: { name, value } } = event
    this.setState({ [name]: value })
    // if (name === "recoveryEmail") this.setState({ phoneNumber: undefined})
  }

  togglePopup = () => this.state.popupClass === "hiddenOverlay" ? this.setState({popupClass: "overlay"}) : this.setState({popupClass: "hiddenOverlay"})

  componentWillMount() {
    if(sessionStorage.getItem('UnlimitedCouponerKey') && sessionStorage.getItem('UnlimitedCouponerEmail')) {
      this.props.setMainHome();
      toast.error("You are already logged in!")
    }
  }
  sendRecovery(){
    if (validateEmail(this.state.recoveryEmail) === false) return toast.warn("You need to enter a valid email")
    const data = {
      recoveryEmail: this.state.recoveryEmail,
      // phoneNumber: this.state.phoneNumber
    }
    const json = postRequest(`/api/recoverAccount`, data)
    if (json && json.success === true) {
      this.setState({recoverEmailSent: true})
      toast.success("Your recovery message has been sent! Please enter it in the next prompt.")
    }
    else toast.error("Something went wrong, please try again.")
    // this.togglePopup();
  }
  handleSubmit(e){
    e.preventDefault();
    if (validateEmail(this.state.email) === false) return toast.error("You need to enter a valid email")
    if (this.state.password === '') return toast.error("You need to enter a password")
    const data = {
      email: this.state.email,
      password: this.state.password,
    }
    const json = postRequest(`/api/signin`, data)
    if (json && json.loggedInKey){
      this.props.parentMethod( json.loggedInKey, this.state.email, json.couponsCurrentlyClaimed, json.membershipExperationDate);
      sessionStorage.setItem('UnlimitedCouponerKey', json.loggedInKey)
      json.loggedInKey.substr(-1) === "b" ? sessionStorage.setItem('businessOwner', true) : sessionStorage.setItem('businessOwner', false)
      toast.success("Welcome " + this.state.email + "!")
      // if(json.loggedInKey.substr(-1) === "c") {
      //   sessionStorage.setItem('UnlimitedCouponerMembershipExperationDate', json.membershipExperationDate)
      //   sessionStorage.setItem('UnlimitedCouponerCouponsCurrentlyClaimed', json.couponsCurrentlyClaimed)
      // }
    } else toast.error("Invalid Login")
  }
    
  validateCode(){
    if (checkPasswordStrength(this.state.newPassword)) this.setState({validPassword: <span className="green icon">&#10003;</span>})
    else return toast.warn("Your password is not valid!");
    const data = {
      recoveryEmail: this.state.recoveryEmail,
      newPassword: this.state.newPassword,
      randomNumber: this.state.recoveryCode
    }
    const json = postRequest(`/api/recoverAccountWithCode`, data)
    json.success ? toast.success("Successful account recover!") : toast.error("Failed to recover account.")
  }
  render() {
    return (
      <div className="loginForm">
          <form className="form" method="post">
            <h2>Log In</h2>
            <div className="inputGroup">
              <div className="emailPass">
                  <label htmlFor="emailSignin">Email</label>
                  <input type="email" name="email" id="emailSignin" onChange={this.handleChange}/>
                  <br/>
                  <label htmlFor="passwordSignin">Password</label>
                  <input type="password" name="password" id="passwordSignin" onChange={this.handleChange}/>
                  <br/>
                <button className='signupbtn signupbtnn' value="send" onClick={this.handleSubmit}><strong>Sign In</strong></button>
                <div className='forgotPass'>
                  <strong onClick={this.togglePopup}>Forgot Password?</strong>
                </div>
              </div>
            </div>
          </form>
          <div className={this.state.popupClass}>
            <div className="popup">
            {/* this.setState({recoverEmailSent: true}) */}
              <h2 className="popupheader">
              {this.state.recoverEmailSent === false ? 
                "Please Enter Your Email" : 
                "Please enter your recovery code."
              }
              </h2>
              <a className="close" onClick={this.togglePopup}>&times;</a>
              <div className="popupcontent">
                <InputField
                  htmlFor={this.state.recoverEmailSent === false ? "Recover account": "Your 5 Digit Code"}
                  type={this.state.recoverEmailSent === false ? "text": "number"}
                  name={this.state.recoverEmailSent === false ? "recoveryEmail": "recoveryCode"}
                  labelHTML={this.state.recoverEmailSent === false ? "Your Email": "Your 5 Digit Code"}
                  placeholder={this.state.recoverEmailSent === false ? "helpme@ohno.com": "12345"}
                  onChange={this.handleChange}
                  required
                />
                {this.state.recoverEmailSent === false ? <div></div> :
                <div>
                  <p className="text"><strong>Your new password will require 1 uppercase letter, 1 lowercase letter, 8 total characters, 1 number, and one special character.</strong> </p>
                  <InputField
                    htmlFor="New Password"
                    type="password"
                    name= "newPassword"
                    labelHTML="Your New Password"
                    placeholder= "New Password"
                    onChange={this.handleChange}
                    required
                  />
                </div>
                }
                {/* <PhoneInput
                  placeholder="Enter phone number"
                  value={ this.state.phoneNumber }
                  onChange={ phoneNumber => this.setState({ recoveryEmail: undefined, phoneNumber: phoneNumber}) } 
                /> */}
              <div className="popupbtn">
              <button className='signupbtn signupbtnn' value="send" onClick = {this.state.recoverEmailSent === false ? this.sendRecovery : this.validateCode}>
                <strong>
                  {this.state.recoverEmailSent === false ? "Send Recovery Email" : "Validate Code"}
                </strong>
              </button>
              </div>
              </div>
            </div>
          </div>
      </div>
    );
  }
}

export default Login;
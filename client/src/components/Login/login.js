 
import React, { Component } from 'react';
import './login.css';
// import { ReCaptcha } from 'react-recaptcha-google';
// import { loadReCaptcha } from 'react-recaptcha-google';
import InputField from '../SubComponents/InputField/inputField'
import validateEmail from '../../validateEmail';

class Login extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
        email: '',
        password: '',
        recaptchaToken: '',
        popupClass: 'hiddenOverlay',
        recoveryEmail: ''
    };
    this.updateEmail = this.updateEmail.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    // this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    // this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    this.togglePopup = this.togglePopup.bind(this);
    this.updateRecoveryEmail = this.updateRecoveryEmail.bind(this);
    this.sendRecoveryEmail = this.sendRecoveryEmail.bind(this);
  }
  updatePassword(event) {
    this.setState({password : event.target.value})
  }
  updateEmail(event) {
    this.setState({email : event.target.value})
  }
  updateRecoveryEmail(event){
    this.setState({recoveryEmail : event.target.value})
  }
  togglePopup(){
    let newClass = "hiddenOverlay";
    if(this.state.popupClass === "hiddenOverlay") newClass = "overlay";
    this.setState({popupClass: newClass})
  }
  componentDidMount() {
  //   loadReCaptcha()
  //   if (this.captchaDemo) {
  //       this.captchaDemo.reset();
  //       this.captchaDemo.execute();
  //   }
  // }
  // onLoadRecaptcha() {
  //     if (this.captchaDemo) {
  //         this.captchaDemo.reset();
  //         this.captchaDemo.execute();
  //     }
  // }
  // verifyCallback(recaptchaToken) {
  //   this.setState({recaptchaToken: recaptchaToken})
  }
  async sendRecoveryEmail(){
    if (validateEmail(this.state.recoveryEmail) === false) return alert("You need to enter a valid email")
    const data = {
      recoveryEmail: this.state.recoveryEmail,
      // recaptchaToken: this.state.recaptchaToken
    }
    const url = `/api/recoverAccount`
    const response = await fetch(url, {
      method: "POST", 
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(data),
    })
    const json = await response.json()
    alert(JSON.stringify(json))
    if (json.success === true) {
      alert("A message has been sent to your email, please check it to recover your account")
      this.togglePopup();
    } else alert("Something went wrong, please try again.")
  }
  async handleSubmit(e){
    e.preventDefault();
    if (this.state.email === '') return alert("You need to enter a valid email")
    if (validateEmail(this.state.email) === false) return alert("You need to enter a valid email")
    if (this.state.password === '') return alert("You need to enter a password")
    const data = {
      email: this.state.email,
      password: this.state.password,
      // recaptchaToken: this.state.recaptchaToken
    }
    const url = `/api/signin`
    const response = await fetch(url, {
      method: "POST", 
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(data),
    })
    const json = await response.json()
    if (json.loggedInKey){
      this.props.parentMethod(json.loggedInKey, this.state.email);
      sessionStorage.setItem('UnlimitedCouponerKey', JSON.stringify(json.loggedInKey))
    } else alert("Invalid Login")
  }
    
  render() {
    return (
      <div className="loginForm">
          <form className="form" method="post">
            <h2>Log In</h2>
            <div className="inputGroup">
              <div className="emailPass">
                  <label>Email</label>
                  <input type="email" id="emailSignin" onChange={this.updateEmail}/>
                  <br/>
                  <label>Password</label>
                  <input type="password" id="passwordSignin" onChange={this.updatePassword}/>
                  <br/>
                <button className='signupbtn signupbtnn' value="send" onClick={this.handleSubmit}><strong>Sign In</strong></button>
                <div className='forgotPass'>
                  <strong onClick={this.togglePopup}>Forgot Password?</strong>
                </div>
              </div>
            </div>
            {/* <ReCaptcha
            ref={(el) => {this.captchaDemo = el;}}
            size="invisible"
            render="explicit"
            sitekey="6Lf9D3QUAAAAAFdm98112C_RrKJ47-j68Oimnslb"
            data-theme="dark"
            onloadCallback={this.onLoadRecaptcha}
            verifyCallback={this.verifyCallback}
            /> */}
          </form>
          <div className={this.state.popupClass}>
            <div className="popup">
              <h2>Please Enter Your Email</h2>
              <a className="close" onClick={this.togglePopup}>&times;</a>
              <div className="popupcontent">
                <InputField
                htmlFor="Recover account"
                type="text"
                labelHTML="Your Email"
                placeholder="helpme@ohno.com"
                onChange={this.updateRecoveryEmail}
                required
                />
              <div className="popupbtn">
              <button className='signupbtn signupbtnn' value="send" onClick={this.sendRecoveryEmail}><strong>Recover</strong></button>
              </div>
              </div>
            </div>
          </div>
      </div>
    );
  }
}

export default Login;
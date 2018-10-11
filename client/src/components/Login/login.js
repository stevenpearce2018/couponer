 
import React, { Component } from 'react';
import './login.css';
import { ReCaptcha } from 'react-recaptcha-google';
import { loadReCaptcha } from 'react-recaptcha-google';

class Login extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
        email: '',
        password: '',
        recaptchaToken: '',
    };
    this.updateEmail = this.updateEmail.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onLoadRecaptcha = this.onLoadRecaptcha.bind(this);
    this.verifyCallback = this.verifyCallback.bind(this);
  }
  updatePassword(event) {
    this.setState({password : event.target.value})
  }
  updateEmail(event) {
    this.setState({email : event.target.value})
  }

  componentDidMount() {
    loadReCaptcha()
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

  async handleSubmit(e){
    e.preventDefault();
    const data = {
      email: this.state.email,
      password: this.state.password,
      recaptchaToken: this.state.recaptchaToken
    }
    alert(this.state.recaptchaToken, 'this.state.recaptchaToken')
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
    alert(JSON.stringify(json))
    if (json.loggedInKey){
      this.props.parentMethod();
      sessionStorage.setItem('couponerkey', JSON.stringify(json.loggedInKey))
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
                <button className='signupbtn' value="send" onClick={this.handleSubmit}><strong>Sign In</strong></button>
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
          </form>
      </div>
    );
  }
}

export default Login;
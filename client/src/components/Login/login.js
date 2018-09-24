 
 import React, { Component } from 'react';
 import './login.css';
 
 class Login extends Component {
    constructor(props) {
      super(props);
      this.state = {
          email: '',
          password: ''
      };
      this.updateEmail = this.updateEmail.bind(this);
      this.updatePassword = this.updatePassword.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
    updatePassword(event) {
      this.setState({password : event.target.value})
    }
    updateEmail(event) {
      this.setState({email : event.target.value})
    }
    async handleSubmit(e){
      e.preventDefault();
      const data = {
        email: this.state.email,
        password: this.state.password
      }
      const url = `api/signin`
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
      localStorage.setItem('credsCoupon', JSON.stringify(json))
    }

    render() {
      return (
        <div className="loginForm">
            <form className="form" method="post">
                <h2>Log In</h2>
                <div className="inputGroup">
                <div className="emailPass">
                    <label> Email : </label>
                    <input type="email" id="emailSignin" onChange={this.updateEmail}/>
                    <br/>
                    <label> Password : </label>
                    <input type="password" id="passwordSignin" onChange={this.updatePassword}/>
                    <br/>
                    <button className='signupbtn' value="send" onClick={this.handleSubmit}><strong>Sign In</strong></button>
                </div>
                </div>
            </form>
        </div>
      );
    }
  }

export default Login;
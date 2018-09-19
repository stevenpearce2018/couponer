 
 import React, { Component } from 'react';
 import './login.css';
 
 class Login extends Component {
    constructor(props) {
      super(props);
      this.state = {
          email: '',
          password: ''
      };
      }
      updatePassword(event) {
        this.setState({password : event.target.value})
      }
      updateEmail(event) {
        this.setState({email : event.target.value})
      }
      handleSubmit(e){
        e.preventDefault();
        const data = {
          email: this.state.email,
          password: this.state.password
        }
        const url = `api/signin`
        fetch(url, {
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, cors, *same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, same-origin, *omit
          headers: {
              "Content-Type": "application/json; charset=utf-8",
              // "Content-Type": "application/x-www-form-urlencoded",
          },
          body: JSON.stringify(data),
      }).then(response => {
        response.json().then(json => {
          alert(JSON.stringify(json))
            localStorage.setItem('credsCoupon', JSON.stringify(json))
          })
        })
    }
    render() {
      return (
        <div className="loginForm">
            <form className="form" method="post">
                <h2>Log In</h2>
                <div className="inputGroup">
                <div className="emailPass">
                    <label> Email : </label>
                    <input type="email" id="emailSignin" onChange={this.updateEmail.bind(this)}/>
                    <br/>
                    <label> Password : </label>
                    <input type="password" id="passwordSignin" onChange={this.updatePassword.bind(this)}/>
                    <br/>
                    <button className='signIn' value="send" onClick={this.handleSubmit.bind(this)}><strong>Sign In</strong></button>
                </div>
                </div>
            </form>
        </div>
          );
        }
      }

export default Login;
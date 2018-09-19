import React, { Component } from 'react'
import './App.css'
import CouponForm from './components/CouponForm/couponform'
import SignUp from './components/SignUp/signup'
import AccountSettings from './components/AccountSettings/accountsettings';
import Home from './components/Home/home'
import Footer from './components/Footer/footer';
import Login from './components/Login/login';
import axios from 'axios';
import Search from './components/Search/search'
import superState from './superState';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      email: '',
      password: '',
      test: superState.test,
      mainContent: <Home/>,
      signinSignoutButton: this.isLoggedinbutton(),
      signupButton: this.showSignupButton(),
  };
}
isLoggedinbutton() {
  let user = localStorage.getItem('credsCoupon')
  if(user) {
    return <button className='navBar' onClick={this.handleSignOut.bind(this)}><strong>Sign Out</strong></button>;
  }
  else{
    return <Home/>;
    // <button className='navBar' value="send" onClick={this.setSignInToMain.bind(this)}><strong>Sign In</strong></button>;
  }
}
showSignupButton(){
  let user = localStorage.getItem('credsCoupon')
  if(user) {
    return '';
  }
  else{
    return <button className='navBar' onClick={this.setSignupToMain.bind(this)}><strong>Sign up</strong></button>;
  }
}
setSignupToMain(){
  this.setState({mainContent: <Home/>})
}

setSuperState(){
  this.setState({test: superState.test})
}
setSignInToMain() {
  this.setState({mainContent: <div className="formDiv">
  <form className="form" method="post">
  <h2>SignIn</h2>
    <div className="inputGroup">
    <label> Email : </label>
    <input type="email" id="emailSignin" onChange={this.signInEmail.bind(this)}/>
    <br/>
    <label> Password : </label>
    <input type="password" id="passwordSignin" onChange={this.signInPassword.bind(this)}/>
    <br/>
    <button value="send" onClick={this.handleSubmit.bind(this)}> Sign In</button>
    </div>
  </form>
</div>})
}
  isLoggedin() {
    let user = localStorage.getItem('credsCoupon')
    if (user) {
      return '';
    } else {
      return <div className="formDiv">
      <form className="form" method="post">
      <h2>SignIn</h2>
        <div className="inputGroup">
        <label> Email : </label>
        <input type="email" id="emailSignin" onChange={this.signInEmail.bind(this)}/>
        <br/>
        <label> Password : </label>
        <input type="password" id="passwordSignin" onChange={this.signInPassword.bind(this)}/>
        <br/>
        <button value="send" onClick={this.handleSubmit.bind(this)}> Sign In</button>
        </div>
      </form>
    </div>;
    }
  }
    handleSignOut(){
      localStorage.removeItem('credsCoupon')
      this.setState({mainContent: <div className="formDiv">
      <form className="form" method="post">
      <h2>SignIn</h2>
        <div className="inputGroup">
        <label> Email : </label>
        <input type="email" id="emailSignin" onChange={this.signInEmail.bind(this)}/>
        <br/>
        <label> Password : </label>
        <input type="password" id="passwordSignin" onChange={this.signInPassword.bind(this)}/>
        <br/>
        <button value="send" onClick={this.handleSubmit.bind(this)}> Sign In</button>
        </div>
      </form>
    </div>})
    this.setState({
      signupButton: <button className='navBar' onClick={this.setSignupToMain.bind(this)}><strong>Sign up</strong></button>,
      signinSignoutButton: <button className='navBar' onClick={this.setSignInToMain.bind(this)}><strong>Sign in</strong></button>})
    }
    signInPassword(event) {
      this.setState({password : event.target.value})
  }
  signInEmail(event) {
      this.setState({email : event.target.value})
  }

  getUserInfo() {
    var user = JSON.parse(localStorage.getItem('credsCoupon'));
    let password;
    let email;
    if (user) {
            password = user.password;
            email = user.email;
        const url = `/api/signin/${email}/${password}/accountSettings`
        fetch(url, {
          method: 'post',
          body: {
            password: password,
            email: email
          },
          headers: {
            Accept: 'application/json',
          },
      }).then(response => {
        response.json().then(json => {
            alert(JSON.stringify(json))
        })
      })
    } else {
        this.setState({mainContent: <div className="formDiv">
        <form className="form" method="post">
        <h2>Log in</h2>
          <div className="inputGroup">
          <label> Email : </label>
          <input type="email" id="emailSignin" onChange={this.signInEmail.bind(this)}/>
          <br/>
          <label> Password : </label>
          <input type="password" id="passwordSignin" onChange={this.signInPassword.bind(this)}/>
          <br/>
          <button className='navBar' value="send" onClick={this.handleSubmit.bind(this)}><strong>Sign In</strong></button>
          </div>
        </form>
      </div>})
        }
    }

  setMainAccountSettings() {
    this.setState({mainContent: <AccountSettings/>})
  }
  setMainUploadCoupon() {
    this.setState({mainContent: <CouponForm/>})
  }
  setMainSignUp(e){
    e.preventDefault();
    this.setState({mainContent: <SignUp/>})
  }
  setMainHome(e){
    e.preventDefault();
    this.setState({mainContent: <Home/>})
  }
  setMainLogin(e){
    e.preventDefault();
    this.setState({mainContent: <Login/>})
  }
  setMainSearch(e){
    e.preventDefault();
    this.setState({mainContent: <Search parentMethod={this.setSuperState.bind(this)}/>})
  }

  handleSubmit(e){
      e.preventDefault();
      const url = `api/signin`
      fetch(url, {
        body: {
          email: this.state.email,
          password: this.state.password
        },
        method: 'post',
        headers: {
          Accept: 'application/json',
        },
    }).then(response => {
      response.json().then(json => {
          // let user = localStorage.getItem('credsCoupon')
          // localStorage.setItem('credsCoupon', JSON.stringify(json))
          // user = localStorage.getItem('credsCoupon')
          this.setState({
            mainContent: '',
            signinSignoutButton: <div className="navBar"><button onClick={this.handleSignOut.bind(this)}><strong>Sign Out</strong></button></div>,
            signupButton: '',
        })
        })
      })
  }

  render () {
    return (
        <div className="home">
          <h1 className='homeMainTitle'>
            <span>
              Save money, grow your business, try something new.
            </span>
          </h1>
        <header className='homeHeader'>
          <section>
            <a href=" " id="logo">
              <strong>
                Couponer
              </strong>
            </a>
            <label htmlFor="toggle-1" className="toggle-menu">
              <ul>
                <li ></li>
                <li ></li>
                <li ></li>
              </ul>
            </label>
            <input type="checkbox" id="toggle-1"/>

          <nav>
            <ul>
              <li  onClick={this.setMainHome.bind(this)}><a href="#Home"><i className="icon-home"></i>Home</a></li>
              <li onClick={this.setMainLogin.bind(this)}><a href="#Login"><i className="icon-signin"></i>Login</a></li>
              <li onClick={this.setMainSignUp.bind(this)}><a href="#signUp"><i className="icon-user"></i>Sign up</a></li>
              <li onClick={this.setMainAccountSettings.bind(this)}><a href="#accountSettings"><i className="icon-gear"></i>Account Settings</a></li>
              <li onClick={this.setMainUploadCoupon.bind(this)}><a href="#coupons"><i className="icon-money"></i>Coupons</a></li>
              <li onClick={this.setMainSearch.bind(this)}><a href="#search"><i className="icon-search"></i>Search</a></li>
            </ul>
          </nav>
          </section>
        </header>
          {/* <header className="App-header"> */}
            {/* <div className='navigation'> */}
            {/* <button className='navBar' onClick={this.setMainUploadCoupon.bind(this)}><i class="fa fa-home"></i></button> */}
                {/* <button className='navBar' onClick={this.setMainViewCoupons.bind(this)}><strong>View Coupons</strong></button>
                <button className='navBar' onClick={this.setMainAccountSettings.bind(this)}><strong>Account Settings</strong></button>
                <button className='navBar' onClick={this.setMainMyCoupons.bind(this)}><strong>My Coupons</strong></button>
                <button className='navBar' onClick={this.setMainUploadCoupon.bind(this)}><strong>Upload Coupon</strong></button> */}
            {/* </div> */}
          {/* </header> */}
          <h1>{this.state.test}</h1>
          {this.state.mainContent}
          <br/>
          <br/>
          {/* {this.state.signinSignoutButton}
          {this.state.signupButton} */}

        <Footer/>
        </div>
    )
  }
}

export default App;

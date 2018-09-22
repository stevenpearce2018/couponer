import React, { Component } from 'react'
import './App.css'
import CouponForm from './components/CouponForm/couponform'
import SignUp from './components/SignUp/signup'
import AccountSettings from './components/AccountSettings/accountsettings';
import Home from './components/Home/home'
import Footer from './components/Footer/footer';
import Login from './components/Login/login';
import Search from './components/Search/search'
import superState from './superState';
import history from './history'


// For routing
const Link = (props) => {
    const onClick = (e) => {
        const aNewTab = e.metaKey || e.ctrlKey;
        const anExternalLink = props.href.startsWith('http');
        if (!aNewTab && !anExternalLink) {
            e.preventDefault();
            history.push(props.href);
        }
    };
    return (
        <a href={props.href} onClick={onClick}>
            {props.children}
        </a>
    );
};

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
  this.setMainSearch = this.setMainSearch.bind(this);
  this.setMainUploadCoupon = this.setMainUploadCoupon.bind(this);
  this.setMainSignUp = this.setMainSignUp.bind(this);
  this.setMainAccountSettings = this.setMainAccountSettings.bind(this);
  this.setMainHome = this.setMainHome.bind(this);
  this.setMainLogin = this.setMainLogin.bind(this);
  this.setSignupToMain = this.setSignupToMain.bind(this);
  this.handleSignOut = this.handleSignOut.bind(this);
  this.setSuperState = this.setSuperState.bind(this);
  this.signInPassword = this.signInPassword.bind(this);
  this.handleSubmit = this.handleSubmit.bind(this);
  this.setSignInToMain = this.setSignInToMain.bind(this);
  this.signInPassword = this.signInPassword.bind(this);
  this.signInEmail = this.signInEmail.bind(this);
  this.setSignupToMain = this.setSignupToMain.bind(this);
  this.handleSubmit = this.handleSubmit.bind(this);
}
componentDidMount () {
  this._isMounted = true; 
  window.onpopstate = ()=> {
    if(this._isMounted) {
      const urlPath = window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length)
      switch (urlPath.toLowerCase()) {
        case '':
            this.setState({mainContent: <Home/>})
            break;
        case 'home':
            this.setState({mainContent: <Home/>})
            break;
        case 'uploadcoupon':       
            this.setState({mainContent: <CouponForm/>})
            break;
        case 'accountsettings': 
            this.setState({mainContent: <AccountSettings/>})
            break;
        case 'signup':
            this.setState({mainContent: <SignUp/>})
            break;
        case 'search':
            this.setState({mainContent: <Search/>})
            break;
        case 'login':
            this.setState({mainContent: <Login/>})
            break;
        case 'signin':
            this.setSignInToMain();
        default:
            this.setState({mainContent: <Home/>})
      }
    }
  }
}
isLoggedinbutton() {
  let user = localStorage.getItem('credsCoupon')
  if(user) {
    return <button className='navBar' onClick={this.handleSignOut}><strong>Sign Out</strong></button>;
  }
  else{
    return <Home/>;
    // <button className='navBar' value="send" onClick={this.setSignInToMain}><strong>Sign In</strong></button>;
  }
}
showSignupButton(){
  let user = localStorage.getItem('credsCoupon')
  if(user) {
    return '';
  }
  else{
    return <button className='navBar' onClick={this.setSignupToMain}><strong>Sign up</strong></button>;
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
    <input type="email" id="emailSignin" onChange={this.signInEmail}/>
    <br/>
    <label> Password : </label>
    <input type="password" id="passwordSignin" onChange={this.signInPassword}/>
    <br/>
    <button value="send" onClick={this.handleSubmit}> Sign In</button>
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
        <input type="email" id="emailSignin" onChange={this.signInEmail}/>
        <br/>
        <label> Password : </label>
        <input type="password" id="passwordSignin" onChange={this.signInPassword}/>
        <br/>
        <button value="send" onClick={this.handleSubmit}> Sign In</button>
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
        <input type="email" id="emailSignin" onChange={this.signInEmail}/>
        <br/>
        <label> Password : </label>
        <input type="password" id="passwordSignin" onChange={this.signInPassword}/>
        <br/>
        <button value="send" onClick={this.handleSubmit}> Sign In</button>
        </div>
      </form>
    </div>})
    this.setState({
      signupButton: <button className='navBar' onClick={this.setSignupToMain}><strong>Sign up</strong></button>,
      signinSignoutButton: <button className='navBar' onClick={this.setSignInToMain}><strong>Sign in</strong></button>})
    }
    signInPassword(event) {
      this.setState({password : event.target.value})
  }
  signInEmail(event) {
      this.setState({email : event.target.value})
  }

  getUserInfo() {
    let user = JSON.parse(localStorage.getItem('credsCoupon'));
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
          <input type="email" id="emailSignin" onChange={this.signInEmail}/>
          <br/>
          <label> Password : </label>
          <input type="password" id="passwordSignin" onChange={this.signInPassword}/>
          <br/>
          <button className='navBar' value="send" onClick={this.handleSubmit}><strong>Sign In</strong></button>
          </div>
        </form>
      </div>})
        }
    }

  setMainAccountSettings(e) {
    // e.preventDefault();
    // window.history.pushState({page: "Account Settings"}, "Account Settings", "AccountSettings");
    this.setState({mainContent: <AccountSettings/>})
  }
  setMainUploadCoupon(e) {
    // e.preventDefault();
    // window.history.pushState({page: "Upload coupon"}, "Upload coupon", "UploadCoupon");
    this.setState({mainContent: <CouponForm/>})
  }
  setMainSignUp(e){
    // e.preventDefault();
    // window.history.pushState({page: "SignUp to Couponer"}, "SignUp to Couponer", "SignUp");
    this.setState({mainContent: <SignUp/>})
  }
  setMainHome(e){
    // e.preventDefault();
    // window.history.pushState({page: "Welcome to Couponer"}, "Welcome to Couponer", "Home");
    this.setState({mainContent: <Home/>})
  }
  setMainLogin(e){
    // e.preventDefault();
    // window.history.pushState({page: "Login to Couponer"}, "Login to Couponer", "Login");
    this.setState({mainContent: <Login/>})
  }
  setMainSearch(e){
    // e.preventDefault();
    // window.history.pushState({page: "Search For Coupons"}, "Search For Coupons", "Search");
    this.setState({mainContent: <Search parentMethod={this.setSuperState}/>})
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
            signinSignoutButton: <div className="navBar"><button onClick={this.handleSignOut}><strong>Sign Out</strong></button></div>,
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
            <a href=" " onClick={this.setMainHome} id="logo">
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

          <nav className='navPopup'>
            <ul>
              <Link href = '/Home'><li onClick={this.setMainHome}><a href="#Home"><i className="icon-home"></i>Home</a></li></Link>
              <Link href = '/Login'><li onClick={this.setMainLogin}><a href="#Login"><i className="icon-signin"></i>Login</a></li></Link>
              <Link href = '/SignUp'><li onClick={this.setMainSignUp}><a href="#SignUp"><i className="icon-user"></i>Sign up</a></li></Link>
              <Link href = '/AccountSettings'><li onClick={this.setMainAccountSettings}><a href="#AccountSettings"><i className="icon-gear"></i>Account Settings</a></li></Link>
              <Link href = '/UploadCoupon'><li onClick={this.setMainUploadCoupon}><a href="#Coupons"><i className="icon-money"></i>Coupons</a></li></Link>
              <Link href = '/Search'><li onClick={this.setMainSearch}><a href="#Search"><i className="icon-search"></i>Search</a></li></Link>
            </ul>
          </nav>
          </section>
        </header>
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

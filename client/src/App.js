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
import history from './history';
import CheckoutForm from './components/CheckoutForm/checkoutForm'
import { Elements, StripeProvider } from 'react-stripe-elements';


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
      test: superState.test,
      mainContent: <Home/>,
      loggedin: 'loggedout'
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
  this.handleSubmit = this.handleSubmit.bind(this);
  this.setStateLoggedIn = this.setStateLoggedIn.bind(this)
  this.setSignupToMain = this.setSignupToMain.bind(this);
  this.handleSubmit = this.handleSubmit.bind(this);
}
componentDidMount () {
  const urlHandler = (currentURL) => {
    switch (currentURL.toLowerCase()) {
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
  const url = window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length)
  urlHandler(url)
  this._isMounted = true;
  window.onpopstate = () => {
    if(this._isMounted) {
      const urlPath = window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length)
      urlHandler(urlPath)
    }
  }
}

setSignupToMain(){
  this.setState({mainContent: <Home/>})
}

setSuperState(){
  this.setState({test: superState.test})
}
  handleSignOut(){
    this.setState({loggedin: 'loggedOut'})
  }

  setStateLoggedIn() {
    alert('setStateLoggedIn')
    this.setState({loggedin: 'loggedin'})
  }

  setMainAccountSettings(e) {
    this.setState({mainContent: <AccountSettings/>})
  }
  setMainUploadCoupon(e) {
    this.setState({mainContent: <CouponForm/>})
  }
  setMainSignUp(e){
    this.setState({mainContent: <SignUp/>})
  }
  setMainHome(e){
    this.setState({mainContent: <Home/>})
  }
  setMainLogin(e){
    this.setState({mainContent: <Login parentMethod={this.setStateLoggedIn}/>})
  }
  setMainSearch(e){
    this.setState({mainContent: <Search parentMethod={this.setSuperState}/>})
  }

  async handleSubmit(e){
      e.preventDefault();
      const url = `api/signin`
      let response = await fetch(url, {
        body: {
          email: this.state.email,
          password: this.state.password
        },
        method: 'post',
        headers: {
          Accept: 'application/json',
        },
    })
    response = await response.json()
    alert(response)
      this.setState({
        mainContent: '',
        signinSignoutButton: <div className="navBar"><button onClick={this.handleSignOut}><strong>Sign Out</strong></button></div>,
        signupButton: '',
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
          <StripeProvider apiKey="pk_test_3eBW9BZ4UzRNsmtPCk9gc8F2">
        <div className="example">
          <h1>React Stripe Elements Example</h1>
          <Elements>
            <CheckoutForm />
          </Elements>
        </div>
      </StripeProvider>
          {/* {this.state.signinSignoutButton}
          {this.state.signupButton} */}

        <Footer/>
        </div>
    )
  }
}

export default App;

import React, { Component } from 'react';
import './App.css';
import CouponForm from './components/CouponForm/couponform';
import SignUp from './components/SignUp/signup';
import AccountSettings from './components/AccountSettings/accountsettings';
import Home from './components/Home/home';
import Footer from './components/Footer/footer';
import Login from './components/Login/login';
import Search from './components/Search/search';
import About from './components/About/about';
import history from './history';
import { loadReCaptcha } from 'react-recaptcha-google';
import MyCoupons from './components/MyCoupons/myCoupons';

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
      <div className="notHidden">
        <a href={props.href} onClick={onClick}>
            {props.children}
        </a>
      </div>
    );
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      mainContent: '',
      loginButton: 'notHidden',
      logoutButton: 'hidden',
      email: '',
      loggedInKey: '',
      showOrHideNav: 'hidden',
      loggedInBuisness: 'hidden'
  };
  this.setMainSearch = this.setMainSearch.bind(this);
  this.setMainUploadCoupon = this.setMainUploadCoupon.bind(this);
  this.setMainSignUp = this.setMainSignUp.bind(this);
  this.setMainAccountSettings = this.setMainAccountSettings.bind(this);
  this.setMainHome = this.setMainHome.bind(this);
  this.setMainLogin = this.setMainLogin.bind(this);
  this.setStateLoggedIn = this.setStateLoggedIn.bind(this)
  this.logout = this.logout.bind(this);
  this.setMainToAbout = this.setMainToAbout.bind(this);
  this.getCoupons = this.getCoupons.bind(this);
  this.showOrHideNav = this.showOrHideNav.bind(this);
  this.setMainToMyCoupons = this.setMainToMyCoupons.bind(this);
}
async componentDidMount () {
  loadReCaptcha();
  const urlHandler = (currentURL) => {
    switch (currentURL.toLowerCase()) {
      case 'home':
          this.setMainHome();
          break;
      case 'uploadcoupon':
          this.setMainUploadCoupon();
          break;
      case 'accountsettings':
          this.setMainAccountSettings();
          break;
      case 'signup':
          this.setMainSignUp();
          break;
      case 'search':
          this.setMainSearch();
          break;
      case 'login':
          this.setMainLogin();
          break;
      case 'about':
          this.setMainToAbout();
          break;
      case 'mycoupons':
          this.setMainToMyCoupons();
          break;
      default:
          window.location.pathname = '/Home';
          this.setMainHome();
          break;
    }
  }
  const url = window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length)
  urlHandler(url);
  this._isMounted = true;
  window.onpopstate = () => {
    if(this._isMounted) {
      const urlPath = window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length)
      urlHandler(urlPath)
    }
  }
  if (sessionStorage.getItem('UnlimitedCouponerkey') && sessionStorage.getItem('UnlimitedCouponerkey') !== '') this.setState({loginButton: 'hidden', logoutButton: 'notHidden'})
}
showOrHideNav(){
  if (this.state.showOrHideNav === "navPopup") this.setState({showOrHideNav:"hidden"})
  else this.setState({showOrHideNav:"navPopup"})
}
  async getCoupons(_id){
    const loggedInKey = this.state.loggedInKey;
    const email = this.state.email;
    if (loggedInKey === '' || email === '') alert('You are not logged in!')
    else {
      const data = {
        _id: _id,
        loggedInKey: this.state.loggedInKey,
        email: this.state.email
      }
      const url = `/api/getCoupon`
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
    }
  }
  async logout(){
    const data = {
      loggedInKey: this.state.loggedInKey,
      email: this.state.email
    }
    const url = `/api/signout`;
    const response =  await fetch(url, {
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
    if(json.response === "Logout Failed") alert(json.response)
    this.setState({mainContent: <Home/>, loggedInKey: '', email: '', loginButton: 'notHidden', logoutButton: 'hidden', loggedInBuisness:"hidden"})
    sessionStorage.setItem('UnlimitedCouponerkey', '')
  }

  setMainAccountSettings(e) {
    this.setState({mainContent: <AccountSettings/>})
  }
  setMainUploadCoupon(e) {
    this.setState({mainContent: <CouponForm/>})
  }
  setMainSignUp(e){
    this.setState({mainContent: <SignUp parentMethod={this.setStateLoggedIn}/>})
  }
  setMainHome(e){
    this.setState({mainContent: <Home parentMethod={this.getCoupons}/>})
  }
  setMainLogin(e){
    this.setState({mainContent: <Login parentMethod={this.setStateLoggedIn}/>})
  }
  setMainSearch(e){
    this.setState({mainContent: <Search parentMethod={this.getCoupons}/>})
  }
  setMainToAbout(){
    this.setState({mainContent: <About/>})
  }
  setMainToMyCoupons(){
    this.setState({mainContent: <MyCoupons parentMethod={this.getCoupons}/>})
  }
  setStateLoggedIn(key, email) {
    sessionStorage.setItem('UnlimitedCouponerkey', key)
    if(key.substring(key.length-1, key.length) === "c") this.setState({mainContent: <Home parentMethod={this.getCoupons}/>, loggedInKey: key, email: email, logoutButton: 'notHidden', loginButton: 'hidden'})
    else if(key.substring(key.length-1, key.length) === "b") this.setState({mainContent: <Home parentMethod={this.getCoupons}/>, loggedInKey: key, email: email, logoutButton: 'notHidden', loginButton: 'hidden', loggedInBuisness: 'notHidden'})
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
            <a href="/Home" onClick={this.setMainHome} id="logo">
              <strong>
                UnlimitedCouponer
              </strong>
            </a>
            <label htmlFor="toggle-1" className="toggle-menu" onClick={this.showOrHideNav}>
              <ul>
                <li ></li>
                <li ></li>
                <li ></li>
              </ul>
            </label>
            {/* <input type="checkbox" id="toggle-1" onClick={this.showOrHideNav}/> */}
          <nav className = {this.state.showOrHideNav} onClick={this.showOrHideNav}>
            <ul>
              <Link href = '/Home'><li onClick={this.setMainHome}><div><i className="icon-home"></i>Home</div></li></Link>
              <Link href = '/About'><li onClick={this.setMainToAbout}><div><i className="fa fa-info-circle"></i>About</div></li></Link>
              <div className={this.state.loginButton}><Link href = '/Login'><li onClick={this.setMainLogin}><div><i className="icon-signin"></i>Login</div></li></Link></div>
              <div className={this.state.loginButton}><Link href = '/SignUp'><li onClick={this.setMainSignUp}><div><i className="icon-user"></i>Sign up</div></li></Link></div>
              <div className={this.state.logoutButton}><Link href = '/Home'><li onClick={this.logout}><div><i className="icon-user"></i>Logout</div></li></Link></div>
              <div className={this.state.logoutButton}><Link href = '/MyCoupons'><li onClick={this.setMainToMyCoupons}><div><i className="icon-money"></i>My Coupons</div></li></Link></div>
              <div className={this.state.logoutButton}><Link href = '/AccountSettings'><li onClick={this.setMainAccountSettings}><div><i className="icon-gear"></i>Account Settings</div></li></Link></div>
              <div className={this.state.loggedInBuisness}><Link href = '/UploadCoupon'><li onClick={this.setMainUploadCoupon}><div><i className="icon-money"></i>Upload Coupons</div></li></Link></div>
              <Link href = '/Search'><li onClick={this.setMainSearch}><div><i className="icon-search"></i>Search Coupons</div></li></Link>
            </ul>
          </nav>
          </section>
        </header>
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

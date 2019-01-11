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
import MyCoupons from './components/MyCoupons/myCoupons';
import postRequest from './postReqest';
import getPosition from "./getPosition";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Helmet } from 'react-helmet';
import capitalizeCase from './capitalizeCase';

const SEO = props => {
  return (
    <Helmet>
      <meta name="description" content={props.description}/>
      <meta name="keywords" content={props.keywords}/>
      <title>{props.title}</title>
    </Helmet>
  )
}
// For routing
const Link = props => {
    const onClick = e => {
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
        SEO: <SEO
          title="Boston Deals and Coupons for Food, Spa, Beauty, Clothes, Gym, Car repair, and More."
          keywords="Coupons, Boston Coupons, Food Coupons, Boston Activities" 
          description="Free unlimited online coupons in boston. Save money and explore local businesses in boston. Promote and market your small business for free. Food Coupons, Automotive and Car Repair Coupons, Coupons for Bars, Coupons for Gyms, Yoga Coupons, Health Coupons, Travel Coupons, Increase Business Revenue, Try new Activies, Explore Boston."
        />,
        couponsCurrentlyClaimed: "",
        membershipExperationDate: '',
        showOrHideNav: 'hidden',
        loggedInbusiness: 'hidden',
        ignoreClick: true, // handles navbar closing when open and clicking outside it.
        couponData: <div className="loaderContainer"><div className="loader"></div></div>,
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
    this.showOrHideNav = this.showOrHideNav.bind(this);
    this.setMainToMyCoupons = this.setMainToMyCoupons.bind(this);
    this.uploadCoupons = this.uploadCoupons.bind(this);
    this.hideNav = this.hideNav.bind(this);
    this.updateAccountSettings = this.updateAccountSettings.bind(this);
    // this.fetchCoupons = this.fetchCoupons.bind(this);
    this.updateCouponsClaimed = this.updateCouponsClaimed.bind(this);
    this.updateMembershipExperationDate = this.updateMembershipExperationDate.bind(this);
    this.updateHomeSEO = this.updateHomeSEO.bind(this);
  }
  async componentDidMount () {
    const couponlatitude = sessionStorage.getItem('couponlatitude');
    const couponlongitude = sessionStorage.getItem('couponlongitude');
    if (!couponlatitude && !couponlongitude && navigator.geolocation) getPosition(gotPosition);
    else this.setState({latitude: couponlongitude, longitude: couponlongitude})
    function gotPosition(position) {
      sessionStorage.setItem("couponlatitude", position.latitude)
      sessionStorage.setItem("couponlongitude", position.longitude)
    }
    const urlHandler = currentURL => {
      if(currentURL.toLowerCase().substring(0, 6) === "search") this.setMainSearch();
      else {
        switch (currentURL.toLowerCase()) {
          case '' || 'home' || '/':
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
              this.setMainHome();
              break;
        }
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
    const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey');
    const couponsCurrentlyClaimed = sessionStorage.getItem('couponsCurrentlyClaimed')
    const membershipExperationDate = sessionStorage.getItem('membershipExperationDate')
    if (loggedInKey) this.setState({loginButton: 'hidden', logoutButton: 'notHidden', loggedInKey: sessionStorage.getItem('UnlimitedCouponerKey').replace('"', '').replace('"', ''), email:sessionStorage.getItem('UnlimitedCouponerEmail'), membershipExperationDate: membershipExperationDate, couponsCurrentlyClaimed: couponsCurrentlyClaimed })
    if (loggedInKey && loggedInKey.substr(-1) === "b") this.setState({loggedInbusiness: 'notHidden'})
  }

  showOrHideNav = () => {
    if (this.state.showOrHideNav === "navPopup") this.setState({showOrHideNav:"hidden", ignoreClick: true})
    else this.setState({showOrHideNav:"navPopup", ignoreClick: false})
  }
  hideNav = () => {
    if (this.showOrHideNav !== "hidden" && this.state.ignoreClick === false) this.setState({showOrHideNav: "hidden", ignoreClick: true})
  }

  updateHomeSEO = couponData => this.setState({SEO: <SEO title={`${capitalizeCase(couponData.city)} coupons, ${capitalizeCase(couponData.title)}`} keywords={`${capitalizeCase(couponData.title)}, ${capitalizeCase(couponData.city)}`} description={capitalizeCase(couponData.textarea)} />});

  async logout(){
    const data = {
      loggedInKey: this.state.loggedInKey,
      email: this.state.email
    }
    await postRequest(`/api/signout`, data)
    this.setState({mainContent: <Home updateCouponsClaimed={this.updateCouponsClaimed} updateHomeSEO={this.updateHomeSEO}/>, loggedInKey: '', email: '', loginButton: 'notHidden', logoutButton: 'hidden', loggedInbusiness:"hidden", couponsCurrentlyClaimed: '', membershipExperationDate: ""})
    toast.success("Successful Logout!")
    sessionStorage.removeItem('UnlimitedCouponerKey')
    sessionStorage.removeItem('UnlimitedCouponerEmail')
    sessionStorage.removeItem('businessOwner');
    sessionStorage.removeItem('couponsCurrentlyClaimed')
    sessionStorage.removeItem('membershipExperationDate')
    sessionStorage.removeItem("hsUrl")
  }
  async uploadCoupons(state){
    const data = {
      description: state.description,
      source: state.source,
      currency: state.currency,
      amount: state.amount,
      title: state.title,
      longitude: state.longitude,
      latitude: state.latitude,
      address: state.address,
      amountCoupons: state.amountCoupons,
      currentPrice: state.currentPrice,
      discountedPrice: state.discountedPrice,
      superCoupon: state.superCoupon,
      textarea: state.textarea,
      imagePreviewUrl: state.imagePreviewUrl,
      category: state.category,
      city: state.city,
      zip: state.zip,
      loggedInKey: this.state.loggedInKey,
      email: this.state.email,
    }
    const json = await postRequest(`/api/uploadCoupons`, data)
    if(json && json.response === "Coupon Created" ) return toast.success("Coupon Created!");
    else return toast.error(json.response);
    // alert(JSON.stringify(json), "json")
  }
  async updateAccountSettings(data){
    const dataObject = {
      oldPassword: data.oldPassword,
      newPassword:  data.newPassword,
      city: data.city,
      businessName: data.businessName,
      loggedInKey: this.state.loggedInKey,
      email: this.state.email
    }
    const json = await postRequest(`/api/updateAccount`, dataObject)
    if(json && json.response === "Updated Account!") toast.success("Updated Account!")
    else toast.error("Failed to update account.")
  }

  setMainAccountSettings = () => this.setState({SEO: <SEO title="UnlimitedCouponer - Manage Coupons and Your Account." keywords="Coupons, Boston Coupons, Food Coupons, Boston Activities" description="Manage free coupons, upload coupons for free and manage them all through unlimitedcouponer. Validate coupons and market for free online. Manage your account and view your currently claimed coupons for free online. View deals near you."/>, mainContent: <AccountSettings updateMembershipExperationDate = {this.updateMembershipExperationDate} setMainHome={this.setMainHome} updateAccountSettings={this.updateAccountSettings} updateCouponsClaimed={this.updateCouponsClaimed}/>})
  
  setMainUploadCoupon = () => this.setState({SEO: <SEO keywords="Upload Coupons, Boston Coupons, Online Coupons, Upload Coupons" description="Promote your local business with online coupons for free. Market your business to local customers. Grow your revenue by gaining new customers. Advertise locally in boston by uploading your coupons and business to gain popularity today. Manage custom coupons online for free."/>, mainContent: <CouponForm setMainHome={this.setMainHome} uploadCoupons={this.uploadCoupons}/>})
  
  setMainSignUp = () => this.setState({SEO: <SEO title="Signup Today for Unlimited Coupons and Free Marketing" keywords="Upload Coupons, Boston Coupons, Online Coupons, Upload Coupons" description="Signup for free unlimited online coupons today. Signup to claim unlimited coupons for food, retail, car repair, travel, vacations, spa, fitness, gym memberships, and much much more. No hidden fees, no monthly charges, local coupons near you managed for free by unlimtied couponer. Signup to promote your business to local customers today, free of charge and no subscription fees."/>, mainContent: <SignUp setMainHome={this.setMainHome} parentMethod={this.setStateLoggedIn}/>})
  
  updateCouponsClaimed = number => number === -1 ? this.setState({couponsCurrentlyClaimed: (Number(this.state.couponsCurrentlyClaimed) - 1)}) : this.setState({couponsCurrentlyClaimed: (Number(this.state.couponsCurrentlyClaimed) + 1)})

  setMainHome = () => {
    const urlTwo = window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length)
    const id = urlTwo.substring(urlTwo.lastIndexOf('/')+1, urlTwo.length)
    id.length === 24 ? window.history.pushState(null, '', window.location.href) : window.history.pushState(null, '', '/Home');
    this.setState({SEO: <SEO title="Boston Deals and Coupons for Food, Spa, Beauty, Clothes, Gym, Car repair, and More." keywords="Coupons, Boston Coupons, Food Coupons, Boston Activities" description="Free unlimited online coupons in boston. Save money and explore local businesses in boston. Promote and market your small business for free. Food Coupons, Automotive and Car Repair Coupons, Coupons for Bars, Coupons for Gyms, Yoga Coupons, Health Coupons, Travel Coupons, Increase Business Revenue, Try new Activies, Explore Boston."/>, mainContent: <Home updateCouponsClaimed={this.updateCouponsClaimed} updateHomeSEO={this.updateHomeSEO}/>})
  }

  setMainLogin = () => this.setState({SEO: <SEO title="Login to claim free coupons for food, coffee, pizza, rock climbing, laser tag, and More." keywords="Manage Coupons, Boston Coupons, Online Coupons, Boston Deals" description="Login to claim unlimited coupons for free. Easy online coupons in the boston area, search by category, keywords, or location. Get pizza coupon, gym coupons, great deals, auto repair deals, deals on cruises, deals on paintball, deals on bars, deals on anything and everything at unlimitedcouponer. Upload coupons now for free at unlimited couponer."/>, mainContent: <Login setMainHome={this.setMainHome} parentMethod={this.setStateLoggedIn}/>})
  
  setMainSearch = () => this.setState({SEO: <SEO title="Search for great deals and coupons on food, clothes, gym memberships, and more." keywords="Search Coupons, Boston Coupons, Coupons near me, find Coupons" description="Free unlimited online coupons in boston. Save money and explore local businesses in boston. Promote and market your small business for free. Food Coupons, Automotive and Car Repair Coupons, Coupons for Bars, Coupons for Gyms, Yoga Coupons, Health Coupons, Travel Coupons, Increase Business Revenue, Try new Activies, Explore Boston."/>, mainContent: <Search updateCouponsClaimed={this.updateCouponsClaimed}/>})

  setMainToAbout = () => this.setState({SEO: <SEO title="About UnlimitedCouponer Great Deals." keywords="Free Coupons, Boston Coupons, Cheap Marketing, Boston Activities" description="Learn about great deals on unlimited couponer and how you can use it to market to customers in the boston area. We are a great alternative to Groupon and offer online coupons at a much more reasonable price than other vendors. Signup today and begin marketing your business for free. Get great deals on gym memberships, eating out, rock climbing, paintball, cruises, travel, and much more."/>, mainContent: <About/>})

  setMainToMyCoupons = () => this.setState({SEO: <SEO title="Boston Deals and Coupons for Food, Spa, Beauty, Clothes, Gym, Car repair, and More." keywords="Coupons, Boston Coupons, Food Coupons, Boston Activities" description="Free unlimited online coupons in boston. Save money and explore local businesses in boston. Promote and market your small business for free. Food Coupons, Automotive and Car Repair Coupons, Coupons for Bars, Coupons for Gyms, Yoga Coupons, Health Coupons, Travel Coupons, Increase Business Revenue, Try new Activies, Explore Boston."/>, mainContent: <MyCoupons updateCouponsClaimed={this.updateCouponsClaimed} setMainHome={this.setMainHome}/>})
  
  setStateLoggedIn = (key, email, couponsCurrentlyClaimed, membershipExperationDate) => {
    sessionStorage.setItem('UnlimitedCouponerKey', key)
    sessionStorage.setItem('UnlimitedCouponerEmail', email)
    if(key.substr(-1) === "c") {
      this.setState({SEO: <SEO title="Boston Deals and Coupons for Food, Spa, Beauty, Clothes, Gym, Car repair, and More." keywords="Coupons, Boston Coupons, Food Coupons, Boston Activities" description="Free unlimited online coupons in boston. Save money and explore local businesses in boston. Promote and market your small business for free. Food Coupons, Automotive and Car Repair Coupons, Coupons for Bars, Coupons for Gyms, Yoga Coupons, Health Coupons, Travel Coupons, Increase Business Revenue, Try new Activies, Explore Boston."/>, mainContent: <Home updateCouponsClaimed={this.updateCouponsClaimed} updateHomeSEO={this.updateHomeSEO}/>, loggedInKey: key, email: email, logoutButton: 'notHidden', loginButton: 'hidden', couponsCurrentlyClaimed: couponsCurrentlyClaimed, membershipExperationDate: membershipExperationDate})
      sessionStorage.setItem('couponsCurrentlyClaimed', couponsCurrentlyClaimed)
      sessionStorage.setItem('membershipExperationDate', membershipExperationDate)
      window.history.pushState(null, '', '/Home');
    }
    else if(key.substr(-1) === "b") {
      this.setState({SEO: <SEO title="Boston Deals and Coupons for Food, Spa, Beauty, Clothes, Gym, Car repair, and More."keywords="Coupons, Boston Coupons, Food Coupons, Boston Activities" description="Free unlimited online coupons in boston. Save money and explore local businesses in boston. Promote and market your small business for free. Food Coupons, Automotive and Car Repair Coupons, Coupons for Bars, Coupons for Gyms, Yoga Coupons, Health Coupons, Travel Coupons, Increase Business Revenue, Try new Activies, Explore Boston."/>, mainContent: <Home updateCouponsClaimed={this.updateCouponsClaimed} updateHomeSEO={this.updateHomeSEO}/>, loggedInKey: key, email: email, logoutButton: 'notHidden', loginButton: 'hidden', loggedInbusiness: 'notHidden'})
      window.history.pushState(null, '', '/Home');
    }
  }

  updateMembershipExperationDate = updatedMembershipEndDate => this.setState({membershipExperationDate: updatedMembershipEndDate})

  render () {
    return (
        <div className="home" onClick={this.hideNav}>
        {this.state.SEO}
        <ToastContainer />
          <h1 className='homeMainTitle'>
            Coupons to for food, spas, gyms, bars, and more! Promote your business for free by offering discounts to local customers.
          </h1>
          { (this.state.email) ? <strong><p className="loginInfo">Logged in as: {this.state.email}.</p></strong> : <strong><p>Welcome, Guest!</p></strong> }
          {/* { (this.state.membershipExperationDate) ? <strong><p className="loginInfo">Membership Expires On: {this.state.membershipExperationDate}</p></strong> : <p></p> }       */}
          { (this.state.couponsCurrentlyClaimed) ? <strong><p className="loginInfo">{this.state.couponsCurrentlyClaimed}/5 Coupons Claimed!</p></strong> : <p></p> }
        <header className='homeHeader'>
          <section>
            <a onClick={this.setMainHome} id="logo">
              <strong>
                UnlimitedCouponer
              </strong>
            </a>
            <span htmlFor="toggle-1" className="toggle-menu" onClick={this.showOrHideNav}>
              <ul>
                <li ></li>
                <li ></li>
                <li ></li>
              </ul>
            </span>
            {/* <input type="checkbox" id="toggle-1" onClick={this.showOrHideNav}/> */}
          <nav className = {this.state.showOrHideNav} onClick={this.showOrHideNav}>
            <ul>
            <Link href = '/Home'><li onClick={this.setMainHome}><div><i className="fa fa-home"></i>Home</div></li></Link>
              <Link href = '/About'><li onClick={this.setMainToAbout}><div><i className="fa fa-info-circle"></i>About</div></li></Link>
              <div className={this.state.loginButton}><Link href = '/Login'><li onClick={this.setMainLogin}><div><i className="fa fa-sign-in"></i>Login</div></li></Link></div>
              <div className={this.state.loginButton}><Link href = '/SignUp'><li onClick={this.setMainSignUp}><div><i className="fa fa-user"></i>Sign up</div></li></Link></div>
              <div className={this.state.logoutButton}><Link href = '/Home'><li onClick={this.logout}><div><i className="fa fa-user"></i>Logout</div></li></Link></div>
              <div className={this.state.logoutButton}><Link href = '/MyCoupons'><li onClick={this.setMainToMyCoupons}><div><i className="fa fa-money"></i>My Coupons</div></li></Link></div>
              <div className={this.state.logoutButton}><Link href = '/AccountSettings'><li onClick={this.setMainAccountSettings}><div><i className="fa fa-gear"></i>Account Settings</div></li></Link></div>
              <div className={this.state.loggedInbusiness}><Link href = '/UploadCoupon'><li onClick={this.setMainUploadCoupon}><div><i className="fa fa-money"></i>Upload Coupons</div></li></Link></div>
              <Link href = '/Search'><li onClick={this.setMainSearch}><div><i className="fa fa-search"></i>Search Coupons</div></li></Link>
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

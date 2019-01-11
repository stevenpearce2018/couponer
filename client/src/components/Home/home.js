import React, { Component } from 'react';
import './home.css';
import CouponsMaker from '../../couponsMaker';
import { toast } from 'react-toastify';
import getRequest from '../../getRequest';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      geolocation: '',
      latitude: '',
      longitude: '',
      pageNumber: 1,
      coupon: <div></div>,
      coupons: <div className="loaderContainer"><div className="loader"></div></div>,
      incrementPageClass: "hidden"
    };
    this.decreasePage = this.decreasePage.bind(this);
    this.incrementPage = this.incrementPage.bind(this);
    this.changePage = this.changePage.bind(this);
    this.focusCoupon = this.focusCoupon.bind(this);
  }
  async componentDidMount() {
    const couponlatitude = sessionStorage.getItem('couponlatitude');
    const couponlongitude = sessionStorage.getItem('couponlongitude');
    const that = this;
    if (!couponlongitude && !couponlatitude) {
      if (navigator && navigator.geolocation) navigator.geolocation.getCurrentPosition(showPosition);
      async function showPosition(location) {
        const url = `/api/geoCoupons/${location.coords.longitude}/${location.coords.latitude}/1`;
        const data = await getRequest(url);
        sessionStorage.setItem('couponlatitude', location.coords.latitude);
        sessionStorage.setItem('couponlongitude', location.coords.longitude);
        if(data && data.coupons && data.coupons.length > 0) that.setState({coupons: CouponsMaker(data.coupons, that.props.updateCouponsClaimed, undefined, that.focusCoupon), incrementPageClass: "center marginTop"})
        else that.setState({coupons: <h2 className="center paddingTop">No coupons found based on your location or we could not get your location. Please try searching manually.</h2>})
      }
    }
    else {
      that.setState({
        geolocation: couponlatitude + " " + couponlongitude,
        latitude: couponlatitude,
        longitude: couponlongitude,
      })
      const url = `/api/geoCoupons/${couponlongitude}/${couponlatitude}/1`;
      const data = await getRequest(url);
      if(data && data.coupons && data.coupons.length > 0) that.setState({coupons: CouponsMaker(data.coupons, that.props.updateCouponsClaimed, undefined, that.focusCoupon), incrementPageClass: "center marginTop"})
      else that.setState({coupons: <h2 className="center paddingTop">No coupons found based on your location or we could not get your location. Please try searching manually.</h2>})
    }
    const urlTwo = window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length)
    const id = urlTwo.substring(urlTwo.lastIndexOf('/')+1, urlTwo.length)
    if(id.toLowerCase() !== "home") {
      const getURL = `/api/deals/${id}`;
      const dataTwo = await getRequest(getURL);
      if(dataTwo && dataTwo.coupons !== "No coupons found.") this.setState({coupon: CouponsMaker(dataTwo.coupons, that.props.updateCouponsClaimed, undefined, that.alreadySelected)})
    }
  }
  async changePage(number){
    const pageNumber = Number(this.state.pageNumber) + number;
    const couponlatitude = sessionStorage.getItem('couponlatitude');
    const couponlongitude = sessionStorage.getItem('couponlongitude');
    if (pageNumber >= 1) {
      const url = `/api/geoCoupons/${couponlongitude}/${couponlatitude}/${pageNumber}`;
      const data = await getRequest(url);
      if (data.coupons && data.coupons.length > 0) this.setState({coupons: CouponsMaker(data.coupons, this.props.updateCouponsClaimed, undefined, this.focusCoupon), incrementPageClass: "center marginTop", pageNumber: pageNumber})
      else this.setState({coupons: <h2 className="center paddingTop">No coupons found based on your location or we could not get your location. Please try searching manually.</h2>, pageNumber: pageNumber})
    }
    else toast.error("You cannot go lower than page one!") 
  }

  alreadySelected = () => toast.error("You already selected this coupon, just share the URL!")

  decreasePage = () => this.changePage(-1)

  incrementPage = () => this.changePage(1)

  focusCoupon = async coupon => {
    sessionStorage.setItem("hsUrl", `/${encodeURI(coupon.city)}/${encodeURI(coupon.title)}/${encodeURI(coupon._id)}`)
    window.history.pushState(null, '', '/Home'+sessionStorage.getItem("hsUrl"))
    this.setState({coupon: CouponsMaker([coupon], this.props.updateCouponsClaimed, undefined, this.alreadySelected)})
    this.props.updateHomeSEO(coupon)
    toast.success("Share the URL with your friends!")
  }
  
  render() {
    return (
      <div>
        <div className="center">
          <h2>Coupons near you</h2>
        </div>
        {this.state.coupon}
        {this.state.coupons}
        <div className={this.state.incrementPageClass}>
          <a className="incrementIcons backgroundCircle" onClick={this.decreasePage}>
          &#8678;
          </a>
          <a className="backgroundCircle" onClick={this.incrementPage}>
          &#8680;
          </a>
        </div>
      </div>
    );
  }
}

export default Home
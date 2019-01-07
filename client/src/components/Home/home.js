import React, { Component } from 'react';
import './home.css';
import CouponsMaker from '../../couponsMaker';
import { toast } from 'react-toastify';
import getPosition from '../../getPosition';
import getRequest from '../../getRequest';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      geolocation: '',
      latitude: '',
      longitude: '',
      pageNumber: 1,
      coupons: <div className="loaderContainer"><div className="loader"></div></div>,
      incrementPageClass: "hidden"
    };
    this.decreasePage = this.decreasePage.bind(this);
    this.incrementPage = this.incrementPage.bind(this);
    this.changePage = this.changePage.bind(this);
  }
  async componentDidMount() {
    const couponlatitude = sessionStorage.getItem('couponlatitude');
    const couponlongitude = sessionStorage.getItem('couponlongitude');
    const that = this;
    if (!couponlongitude && !couponlatitude && navigator.geolocation) getPosition(gotPosition, noLocation);
    else {
      that.setState({
        geolocation: couponlatitude + " " + couponlongitude,
        latitude: couponlatitude,
        longitude: couponlongitude,
      })
      const url = `/api/geoCoupons/${couponlongitude}/${couponlatitude}/1`;
      const data = getRequest(url);
      if(data.coupons && data.coupons.length > 0) that.setState({coupons: CouponsMaker(data.coupons, that.props.updateCouponsClaimed), incrementPageClass: "center marginTop"})
      else that.setState({coupons: <h2 className="center paddingTop">No coupons found based on your location or we could not get your location. Please try searching manually.</h2>})
    }
    function noLocation()
    {
      toast.error('Could not find location, you will need to search manually :(');
      that.setState({coupons: <h2 className="center paddingTop">No coupons found based on your location or we could not get your location. Please try searching manually.</h2>})
    }
    async function gotPosition(position) {
      that.setState({
        geolocation: position.latitude + " " + position.longitude,
        latitude: position.latitude,
        longitude: position.longitude,
      })
      const url = `/api/geoCoupons/${position.longitude}/${position.latitude}/1`;
      const data = getRequest(url);
      if(data.coupons && data.coupons > 0 ) that.setState({coupons: CouponsMaker(data.coupons, that.props.updateCouponsClaimed), incrementPageClass: "center marginTop"})
      else that.setState({coupons: <h2 className="center paddingTop">No coupons found based on your location or we could not get your location. Please try searching manually.</h2>})
      sessionStorage.setItem("couponlatitude", position.latitude)
      sessionStorage.setItem("couponlongitude", position.longitude)
    }
  }
  async changePage(number){
    const pageNumber = Number(this.state.pageNumber) + number;
    const couponlatitude = sessionStorage.getItem('couponlatitude');
    const couponlongitude = sessionStorage.getItem('couponlongitude');
    if (pageNumber >= 1) {
      const url = `/api/geoCoupons/${couponlongitude}/${couponlatitude}/${pageNumber}`;
      const data = getRequest(url);
      if (data.coupons && data.coupons.length > 0) this.setState({coupons: CouponsMaker(data.coupons, this.props.updateCouponsClaimed), incrementPageClass: "center marginTop", pageNumber: pageNumber})
      else this.setState({coupons: <h2 className="center paddingTop">No coupons found based on your location or we could not get your location. Please try searching manually.</h2>, pageNumber: pageNumber})
    }
    else toast.error("You cannot go lower than page one!") 
  }
  decreasePage = () => this.changePage(-1)

  incrementPage = () => this.changePage(1)
  
  render() {
    return (
      <div>
        <div className="center">
          <h2>Coupons near you</h2>
        </div>
        {this.state.coupons}
        <div className={this.state.incrementPageClass}>
          <a className="icon-button incrementIcons backgroundCircle" onClick={this.decreasePage}>
            <i className="fa fa-arrow-left"></i>
          </a>
          <a className="icon-button backgroundCircle" onClick={this.incrementPage}>
            <i className="fa fa-arrow-right"></i>
          </a>
        </div>
      </div>
    );
  }
}

export default Home
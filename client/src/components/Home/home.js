import React, { Component } from 'react';
import './home.css';
import CouponsMaker from '../../couponsMaker';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      geolocation: '',
      latitude: '',
      longitude: '',
      city: '',
      pageNumber: 1,
      coupons: <div className="loaderContainer"><div className="loader"></div></div>,
      incrementPageClass: "hidden"
    };
    this.decreasePage = this.decreasePage.bind(this);
    this.incrementPage = this.incrementPage.bind(this);
    this.changePage = this.changePage.bind(this);
  }
  componentDidMount () {
    // alert(HaversineInMiles(latitude1, longitude1, latitude2, longitude2))
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } 
    const that = this;
    const google = window.google
    // eslint-disable-next-line
    const geocoder = new google.maps.Geocoder;
    async function cityNotFound () {
      that.setState({coupons: <h2>We were unable to get your location. Try searching manually.</h2>})     
    }
    function showPosition(position) {
      that.setState({
        geolocation: position.coords.latitude + " " + position.coords.longitude,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
      sessionStorage.setItem('couponlatitude', position.coords.latitude);
      sessionStorage.setItem('couponlongitude', position.coords.longitude);
      const latlng = {lat: parseFloat(that.state.latitude), lng: parseFloat(that.state.longitude)};
      try {
        geocoder.geocode({location: latlng}, async (results, status) => {
          if (status === 'OK') {
            if (results[0]) {
              let city = results[0].address_components.filter((addr) => {
                return (addr.types[0] === 'locality')?1:(addr.types[0] === 'administrative_area_level_1')?1:0;
              });
              if(city[0]) city = JSON.stringify(city[0].long_name).toLowerCase()
              if (city.length > 0 || city.length > 1) {
                that.setState({city: city})
                // const data = sessionStorage.getItem('couponsDataPage'+that.state.pageNumber, data.coupons);
                const url = '/api/getSponseredCoupons/'+city+'/'+that.state.pageNumber
                const response = await fetch(url, {
                  method: "GET", // *GET, POST, PUT, DELETE, etc.
                  mode: "cors", // no-cors, cors, *same-origin
                  cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
                  credentials: "same-origin", // include, same-origin, *omit
                  headers: {
                    "Content-Type": "application/json; charset=utf-8",
                  }
                })
                const data = await response.json();
                if (data.coupons !== "No coupons were found near you. Try searching manually") that.setState({coupons: CouponsMaker(data.coupons), incrementPageClass: "center"})
                else that.setState({coupons:<div className="center"><br/><h2>No coupons found near you, try searching manually.</h2></div>})
              } else cityNotFound();
            } else cityNotFound();
          } else cityNotFound();
        });
      } catch (error) {
        that.setState({coupons: <h2>No Coupons found based on your location or we could not get your location. Please try searching manually.</h2>})
      }
    }
  }
  async changePage(number){
    const pageNumber = Number(this.state.pageNumber) + number;
    if (pageNumber >= 1) {
      const url = '/api/getSponseredCoupons/'+this.state.city+'/'+(pageNumber)
      const response = await fetch(url);
      const data = await response.json();
      this.setState({coupons: CouponsMaker(data.coupons), incrementPageClass: "center", pageNumber: pageNumber})
    }
    else alert("You cannot go lower than page one!") 
  }
  decreasePage(){
    this.changePage(-1)
  }
  incrementPage(){
    this.changePage(1)
  }
  render() {
    return (
      <div>
        <div className="center">
          <h2>Coupons near you</h2>
        </div>
        {this.state.coupons}
        <div className={this.state.incrementPageClass}>
          <a className="icon-button incrementIcons backgroundCircle" onClick={this.decreasePage}>
            <i className="fa-arrow-left"></i>
          </a>
          <a className="icon-button backgroundCircle" onClick={this.incrementPage}>
            <i className="fa-arrow-right"></i>
          </a>
        </div>
      </div>
    );
  }
}

export default Home
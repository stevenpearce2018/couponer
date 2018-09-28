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
      coupons: ''
    };
  }

  componentDidMount () {   
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } 
    const that = this;
    const google = window.google
    const geocoder = new google.maps.Geocoder;
    async function cityNotFound () {
      const url = '/api/getSponseredCoupons/nocityfound'
      const response = await fetch(url);
      const data = await response.json();
      that.setState({coupons: CouponsMaker(data.coupons)})
    }
    function showPosition(position) {
      that.setState({
        geolocation: position.coords.latitude + " " + position.coords.longitude,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
      const latlng = {lat: parseFloat(that.state.latitude), lng: parseFloat(that.state.longitude)};
      geocoder.geocode({'location': latlng}, async (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            let city = results[0].address_components.filter((addr) => {
              return (addr.types[0]=='locality')?1:(addr.types[0] == 'administrative_area_level_1')?1:0;
            });
            if(city[0]) city = JSON.stringify(city[0].long_name).toLowerCase()
            if (city.length > 0 || city.length > 1) {
              const url = '/api/getSponseredCoupons/'+city
              const response = await fetch(url);
              const data = await response.json();
              that.setState({coupons: CouponsMaker(data.coupons)})
            } else cityNotFound();
          } else cityNotFound();
        } else cityNotFound();
      });
    }
  }

  render() {
    return (
      <div>
          {/* <form action="/charge" method="POST">
          <script
            src="https://checkout.stripe.com/checkout.js" className="stripe-button"
            data-key="pk_test_3eBW9BZ4UzRNsmtPCk9gc8F2"
            data-amount="2500"
            data-name="Testing"
            data-description="Example charge"
            data-image="https://stripe.com/img/documentation/checkout/marketplace.png"
            data-locale="auto">
          </script>
        </form> */}
        <section id="portfolio" className="content">
        <h2>What we do</h2>
        <p>Couponer is meant to be a <strong>buisness and consumer friendly</strong> way of connecting customers with unique products and experiences. Couponer is cheap for both parties, costing only 5$ a month for <strong>unlimited</strong> coupons as a consumer and 0.50$ per coupon posted as a buisness. Couponer is the perfect way to make more money for your buisness through promotions or find great deals on places a consumer may have never heard of. Sign up today, and find great deals in a city near you.</p>
        </section>
        <br/>
        {this.state.coupons}
      </div>
    );
  }
}

export default Home

import React, { Component } from 'react';
import './about.css';
// import CouponsMaker from '../../couponsMaker';

class About extends Component {
  render() {
    return (
      <div>
        <section id="portfolio" className="content">
        <h2 className="textHeader">What we do</h2>
        <p className="text">Couponer is meant to be a <strong>buisness and consumer friendly</strong> way of connecting customers with unique products and experiences. Couponer is cheap for both parties, costing only 5$ a month for <strong>unlimited</strong> coupons as a consumer and 0.50$ per coupon posted as a buisness. Couponer is the perfect way to make more money for your buisness through promotions or find great deals on places a consumer may have never heard of. Sign up today, and find great deals in a city near you.</p>
        <br/>
        <br/>
        <h3 className="textHeader">Why choose us?</h3>
        <p className="text">If you are a consumer you can find new and interesting events or foods that you may have never knew existed otherwise. As a consumer you can use Couponer to save money on activities that you would have done regardless, it pays for itself! If you are a buisness owner you can use Couponer to advertise your buisness and make money at the same time, other coupon websites take a large percentage of each sale. We believe that is not only anti-entrepreneur, but these aggressive margins can often times drive away up and coming small businesses.</p>
        <br/>
        <br/>
        <h3 className="textHeader">Contact us</h3>
        <p className="text">Found a bug, have a general question, want to make a sugguestion? Feel free to email us at !todo@doesnt.exist.com.</p>
        </section>
        <br/>
      </div>
    );
  }
}

export default About

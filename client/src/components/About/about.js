import React from 'react';
import './about.css';

const About = () => {
    return (
      <div>
        <section id="portfolio" className="content">
        <AboutElement header={"Contact us"} text={<div>UnlimitedCouponer is meant to be a <strong>buisness and consumer friendly</strong> way of connecting customers with unique products and experiences. UnlimitedCouponer is cheap for both parties, costing only 5$ a month for <strong>unlimited</strong> coupons as a consumer and 0.50$ per coupon posted as a buisness. UnlimitedCouponer is the perfect way to make more money for your buisness through promotions or find great deals on places a consumer may have never heard of. Sign up today, and find great deals in a city near you.</div>}/>
        <br/>
        <br/>
        <AboutElement header={"Why choose us?"} text={"If you are a consumer you can find new and interesting events or foods that you may have never knew existed otherwise. As a consumer you can use UnlimitedCouponer to save money on activities that you would have done regardless, it pays for itself! If you are a buisness owner you can use UnlimitedCouponer to advertise your buisness and make money at the same time, other coupon websites take a large percentage of each sale. We believe that is not only anti-entrepreneur, but these aggressive margins can often times drive away up and coming small businesses."}/>
        <br/>
        <br/>
        <AboutElement header={"Contact us"} text={"Found a bug, have a general question, want to make a sugguestion? Email me at UnlimitedCouponer@gmail.com."}/>
        </section>
        <br/>
      </div>
    );
}

const AboutElement = props => <div><h2 className="textHeader">{props.header}</h2> <p className="text">{props.text}</p></div>

export default About

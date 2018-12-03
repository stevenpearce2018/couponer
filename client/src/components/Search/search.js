import React, { Component } from 'react';
import './search.css';
import Select from '../SubComponents/Select/select';
import CouponsMaker from '../../couponsMaker';
import { toast } from 'react-toastify';


const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Private component, keep scoped to search component
class SearchField extends Component {
  render() {
    return (
      <div className="searchBox">
      <div className='searchLabel'>
      <label className='signupLabel' htmlFor={this.props.htmlFor}>
        <strong>{this.props.htmlFor}</strong>
      </label>
      </div>
      <input className={this.props.className} id={this.props.htmlFor} type="text" name={this.props.name} placeholder={this.props.placeholder} onChange={this.props.onChange}/>
    </div>
    )
  }
}

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      city: '',
      zip: '',
      category: '',
      coupons: '',
      keywords: '',
      pageNumber: 1,
      incrementPageClass: "hidden",
      latitude: "",
      longitude: ''
    }
    this.updateCategory = this.updateCategory.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.decreasePage = this.decreasePage.bind(this);
    this.incrementPage = this.incrementPage.bind(this);
    this.changePage = this.changePage.bind(this);
  }
  async componentDidMount() {
    const couponlatitude = sessionStorage.setItem('couponlatitude');
    const couponlongitude = sessionStorage.setItem('couponlongitude');
    if (!couponlatitude && !couponlongitude && navigator.geolocation) navigator.geolocation.getCurrentPosition(showPosition);
    else this.setState({latitude: couponlongitude, longitude: couponlongitude})
    const that = this;
    function showPosition(position) {
      that.setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
      sessionStorage.setItem('couponlatitude', position.coords.latitude);
      sessionStorage.setItem('couponlongitude', position.coords.longitude);
    }
    const url = '/'+window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length)
    const city = getParameterByName('city', url)
    if (city) this.setState({city: city})
    const pageNumber = getParameterByName('pageNumber', url)
    if (pageNumber) this.setState({pageNumber: pageNumber})
    const zip = getParameterByName('zip', url)
    if (zip) this.setState({zip: zip})
    const category = getParameterByName('category', url)
    if (category) this.setState({category: category})
    const keywords = getParameterByName('keywords', url)
    if (keywords) this.setState({keywords: keywords})
    if (keywords || category || city || zip) this.setState({coupons: <div className="loaderContainer"><div className="loader"></div></div>})
    const response = await fetch(url, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, same-origin, *omit
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    })
    const couponsData = await response.json();
    this.setState({coupons: CouponsMaker(couponsData.coupons, this.props.updateCouponsClaimed), incrementPageClass: "center", pageNumber : Number(this.state.pageNumber), keywords: "", category: "", city: "", zip: ""})
    // alert(HaversineInMiles(latitude1, longitude1, latitude2, longitude2))
  }
  async changePage(number) {
    if (Number(this.state.pageNumber) + Number(number) >= 1) {
      let searchSubUrl;
      if (this.state.city !== '') searchSubUrl = `&city=${this.state.city}`
      if (this.state.category !== '') searchSubUrl = `${searchSubUrl}&category=${this.state.category}`
      if (this.state.zip !== '') searchSubUrl = `${searchSubUrl}&zip=${this.state.zip}`
      if (this.state.keywords !== '') searchSubUrl = `${searchSubUrl}&keywords=${this.state.keywords}`
      window.history.pushState(null, '', decodeURIComponent(`/search?pageNumber=${Number(this.state.pageNumber) + Number(number)}${searchSubUrl}`));
      const url = '/'+window.location.href.substring(window.location.href.lastIndexOf('/')+1, window.location.href.length)
      const city = getParameterByName('city', url)
      if (city) this.setState({city: city})
      const pageNumber = getParameterByName('pageNumber', url)
      if (Number(this.state.pageNumber) + Number(number)) this.setState({pageNumber: pageNumber})
      const zip = getParameterByName('zip', url)
      if (zip) this.setState({zip: zip})
      const category = getParameterByName('category', url)
      if (category) this.setState({category: category})
      const keywords = getParameterByName('keywords', url)
      if (keywords) this.setState({keywords: keywords})
      if (keywords || category || city || zip) this.setState({coupons: <div className="loaderContainer"><div className="loader"></div></div>})
      const response = await fetch(url, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
      const couponsData = await response.json();
      this.setState({coupons: CouponsMaker(couponsData.coupons, this.props.updateCouponsClaimed), pageNumber : Number(this.state.pageNumber)})
      // window.location.href = decodeURIComponent(`/search?pageNumber=${pageNumber}${searchSubUrl}`);
    }
    else toast.error("You cannot go lower than page one!")
  }
  decreasePage = () => this.changePage(-1)

  incrementPage = () => this.changePage(1)
  
  handleChange = event => {
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }
  updateCategory = e => {
    const choices = ["Food", "Entertainment", "Health and Fitness", "Retail", "Home Improvement", "Activities", "Other", "Any" ]
    this.setState({ category: choices[e.target.value] });
  }
  async handleSearch(e){
    e.preventDefault();
    let searchSubUrl;
    if (this.state.city && this.state.city !== '') searchSubUrl = `&city=${this.state.city}`
    if (this.state.category && this.state.category !== '') searchSubUrl = `${searchSubUrl}&category=${this.state.category}`
    if (this.state.zip && this.state.zip !== '') searchSubUrl = `${searchSubUrl}&zip=${this.state.zip}`
    if (this.state.keywords && this.state.keywords !== '') searchSubUrl = `${searchSubUrl}&keywords=${this.state.keywords}`
    if (this.state.category && this.state.category !== '' || this.state.zip !== '' || this.state.city !== '' || this.state.keywords) {
      searchSubUrl = searchSubUrl.replace("undefined", "").replace("undefined", "")
      this.setState({coupons: <div className="loaderContainer"><div className="loader"></div></div>})
      // window.location.href = decodeURIComponent(`/search?pageNumber=${this.state.pageNumber}${searchSubUrl}`);
      window.history.pushState(null, '', `/search?pageNumber=${this.state.pageNumber}${searchSubUrl}`);
      const response = await fetch(`/search?pageNumber=${this.state.pageNumber}${searchSubUrl}`, {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "default", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      })
      const couponsData = await response.json();
      this.setState({coupons: CouponsMaker(couponsData.coupons, this.props.updateCouponsClaimed), pageNumber : Number(this.state.pageNumber)})
    }
  }                
  render() {
    return (
      <div className="container text-center">
      <form className='searchForm'>
      <h2>Search for coupons by city, zipcode, and even by category!</h2>
      <br/>
      <SearchField
      htmlFor="City"
      name="city"
      className='searchCity'
      onChange={this.handleChange}
      />
      <br/>
      <SearchField
      htmlFor="Zip"
      name="zip"
      className='searchZip'
      onChange={this.handleChange}
      />
      <br/>
      <strong>
      <Select
        hasLabel='true'
        htmlFor='select'
        name="category"
        label='Coupon Category'
        options='Food, Entertainment, Health and Fitness, Retail, Home Improvement, Activities, Other'
        required={true}
        value={this.state.length}
        onChange={this.updateCategory} 
      />
      </strong>
      <br/>
      <SearchField
      htmlFor="Use a keyword to specify your search"
      className='searchCategory'
      name="keywords"
      onChange={this.handleChange}
      />
      <button type="submit" value="Submit" className="searchButton" onClick={this.handleSearch}><strong>Search</strong></button>
    </form>
      <br/>
      <br/>
      {this.state.coupons}
      <br/>
      <br/>
      <div className={this.state.incrementPageClass}>
        <a className="icon-button incrementIcons backgroundCircle" onClick={this.decreasePage}>
          <i className="fa-arrow-left"></i>
        </a>
        <a className="icon-button backgroundCircle" onClick={this.incrementPage}>
          <i className="fa-arrow-right"></i>
        </a>
      </div>
    </div>
    )
  }
}

export default Search;


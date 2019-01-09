import React, { Component } from 'react';
import './search.css';
import Select from '../SubComponents/Select/select';
import CouponsMaker from '../../couponsMaker';
import { toast } from 'react-toastify';
import getPosition from '../../getPosition';
import getRequest from '../../getRequest';


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
const SearchField = props => {
    return (
      <div className="searchBox">
      <div className='searchLabel'>
      <label className='signupLabel' htmlFor={props.htmlFor}>
        <strong>{props.htmlFor}</strong>
      </label>
      </div>
      <input className={props.className} id={props.htmlFor} type="text" name={props.name} placeholder={props.placeholder} onChange={props.onChange}/>
    </div>
    )
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
    const couponlatitude = sessionStorage.getItem('couponlatitude');
    const couponlongitude = sessionStorage.getItem('couponlongitude');
    if (!couponlatitude && !couponlongitude && navigator.geolocation) getPosition(gotPosition);
    else this.setState({latitude: couponlongitude, longitude: couponlongitude})
    const that = this;
    function gotPosition(position) {
      that.setState({
        latitude: position.latitude,
        longitude: position.longitude,
      })
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
    const couponsData = await getRequest(url);
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
      const couponsData = await getRequest(url);
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
      const couponsData = await getRequest(`/search?pageNumber=${this.state.pageNumber}${searchSubUrl}`);
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
        <a className="incrementIcons backgroundCircle" onClick={this.decreasePage}>
        &#8678;
        </a>
        <a className="icon-button backgroundCircle" onClick={this.incrementPage}>
        &#8680;
        </a>
      </div>
    </div>
    )
  }
}

export default Search;


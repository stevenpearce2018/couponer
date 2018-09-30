import React, { Component } from 'react';
import './search.css';
import CouponsMaker from '../../couponsMaker';

// Private component, keep scoped to search component
class SearchField extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div className="searchBox">
      <div className='searchLabel'>
      <label className='signupLabel' htmlFor={this.props.htmlFor}>
        <strong>{this.props.htmlFor}</strong>
      </label>
      </div>
      <input className={this.props.className} type="text" placeholder={this.props.placeholder} onChange={this.props.onChange}/>
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
      coupons: ''
    }
    this.updateCity = this.updateCity.bind(this);
    this.updateZip = this.updateZip.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
  }
  updateCity(e) {
    this.setState({ city: e.target.value });
  }
  updateZip (e) {
    this.setState({ zip: e.target.value });
  }
  updateCategory (e) {
    this.setState({ category: e.target.value });
  }

  async handleSearch(e){
    e.preventDefault();
    const data = {
      city: this.state.city,
      zip: this.state.zip,
      category: this.state.category,
    }
    const that = this;
    if (this.state.category !== '' || this.state.zip !== '' || this.state.city !== '') {
      const url = `/api/searchCoupons`
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
      that.setState({coupons: CouponsMaker(json.coupons)})
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
      className='searchCity'
      onChange={this.updateCity}
      />
      <br/>
      <SearchField
      htmlFor="Zip"
      className='searchZip'
      onChange={this.updateZip}
      />
      <br/>
      <SearchField
      htmlFor="Category"
      className='searchCategory'
      onChange={this.updateCategory}
      />
      <button type="submit" value="Submit" className="searchButton" onClick={this.handleSearch}><strong>Search</strong></button>
  </form>
      {this.state.coupons}
        </div>
    )
  }
}

export default Search;


import React, { Component } from 'react';
import './search.css';
import superState from '../../superState';
import CouponsMaker from '../../couponsMaker';

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
    this.test = this.test.bind(this)
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

  callParentFunction = () => {
    superState.test = 'New State'
    this.props.parentMethod();
    }
    test() {
      console.log(this.state.coupons)
    }

  async handleSearch(e){
    e.preventDefault();
    const data = {
        city: this.state.city,
        zip: this.state.zip,
        category: this.state.category,
    }
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
  this.setState({coupons: CouponsMaker(json.coupons)})
}                
// <div className="inputGroup">
// <div className="emailPass">
  render() {
    return (
      <div className="container text-center">
          <form className='searchForm'>
      <div className="searchBox">
        <div className='searchLabel'>
        <label className='signupLabel' htmlFor="City">
          <strong>City :</strong>
        </label>
        </div>
        <input className='searchCity' type="text" placeholder="Your city" onChange={this.updateCity}/>
      </div>
    <div className="searchBox">
        <div className='searchLabel'>
        <label htmlFor="Zip">
          <strong>Zip : </strong>
        </label>
    </div>
        <input className='searchZip' type="text" placeholder="12345" onChange={this.updateZip}/>
      </div>
      <div className="searchBox"> 
        <div className='searchLabel'>
        <label className='searchLabel' htmlFor="Category">
          <strong>Category: </strong>
        </label>
        </div>
        <input className='searchCategory' type="text" placeholder="food" onChange={this.updateCategory}/>
      </div>
  </form>
  <br/>

        <button type="submit" value="Submit" className="searchButton" onClick={this.handleSearch}><strong>Search</strong></button>
        <br/>
      <button onClick={this.callParentFunction}> Update State</button>
      <button onClick={this.test}> Test </button>
      {this.state.coupons}
        </div>
    )
  }
}

export default Search;


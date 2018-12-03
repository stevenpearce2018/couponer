import React, { Component } from 'react';
import './couponform.css';
import Coupon from '../SubComponents/Coupon/coupon';
import Input from '../SubComponents/Input/input';
import Select from '../SubComponents/Select/select';
import Textarea from '../SubComponents/Textarea/textarea';
import Checkout from '../Checkout/checkout';
import HaversineInMiles from '../../HaversineInMiles';
import { toast } from 'react-toastify';

const validateCouponForm = state => {
  if (state.latitude === '' || state.longitude === '') return toast.error('Invalid Address, please check address!')
  else if (state.title === 'Rent your very own kitten today!') return toast.error('You must have a unique title!');
  else if (state.address === '123 Cuddle Street, Kittentown, MA. 0 Miles Away.') return toast.error('You must have an address!');
  else if (state.imagePreviewUrl === 'http://www.petsworld.in/blog/wp-content/uploads/2014/09/cute-kittens.jpg') return toast.error('You must upload an image!!!!!')
  else if (state.textarea === 'Ever want to have a kitten without the responsibility of actually owning it? Want to sneak a kitten into your apartment for a week without your pesky landlord knowing? Now you can! Call 1-8000-RENT-CAT now to rent your very own kitten today.') return toast.error('You must upload a custom description!');
  else if (state.city === '') return toast.error('You must have a city!')
  else if (state.category === '') return toast.error('You must have a category!')
  else if (state.discountedPrice === '') return toast.error('You must have a category!')
  else if (state.price === '') return toast.error('You must have a Current Price!')
  // !todo, fix this check
  // else if (state.currentPrice <= state.discountedPrice) return alert('Your discounted price must be lower than your current price!')
  else if (state.city === '') return toast.error('You must have a city!')
  else if (state.zip === '' || state.zip.length < 3) return toast.error('You must have a zipcode!')
  else return true;
}

class CouponForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Rent your very own kitten today!',
      longitude: '',
      latitude: '',
      mylongitude: '',
      mylatitude: '',
      address: '123 Cuddle Street, Kittentown, MA. 0 Miles Away.',
      amountCoupons: '100',
      currentPrice: '10.00',
      discountedPrice: '5.00',
      superCoupon: 'Make a Selection',
      textarea: 'Ever want to have a kitten without the responsibility of actually owning it? Want to sneak a kitten into your apartment for a week without your pesky landlord knowing? Now you can! Call 1-8000-RENT-CAT now to rent your very own kitten today.',
      file: '',
      imagePreviewUrl: 'http://www.petsworld.in/blog/wp-content/uploads/2014/09/cute-kittens.jpg',
      category: '',
      city: '',
      zip: '',
      popupClass: 'hiddenOverlay',
      validAddress: <span className="icon red">&#x2718;</span>,
    };
    this.togglePopup = this.togglePopup.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.handleDiscountedPriceChange = this.handleDiscountedPriceChange.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.handleSuperChange = this.handleSuperChange.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.handleCurrentPriceChange = this.handleCurrentPriceChange.bind(this);
    this.handleAmountCouponsChange = this.handleAmountCouponsChange.bind(this);
    this.handleTextareaChange = this.handleTextareaChange.bind(this);
    this.payForCoupons = this.payForCoupons.bind(this)
  }
  componentDidMount() {
    const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey');
    if (!loggedInKey) {
      this.props.setMainHome()
      return toast.error('You are not logged in!')
    }
    else if(loggedInKey.slice(-1) !== "b") {
      this.props.setMainHome()
      return toast.error('Only buiness owners can access this page!')
    }
    this.setState({loggedInKey:loggedInKey})
    const couponlatitude = sessionStorage.getItem('couponlatitude');
    const couponlongitude = sessionStorage.getItem('couponlongitude');
    if (!couponlatitude && !couponlongitude && navigator.geolocation) navigator.geolocation.getCurrentPosition(showPosition);
    else this.setState({mylongitude: couponlongitude, mylatitude: couponlatitude})
    const that = this;
    function showPosition(position) {
      that.setState({
        mylongitude: position.coords.longitude,
        mylatitude: position.coords.latitude,
      })
    }
  }
  handleChange = event => {
    const { target: { name, value } } = event
    this.setState({ [name]: value })
  }

  togglePopup = () => this.state.popupClass === "hiddenOverlay" ? this.setState({popupClass: "overlay"}) : this.setState({popupClass: "hiddenOverlay"})

  handleImageChange = e => {
    e.preventDefault();
    try {
      const reader = new FileReader();
      const file = e.target.files[0];
      reader.onloadend = () => {
        this.setState({
          file: file,
          imagePreviewUrl: reader.result
        });
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('You must select an image!')
    }
  }

  uploadFile = e => {
    e.preventDefault();
    let that = this;
    const google = window.google
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': this.state.address}, async (results, status) => {
      if (google.maps.GeocoderStatus.OK === 'OK') {
        if (results[0] && that.state.address.length > 5) {
          that.setState({
            latitude:results[0].geometry.location.lat(),
            longitude: results[0].geometry.location.lng()
          })
          if (validateCouponForm(this.state) === true) this.props.uploadCoupons(this.state)
        }
      } else toast.error('Your address appears to be incorrect. Please check your formatting and confirm it can be found on Google Maps.')
    });
  }
  handleTitleChange = e => {
    if (e.target.value === '') this.setState({ title: 'Rent your very own kitten today!'})
    else this.setState({ title: e.target.value })
  }
  handleAddressChange = e => {
    let that = this;
    if (e.target.value === '') this.setState({ address: '123 Cuddle Street, KittenTown MA. 0 Miles Away.'})
    else this.setState({address: e.target.value})
    
    const google = window.google
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': this.state.address}, async (results, status) => {
      try {
          if (results[0] && that.state.address.length > 5) {
            that.setState({
              latitude:results[0].geometry.location.lat(),
              longitude: results[0].geometry.location.lng(),
              validAddress: <span className="icon green">&#10003;</span>
            })
          }
      }
      catch (error) { that.setState({validAddress: <span className="icon red">&#x2718;</span>}) }
    });
  }
  
    handleAmountCouponsChange = e => {
      let coupons = e.target.value;
      if (coupons.lastIndexOf('.') > -1) coupons = 0;
      this.setState({amountCoupons: coupons})
    }
    handleDiscountedPriceChange = e => {
      let price = e.target.value;
        if (price.includes('.')) {
          if (price.substring(price.length-3, price.length-2) === '.') this.setState({discountedPrice: e.target.value})
          else this.setState({discountedPrice: e.target.value + '0'})
        } else this.setState({discountedPrice: e.target.value + '.00'})
    }
    
    handleCurrentPriceChange = e => {
      let price = e.target.value;
      if (price.includes('.')) {
        if (price.substring(price.length-3, price.length-2) === '.') this.setState({currentPrice: e.target.value})
        else this.setState({currentPrice: e.target.value + '0'})
      } else this.setState({currentPrice: e.target.value + '.00'})
    }
    handleTextareaChange = e => {
      if(e.target.value === '') this.setState({textarea: 'Ever want to have a kitten without the responsibility of actually owning it? Want to sneak a kitten into your apartment for a week without your pesky landlord knowing? Now you can! Call 1-8000-RENT-CAT now to rent your very own kitten today.'})
      else this.setState({ textarea: e.target.value})
    }
    handleCategoryChange = e => {
      const categoryChoices = [
        'Food',
        'Entertainment',
        'Health and Fitness',
        'Retail',
        'Home improvement',
        'Activies',
        'Other'
      ]
      this.setState({category: categoryChoices[e.target.value]})
    }
  handleSuperChange = e => {
    const superChoices = [
      "Let's go super",
      'No thanks',
    ]
    this.setState({superCoupon: superChoices[e.target.value]})
  }

  payForCoupons = dataFromStripe => {
    const data = {
      description: dataFromStripe.description,
      source: dataFromStripe.source,
      currency: dataFromStripe.currency,
      amount: dataFromStripe.amount,
      title: this.state.title,
      address: this.state.address,
      amountCoupons: Number(this.state.amountCoupons),
      currentPrice: Number(this.state.currentPrice),
      discountedPrice: Number(this.state.discountedPrice),
      superCoupon: this.state.superCoupon,
      textarea: this.state.textarea,
      imagePreviewUrl: this.state.imagePreviewUrl,
      category: this.state.category,
      city: this.state.city,
      zip: this.state.zip,
      longitude: Number(this.state.longitude),
      latitude: Number(this.state.latitude)
    }
    const google = window.google
    const geocoder = new google.maps.Geocoder();
    const that = this;
    geocoder.geocode({ 'address': this.state.address}, async (results, status) => {
      if (google.maps.GeocoderStatus.OK === 'OK') {
        if (results[0] && that.state.address.length > 5) {
          that.setState({
            latitude:results[0].geometry.location.lat(),
            longitude: results[0].geometry.location.lng()
          })
          if (validateCouponForm(this.state) === true) that.props.uploadCoupons(data)
        }
      } else toast.error('Your address appears to be incorrect. Please check your formatting and confirm it can be found on Google Maps.')
    });
  }
  render() {
    return (
      <div className="flextape">
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800" rel="stylesheet"></link>
        <link href="https://netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet"></link>
        <div className='couponHeader'>
          <h1 className='formHeaderText'> Example Coupon</h1>
        </div>
        <div className='formHeader'>
          <h1 className='formHeaderText'> Coupon details</h1>
        </div>
        <div className="flextape">
        <Coupon
          title = {this.state.title}
          imagePreviewUrl = {this.state.imagePreviewUrl}
          currentPrice = {this.state.currentPrice}
          discountedPrice = {this.state.discountedPrice}
          amountCoupons = {this.state.amountCoupons}
          length = {this.state.length}
          textarea = {this.state.textarea}
          address = {this.state.address}
          distance = {HaversineInMiles(this.state.mylatitude, this.state.mylongitude, this.state.latitude, this.state.longitude)}
        />
        <div className='formHeaderMobile'>
          <h1>Coupon details</h1>
        </div>
        <div className='uploadCouponForm'>
        <form
          method="post"
          encType="multipart/form-data"
          className='uploadForm'
          action="/api/uploadCoupons">
        <br/>
        <br/>
        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='Title'
          required={true}
          type='text'
          className='couponUploadTitle'
          value={this.state.title}
          onChange={this.handleTitleChange}
        />
        <br/> 
        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='Full Address'
          icon={this.state.validAddress.props.src}
          required={true}
          type='text'
          value={this.state.address}
          onChange={this.handleAddressChange}
        />
        <br/>
        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='City'
          required={true}
          name="city"
          type='text'
          value={this.state.city}
          onChange={this.handleChange}
        />
        <br/>
        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='Zip code'
          required={true}
          type='number'
          name="zip"
          value={this.state.handleZipChange}
          onChange={this.handleChange}
        />
        <br/>
        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='Amount of Coupons'
          required={true}
          type='number'
          value={this.state.amountCoupons}
          onChange={this.handleAmountCouponsChange}
        />
        <br/>
        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='Current Price'
          required={true}
          type='number'
          value={this.state.currentPrice}
          onChange={this.handleCurrentPriceChange}
        />
        <br/>
        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='Discounted Price'
          required={true}
          type='number'
          value={this.state.discountedPrice}
          onChange={this.handleDiscountedPriceChange}
        />
        <br/>
        <Select
          hasLabel='true'
          htmlFor='select'
          label='Coupon Category'
          options='Food, Entertainment, Health and Fitness, Retail, Home Improvement, Activities, Other'
          required={true}
          value={this.state.length}
          onChange={this.handleCategoryChange}
        />
        <br/>
        <Textarea
          hasLabel='true'
          htmlFor='textarea'
          label='Description of Coupon'
          required={true}
          value={this.state.textarea}
          onChange={this.handleTextareaChange}
        />
        <br/>
        <div className='box'>
          <a className="icon-button" onClick={this.togglePopup}>
            <i className="icon-question"></i>
          </a>
          <div className={this.state.popupClass}>
            <div className="popup">
              <h2 className="popupheader">What are Super Coupons?</h2>
              <a className="close" onClick={this.togglePopup}>&times;</a>
              <div className="popupcontent">
                Super Coupons are coupons that have a higher likelyhood of appearing up in searches. Super Coupons are also the only coupons that can appear on the home page. Super Coupons cost 1.00$ per coupon instead of the standard 0.50$.
              </div>
            </div>
          </div> 
          <Select
            hasLabel='true'
            htmlFor='select'
            label='Super Coupon'
            options="Let's Go Super!, No thanks."
            required={true}
            value={this.state.superCoupon}
            onChange={this.handleSuperChange}
          />
          </div>
          <br/>
          <br/>
          <label className="custom-file-upload">
            Upload Your Image
            <input className="fileInput" 
              type="file"
              required={true}
              onChange={this.handleImageChange} />
            </label>
          <button className="submitButton" 
            type="submit" 
            onClick={this.uploadFile}
            >
          Upload Coupons
          </button>
      </form>
      <Checkout
          parentMethod={this.payForCoupons}
          name={'UnlimitedCouponer Coupons'}
          description={(this.state.superCoupon === "Let's go super") ? this.state.amountCoupons + " Super Coupons" : this.state.amountCoupons + " Coupons"}
          amount={(this.state.superCoupon === "Let's go super") ? 1.00 * this.state.amountCoupons : this.state.amountCoupons * 0.50}
          panelLabel="Upload coupons"
        />
      </div>
      </div>
      </div>
    )
  }
}



export default CouponForm; 
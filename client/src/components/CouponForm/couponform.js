import React, { Component } from 'react';
import './couponform.css';
import Coupon from '../SubComponents/Coupon/coupon';

// Create component for label
class Label extends Component {
  render() {
    if (this.props.hasLabel === 'true') {
      return <label htmlFor={this.props.htmlFor}>{this.props.label}</label>
    }
  }
}


// Create component for textarea
class Textarea extends Component {
  render() {
    return (
      <fieldset>
        <Label
          hasLabel={this.props.hasLabel}
          htmlFor={this.props.htmlFor}
          label={this.props.label}
          className={this.props.className}
        />

        <textarea
          cols={this.props.cols || null}
          id={this.props.htmlFor}
          name={this.props.name || null}
          required={this.props.required || null}
          rows={this.props.rows || null}
          value = {this.props.textarea || null}
          onChange={this.props.onChange || null}
          className={this.props.className}
        >
        </textarea>
      </fieldset>
    );
  }
};


// Create component for select input
class Select extends Component {
  render() {
    // Get all options from option prop
    const selectOptions = this.props.options.split(', ');

    // Generate list of options
    const selectOptionsList = selectOptions.map((selectOption, index) => {
      return <option key={index} value={index}>{selectOption}</option>
    });

    return (
      <fieldset>
        <Label
          hasLabel={this.props.hasLabel}
          htmlFor={this.props.htmlFor}
          label={this.props.label}
          className={this.props.className}
        />
        
        <select
          defaultValue=''
          id={this.props.htmlFor}
          name={this.props.name || null}
          required={this.props.required || null}
          value = {this.props.length || null}
          onChange={this.props.onChange || null}
        >
          <option value='' disabled>Make Selection</option>

          {selectOptionsList}
        </select>
      </fieldset>
    );
  }
};
// Create component for input
class Input extends Component {
  render() {
    return (
      <fieldset>
        <Label
          hasLabel={this.props.hasLabel}
          htmlFor={this.props.htmlFor}
          label={this.props.label}
        />

        <input
          id={this.props.htmlFor}
          max={this.props.max || ''}
          min={this.props.min || ''}
          name={this.props.name || ''}
          placeholder={this.props.placeholder || ''}
          required={this.props.required || ''}
          step={this.props.step || ''}
          type={this.props.type || 'text'}
          onChange={this.props.onChange || ''}
        />
      </fieldset>
    );
  }
}


class CouponForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: 'Rent your very own kitten today!',
      longitude: '',
      latitude: '',
      address: '123 Cuddle Street, Kittentown, MA. 0 Miles Away.',
      amountCoupons: '100',
      currentPrice: '10.00',
      discountedPrice: '5.00',
      length: '1 day ',
      superCoupon: 'Make a Selection',
      textarea: 'Ever want to have a kitten without the responsibility of actually owning it? Want to sneak a kitten into your apartment for a week without your pesky landlord knowing? Now you can! Call 1-8000-RENT-CAT now to rent your very own kitten today.',
      file: '',
      imagePreviewUrl: 'http://www.petsworld.in/blog/wp-content/uploads/2014/09/cute-kittens.jpg',
      category: '',
      city: '',
      zip: '',
      popupClass: 'overlayHidden'
    };
    this.togglePopup = this.togglePopup.bind(this);
  }
  togglePopup(){

  }
  handleImageChange(e) {
    e.preventDefault();

    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }
    reader.readAsDataURL(file)
  }
  setLatAndLong() {
    let that = this;
    const google=window.google
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': this.state.address}, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0] && that.state.address.length > 5) {
          that.setState({
            latitude:results[0].geometry.location.lat(),
            longitude: results[0].geometry.location.lng()
          })
        }
      }
    });
  }

  uploadFile(e) {
    // after a response is gotten from the server
    // JSON.stringify the response then JSON.parse the response 
    e.preventDefault();
    let that = this;
    const google=window.google
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': this.state.address}, async (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0] && that.state.address.length > 5) {
          that.setState({
            latitude:results[0].geometry.location.lat(),
            longitude: results[0].geometry.location.lng()
          })
          if (this.state.latitude === '' || this.state.longitude === '') alert('Invalid Address, please check address!')
          else if (this.state.title === 'Rent your very own kitten today!') alert('You must have a unique title!')
          else if (this.state.address === '123 Cuddle Street, Kittentown, MA. 0 Miles Away.') alert('You must have an address!')
          else if (this.state.currentPrice <= this.state.discountedPrice) alert('Your discounted price must be lower than your old price')
          else if (this.state.imagePreviewUrl === 'http://www.petsworld.in/blog/wp-content/uploads/2014/09/cute-kittens.jpg') alert('You must upload an image!')
          else if (this.state.textarea === 'Ever want to have a kitten without the responsibility of actually owning it? Want to sneak a kitten into your apartment for a week without your pesky landlord knowing? Now you can! Call 1-8000-RENT-CAT now to rent your very own kitten today.') alert('You must upload a custom description!')
          else if (this.state.city === '') alert('You must have a city!')
          else if (this.state.category === '') alert('You must have a category!')
          else if (this.state.length === '1 day ') alert('You must have a length!')
          else if (this.state.currentPrice <= this.state.discountedPrice) alert('Your discounted price must be lower than your current price!')
          else if (this.state.city === '') alert('You must have a city!')
          else if (this.state.zip === '' || this.state.zip.length < 3) alert('You must have a zipcode!')
          else {
            const url = `/api/uploadCoupons`
            const response = await fetch(url, {
              body: this.state,
              method: 'POST',
              headers: {
                Accept: 'application/json',
              },
            })
            alert(JSON.stringify(response))
          }
        }
      } else alert('In order to find automatically find coupons within your area we will need to know your location. You can of course search for coupons through our search section!')
    });
  }
    handleTitleChange(e) {
      if (e.target.value == '') {
        this.setState({
          title: 'Rent your very own kitten today!'
        })
      } else {
        this.setState({
          title: e.target.value,
        })
      }
    }
  handleAddressChange(e) {
      if (e.target.value == '') {
        this.setState({
          address: '123 Cuddle Street, KittenTown MA. 0 Miles Away.'
        })
      } else {
        this.setState({
          address: e.target.value,
        })
      }
    }
  
      handleAmountCouponsChange(e) {
        let coupons = e.target.value;
        if (coupons.lastIndexOf('.') > -1) {
          coupons = 0;
        }
      this.setState({amountCoupons: coupons})
    }
      handleDiscountedPriceChange(e) {
        let price = e.target.value;
        if (price.includes('.'))
        {
          if (price.substring(price.length-3, price.length-2) == '.') {
            this.setState({discountedPrice: e.target.value})
          } else {
            this.setState({discountedPrice: e.target.value + '0'})
          }
        } else {
          this.setState({discountedPrice: e.target.value + '.00'})
        }
    }
        handleCurrentPriceChange(e) {
          let price = e.target.value;
          if (price.includes('.'))
          {
            if (price.substring(price.length-3, price.length-2) == '.') {
              this.setState({currentPrice: e.target.value})
            } else {
              this.setState({currentPrice: e.target.value + '0'})
            }
          } else {
            this.setState({currentPrice: e.target.value + '.00'})
          }
        }
      handleLengthChange(e) {
        if (e.target.value === 1) {
          this.setState({length: e.target.value + ' day '})
        }
      this.setState({length: e.target.value + ' days '})
    }
    handleTextareaChange(e) {
        if(e.target.value == '') {
          this.setState({textarea: 'Ever want to have a kitten without the responsibility of actually owning it? Want to sneak a kitten into your apartment for a week without your pesky landlord knowing? Now you can! Call 1-8000-RENT-CAT now to rent your very own kitten today.'})
        } else {
          this.setState({
            textarea: e.target.value,
          })
        }
    }
    handleCategoryChange(e){
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
  handleSuperChange(e){
    const superChoices = [
      "Let's go super",
      'No thanks',
    ]
    this.setState({superCoupon: superChoices[e.target.value]})
  }

  handleCityChange(e){
    this.setState({city: e.target.value})
  }

  handleZipChange(e){
    this.setState({zip: e.target.value})
  }

  render() {
    let {imagePreviewUrl} = this.state;
    let $imagePreview = '';
    if (imagePreviewUrl) {
      $imagePreview = (<img className = "exampleImage" src={imagePreviewUrl} />);
    } else {
      $imagePreview = (<div className="previewText">Please select an image of your product</div>);
    }

    return (
      <div className="flextape">
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700,800" rel="stylesheet"></link>
        <link href="https://netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet"></link>
        <div className='couponHeader'>
          <h1 className='formHeaderText'> Example Coupon </h1>
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
        amountCoupons = {this.state.length}
        textarea = {this.state.textarea}
        address = {this.state.address}
        />
        {/* <div className="coupon">
          <h1 className = "exampleTitle">{this.state.title}</h1>
          <div className = "exampleImage" >{$imagePreview}</div>
          <div className="pricing">
            <div className='oldPrice'>
                Was: {(this.state.currentPrice - 0).toFixed(2)}$
            </div>
            <div className='percentOff'>
                {(((this.state.currentPrice - this.state.discountedPrice)/this.state.currentPrice)*100).toFixed(2)}% Percent Off!
            </div>
            <br/>
            <div className='newPrice'>
                Now: {(this.state.discountedPrice - 0).toFixed(2)}$
            </div>
            <div className='savings'>
                Save: {(this.state.currentPrice - this.state.discountedPrice).toFixed(2)}$
            </div>
            <br/>
            <hr/>
            <div className="amountLeft">
                Only {this.state.amountCoupons} Coupons Left!
            </div>
          <hr/>
          <div className="description">
          <br/>
            <p>{this.state.textarea}</p>
            <br/>
            <hr/>
            <br/>
            <p className="timeLeft"> Don't delay, only <strong>{this.state.length}</strong> left until these coupons expire! </p>
            <hr/>
            <br/>
            <p>{this.state.address}</p>
            <hr/>
            <br/>
                      <button className="getCoupon"> Get Coupon </button>
          <button className ="declineCoupon"> No Thanks </button>
          </div>
          <br/>
        </div>
      </div> */}
        <div className='formHeaderMobile'>
          <h1> Coupon details</h1>
        </div>
        <div className='uploadCouponForm'>
        <form // onSubmit={(e)=>this.handleSubmit(e)}
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
          required='true'
          type='text'
          className='couponUploadTitle'
  value={this.state.title}
  onChange={(e)=>this.handleTitleChange(e)} />
          <br/>
          
          <Input
          hasLabel='true'
          htmlFor='textInput'
          label='Address'
          required='true'
          type='text'
  value={this.state.address}
  onChange={(e)=>this.handleAddressChange(e)} />
          <br/>

        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='City'
          required='true'
          type='text'
          value={this.state.city}
          onChange={(e)=>this.handleCityChange(e)} />
          <br/>
        
        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='Zip code'
          required='true'
          type='number'
          value={this.state.handleZipChange}
          onChange={(e)=>this.handleZipChange(e)} />
        <br/>
        
        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='Amount of Coupons'
          required='true'
          type='number'
          value={this.state.amountCoupons}
          onChange={(e)=>this.handleAmountCouponsChange(e)} />
        <br/>
        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='Current Price'
          required='true'
          type='number'
          value={this.state.currentPrice}
          onChange={(e)=>this.handleCurrentPriceChange(e)} />
        <br/>
        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='Discounted Price'
          required='true'
          type='number'
          value={this.state.discountedPrice}
          onChange={(e)=>this.handleDiscountedPriceChange(e)} />
        <br/>
        <Select
          hasLabel='true'
          htmlFor='select'
          label='Coupon Category'
          options='Food, Entertainment, Health and Fitness, Retail, Home Improvement, Activities, Other'
          required='true'
          value={this.state.length}
          onChange={(e)=>this.handleCategoryChange(e)} />
        <br/>
        <Input
          hasLabel='true'
          htmlFor='textInput'
          label='How many days?'
          type='number'
          required='true'
          value={this.state.length}
          onChange={(e)=>this.handleLengthChange(e)} />
        <br/>
        <Textarea
          hasLabel='true'
          htmlFor='textarea'
          label='Description of Coupon'
          required='true'
          value={this.state.textarea}
          onChange={(e)=>this.handleTextareaChange(e)} />
         <br/>
          <div className='box'>
              <a className="icon-button" onClick={this.togglePopup()}>
                <i 
                className="icon-question">
                </i>
                </a>
<div className="overlay">
	<div className="popup">
		<h2>What are Super Coupons?</h2>
		<a className="close" onClick={this.togglePopup()}>&times;</a>
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
            required='true'
            value={this.state.superCoupon}
            onChange={(e)=>this.handleSuperChange(e)} />
          </div>
          <br/>
          <br/>
                    <label className="custom-file-upload">Upload Your Image
          <input className="fileInput" 
            type="file"
            required='true'
            onChange={(e)=>this.handleImageChange(e)} />
          </label>
          <button className="submitButton" 
            type="submit" 
            onClick={(e)=>this.uploadFile(e)}
            >Upload Coupons</button>
        </form>
        </div>
      </div>
        </div>
    )
  }
}



export default CouponForm; 
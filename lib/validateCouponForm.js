const validateCouponForm = state => {
    if (state.latitude === '' || state.longitude === '') {
      toast.error('Invalid Address, please check address!')
      return false;
    }
    else if (state.title === 'Rent your very own kitten today!') {
      toast.error('You must have a unique title!');
      return false;
    }
    else if (state.address === '123 Cuddle Street, Kittentown, MA. 0 Miles Away.') {
      toast.error('You must have an address!');
      return false;
    }
    else if (state.imagePreviewUrl  === "" || state.imagePreviewUrl === 'http://www.petsworld.in/blog/wp-content/uploads/2014/09/cute-kittens.jpg') {
      toast.error('You must upload an image!')
      return false;
    }
    else if (state.textarea === 'Ever want to have a kitten without the responsibility of actually owning it? Want to sneak a kitten into your apartment for a week without your pesky landlord knowing? Now you can! Call 1-8000-RENT-CAT now to rent your very own kitten today.') {
      toast.error('You must upload a custom description!');
      return false;
    }
    else if (state.city === '') {
      toast.error('You must have a city!')
      return false;
    }
    else if (state.category === '') {
      toast.error('You must have a category!')
      return false;
    }
    else if (state.discountedPrice === '') {
      toast.error('You must have a category!')
      return false;
    }
    else if (state.price === '') {
      toast.error('You must have a Current Price!')
      return false;
    }
    // !todo, fix this check
    // else if (state.currentPrice <= state.discountedPrice) return alert('Your discounted price must be lower than your current price!')
    else if (state.city === '') {
      toast.error('You must have a city!')
      return false;
    }
    else if (state.zip === '' || state.zip.length < 3) {
      toast.error('You must have a zipcode!')
      return false;
    }
    else return true;
  }
module.exports = validateCouponForm;
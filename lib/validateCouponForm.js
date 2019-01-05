const validateCouponForm = state => {
  if (state.latitude === '' || state.longitude === '') return { errorMessage:"Could not validate your address, please check the formatting!", valid: false };
  else if (state.title === 'Rent your very own kitten today!') return { errorMessage:"Please enter your own unique title!", valid: false };
  else if (state.title.length < 3) return { errorMessage:"Your title must be longer than 2 characters!", valid: false };
  else if (state.address === '123 Cuddle Street, Kittentown, MA. 0 Miles Away.') return { errorMessage:"Your description must be under 1000 characters!", valid: false };
  else if (state.imagePreviewUrl === 'http://www.petsworld.in/blog/wp-content/uploads/2014/09/cute-kittens.jpg') return toast.error('You must upload an image!')
  else if (state.textarea === 'Ever want to have a kitten without the responsibility of actually owning it? Want to sneak a kitten into your apartment for a week without your pesky landlord knowing? Now you can! Call 1-8000-RENT-CAT now to rent your very own kitten today.') return { errorMessage:"Your description must be unique!", valid: false };
  else if (state.textarea.length < 49) return { errorMessage:"Your description must be under 1000 characters!", valid: false };
  else if (state.textarea.length >= 1000) return { errorMessage:"Your description must be under 1000 characters!", valid: false };
  else if (state.city === '') return { errorMessage:"You must enter a city!", valid: false };
  else if (state.category === '') return { errorMessage:"You must select a category!", valid: false };
  else if (state.discountedPrice === '') return { errorMessage:"Your discounted price must not be empty!", valid: false };
  else if (Number(state.discountedPrice) >= 10000) return { errorMessage:"Your discounted price must be under 10000!", valid: false };
  else if (Number(state.discountedPrice) >= Number(state.currentPrice) ) return { errorMessage:"Your discounted price must be lower than your current price!", valid: false };
  else if (Number(state.discountedPrice) <= 0 || Number(state.currentPrice) === 0) return { errorMessage:"Your discounted price and current price must be above 0!", valid: false };
  else if (state.price === '') return { errorMessage:"You must enter a price", valid: false };
  else if (Number(state.price) >= 10000) return { errorMessage:"Your price must be under 10000!", valid: false };
  else if (state.zip === '' || state.zip.length < 3) return { errorMessage:"Your Zip Code is too short or incorrect!", valid: false };
  else return { valid: true };
  }
module.exports = validateCouponForm;
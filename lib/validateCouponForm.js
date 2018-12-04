const validateCouponForm = state => {
  if (state.latitude === '' || state.longitude === '') return false;
  else if (state.title === 'Rent your very own kitten today!') return false;
  else if (state.title.length < 4) return false;
  else if (state.address === '123 Cuddle Street, Kittentown, MA. 0 Miles Away.') return false;
  else if (state.imagePreviewUrl === 'http://www.petsworld.in/blog/wp-content/uploads/2014/09/cute-kittens.jpg') return toast.error('You must upload an image!!!!!')
  else if (state.textarea === 'Ever want to have a kitten without the responsibility of actually owning it? Want to sneak a kitten into your apartment for a week without your pesky landlord knowing? Now you can! Call 1-8000-RENT-CAT now to rent your very own kitten today.') return false;
  else if (state.textarea.length < 49) return false;
  else if (state.city === '') return false;
  else if (state.category === '') return false;
  else if (state.discountedPrice === '') return false;
  else if (Number(state.discountedPrice) >= 10000) return false;
  else if (state.price === '') return false;
  else if (Number(state.price) >= 10000) return false;
  else if (state.zip === '' || state.zip.length < 3) return false;
  else return true;
  }
module.exports = validateCouponForm;
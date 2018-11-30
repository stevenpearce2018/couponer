const validateCouponForm = state => {
    if (state.latitude === '' || state.longitude === '') return false;
    else if (state.title === 'Rent your very own kitten today!') return false;
    else if (state.address === '123 Cuddle Street, Kittentown, MA. 0 Miles Away.') return false;
    else if (state.imagePreviewUrl  === "" || state.imagePreviewUrl === 'http://www.petsworld.in/blog/wp-content/uploads/2014/09/cute-kittens.jpg') return false;
    else if (state.textarea === 'Ever want to have a kitten without the responsibility of actually owning it? Want to sneak a kitten into your apartment for a week without your pesky landlord knowing? Now you can! Call 1-8000-RENT-CAT now to rent your very own kitten today.') return false;
    else if (state.city === '') return false;
    else if (state.category === '') return false;
    else if (state.discountedPrice === '') return false;
    else if (state.price === '') return false;
    // !todo, fix this check
    // else if (state.currentPrice <= state.discountedPrice) return alert('Your discounted price must be lower than your current price!')
    else if (state.city === '') return false;
    else if (state.zip === '' || state.zip.length < 3) return false;
    else return true;
  }
module.exports = validateCouponForm;
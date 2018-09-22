const express = require('express');
const app = express();
const redisHelper = require('./redisHelper')
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
app.use(bodyParser.json({limit:'50mb'})) // handle json data
app.use(bodyParser.urlencoded({ extended: true, limit:'50mb' })) // handle URL-encoded data
const MongoClient = require('mongodb').MongoClient
const Coupon = require('./models/coupons')
const AccountInfo = require('./models/accountInfo')
const mongoose = require('mongoose')

const uri = 'mongodb+srv://Steve:Password@cluster0-bpsap.mongodb.net/test?authSource=test&w=1';

mongoose.connect(
  "mongodb+srv://Steve:Password@cluster0-bpsap.mongodb.net/test?authSource=test&w=1",
  {
    useMongoClient: true
  }
);

// app.get('*', (req, res) => {
//   res.json({url: req.url});
// });

app.post('/api/signupCustomer', async(req, res) => {
  const ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
  // const redisKey = req.body.email;
  let loginKey
  AccountInfo.find({ 'email': req.body.email }).then(async result => {
    if (result.length === 0) {
      if (req.body.email && req.body.password && req.body.phoneNumber && req.body.cardNumber && req.body.CCV && req.body.zipCode && req.body.experationDate && req.body.address &&
        req.body.cardholderName && req.body.city && req.body.country && req.body.region && req.body.yourPick && ip) {
        const hashedPass = await bcrypt.hashSync(req.body.password, 10);
        const email = req.body.email
        if (req.body.buisnessName == '' || !req.body.buisnessName) {
          loginKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ':b'
        } else {
          loginKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ':c'
        }
        const accountInfo = new AccountInfo({
          _id: new mongoose.Types.ObjectId(),
          email: email,
          buisnessName: req.body.buisnessName,
          password: hashedPass,
          phoneNumber: req.body.phoneNumber,
          creditCardNumber: req.body.cardNumber,
          CCV: req.body.CCV,
          zipCode: req.body.zipCode,
          experationDate: req.body.experationDate,
          address: req.body.address,
          cardholderName: req.body.cardholderName,
          city: req.body.city.toLowerCase(),
          country: req.body.country,
          region: req.body.region,
          yourPick: req.body.yourPick,
          loggedInKey: loginKey,
          ip: ip
        })
        accountInfo.save()
        .catch(err => console.log('error'))
        res.json({
          email: email,
          loggedInKey:loginKey
        });
    } else {
      res.json({resp:'You need to fill out all fields!'});
    }
    }else {
      res.json({resp:'Email address is taken!'});
    }
  });
});

app.post('/api/updateAccount', (req, res) => {
  const redisKey = req.body.email;
  let userExist = false;
  // login key is "email:password"
  redisHelper.get(redisKey, registerUser) //geting user based on email 
  function registerUser (result) { //then I call this funtion with the information found in redis
    console.log(result)
    console.log(redisKey + ' '+ req.params)
    if (!result) {
      redisHelper.set(redisKey, JSON.stringify(req.body))
    } else {
      userExist = true;
    }
    // already logged in
    console.log(userExist)
    if (userExist) {
      res.json({email: req.body.email, password: req.body.password })
    } else {
      res.json({resp:'Welcome new user!'});
    }
  }
});

app.get('/api/getSponseredCoupons/:city', async (req, res) => {
  let coupons;
  const cityUserIsIn = req.params.city.toLowerCase()
  if(req.body.city && nocityfound !== 'nocityfound') {
    coupons = await Coupon.find({city : cityUserIsIn} ).limit(20)
    console.log(coupons)
    if (coupons.length > 0 ) {
      res.json({
        coupons: coupons
      });
    } else {
      res.json({
        coupons: 'No coupons were found near you. Try searching manually'
      });
    }
  } else {
    coupons = await Coupon.find().limit(20)
    if (coupons.length > 0 ) {
      res.json({
        coupons: coupons
      });
    } else {
      res.json({
        coupons: 'No coupons were found near you. Try searching manually'
      });
    }
  }
});

app.post('/api/searchCoupons', async (req, res) => {
  let coupons;
  const city = req.body.city.toLowerCase()
  const zip = req.body.zip
  const category = req.body.category
  if(city && zip && category) {
    coupons = await Coupon.find({'city' : city, 'zip' : zip, 'category' : category})
  }
  else if(city && zip) {
    coupons = await Coupon.find({'city' : city, 'zip' : zip})
  } 
  else if(category && zip) {
    coupons = await Coupon.find({'zip' : zip, 'category' : category})
  } 
  else if(category && city) {
    coupons = await Coupon.find({'city' : city, 'category' : category})
  }
  else if(category){
    coupons = await Coupon.find({'category' : category})
  }
  else if(city){
    coupons = await Coupon.find({'city' : city})
  }
  else if(zip){
    coupons = await Coupon.find({'zip' : zip})
  }
  console.log(coupons)
  res.json({
    coupons: coupons
  });
});

app.post('/api/signin', (req, res) => {
  const redisKey = req.body.email;
  const password = req.body.password;
  const accountSettings = req.body.accountSettings;
  redisHelper.get(redisKey, login)
  function login (outcome) {
    if (outcome) { // if this is not null, then execute this block of code
      // console.log(bcrypt.compareSync(outcome.password, req.body.password)); // true
      if (bcrypt.compareSync(outcome.password, req.body.password)) {
        // console.log('password valid')
        if (accountSettings === 'accountSettings') {
          res.json({
            password: password,
            email: redisKey,
            address: outcome.address,
            buisnessName: outcome.buisnessName,
            cardholderName: outcome.cardholderName,
            cardNumber: outcome.cardNumber,
            CCV: outcome.CCV,
            city: outcome.city,
            experationDate: outcome.experationDate,
            yourPick: outcome.yourPick,
            zipCode: outcome.zipCode,
            phoneNumber: outcome.phoneNumber
          });
        } else {
          res.json({password: password, email: redisKey});
        }

      } else {
        // console.log('password not valid')
        res.json({resp: 'invalid login'});
      }
    } else { //user not found
      res.json({resp: 'login not found'});
    }
  }
  // res.json({resp:'Welcome new user!'});
});
app.get('/api/getCustomer', (req, res) => {
  const redisKey = req.body.email;
  const password = req.body.password;
  console.log('getCustomer')
  console.log(req.body)
  redisHelper.get(redisKey, login)
  function login (outcome) {
    if (outcome) { // if this is not null, then execute this block of code
      if (outcome.password == password) {
        console.log('password valid')
        res.json({password: password, email: redisKey});

      } else {
        console.log('password not valid')
        res.json({resp: 'invalid login'});
      }
    } else { //user not found
      console.log('user not found')
      res.json({resp: 'login not found'});
    }
  }
})

app.post
(`/api/uploadCoupons`, (req, res) => { // req = request
  // let base64Data = req.body.imagePreviewUrl.replace(/^data:image\/png;base64,/, ""); 
  // base64Data = base64Data.replace(/^data:image\/jpeg;base64,/, "")
  // base64Data = base64Data.replace(/^data:image\/gif;base64,/, "")
  // base64Data = base64Data.replace(/^data:image\/tif;base64,/, "")
  // base64Data = base64Data.replace(/^data:image\/tiff;base64,/, "")
  let lengthInDays = req.body.length;
  const amountCoupons = req.body.amountCoupons;
  lengthInDays = lengthInDays.replace(/\D/g,''); // removes non numbers
  redisHelper.get('couponCount', couponCount)
  let couponNumer;
  function couponCount (result) {
    let couponCodes = {} // Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    if (!result) {
      redisHelper.set('couponCount', '1') 
      couponNumer = 1;
    } else {
      couponNumer = result + 1;
    }
    redisHelper.set('couponCount', couponNumer)
    for(let i = 1; i <= amountCoupons; i++){
      couponCodes['c'+i] = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)+':a';
    }
    redisHelper.set('couponCode'+couponNumer, couponCodes)
    saveCoupon();
  }
  console.log(req.body.superCoupon)
  const saveCoupon = () => {
    const coupon = new Coupon({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      address: req.body.address,
      city: req.body.city.toLowerCase(),
      amountCoupons: amountCoupons,
      lengthInDays: lengthInDays,
      currentPrice: req.body.currentPrice,
      discountedPrice: req.body.discountedPrice,
      category: req.body.category,
      textarea: req.body.textarea,
      base64image: req.body.imagePreviewUrl,
      superCoupon: req.body.superCoupon,
      redisKeyToCoupon: 'couponCode' + couponNumer
    })
    coupon.save()
    .then(result => {
      console.log(result)
    })
    .catch(err => console.log(err))
  }

  res.json({resp: 'testing done'})
})
  
const port = 4000;

app.listen(port, () => `Server running on port ${port}`);
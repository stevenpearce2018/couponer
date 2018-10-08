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
const stripe = require("stripe")("sk_test_0Mebt2KJK4aP2PGMoiya8LEj");
// const fs = require('fs')
// const htttpsOptions = {
//   cert: fs.readFileSync('./ssl/server.crt'),
//   key: fs.readFileSync('./ssl/server.key')
// }
// const https = require('https')

// https.createServer(htttpsOptions, app)

// Token is created using Checkout or Elements!
// Get the payment token ID submitted by the form:
// const token = request.body.stripeToken; // Using Express

mongoose.connect(
  "mongodb+srv://Steve:Password@cluster0-bpsap.mongodb.net/test?authSource=test&w=1",
).then(console.log('Connected to mongoDB'));

app.post('/api/signupCustomer', async(req, res) => {
  const ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     (req.connection.socket ? req.connection.socket.remoteAddress : null);
  const loggedInKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const result = await AccountInfo.find({ 'email': req.body.email })
    if (result.length === 0) {
      if (req.body.email && req.body.password && req.body.phoneNumber && req.body.cardNumber && req.body.CCV && req.body.zipCode && req.body.experationDate && req.body.address &&
        req.body.cardholderName && req.body.city && req.body.country && req.body.region && req.body.yourPick && ip) {
        const hashedPass = await bcrypt.hashSync(req.body.password, 10);
        const email = req.body.email;
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
          loggedInKey: loggedInKey,
          couponIds: [],
          couponsCurrentlyClaimed: 0,
          ip: ip
        })
        await accountInfo.save()
        .catch(err => console.log(err))
        redisHelper.set(loggedInKey, loggedInKey)
        res.json({
          loggedInKey:loggedInKey
        });
    } else res.json({resp:'You need to fill out all fields!'});
    } else res.json({resp:'Email address is taken!'});
});

app.post('/api/updateAccount', (req, res) => {
  // !todo, update account settings
});

// app.post("/charge", async (req, res) => {
//   console.log('charge works')
//   try {
//     let {status} = await stripe.charges.create({
//       amount: 2000,
//       currency: "usd",
//       description: "An example charge",
//       source: req.body
//     });
//     res.json({status});
//   } catch (err) {
//     console.log(JSON.stringify(err))
//     res.status(500).end();
//   }
// });



// req.body.email
// req.body.password

app.post('/api/signin', async (req, res) => {
  const outcome = await AccountInfo.find({'email' : req.body.email}).limit(1)
  if(bcrypt.compareSync(req.body.password, outcome[0].password)) {
    const loggedInKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    res.json({loggedInKey: loggedInKey});
    await AccountInfo.updateOne(
      { "_id" : outcome[0]._id }, 
      { "$set" : { "ip" : req.connection.remoteAddress.replace('::ffff:', '')}, loggedInKey:loggedInKey }, 
      { "upsert" : true } 
    );
  }
  else res.json({loggedInKey: 'invalid login'})
});

app.post(`/api/signout`, async(req, res) => { // req = request
  // const outcome = await AccountInfo.find({'loggedInKey' : req.body.loggedInKey}).limit(1)
  const loggedInKey = req.body.loggedInKey
  console.log(loggedInKey, 'loggedInKey')
  const outcome = await AccountInfo.find({'loggedInKey': loggedInKey}).limit(1)
  console.log(outcome, 'outcome')
  const outcometwo = await AccountInfo.find({'email' : 'testtest'}).limit(1)
  console.log(outcometwo, 'outcometwo')
  if (outcome) {
    res.json({response:"Logout Successful"})
    await AccountInfo.updateOne(
      { "_id" : outcome[0]._id }, 
      { "$set" : { "ip" : ''}, loggedInKey:'' }, 
      { "upsert" : true } 
    );
    // const outcomeTwo = await AccountInfo.find({"_id" : outcome[0]._id}).limit(1)
    // console.log(JSON.stringify(outcomeTwo));
  }
  else res.json({response:"Logout Failed"})
})

app.post(`/api/uploadCoupons`, async(req, res) => { // req = request
  // const lengthInDays = req.body.length.replace(/\D/g,'');
  const amountCoupons = req.body.amountCoupons;
  let couponCodes = [];
  for(let i = 0; i < amountCoupons; i++) couponCodes.push(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)+':a');
  const saveCoupon = async () => {
    const coupon = new Coupon({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      address: req.body.address,
      city: req.body.city.toLowerCase(),
      amountCoupons: amountCoupons,
      // lengthInDays: lengthInDays,
      currentPrice: req.body.currentPrice,
      discountedPrice: req.body.discountedPrice,
      category: req.body.category,
      textarea: req.body.textarea,
      base64image: req.body.imagePreviewUrl,
      superCoupon: req.body.superCoupon,
      couponCodes: couponCodes,
      couponStillValid: true
    })
    await coupon.save()
      .catch(err => console.log(err))
  }
  saveCoupon();
  // res.json({response: 'Coupon Created'})
  res.json({response: 'Coupon Created'})
})

app.get('/api/getSponseredCoupons/:city', async (req, res) => {
  let coupons;
  const cityUserIsIn = req.params.city.toLowerCase()
  if(req.body.city && nocityfound !== 'nocityfound') {
    coupons = await Coupon.find({city : cityUserIsIn} ).limit(20)
    if (coupons.length > 0 ) res.json({ coupons: coupons });
    else res.json({ coupons: 'No coupons were found near you. Try searching manually' });
  }
  else {    
      coupons = await Coupon.find().limit(20)
      if (coupons.length > 0 ) res.json({ coupons });
      else res.json({ coupons: 'No coupons were found near you. Try searching manually' });
  }
});

app.post('/api/searchCoupons', async (req, res) => {
  let coupons;
  const city = req.body.city.toLowerCase()
  const zip = req.body.zip
  const category = req.body.category
  if(city && zip && category) coupons = await Coupon.find({'city' : city, 'zip' : zip, 'category' : category})
  else if(city && zip) coupons = await Coupon.find({'city' : city, 'zip' : zip})
  else if(category && zip) coupons = await Coupon.find({'zip' : zip, 'category' : category})
  else if(category && city) coupons = await Coupon.find({'city' : city, 'category' : category})
  else if(category) coupons = await Coupon.find({'category' : category})
  else if(city) coupons = await Coupon.find({'city' : city})
  else if(zip) coupons = await Coupon.find({'zip' : zip})
  res.json({coupons: coupons});
});

app.post("/charge", async (req, res) => {
  console.log('charge works')
  try {
    let {status} = await stripe.charges.create({
      amount: 2000,
      currency: "usd",
      description: "An example charge",
      source: req.body
    });
    res.json({status});
  } catch (err) {
    console.log(JSON.stringify(err))
    res.status(500).end();
  }
});

app.post(`/api/getCoupon`, async(req, res) => { // req = request
  if (!req.body.loggedInKey) res.json({response: "You need to be logged in and have a valid subscription in order to claim coupons!"});
  console.log(req.body.loggedInKey)
  const ip = req.headers['x-forwarded-for'] || 
  req.connection.remoteAddress || 
  req.socket.remoteAddress ||
  (req.connection.socket ? req.connection.socket.remoteAddress : null);
  const outcome = await AccountInfo.find({'loggedInKey':req.body.loggedInKey })
  console.log(outcome)
  if (outcome) {
    if (outcome.couponsCurrentlyClaimed < 5) {
      res.json({response: "Coupon Claimed!"});
      await AccountInfo.updateOne(
        { "_id" : outcome[0]._id }, 
        { "$set" : {couponIds:outcome[0].couponIds.push(req.body._id)}, couponsCurrentlyClaimed: outcome[0].couponsCurrentlyClaimed+1}, 
        { "upsert" : true } 
      );
    } else res.json({response: "You have too many coupons! Please use a coupon or discard one of your current coupons."});
  }
  else res.json({response: "You need to be logged in and have a valid subscription in order to claim coupons!"});
})

const port = 4000;

app.listen(port, () => `Server running on port ${port}`);
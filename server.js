require('dotenv').config()
const express = require('express');
const app = express();
const redisHelper = require('./redisHelper')
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
app.use(bodyParser.json({limit:'50mb'}))
app.use(bodyParser.urlencoded({ extended: true, limit:'50mb' }))
const accountSid = process.env.ACCOUNT_SID; // !todo, change dev keys to prod keys
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const Coupon = require('./models/coupons')
const AccountInfo = require('./models/accountInfo')
const mongoose = require('mongoose')
const stripe = require('./stripe');
const nodemailer = require('nodemailer');
const recaptchaSecretKey = process.env.recaptchaSecretKey;
const searchableMongoIDs = require("./lib/searchableMongoIDs");
const claimCode = require("./lib/claimCode");
const escapeRegex = require("./lib/escapeRegex");
const generateQR = require("./lib/generateQR");
const validateEmail = require('./lib/validateEmail');
const associateCouponCodeByID = require('./lib/associateCouponCodeByID');
const cleanCoupons = require("./lib/cleanCoupons");
const moment = require("moment");

app.post('/api/generateQR', async(req, res) => {
  try {
    client.messages
    .create({from: '+13124108678', mediaUrl: await generateQR("Hello world"), to: "+15614807156"})
    .then(message => res.json({success:true}))
    .done();
  } catch (error) {
    res.json({success:false})
  }
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@address.com',
    pass: 'yourpassword'
  }
});
const mailOptions = {
  from: 'sender@email.com', // sender address
  to: 'to@email.com', // list of receivers
  subject: 'Welcome!', // Subject line
  html: '<p>Welcome to UnlimitedCouponer</p>'// plain text body
};
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


//!todo, get production mongodb account and login string. Use .env for connection string

try {
  mongoose.connect(process.env.DB).then(console.log('Connected to mongoDB'));
} catch (error) {
  console.log(error, "Failed to connect to mongoDB. :(")
}
const postStripeCharge = res => (stripeErr, stripeRes) => {
  if (stripeErr) res.status(500).send({ error: stripeErr });
  else res.status(200).send({ success: stripeRes });
}

// const didRecaptchaPass = async(req) => {
//   const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${req.body.recaptchaToken}&remoteip=${req.connection.remoteAddress}`;
//   await request(verifyUrl, (err, response, body) => {
//     body = JSON.parse(body);
//     if(body.success !== undefined && !body.success) return false;
//     else return true;
//   })
// }

app.post('/api/charge', async(req, res) => {
  stripe.charges.create(req.body, postStripeCharge(res));
});
app.post('/api/recoverAccount', async(req, res) => {
  const email = req.body.recoveryEmail;
    const mailOptions = {
      from: 'sender@email.com', // sender address
      to: email, // list of receivers
      subject: 'Recover Account', // Subject line
      html: '<p>Welcome to UnlimitedCouponer</p>'// plain text body
    };
    res.json({success:true})
});

app.post('/api/signupCustomer', async(req, res) => {
  console.log(JSON.stringify(req.body))
  redisHelper.get(req.body.phoneNumber, compareRandomNumber)
  async function compareRandomNumber(randomNumber){
    if (randomNumber === req.body.randomNumber) {
      const yourPick = req.body.yourPick
      const ip = req.headers['x-forwarded-for'] || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
      const loggedInKey = req.body.buisnessName ? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ":b" : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ":c";
      const result = await AccountInfo.find({ 'email': req.body.email })
        if (result.length === 0) {
          if (req.body.email && req.body.password && req.body.phoneNumber && yourPick && ip) {
            if (yourPick === ' Buisness Owner' && req.body.buisnessName || yourPick === ' Customer' && req.body.membershipExperationDate ) {
              const hashedPass = await bcrypt.hashSync(req.body.password, 10);
              const email = req.body.email;
              if(validateEmail(email)){
                const membershipExperationDate = (yourPick === ' Buisness Owner') ? "N/A" : req.body.membershipExperationDate;
                const accountInfo = new AccountInfo({
                  _id: new mongoose.Types.ObjectId(),
                  email: email,
                  buisnessName: req.body.buisnessName,
                  password: hashedPass,
                  city: req.body.city,
                  phoneNumber: req.body.phoneNumber,
                  yourPick: yourPick,
                  loggedInKey: loggedInKey,
                  couponIds: [],
                  couponsCurrentlyClaimed: 0,
                  usedCoupons:[],
                  couponCodes:[],
                  membershipExperationDate: membershipExperationDate,
                  ip: ip
                })
                await accountInfo.save()
                .catch(err => console.log(err))
                res.json({
                  loggedInKey:loggedInKey,
                  membershipExperationDate: membershipExperationDate
                });
              } else res.json({resp:'Your email is not valid!'});
              if(yourPick === ' Customer') {
                const successfulSignup = () => console.log("Successful Signup!");
                const chargeData = {
                  description: req.body.description,
                  source: req.body.source,
                  currency: req.body.currency,
                  amount: req.body.amount
                }
                stripe.charges.create(chargeData, successfulSignup());
              }
            } else res.json({resp:'You need to select if you are a buisness owner or a customer!'});
        } else res.json({resp:'You need to fill out all fields!'});
      } else res.json({resp:'Email address is taken!'});
    } else res.json({resp:'Wrong number, please try again!'});
  }
});

app.post('/api/phoneTest', async (req, res) => {
  const randomNumber = Math.floor(Math.random()*90000) + 10000;
  redisHelper.set(req.body.phoneNumber, randomNumber, 60*3) // 3 minutes
  try {
    client.messages
    .create({from: '+13124108678', body: 'Your Security code is: '+randomNumber, to: req.body.phoneNumber})
    .then(message => res.json({success:true}))
    .done();
  } catch (error) {
    res.json({success:false})
  }
})
app.post('/api/phoneTestValidateNumber', async (req, res) => {
  redisHelper.get(req.body.phoneNumber, compareRandomNumber) // 3 minutes
  function compareRandomNumber(randomNumber){
    if (randomNumber === Number(req.body.randomNumber)) res.json({success:true})
    else res.json({success:false})
  }
})

app.post('/api/updateAccount', async (req, res) => {
  //!todo, flush out updateAccount api
  const email = req.body.email;
  const loggedInKey = req.body.loggedInKey;
  const ip = req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);
  const outcome = await AccountInfo.find({'email' : email, "ip": ip, "loggedInKey":loggedInKey}).limit(1)
  if (outcome.length === 1) {
    if (req.body.phoneNumber) {
      await AccountInfo.updateOne(
        { "_id" : outcome[0]._id }, 
        { "$set" : { phoneNumber: req.body.phoneNumber } }, 
        { "upsert" : false } 
      );
    }
    if (req.body.buisnessName) {
      await AccountInfo.updateOne(
        { "_id" : outcome[0]._id }, 
        { "$set" : { buisnessName: req.body.buisnessName } }, 
        { "upsert" : false } 
      );
    }
    if (req.body.city) {
      await AccountInfo.updateOne(
        { "_id" : outcome[0]._id }, 
        { "$set" : { city: req.body.city } }, 
        { "upsert" : false } 
      );
    }
    if (req.body.oldPassword !== req.body.newPassword) {
      if(bcrypt.compareSync(req.body.oldPassword, outcome[0].password)) {
        res.json({response: "Updated Account!"})
        const hashedPass = await bcrypt.hashSync(req.body.newPassword, 10);
        await AccountInfo.updateOne(
          { "_id" : outcome[0]._id }, 
          { "$set" : { password: hashedPass } }, 
          { "upsert" : false } 
        );
      } else res.json({response: "Failed To Update Password"}) 
    }
  } else res.json({response: "Failed to update"})
});

app.post('/api/signin', async (req, res) => {
  const email = req.body.email;
  const outcome = await AccountInfo.find({'email' : email}).limit(1)
  if(outcome[0] && bcrypt.compareSync(req.body.password, outcome[0].password)) {
    const loginStringBase = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const loggedInKey = outcome[0].yourPick === " Customer" ? loginStringBase + ":c" : loginStringBase + ":b"
    outcome[0].yourPick === " Customer" ? res.json({loggedInKey: loggedInKey, membershipExperationDate: outcome[0].membershipExperationDate, couponsCurrentlyClaimed: outcome[0].couponsCurrentlyClaimed}) : res.json({loggedInKey: loggedInKey});
    await AccountInfo.updateOne(
      { "_id" : outcome[0]._id }, 
      { "$set" : { "ip" : req.connection.remoteAddress.replace('::ffff:', '')}, loggedInKey:loggedInKey }, 
      { "upsert" : false } 
    );
  } else res.json({response: "Invalid login"});
});

app.post(`/api/signout`, async(req, res) => {
  const email = req.body.email;
  const loggedInKey = req.body.loggedInKey;
  const ip = req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);
  const outcome = await AccountInfo.find({'email' : email, "ip":ip, "loggedInKey": loggedInKey.replace('"', '').replace('"', '') }).limit(1)
  if (outcome.length > 0) {
    if(outcome[0].loggedInKey === loggedInKey) {
      res.json({response:"Logout Successful"})
      await AccountInfo.updateOne(
        { "_id" : outcome[0]._id }, 
        { "$set" : { "ip" : ''}, loggedInKey:'' }, 
        { "upsert" : false } 
      );
    } else res.json({response:"Logout Failed"})
  } else res.json({response:"Logout Failed"})
})

app.post(`/api/uploadCoupons`, async(req, res) => {
    const ip = req.headers['x-forwarded-for'] || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);
    const loggedInKey = req.body.loggedInKey;
    const outcome = await AccountInfo.find({'email':req.body.email, "loggedInKey": loggedInKey, "ip": ip })
    if (outcome[0].yourPick !== ' Buisness Owner') res.json({response: "Only Buisness Owners can create coupons!"});
    else if(outcome[0].loggedInKey === loggedInKey && outcome[0].ip === ip) {
      const amountCoupons = req.body.amountCoupons;
      let couponCodes = [];
      let i = 0
      for(; i < amountCoupons; i++) couponCodes.push(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)+':a');
      const saveCoupon = async () => {
        const mongodbID = new mongoose.Types.ObjectId();
        const coupon = new Coupon({
          _id: mongodbID,
          title: req.body.title,
          address: req.body.address,
          city: req.body.city.toLowerCase(),
          amountCoupons: amountCoupons,
          currentPrice: req.body.currentPrice,
          discountedPrice: req.body.discountedPrice,
          category: req.body.category,
          textarea: req.body.textarea,
          base64image: req.body.imagePreviewUrl,
          superCoupon: req.body.superCoupon,
          couponCodes: couponCodes,
          couponStillValid: true,
          latitude: req.body.latitude,
          longitude: req.body.longitude
        })
        const successfulSignup = () => console.log("Successful Signup!");
        const chargeData = {
          description: req.body.description,
          source: req.body.source,
          currency: req.body.currency,
          amount: req.body.amount
        }
        stripe.charges.create(chargeData, successfulSignup());
        res.json({response: 'Coupon Created'})
        // pushing the value seemed to a new array seemed to not work so I had to do this hack.
        const arr = [...outcome[0].couponIds, mongodbID]
        await AccountInfo.updateOne(
          { "_id" : outcome[0]._id },
          { "$set" : { "ip" : ip}, "couponIds": arr}, 
          { "upsert" : false } 
        );
        await coupon.save()
          .catch(err => console.log(err))
      }
      saveCoupon();
  } else res.json({response: "You are not logged in!"});
})

app.get('/api/getSponseredCoupons/:city/:pageNumber', async (req, res) => {
  let coupons;
  const cityUserIsIn = req.params.city.toLowerCase().replace(/\"/g,"");
  const pageNumber = req.params.pageNumber;
  redisHelper.get(`${cityUserIsIn}/${pageNumber}`, getCachedCoupons)
  async function getCachedCoupons (data) {
    if(!data) {
      if(cityUserIsIn) {
        coupons = await Coupon.find({city : cityUserIsIn, superCoupon: "Let's go super", couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length > 0 ) res.json({ coupons: cleanCoupons(coupons) });
        else {
          coupons = await Coupon.find({city : cityUserIsIn, superCoupon: "No Thanks", couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length > 0 ) res.json({ coupons: cleanCoupons(coupons) });
          else res.json({ coupons: 'No coupons were found near you. Try searching manually' }); 
        }
        redisHelper.set(`${cityUserIsIn}/${pageNumber}`, coupons, 60*30)
      }
      else {
        coupons = await Coupon.find({superCoupon: "Let's go super", couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length > 0 ) res.json({ coupons: cleanCoupons(coupons) });
        else {
          coupons = await Coupon.find({superCoupon: "No Thanks", couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
          if (coupons.length > 0 ) res.json({ coupons: cleanCoupons(coupons) });
          else res.json({ coupons: 'No coupons were found near you. Try searching manually' });
        }
        redisHelper.set(`${cityUserIsIn}/${pageNumber}`, coupons, 60*30)
      }
    } else if (data.length === 0) res.json({ coupons: 'No coupons were found near you. Try searching manually' });
    else res.json({ coupons: data });
  }
});

app.post('/api/getYourCoupons', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || 
  req.connection.remoteAddress || 
  req.socket.remoteAddress ||
  (req.connection.socket ? req.connection.socket.remoteAddress : null);
  const loggedInKey = req.body.loggedInKey;
  const email = req.body.email;
  let coupons;
  const outcome = await AccountInfo.find({'email':email, "ip": ip, "loggedInKey": loggedInKey}).limit(1);
  if(outcome[0] && outcome[0].couponCodes.length > 0 && outcome[0].loggedInKey === loggedInKey && outcome[0].ip === ip) {
    const searchIDS = searchableMongoIDs(outcome[0].couponIds)
    coupons = await Coupon.find({
      '_id': { $in: searchIDS}
    })
    if (coupons.length === 0 ) {
      coupons = "No coupons found.";
      res.json({ coupons: cleanCoupons(coupons) });
    } else {
      // console.log(outcome[0].couponCodes)
      coupons = associateCouponCodeByID(outcome[0].couponCodes, coupons)
      res.json({ coupons: cleanCoupons(coupons) });
    }
  }
  else if (outcome[0].couponCodes.length === 0) res.json({response: "You are not logged in!"});
  else res.json({response: "No coupons found."});
});

app.get('/search', async (req, res) => {
  // Goodluck!
  let coupons;
  const city = (req.query.city) ? req.query.city.toLowerCase() : null;
  const zip = (req.query.zip) ? req.query.zip : null;
  const category = (req.query.category) ? req.query.category : null;
  const keyword = (req.query.keyword) ? req.query.keyword : null;
  const regex = (keyword) ? new RegExp(escapeRegex(keyword), 'gi') : null;
  const pageNumber = req.query.pageNumber;
  if(city && zip && category && keyword) {
    redisHelper.get(`${city}/${zip}/${keyword}`, getCachedCouponsAll)
    async function getCachedCouponsAll (data) {
      if(!data) {
        coupons = await Coupon.find({'city' : city, 'zip' : zip, 'category' : category, "textarea": regex, couponStillValid: true})
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city, 'zip' : zip, 'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city, 'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        res.json({ coupons: cleanCoupons(coupons) });
        redisHelper.set(`${city}/${zip}/${keyword}/${pageNumber}`, coupons, 60*30)
      }
      else return res.json({coupons: data});
    }
  }
  else if(city && zip) {
    redisHelper.get(`${city}/${zip}/${pageNumber}`, getCachedCouponsCityZip)
    async function getCachedCouponsCityZip (data) {
      if(!data) {
        coupons = await Coupon.find({'city' : city, 'zip' : zip, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({ coupons: cleanCoupons(coupons) });
        redisHelper.set(`${city}/${zip}/${pageNumber}`, coupons, 60*30)
      }
      else return res.json({coupons: data});
    }
  }
  else if(keyword && zip) {
    redisHelper.get(`${keyword}/${zip}/${pageNumber}`, getCachedCouponsKeywordZip)
    async function getCachedCouponsKeywordZip (data) {
      if(!data) {
        coupons = await Coupon.find({'zip' : city, 'textarea' : keyword, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'zip' : zip, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'textarea' : keyword, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({ coupons: cleanCoupons(coupons) });
        redisHelper.set(`${keyword}/${zip}/${pageNumber}`, coupons, 60*30)
      }
      else return res.json({coupons: data});
    }
  }
  else if(city && category) {
    redisHelper.get(`${city}/${category}/${pageNumber}`, getCachedCouponsCityCategory)
    async function getCachedCouponsCityCategory(data) {
      if(!data) {
        coupons = await Coupon.find({'city' : city, 'category' : category, couponStillValid: true})
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({ coupons: cleanCoupons(coupons) });
        redisHelper.set(`${city}/${category}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(city && keyword) {
    redisHelper.get(`${city}/${keyword}/${pageNumber}`, getCachedCouponsCityKeyword)
    async function getCachedCouponsCityKeyword (data) {
      if(!data) {
        coupons = await Coupon.find({'city' : city, 'textarea' : keyword, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'textarea' : keyword, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({ coupons: cleanCoupons(coupons) });
        redisHelper.set(`${city}/${keyword}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(category && zip) {
    redisHelper.get(`${category}/${zip}/${pageNumber}`, getCachedCouponsCategoryZip)
    async function getCachedCouponsCategoryZip (data) {
      if(!data) {
        coupons = await Coupon.find({'zip' : zip, 'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'zip' : zip, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({ coupons: cleanCoupons(coupons) });
        redisHelper.set(`${category}/${zip}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(category && keyword) {
    redisHelper.get(`${category}/${keyword}/${pageNumber}`, getCachedCouponsCategoryKeyword)
    async function getCachedCouponsCategoryKeyword (data) {
      if(!data) {
        coupons = await Coupon.find({'zip' : zip, 'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'textarea' : keyword, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({ coupons: cleanCoupons(coupons) });
        redisHelper.set(`${category}/${keyword}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(category && city) {
    redisHelper.get(`${category}/${city}/${pageNumber}`, getCachedCouponsCategoryCity)
    async function getCachedCouponsCategoryCity (data) {
      if(!data) {
        coupons = await Coupon.find({'city' : city, 'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({ coupons: cleanCoupons(coupons) });
        redisHelper.set(`${category}/${city}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(category) {
    redisHelper.get(`category:${category}/${pageNumber}`, getCachedCouponsCategory)
    async function getCachedCouponsCategory (data) {
      if(!data) {
        coupons = await Coupon.find({'category' : category, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({ coupons: cleanCoupons(coupons) });
        redisHelper.set(`category:${category}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(city) {
    redisHelper.get(`city:${city}/${pageNumber}`, getCachedCouponsCity)
    async function getCachedCouponsCity (data) {
      if(!data) {
        coupons = await Coupon.find({'city' : city, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({ coupons: cleanCoupons(coupons) });
        redisHelper.set(`city:${city}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(zip) {
    redisHelper.get(`zip:${zip}/${pageNumber}`, getCachedCouponsZip)
    async function getCachedCouponsZip (data) {
      if(!data) {
        coupons = await Coupon.find({'zip' : zip, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({ coupons: cleanCoupons(coupons) });
        redisHelper.set(`zip:${zip}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(keyword) {
    redisHelper.get(`keyword:${keyword}/${pageNumber}`, getCachedCouponsKeyword)
    async function getCachedCouponsKeyword (data) {
      if(!data) {
        coupons = await Coupon.find({'textarea' : regex, couponStillValid: true}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({ coupons: cleanCoupons(coupons) });
        redisHelper.set(`keyword:${keyword}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
});

app.post(`/api/getCoupon`, async(req, res) => {
  const loggedInKey = req.body.loggedInKey;
  if (!loggedInKey) res.json({response: "You need to be logged in and have a valid subscription in order to claim coupons!"});
  else {
    const _id = req.body._id;
    const ip = req.headers['x-forwarded-for'] || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);
    const outcome = await AccountInfo.find({'email':req.body.email, 'ip': ip, loggedInKey: loggedInKey }).limit(1)
    if (outcome) {
      if (outcome[0].yourPick !== ' Customer') res.json({response: "Only customers with a valid subscription can claim coupons!"});
      else {
        // console.log(outcome[0].couponsCurrentlyClaimed)
        // if (outcome[0].couponsCurrentlyClaimed < 5) {
          const coupon = await Coupon.find({'_id':_id }).limit(1);
          let couponCode;
          let couponStillValid = true;
          let i = 0;
          const iMax = coupon[0].couponCodes.length;
          for (;i < iMax; i++) {
            if(coupon[0].couponCodes[i].substr(-1) === "a") {
              couponCode = coupon[0].couponCodes[i].substring(0, coupon[0].couponCodes[i].length - 1) + "c";
              break;
            }
          }
          if (coupon[0].amountCoupons - 1 <= 0) couponStillValid = false;
          const arrIds = [...outcome[0].couponIds, _id];
          const arrCouponCodes = [...outcome[0].couponCodes, {_id: _id, couponCode: couponCode}]
          // console.log(arrIds, "arrids")
          // console.log(arrCouponCodes, "arrCouponCodes")
          if(couponCode) {
            res.json({response: "Coupon Claimed!"});
            await AccountInfo.updateOne(
              { "_id" : outcome[0]._id }, 
              { "$set" : { 
                "couponIds": arrIds}, //
                "couponsCurrentlyClaimed": outcome[0].couponsCurrentlyClaimed + 1 ,
                "couponCodes": arrCouponCodes
              }, 
              { "upsert" : false } 
            );
            // console.log(coupon[0].couponCodes)
            const updatedCodes = claimCode(coupon[0].couponCodes)
            // console.log(updatedCodes, "updatedCodes")
            await Coupon.updateOne(
              { "_id" : req.body._id },
              { "$set" : { 
                "couponCodes": updatedCodes},
                "amountCoupons": (coupon[0].amountCoupons - 1),
                "couponStillValid": couponStillValid
              }, 
              { "upsert" : false } 
            );
            // const coupontwo = await Coupon.find({'_id':req.body._id }).limit(1);
            // console.log(JSON.stringify(coupontwo))
          } else res.json({response: "These coupons are no longer available. Please try another coupon."});
        // } else res.json({response: "You have too many coupons! Please use a coupon or discard one of your current coupons."});
      }
    }
  else res.json({response: "You need to be logged in and have a valid subscription in order to claim coupons!"});
  }
})

const port = 8080;

app.listen(port, () => `Server running on port ${port}`);
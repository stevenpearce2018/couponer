const express = require('express');
const app = express();
const redisHelper = require('./redisHelper')
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
app.use(bodyParser.json({limit:'50mb'}))
app.use(bodyParser.urlencoded({ extended: true, limit:'50mb' }))
const accountSid = 'AC6c753b616e86fd0c2721fbd3cfb19428'; // !todo, dev keys, change for production
const authToken = '2c5d015a77ebd80650410099823f3c5d';
const client = require('twilio')(accountSid, authToken);
const Coupon = require('./models/coupons')
const AccountInfo = require('./models/accountInfo')
const mongoose = require('mongoose')
const request = require('request');
const stripe = require('./stripe');
const nodemailer = require('nodemailer');
//!todo, change recaptcha key and put in .env
const recaptchaSecretKey = "6Lf9D3QUAAAAAHfnc-VISWptFohHPV2hyfee9_98"
const db = require('./config/db')
const QRCode = require('qrcode');

const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

const generateQR = async text => {
  try {
    return await QRCode.toDataURL(text)
  } catch (err) {
    console.error("Failed to make qrcode: " + err)
  }
}
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
const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
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
  mongoose.connect(db).then(console.log('Connected to mongoDB'));
} catch (error) {
  console.log(error, "Failed to connect to mongoDB. :(")
}
const postStripeCharge = res => (stripeErr, stripeRes) => {
  if (stripeErr) res.status(500).send({ error: stripeErr });
  else res.status(200).send({ success: stripeRes });
}

const didRecaptchaPass = async(req) => {
  const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${req.body.recaptchaToken}&remoteip=${req.connection.remoteAddress}`;
  await request(verifyUrl, (err, response, body) => {
    body = JSON.parse(body);
    if(body.success !== undefined && !body.success) return false;
    else return true;
  })
}

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
  redisHelper.get(req.body.phoneNumber, compareRandomNumber)
  async function compareRandomNumber(randomNumber){
    if (randomNumber === req.body.randomNumber) {
      const yourPick = req.body.yourPick
      const ip = req.headers['x-forwarded-for'] || 
        req.connection.remoteAddress || 
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
      const loggedInKey = req.body.buisnessName ? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "b" : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + "c";
      const result = await AccountInfo.find({ 'email': req.body.email })
        if (result.length === 0) {
          if (req.body.email && req.body.password && req.body.phoneNumber && yourPick && ip) {
            if (yourPick === ' Buisness Owner' && req.body.buisnessName || yourPick === ' Customer' && req.body.membershipExperationDate ) {
              const hashedPass = await bcrypt.hashSync(req.body.password, 10);
              const email = req.body.email;
              if(validateEmail(email)){
                const membershipExperationDate = req.body.buisnessName ? req.body.buisnessName : "N/A" ;
                const accountInfo = new AccountInfo({
                  _id: new mongoose.Types.ObjectId(),
                  email: email,
                  buisnessName: req.body.buisnessName,
                  password: hashedPass,
                  phoneNumber: req.body.phoneNumber,
                  yourPick: req.body.yourPick,
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
                redisHelper.set(loggedInKey, loggedInKey)
                res.json({
                  loggedInKey:loggedInKey
                });
              } else res.json({resp:'Your email is not valid!'});
              if(yourPick === ' Customer') {
                console.log("in final stage")
                const successfulSignup = () => {
                  console.log("Successful Signup!")
                }
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
  console.log(JSON.stringify(req.body))
  const email = req.body.email;
  const loggedInKey = req.body.loggedInKey;
  const outcome = await AccountInfo.find({'email' : email, "ip": ip, "loggedInKey":loggedInKey}).limit(1)
  const ip = req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);
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
  if(bcrypt.compareSync(req.body.password, outcome[0].password)) {
    const loginStringBase = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const loggedInKey = outcome[0].yourPick === " Customer" ? loginStringBase + ":c" : loginStringBase + ":b"
    res.json({loggedInKey: loggedInKey});
    await AccountInfo.updateOne(
      { "_id" : outcome[0]._id }, 
      { "$set" : { "ip" : req.connection.remoteAddress.replace('::ffff:', '')}, loggedInKey:loggedInKey }, 
      { "upsert" : false } 
    );
  }
});

app.post(`/api/signout`, async(req, res) => {
  const email = req.body.email;
  const loggedInKey = req.body.loggedInKey;
  const ip = req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);
  const outcome = await AccountInfo.find({'email' : email }).limit(1)
  if (outcome.length !== 0) {
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
      if(outcome[0].loggedInKey === loggedInKey && outcome[0].ip === ip) {
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
        res.json({response: 'Coupon Created'})
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
        coupons = await Coupon.find({city : cityUserIsIn}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length > 0 ) res.json({ coupons: coupons });
        else res.json({ coupons: 'No coupons were found near you. Try searching manually' });
        redisHelper.set(`${cityUserIsIn}/${pageNumber}`, coupons, 60*30)
      }
      else {
        coupons = await Coupon.find().skip((pageNumber-1)*20).limit(20)
        if (coupons.length > 0 ) res.json({ coupons: coupons });
        else res.json({ coupons: 'No coupons were found near you. Try searching manually' });
        redisHelper.set(`${cityUserIsIn}/${pageNumber}`, coupons, 60*30)
      }
    } else res.json({ coupons: data });
  }
});

app.post('/api/getYourCoupons', async (req, res) => {
  let coupons;
  if(city && zip && category) coupons = await Coupon.find({'city' : city, 'zip' : zip, 'category' : category})
  res.json({coupons: coupons});
});

app.post('/api/searchCoupons/:pageNumber', async (req, res) => {
  // Goodluck!
  // !todo, this should be a get request.
  let coupons;
  const city = req.body.city.toLowerCase()
  const zip = req.body.zip
  const category = req.body.category
  const keyword = req.body.keyword
  const regex = new RegExp(escapeRegex(keyword), 'gi');
  const pageNumber = req.params.pageNumber;
  if(city && zip && category && keyword) {
    redisHelper.get(`${city}/${zip}/${keyword}`, getCachedCouponsAll)
    async function getCachedCouponsAll (data) {
      if(!data) {
        coupons = await Coupon.find({'city' : city, 'zip' : zip, 'category' : category, "textarea": regex})
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city, 'zip' : zip, 'category' : category}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city, 'category' : category}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city}).skip((pageNumber-1)*20).limit(20)
        res.json({coupons: coupons});
        redisHelper.set(`${city}/${zip}/${keyword}/${pageNumber}`, coupons, 60*30)
      }
      else return res.json({coupons: data});
    }
  }
  else if(city && zip) {
    redisHelper.get(`${city}/${zip}/${pageNumber}`, getCachedCouponsCityZip)
    async function getCachedCouponsCityZip (data) {
      if(!data) {
        coupons = await Coupon.find({'city' : city, 'zip' : zip}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({coupons: coupons});
        redisHelper.set(`${city}/${zip}/${pageNumber}`, coupons, 60*30)
      }
      else return res.json({coupons: data});
    }
  }
  else if(keyword && zip) {
    redisHelper.get(`${keyword}/${zip}/${pageNumber}`, getCachedCouponsKeywordZip)
    async function getCachedCouponsKeywordZip (data) {
      if(!data) {
        coupons = await Coupon.find({'zip' : city, 'textarea' : keyword}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'zip' : zip}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'textarea' : keyword}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({coupons: coupons});
        redisHelper.set(`${keyword}/${zip}/${pageNumber}`, coupons, 60*30)
      }
      else return res.json({coupons: data});
    }
  }
  else if(city && category) {
    redisHelper.get(`${city}/${category}/${pageNumber}`, getCachedCouponsCityCategory)
    async function getCachedCouponsCityCategory(data) {
      if(!data) {
        coupons = await Coupon.find({'city' : city, 'category' : category})
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'category' : category}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({coupons: coupons});
        redisHelper.set(`${city}/${category}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(city && keyword) {
    redisHelper.get(`${city}/${keyword}/${pageNumber}`, getCachedCouponsCityKeyword)
    async function getCachedCouponsCityKeyword (data) {
      if(!data) {
        coupons = await Coupon.find({'city' : city, 'textarea' : keyword}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'textarea' : keyword}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({coupons: coupons});
        redisHelper.set(`${city}/${keyword}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(category && zip) {
    redisHelper.get(`${category}/${zip}/${pageNumber}`, getCachedCouponsCategoryZip)
    async function getCachedCouponsCategoryZip (data) {
      if(!data) {
        coupons = await Coupon.find({'zip' : zip, 'category' : category}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'zip' : zip}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'category' : category}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({coupons: coupons});
        redisHelper.set(`${category}/${zip}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(category && keyword) {
    redisHelper.get(`${category}/${keyword}/${pageNumber}`, getCachedCouponsCategoryKeyword)
    async function getCachedCouponsCategoryKeyword (data) {
      if(!data) {
        coupons = await Coupon.find({'zip' : zip, 'category' : category}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'category' : category}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'textarea' : keyword}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({coupons: coupons});
        redisHelper.set(`${category}/${keyword}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(category && city) {
    redisHelper.get(`${category}/${city}/${pageNumber}`, getCachedCouponsCategoryCity)
    async function getCachedCouponsCategoryCity (data) {
      if(!data) {
        coupons = await Coupon.find({'city' : city, 'category' : category}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'city' : city}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = await Coupon.find({'category' : category}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({coupons: coupons});
        redisHelper.set(`${category}/${city}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(category) {
    redisHelper.get(`category:${category}/${pageNumber}`, getCachedCouponsCategory)
    async function getCachedCouponsCategory (data) {
      if(!data) {
        coupons = await Coupon.find({'category' : category}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({coupons: coupons});
        redisHelper.set(`category:${category}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(city) {
    redisHelper.get(`city:${city}/${pageNumber}`, getCachedCouponsCity)
    async function getCachedCouponsCity (data) {
      if(!data) {
        coupons = await Coupon.find({'city' : city}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({coupons: coupons});
        redisHelper.set(`city:${city}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(zip) {
    redisHelper.get(`zip:${zip}/${pageNumber}`, getCachedCouponsZip)
    async function getCachedCouponsZip (data) {
      if(!data) {
        coupons = await Coupon.find({'zip' : zip}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({coupons: coupons});
        redisHelper.set(`zip:${zip}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
  else if(keyword) {
    redisHelper.get(`keyword:${keyword}/${pageNumber}`, getCachedCouponsKeyword)
    async function getCachedCouponsKeyword (data) {
      if(!data) {
        coupons = await Coupon.find({'textarea' : regex}).skip((pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({coupons: coupons});
        redisHelper.set(`keyword:${keyword}/${pageNumber}`, coupons, 60*30);
      }
      else return res.json({coupons: data});
    }
  }
});

app.post(`/api/getAccountCoupons`, async(req, res) => {
  console.log(JSON.stringify(req.body))
  res.json({response:"hello"})
})

app.post(`/api/getCoupon`, async(req, res) => {
  const loggedInKey = req.body.loggedInKey;
  if (!loggedInKey) res.json({response: "You need to be logged in and have a valid subscription in order to claim coupons!"});
  const ip = req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);
  const outcome = await AccountInfo.find({'email':req.body.email })
  if (outcome) {
    if (outcome.yourPick !== ' Customer') res.json({response: "Only customers with a valid subscription can claim coupons!"});
    else {
      if (outcome.couponsCurrentlyClaimed < 5) {
        res.json({response: "Coupon Claimed!"});
        const coupon = await Coupon.find({'id':outcome[0]._id });
        let couponCode;
        for (let i = 0; i < coupon.length; i++) {
          if(coupon[i].substr(-1) === "a") {
            couponCode = coupon[i];
            break;
          }
        }
        await AccountInfo.updateOne(
          { "_id" : outcome[0]._id }, 
          { "$set" : { 
            couponIds: outcome[0].couponIds.push(req.body._id)},
            couponsCurrentlyClaimed: outcome[0].couponsCurrentlyClaimed+1,
            couponCodes: outcome[0].push(couponCode)
          }, 
          { "upsert" : false } 
        );
      } else res.json({response: "You have too many coupons! Please use a coupon or discard one of your current coupons."});
    }
  }
  else res.json({response: "You need to be logged in and have a valid subscription in order to claim coupons!"});
})

const port = 4000;

app.listen(port, () => `Server running on port ${port}`);
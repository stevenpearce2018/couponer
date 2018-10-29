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

const fuzzySearchRegex = text => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function escapeRegex(text) {
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

// !todo, modularize this and get it to work
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
  // let recaptchaPassed = false
  // const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${req.body.recaptchaToken}&remoteip=${req.connection.remoteAddress}`;
  // await request(verifyUrl, (err, response, body) => {
  //   if (body === undefined) recaptchaPassed = body.success;
  //   else {
  //     body = JSON.parse(body);
  //     if(body.success !== undefined && !body.success) recaptchaPassed = body.success;
  //     else recaptchaPassed = body.success;
  //   }
  // })
  // if (recaptchaPassed === true) {
    const mailOptions = {
      from: 'sender@email.com', // sender address
      to: email, // list of receivers
      subject: 'Recover Account', // Subject line
      html: '<p>Welcome to UnlimitedCouponer</p>'// plain text body
    };
    res.json({success:true})
  // } else res.json({success:false})
});

app.post('/api/signupCustomer', async(req, res) => {
  console.log(JSON.stringify(req.body))
  let passedNumberCheck = false;
  redisHelper.get(req.body.phoneNumber, compareRandomNumber)
  async function compareRandomNumber(randomNumber){
    if (randomNumber === req.body.randomNumber) passedNumberCheck = true;
    else passedNumberCheck = false;
    if (passedNumberCheck === true) {
      // let recaptchaPassed = false
      // const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${req.body.recaptchaToken}&remoteip=${req.connection.remoteAddress}`;
      // await request(verifyUrl, async(err, response, body) => {
        // if(!body) recaptchaPassed = body.success;
        // else {
        //   body = JSON.parse(body);
        //   recaptchaPassed = body.success;
        //   if (recaptchaPassed === true) {
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
          // } else res.json({resp:'Recaptcha failed! Try reloading the page.'});
        // }
      // })
    } else res.json({resp:'Wrong number, please try again!'});
  }
});

app.post('/api/phoneTest', async (req, res) => {
  // let recaptchaPassed = false;
  // const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${req.body.recaptchaToken}&remoteip=${req.connection.remoteAddress}`;
  // await request(verifyUrl, (err, response, body) => {
  //   if(!body) recaptchaPassed = body.success;
  //   else {
  //     body = JSON.parse(body);
  //     recaptchaPassed = body.success;
  //     if (recaptchaPassed) {
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
  //     } else res.json({success:false})
  //   }
  // })
})
app.post('/api/phoneTestValidateNumber', async (req, res) => {
  // let recaptchaPassed = false
  // const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${req.body.recaptchaToken}&remoteip=${req.connection.remoteAddress}`;
  // await request(verifyUrl, (err, response, body) => {
  //   if (!body) res.json({recaptcha: 'invalid recaptcha'})
  //   else {
  //     body = JSON.parse(body);
  //     recaptchaPassed = body.success;
  //     if (recaptchaPassed) {
        redisHelper.get(req.body.phoneNumber, compareRandomNumber) // 3 minutes
        function compareRandomNumber(randomNumber){
          if (randomNumber === Number(req.body.randomNumber)) res.json({success:true})
          else res.json({success:false})
        }
  //     } else res.json({success:false})
  //   }
  // })
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
  } else res.json({response: "Failed to update"})
});

app.post('/api/signin', async (req, res) => {
  // let recaptchaPassed = false
  // const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${req.body.recaptchaToken}&remoteip=${req.connection.remoteAddress}`;
  // await request(verifyUrl, async(err, response, body) => {
  //   if (!body) res.json({recaptcha: 'invalid recaptcha'})
  //   else {
  //     body = JSON.parse(body);
  //     recaptchaPassed = body.success;
  //     if (recaptchaPassed === false) res.json({recaptcha: 'invalid recaptcha'})
  //     else {
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
  //       else res.json({loggedInKey: 'invalid login'})
  //     }
  //   }
  // })
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

app.post(`/api/uploadCoupons`, async(req, res) => { // req = request
  // const lengthInDays = req.body.length.replace(/\D/g,'');
  // let recaptchaPassed = false
  // const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${req.body.recaptchaToken}&remoteip=${req.connection.remoteAddress}`;
  // await request(verifyUrl, async(err, response, body) => {
  //   if (!body) res.json({coupons: 'invalid recaptcha'})
  //   else {
  //     body = JSON.parse(body);
  //     recaptchaPassed = body.success;
  //     if (recaptchaPassed === false) res.json({response: 'invalid recaptcha'})
  //     else {
          const ip = req.headers['x-forwarded-for'] || 
            req.connection.remoteAddress || 
            req.socket.remoteAddress ||
            (req.connection.socket ? req.connection.socket.remoteAddress : null);
          const loggedInKey = req.body.loggedInKey;
          const outcome = await AccountInfo.find({'email':req.body.email, "loggedInKey": loggedInKey, "ip": ip })
          // if (outcome) {
          //   // !todo, check if membership is still valid below
          // } else {
            if (outcome.yourPick !== ' Buisness Owner') res.json({response: "Only Buisness Owners can create coupons!"});
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
              res.json({response: 'Coupon Created'})
          } else res.json({response: "You are not logged in!"});
        // }
      // }
    // }
  // })
})

app.get('/api/getSponseredCoupons/:city/:pageNumber', async (req, res) => {
  let coupons;
  const cityUserIsIn = req.params.city.toLowerCase().replace(/\"/g,"");
  if(cityUserIsIn) {
    coupons = await Coupon.find({city : cityUserIsIn}).skip((req.param.pageNumber-1)*20).limit(20)
    if (coupons.length > 0 ) res.json({ coupons: coupons });
    else res.json({ coupons: 'No coupons were found near you. Try searching manually' });
  }
  else {
    coupons = await Coupon.find().skip((req.param.pageNumber-1)*20).limit(20)
    if (coupons.length > 0 ) res.json({ coupons });
    else res.json({ coupons: 'No coupons were found near you. Try searching manually' });
  }
});

app.post('/api/getYourCoupons', async (req, res) => {
  let coupons;
  if(city && zip && category) coupons = await Coupon.find({'city' : city, 'zip' : zip, 'category' : category})
  res.json({coupons: coupons});
});

app.post('/api/searchCoupons', async (req, res) => {
  // let recaptchaPassed = false
  // const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${req.body.recaptchaToken}&remoteip=${req.connection.remoteAddress}`;
  // await request(verifyUrl, async(err, response, body) => {
  //   if (!body) res.json({coupons: 'invalid recaptcha'})
  //   else {
  //     body = JSON.parse(body);
  //     recaptchaPassed = body.success;
  //     if (recaptchaPassed === false) res.json({coupons: 'invalid recaptcha'})
  //     else {
        let coupons;
        const city = req.body.city.toLowerCase()
        const zip = req.body.zip
        const category = req.body.category
        const keyword = req.body.keyword
        const regex = new RegExp(escapeRegex(keyword), 'gi');
        coupons = await Coupon.find({"textarea": regex})
        if(city && zip && category && keyword) {
          coupons = await Coupon.find({'city' : city, 'zip' : zip, 'category' : category, "textarea": regex})
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city, 'zip' : zip, 'category' : category}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city, 'category' : category}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city}).skip((req.body.pageNumber-1)*20).limit(20)
        }
        else if(city && zip) {
          coupons = await Coupon.find({'city' : city, 'zip' : zip}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city}).skip((req.body.pageNumber-1)*20).limit(20)
        }
        else if(keyword && zip) {
          coupons = await Coupon.find({'zip' : city, 'textarea' : keyword}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'zip' : zip}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'textarea' : keyword}).skip((req.body.pageNumber-1)*20).limit(20)
        }
        else if(city && category) {
          coupons = await Coupon.find({'city' : city, 'category' : category})
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'category' : category}).skip((req.body.pageNumber-1)*20).limit(20)
        }
        else if(city && keyword) {
          coupons = await Coupon.find({'city' : city, 'textarea' : keyword}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'textarea' : keyword}).skip((req.body.pageNumber-1)*20).limit(20)
        }
        else if(category && zip) {
          coupons = await Coupon.find({'zip' : zip, 'category' : category}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'zip' : zip}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'category' : category}).skip((req.body.pageNumber-1)*20).limit(20)
        }
        else if(category && keyword) {
          coupons = await Coupon.find({'zip' : zip, 'category' : category}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'category' : category}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'textarea' : keyword}).skip((req.body.pageNumber-1)*20).limit(20)
        }
        else if(category && city) {
          coupons = await Coupon.find({'city' : city, 'category' : category}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'city' : city}).skip((req.body.pageNumber-1)*20).limit(20)
          if (coupons.length === 0) coupons = await Coupon.find({'category' : category}).skip((req.body.pageNumber-1)*20).limit(20)
        }
        else if(category) coupons = await Coupon.find({'category' : category}).skip((req.body.pageNumber-1)*20).limit(20)
        else if(city) coupons = await Coupon.find({'city' : city}).skip((req.body.pageNumber-1)*20).limit(20)
        else if(zip) coupons = await Coupon.find({'zip' : zip}).skip((req.body.pageNumber-1)*20).limit(20)
        else if(keyword) coupons = await Coupon.find({'textarea' : regex}).skip((req.body.pageNumber-1)*20).limit(20)
        if (coupons.length === 0) coupons = "No coupons found."
        res.json({coupons: coupons});
      // }
  //   }
  // })
});


app.post(`/api/getCoupon`, async(req, res) => { // req = request
  const loggedInKey = req.body.loggedInKey;
  if (!loggedInKey) res.json({response: "You need to be logged in and have a valid subscription in order to claim coupons!"});
  const ip = req.headers['x-forwarded-for'] || 
  req.connection.remoteAddress || 
  req.socket.remoteAddress ||
  (req.connection.socket ? req.connection.socket.remoteAddress : null);
    const outcome = await AccountInfo.find({'email':req.body.email })
    if (outcome) {
      // !todo, check if membership is still valid below
      if (outcome.yourPick !== ' Customer') res.json({response: "Only customers with a valid subscription can claim coupons!"});
      else {
        if (outcome.couponsCurrentlyClaimed < 5) {
          res.json({response: "Coupon Claimed!"});-
          await AccountInfo.updateOne(
            { "_id" : outcome[0]._id }, 
            { "$set" : {couponIds:outcome[0].couponIds.push(req.body._id)}, couponsCurrentlyClaimed: outcome[0].couponsCurrentlyClaimed+1}, 
            { "upsert" : false } 
          );
        } else res.json({response: "You have too many coupons! Please use a coupon or discard one of your current coupons."});
      }
    }
    else res.json({response: "You need to be logged in and have a valid subscription in order to claim coupons!"});
})

const port = 4000;

app.listen(port, () => `Server running on port ${port}`);
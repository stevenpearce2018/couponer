require('dotenv').config()
const express = require('express');
const app = express();
const redisHelper = require('./redisHelper')
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const accountSid = process.env.ACCOUNT_SID; // !todo, change dev keys to prod keys
const authToken = process.env.AUTH_TOKEN;
const pass = process.env.PASS
const unlimtedcouponerEmail = process.env.EMAIL
const client = require('twilio')(accountSid, authToken);
const Coupon = require('./models/coupons')
const AccountInfo = require('./models/accountInfo')
const mongoose = require('mongoose')
const stripe = require('./stripe');
const nodemailer = require('nodemailer');
const searchableMongoIDs = require("./lib/searchableMongoIDs");
const claimCode = require("./lib/claimCode");
const escapeRegex = require("./lib/escapeRegex");
const generateQR = require("./lib/generateQR");
const validateEmail = require('./lib/validateEmail');
const associateCouponCodeByID = require('./lib/associateCouponCodeByID');
const cleanCoupons = require("./lib/cleanCoupons");
const handleAsync = require('async-error-handler');
const getIP = require('./lib/getIP');
const path = require("path")
const checkMembershipDate = require("./lib/checkMembershipDate");
const validateCouponForm = require("./lib/validateCouponForm");
const ObjectId = require('mongodb').ObjectId; 
const useCode = require("./lib/useCode");
const moment = require("moment");
const checkPasswordStrength = require('./lib/checkPasswordStrength');
app.use(express.static('dist'));
app.use(express.static(path.join(__dirname, "client", "build")))
app.use(bodyParser.json({limit:'50mb'}))
app.use(bodyParser.urlencoded({ extended: true, limit:'50mb' }))


app.post('/api/generateQR', handleAsync(async(req, res) => {
  try {
    client.messages
    .create({from: '+13124108678', mediaUrl: await generateQR("Hello world"), to: "+15614807156"})
    .then(message => res.json({success:true}))
    .done();
  } catch (error) {
    res.json({success:false})
  }
}));


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: unlimtedcouponerEmail,
    pass: pass
  }
});
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

app.post('/api/charge', handleAsync(async(req, res) => {
  stripe.charges.create(req.body, postStripeCharge(res));
}));
app.post('/api/recoverAccount', handleAsync(async(req, res) => {
  const email = req.body.recoveryEmail;
  // const phoneNumber = req.body.phoneNumber;
  const randomNumber = Math.floor(Math.random()*90000) + 10000;
  if(email) {
    // r = recoverAccount key
    // smaller the redis string better the performance
    redisHelper.set("r:"+email, randomNumber, 60*10) // 10 minutes
    const mailOptions = {
      from: "UnlimitedCouponer", // sender address
      to: email, // list of receivers
      subject: 'Recover Account', // Subject line
      html: `<p>Here is your random number ${randomNumber}, it will expire in 10 minutes.</p>
      <p>If you did not request this recovery please email us at unlimtedcouponer@gmail.com</p>`// plain text body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return console.log(error);
    });
    res.json({success:true})
  }
}));

app.post('/api/recoverAccountWithCode', handleAsync(async(req, res) => {
  const email = req.body.recoveryEmail;
  const randomNumber = req.body.randomNumber;
  const newPassword = req.body.newPassword;
  redisHelper.get("r:"+email, confirmRandomNumber)
  async function confirmRandomNumber(randomNumberFromRedis) {
    if (randomNumberFromRedis === randomNumber && checkPasswordStrength(newPassword)) { 
      res.json({success:true})
      const result = await AccountInfo.findOne({ 'email': email }) 
      const hashedPass = await bcrypt.hashSync(newPassword, 10);
      await AccountInfo.updateOne(
        { "_id" : result._id }, 
        { "$set" : { password: hashedPass } }, 
        { "upsert" : false } 
      );
    }
    else res.json({success:false})
  }
}));

app.post('/api/phoneTest', handleAsync(async (req, res) => {
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
}))
app.post('/api/phoneTestValidateNumber', handleAsync(async (req, res) => {
  redisHelper.get(req.body.phoneNumber, compareRandomNumber) // 3 minutes
  function compareRandomNumber(randomNumber){
    if (randomNumber === Number(req.body.randomNumber)) res.json({success:true})
    else res.json({success:false})
  }
}))


app.post('/api/signupCustomer', handleAsync(async(req, res) => {
  redisHelper.get(req.body.phoneNumber, compareRandomNumber)
  async function compareRandomNumber(randomNumber){
    if (randomNumber === req.body.randomNumber) {
      const yourPick = req.body.yourPick;
      const password = req.body.password;
      const phoneNumber = req.body.phoneNumber;
      const ip = getIP(req)
      const loggedInKey = req.body.buisnessName ? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ":b" : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + ":c";
      const result = await AccountInfo.find({ 'email': req.body.email })
        if (result.length === 0) {
          if (validateEmail(req.body.email) && req.body.city && req.body.email && password && checkPasswordStrength(password) && phoneNumber && yourPick && ip) {
            if (yourPick === ' Buisness Owner' && req.body.buisnessName || yourPick === ' Customer' && req.body.membershipExperationDate ) {
              const hashedPass = await bcrypt.hashSync(password, 10);
              const email = req.body.email;
              let today = new Date();
              let dd = today.getDate();
              let mm = today.getMonth()+1; //January is 0!
              const yyyy = today.getFullYear();
              if(dd<10) dd = '0'+dd
              if(mm<10) mm = '0'+mm
              today = yyyy + '-' + mm + '-' + dd;
              // if membership is valid, start addming months from that data. Otherwise add from today
              // console.log(req.body.numberOfMonths)
              const finalDate = req.body.numberOfMonths && req.body.numberOfMonths > 0 ? moment(today).add(req.body.numberOfMonths, 'months') : "N/A";
              const membershipExperationDate = yourPick === ' Buisness Owner' ? "N/A" : JSON.stringify(finalDate).substring(1, 11);
              const registerUser = async() => {
                const accountInfo = new AccountInfo({
                  _id: new mongoose.Types.ObjectId(),
                  email: email,
                  buisnessName: req.body.buisnessName,
                  password: hashedPass,
                  city: req.body.city,
                  phoneNumber: phoneNumber,
                  yourPick: yourPick,
                  loggedInKey: loggedInKey,
                  couponIds: [],
                  couponsCurrentlyClaimed: 0,
                  usedCoupons:[],
                  couponCodes:[],
                  membershipExperationDate: membershipExperationDate,
                  ip: ip
                })
                await accountInfo.save().catch(err => console.log(err))
                res.json({
                  loggedInKey:loggedInKey,
                  membershipExperationDate: membershipExperationDate,
                  couponsCurrentlyClaimed: 0
                });
              }
              if(yourPick === ' Customer') {
                const chargeData = {
                  description: req.body.description,
                  source: req.body.source,
                  currency: req.body.currency,
                  amount: req.body.amount
                }
                const charge = (chargeData.amount / 499 === req.body.numberOfMonths) ? await stripe.charges.create(chargeData) : res.json({resp:'Failed to charge card!'});
                if(charge && charge.outcome && charge.outcome.type === "authorized" &&  charge.outcome.network_status === "approved_by_network") registerUser()
                else res.json({resp:'Failed to charge card!'});
              } 
              else if(yourPick === ' Buisness Owner') registerUser()
              else res.json({resp:'You need to select if you are a buisness owner or a customer!'});
            } else res.json({resp:'You need to select if you are a buisness owner or a customer!'});
        } else res.json({resp:'You need to fill out all fields!'});
      } else res.json({resp:'Email address is taken!'});
    } else res.json({resp:'Wrong number, please try again!'});
  }
}));

app.post('/api/phoneTest', handleAsync(async (req, res) => {
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
}))
app.post('/api/phoneTestValidateNumber', handleAsync(async (req, res) => {
  redisHelper.get(req.body.phoneNumber, compareRandomNumber) // 3 minutes
  function compareRandomNumber(randomNumber){
    if (randomNumber === Number(req.body.randomNumber)) res.json({success:true})
    else res.json({success:false})
  }
}))
app.post('/api/updateAccount', handleAsync(async (req, res) => {
  const email = req.body.email;
  const loggedInKey = req.body.loggedInKey;
  const ip = getIP(req)
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
}));

app.post('/api/signin', handleAsync(async (req, res) => {
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
}));

app.post(`/api/signout`, handleAsync(async(req, res) => {
  const email = req.body.email;
  const loggedInKey = req.body.loggedInKey;
  const ip = getIP(req)
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
}))

// app.post(`/api/uploadCoupons`, handleAsync(async(req, res) => {
//   const ip = getIP(req)
//   const loggedInKey = req.body.loggedInKey;
//   const outcome = await AccountInfo.find({'email':req.body.email, "loggedInKey": loggedInKey, "ip": ip }).limit(1)
//   if (outcome && outcome[0].yourPick !== ' Buisness Owner') res.json({response: "Only Buisness Owners can create coupons!"});
//   else if(req.body.superCoupon !== "Let's go super" && req.body.superCoupon !== "No thanks." && req.body.superCoupon !== " No thanks.") res.json({response: "Please choose your coupon type!"});
//   else if(outcome && outcome[0].loggedInKey === loggedInKey && outcome[0].ip === ip) {
//     // if(validateCouponForm(req.body) && Number(req.body.currentPrice) > Number(req.body.discountedPrice)) {
//       const chargeData = {
//         description: req.body.description,
//         source: req.body.source,
//         currency: req.body.currency,
//         amount: req.body.amount
//       }
//       const charge = (req.body.superCoupon === "Let's go super" && chargeData.amount / 100 === req.body.amountCoupons || chargeData.amount / 50 === req.body.amountCoupons) ? await stripe.charges.create(chargeData) : res.json({resp:'Failed to charge card!'});
//       if(charge && charge.outcome && charge.outcome.type === "authorized" &&  charge.outcome.network_status === "approved_by_network") {
//         res.json({response: 'Coupon Created'})
//         const amountCoupons = req.body.amountCoupons;
//         let couponCodes = [];
//         let i = 0
//         for(; i < amountCoupons; i++) couponCodes.push(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)+':a');
//         const saveCoupon = async () => {
//           const mongodbID = new mongoose.Types.ObjectId();
//           const coupon = new Coupon({
//             _id: mongodbID,
//             title: req.body.title,
//             address: req.body.address,
//             city: req.body.city.toLowerCase(),
//             amountCoupons: amountCoupons,
//             currentPrice: req.body.currentPrice,
//             discountedPrice: req.body.discountedPrice,
//             category: req.body.category,
//             textarea: req.body.textarea,
//             base64image: req.body.imagePreviewUrl,
//             superCoupon: req.body.superCoupon,
//             couponCodes: couponCodes,
//             couponStillValid: true,
//             latitude: req.body.latitude,
//             longitude: req.body.longitude
//           })
          
//           // pushing the value seemed to a new array seemed to not work so I had to do this hack.
//           const arr = [...outcome[0].couponIds, mongodbID]
//           await AccountInfo.updateOne(
//             { "_id" : outcome[0]._id }, 
//             { "$set" : {"couponIds": arr}}, 
//             { "upsert" : false } 
//           );
//           await coupon.save()
//             .catch(err => console.log(err))
//             // console.log({chargeData})
//         }
//         saveCoupon();
//       } else res.json({response: 'Coupon Not Created'})
//     // } else res.json({response: 'Coupon Not Created'})
//   } else res.json({response: "You are not logged in!"});
// }))

app.get('/api/uploadCoupons', checkUserAuth, chargeUser, sendJSON);

async function checkUserAuth(req, res, next) {
  const ip = getIP(req)
  const loggedInKey = req.body.loggedInKey;
  const outcome = await AccountInfo.find({'email':req.body.email, "loggedInKey": loggedInKey, "ip": ip }).limit(1);
  if (outcome && outcome[0].yourPick !== ' Buisness Owner') res.json({response: "Only Buisness Owners can create coupons!"});
  else if(req.body.superCoupon !== "Let's go super" && req.body.superCoupon !== "No thanks." && req.body.superCoupon !== " No thanks.") res.json({response: "Please choose your coupon type!"});
  else if(outcome && outcome[0].loggedInKey === loggedInKey && outcome[0].ip === ip) return next();
  return res.json({response: "Failed to upload coupons!"})
}

async function chargeUser(req, res, next) {
  const chargeData = {
    description: req.body.description,
    source: req.body.source,
    currency: req.body.currency,
    amount: req.body.amount
  }
  const charge = (req.body.superCoupon === "Let's go super" && chargeData.amount / 100 === req.body.amountCoupons || chargeData.amount / 50 === req.body.amountCoupons) ? await stripe.charges.create(chargeData) : res.json({resp:'Failed to charge card!'});
  if(charge && charge.outcome && charge.outcome.type === "authorized" &&  charge.outcome.network_status === "approved_by_network") return next();
  else res.json({response: "Failed to upload coupons!"});
}

async function sendJSON(req, res, next) {
  const ip = getIP(req)
  const outcome = await AccountInfo.find({'email':req.body.email, "loggedInKey": req.body.loggedInKey, "ip": ip }).limit(1);
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
      
    // pushing the value seemed to a new array seemed to not work so I had to do this hack.
    const arr = [...outcome[0].couponIds, mongodbID]
    await AccountInfo.updateOne(
      { "_id" : outcome[0]._id }, 
      { "$set" : {"couponIds": arr}}, 
      { "upsert" : false } 
    );
    await coupon.save()
      .catch(err => console.log(err))
      // console.log({chargeData})
  }
  saveCoupon();
}

app.get('/api/getSponseredCoupons/:city/:pageNumber', handleAsync(async (req, res) => {
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
}));

app.post('/api/getYourCoupons', handleAsync(async (req, res) => {
  const ip = getIP(req)
  const loggedInKey = req.body.loggedInKey;
  const email = req.body.email;
  let coupons;
  const outcome = await AccountInfo.find({'email':email, "ip": ip, "loggedInKey": loggedInKey}).limit(1);
  if(outcome[0] && outcome[0].loggedInKey === loggedInKey && outcome[0].ip === ip) {
    const searchIDS = searchableMongoIDs(outcome[0].couponIds)
    coupons = await Coupon.find({'_id': { $in: searchIDS}})
    coupons.length === 0 ? coupons = "No coupons found." : coupons = associateCouponCodeByID(outcome[0].couponCodes, coupons)
    res.json({ coupons: coupons });
  }
  else if (outcome[0] && outcome[0].couponCodes.length === 0) res.json({response: "You are not logged in!"});
  else res.json({response: "No coupons found."});
}));

app.post('/api/addMonths', handleAsync(async (req, res) => {
  const ip = getIP(req)
  const loggedInKey = req.body.loggedInKey;
  const email = req.body.email;
  const numberOfMonths = req.body.numberOfMonths;
  const chargeData = {
    description: req.body.description,
    source: req.body.source,
    currency: req.body.currency,
    amount: req.body.amount
  }
  const outcome = await AccountInfo.find({'email':email, "ip": ip, "loggedInKey": loggedInKey}).limit(1);
  if(outcome[0].length !== 0 && req.body.numberOfMonths >= 1) {
    const charge = (chargeData.amount / 499 === numberOfMonths) ? await stripe.charges.create(chargeData) : res.json({resp:'Failed to charge card!'});
    if(charge && charge.outcome && charge.outcome.type === "authorized" &&  charge.outcome.network_status === "approved_by_network") {
      let today = new Date();
      let dd = today.getDate();
      let mm = today.getMonth()+1; //January is 0!
      const yyyy = today.getFullYear();
      if(dd<10) dd = '0'+dd
      if(mm<10) mm = '0'+mm
      today = yyyy + '-' + mm + '-' + dd;
      // if membership is valid, start addming months from that data. Otherwise add from today
      const date = outcome[0].membershipExperationDate
      const startingDate = checkMembershipDate(date) ? date : today;
      const finalDate = moment(startingDate).add(numberOfMonths, 'months');
      const cleanedDate = JSON.stringify(finalDate).substring(1, 11)
      res.json({response: `Added ${numberOfMonths} month(s) worth of membership. Thank you for your support!`, cleanedDate: cleanedDate})
      await AccountInfo.updateOne(
        { "_id" : outcome[0]._id }, 
        { "$set" : { "membershipExperationDate": cleanedDate}}, 
        { "upsert" : false } 
      );
    }
  } else res.json({response: "Failed to add months."})
}))

app.post('/api/validateCode', handleAsync(async (req, res) => {
  const couponCode = req.body.couponCode;
  const couponID = new ObjectId(req.body.id);
  const coupon = await Coupon.find({'_id': couponID}).limit(1);
  const account = await AccountInfo.find({'email':req.body.email}).limit(1)
  if (coupon.length === 0) res.json({response: "Coupon is not valid."})
  else if(account.length === 0) res.json({response: "Email is not valid."})
  else {
    const confirmCodeLinkedToAccount = (couponCode, couponCodes) => {
      if (couponCode.slice(-1) === "u") return false;
      let i = 0;
      const couponCodesLength = couponCodes.length;
      for (; i < couponCodesLength; i++ ) if(couponCodes[i].couponCode === couponCode) return true;
      return false;
    }
    const codeLinkedToEmail = confirmCodeLinkedToAccount(couponCode, account[0].couponCodes)
    const confirmValidCouponCode = (couponCode, couponCodes) => {
      if (couponCode.slice(-1) === "u") return false;
      let i = 0;
      const couponCodesLength = couponCodes.length;
      for (; i < couponCodesLength; i++ ) if(couponCodes[i] === couponCode) return true;
      return false;
    }
    const isValidCouponCode = confirmValidCouponCode(couponCode, coupon[0].couponCodes)
    isValidCouponCode && codeLinkedToEmail ? res.json({response: "Coupon is valid!"}) : res.json({response: "Coupon is not valid."});
    if (isValidCouponCode && codeLinkedToEmail) {
      const arrCouponCodes = useCode(couponCode, account[0].couponCodes)
      // console.log({arrCouponCodes})
      const couponsCurrentlyClaimed = account[0].couponsCurrentlyClaimed >= 0 ? Number(account[0].couponsCurrentlyClaimed) - 1 : 0;
      await AccountInfo.updateOne(
        { "_id" : account[0]._id }, 
        { "$set" : { 
          "couponsCurrentlyClaimed": couponsCurrentlyClaimed }, //
          "couponCodes": arrCouponCodes
        }, 
        { "upsert" : false } 
      );
    }
  }
}))

app.get('/search', handleAsync(async (req, res) => {
  // Goodluck!
  let coupons;
  const city = (req.query.city) ? req.query.city.toLowerCase() : null;
  const zip = (req.query.zip) ? req.query.zip : null;
  const category = (req.query.category) ? req.query.category : null;
  const keyword = (req.query.keywords) ? req.query.keywords : null;
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
}));

app.post(`/api/getCoupon`, handleAsync(async(req, res) => {
  const loggedInKey = req.body.loggedInKey;
  if (!loggedInKey) res.json({response: "You need to be logged in and have a valid subscription in order to claim coupons!"});
  else {
    const _id = req.body._id;
    const ip = getIP(req)
    const outcome = await AccountInfo.find({'email':req.body.email, 'ip': ip, loggedInKey: loggedInKey }).limit(1)
    if (outcome) {
      if (outcome[0].yourPick !== ' Customer') res.json({response: "Only customers with a valid subscription can claim coupons!"});
      else if(checkMembershipDate(outcome[0].membershipExperationDate)) {
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
            const updatedCodes = claimCode(coupon[0].couponCodes)
            await Coupon.updateOne(
              { "_id" : req.body._id },
              { "$set" : { 
                "couponCodes": updatedCodes},
                "amountCoupons": (coupon[0].amountCoupons - 1),
                "couponStillValid": couponStillValid
              }, 
              { "upsert" : false } 
            );
          } else res.json({response: "These coupons are no longer available. Please try another coupon."});
        // } else res.json({response: "You have too many coupons! Please use or discard one of your current coupons."});
      } else res.json({response: "Your membership has expired! Please renew it under the account settings option."});
    }
  else res.json({response: "You need to be logged in and have a valid subscription in order to claim coupons!"});
  }
}))

app.post(`/api/discardCoupon`, handleAsync(async(req, res) => {
  const loggedInKey = req.body.loggedInKey;
  if (!loggedInKey) res.json({response: "You need to be logged in to discard coupons!"});
  else {
    const _id = req.body._id;
    const ip = getIP(req)
    const outcome = await AccountInfo.find({'email':req.body.email, 'ip': ip, loggedInKey: loggedInKey }).limit(1)
    if (outcome) {
      if (outcome[0].yourPick !== ' Customer') res.json({response: "Something went wrong!"});
      // if (outcome[0].couponsCurrentlyClaimed === 0) {
          const coupon = await Coupon.find({'_id':_id }).limit(1);
          const arrIds = filtherID(outcome[0].couponIds, _id);
          const filtherID = (IDS, ID) => {
            let i = 0;
            let iMax = IDS.length;
            let cleanedIDS = []
            for (; i < iMax; i++) if (IDS[i] !== ID) cleanedIDS.push(IDS[i]);
            return cleanedIDS;
          }
          const filtherCouponCodes = (couponCodes, ID) => {
            let i = 0;
            let iMax = couponCodes.length;
            let cleanedIDS = []
            for (; i < iMax; i++) if (couponCodes[i]._id !== ID) cleanedIDS.push(couponCodes[i]);
            return cleanedIDS;
          }
          // const arrCouponCodes = [...outcome[0].couponCodes, {_id: _id, couponCode: couponCode}]
          const arrCouponCodes = filtherCouponCodes(outcome[0].couponCodes, _id)
          res.json({response: "Coupon Removed!"});
          await AccountInfo.updateOne(
            { "_id" : outcome[0]._id }, 
            { "$set" : { 
              "couponIds": arrIds}, //
              "couponsCurrentlyClaimed": outcome[0].couponsCurrentlyClaimed - 1 ,
              "couponCodes": arrCouponCodes
            }, 
            { "upsert" : false } 
          );
          // unclaim the code in outcome[0].couponCodes
          // !todo
          const updatedCodes = unclaimCode(coupon[0].couponCodes)
          await Coupon.updateOne(
            { "_id" : req.body._id },
            { "$set" : { 
              "couponCodes": updatedCodes},
              "amountCoupons": (coupon[0].amountCoupons + 1),
              "couponStillValid": true
            }, 
            { "upsert" : false } 
          );
    }else res.json({response: "You need to be logged in and have a valid subscription in order to claim coupons!"});
  }
}))

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "client", "build", "index.html")));

const port = process.env.PORT || 8080;

app.listen(port, () => `Server running on port ${port}`);
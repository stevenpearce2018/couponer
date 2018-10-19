# Copyright 2018 Steven Pearce
<strong> You will need a twilio key to create accounts because the current twilio key is bound to my phone number.</strong>

1) cd UnlimitedCouponer
2) npm install
3) cd client
4) npm install
5) cd ..
6) npm run dev
npm run dev will run the client and server at the same time.

Make sure you install the node packages for the server AND the client.

The mongodb connection string is public and should allow you to connect to it. Do with it what you want it is not using useful data or and is just the mongodb trial cluster.

You will need a redis server running locally for the server to compile. I plan on removing this for now and readding redis for caching later as redis was adding a lot of unneded complexity and cacheing will be much easier to accomplish with a more complete product.

[ ] === Not complete
[/] === Partial
[X] === Done

[X] Search Functionality <br />
[ ] Restructure of server code to help simplify the serverside logic <br />
[ ] Docker Containers <br />
[X] Stateless Server <br />
[ ] Load Balancer <br />
[X] Redis Caching Support <br />
[ ] HTTPS <br />
[X] MongoDB Connection <br />
[X] Signup Support <br />
[X] Login Support <br />
[X] Account details Encryption <br />
[X] Autoload Sponsered Coupons <br />
[/] Stripe payment support <br />
[ ] Paid membership support <br />
[/] Page system for coupons<br />
[X] Display Coupons <br />
[X] Create Coupons <br />
[/] Login Security/Validation <br />
[/] React Native App (Waiting till webapp is Fully Complete to Resume) <br />
[ ] Refactoring of CSS <br />
[ ] Global CSS Classes to Reduce Css Bloat <br />
[/] Refactoring of JS Components <br />
[X] Router Support <br />
[X] SPA design <br />
[ ] Webpack Lazy Loading <br />
[X] Recaptcha Support <br />
[ ] Image Optimizations for Performance <br />
[/] General Serverside Validation of data <br />
[/] Stripe payment handling (May move to amazon or other payment processor) <br />
[/] CDN Setup of Assets <br />
[X] Address Validation <br />
[X] GeoLocation AutoSearch  <br />
[/] Strip Unused dependacies <br />
[/] Mongoose Models <br />
[ ] Production MongoDB Setup <br />
[X] Preact config <br />
[ ] Production Redis Setup <br />
[ ] Enviromnet of MongoDB String Setup <br />
[ ] Production Payment Setup <br />
[ ] Deployed on (Probably) Heroku <br />

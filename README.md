# Copyright 2018 Steven Pearce

1) cd Couponer
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

[X] Search functionality <br />
[ ] Docker Containers <br />
[X] Stateless server <br />
[ ] Load Balancer <br />
[/] Redis caching support <br />
[ ] HTTPS <br />
[X] MongoDB Connection <br />
[X] Signup Support <br />
[/] Login Support <br />
[X] Login Encryption <br />
[X] Autoload Sponsered Coupons <br />
[X] Display Coupons <br />
[X] Create Coupons <br />
[/] Login Security/Validation <br />
[/] React Native app (Waiting till webapp is fully complete to resume) <br />
[ ] Refactoring of CSS <br />
[ ] Global CSS classes to reduce css bloat <br />
[ ] Refactoring of JS Components <br />
[X] Router Support <br />
[X] SPA design <br />
[ ] Webpack lazy loading <br />
[ ] Image optimizations for performance <br />
[/] General Serverside Validation of data <br />
[/] Stripe payment handling (May move to amazon or other payment processor) <br />
[ ] CDN setup of assets <br />
[X] Address validation <br />
[X] GeoLocation AutoSearch  <br />
[/] Strip unused dependacies <br />
[/] Mongoose models <br />
[ ] Deployed on (probably) heroku <br />

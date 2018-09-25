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

[X] Search functionality
[ ] Docker Containers
[X] Stateless server
[ ] Load Balancer
[/] Redis caching support
[ ] HTTPS
[X] MongoDB Connection
[X] Signup Support
[/] Login Support
[X] Login Encryption
[X] Autoload Sponsered Coupons
[X] Display Coupons
[X] Create Coupons
[/] Login Security/Validation
[/] React Native app (Waiting till webapp is fully complete to resume)
[ ] Refactoring of CSS
[ ] Global CSS classes to reduce css bloat
[ ] Refactoring of JS Components
[X] Router Support
[X] SPA design
[ ] Webpack lazy loading
[ ] Image optimizations for performance
[/] General Serverside Validation of data
[/] Stripe payment handling (May move to amazon or other payment processor)
[ ] CDN setup of assets
[X] Address validation
[X] GeoLocation AutoSearch 
[/] Strip unused dependacies
[/] Mongoose models
[ ] Deployed on (probably) heroku

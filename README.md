# invoice-app-backend
This is a Node/Express JS back-end app for issuing invoices by merchants for small businesses. The app handles registration for merchants and supports adding items and customers. Once there are items and customers, merchants can choose to generate invoices to save or send as email. Emails include a pdf of the invoice with a payment url which opens a payment portal. You can find front-end client for this app on [invoice-app-client](https://github.com/jKh98/invoice-app-client).

## Usage

* Clone or download repository
* Install dependencies by running `<npm install>`
* Run the application using `<nodemon server>` or `<npm run server>`

## Dependencies

* [Express JS](https://github.com/expressjs/express) for routing http sequests
* [Nodemon](https://github.com/remy/nodemon) for automaticlly restarting server after editing.
* [Mongoose](https://github.com/Automattic/mongoose) for modeling data and connecting to database.
* [BodyParser](https://github.com/expressjs/body-parser) 
* [ejs](https://github.com/mde/ejs) for validating user requests with tokens.
* [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) for generating and comparing password hashes.
* [JsonWebToken](https://github.com/auth0/node-jsonwebtoken) for validating user requests with tokens.
* [NodeMailer](https://github.com/nodemailer/nodemailer) for sending invoice emails to customers.
* [Stripe](https://github.com/stripe/stripe-node) for handling secure payements.
* [node-pdf-invoice](https://github.com/Astrocoders/node-pdf-invoice) for generating pdf invoices from json.

## Structure
  
* `<server.js>` main entry in the app. Configures express server and main routes with corresponding controllers.
* `<models/>` contains schema defenitions for users (merchants), customers, items, invoices and payments.
* `<controllers/>` contains route controller for different models. For example the userController contains routes for adding, editing, authenticating users ...
* `<middleware/>`contains middleware functions that validate requests.
* `<db/>` contains configuration for Mongoose and MongoDB Atlas
* `<views/>` contains static files which are served for payments




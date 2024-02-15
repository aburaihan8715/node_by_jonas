const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
// const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  // 2) Create checkout session
  // NOTE: As it is protected route, so user email will come from protect() function
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],

    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,

    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',

    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, // 1 dolors=100 cents
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            // images: [
            //   'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=600',
            // ],
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // NOTE: This is only temporary, because it is UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

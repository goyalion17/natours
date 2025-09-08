const Stripe = require('stripe');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const User = require('../models/userModel');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1: Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2: Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },
      },
    ],
    mode: 'payment',
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

const createBookingCheckout = async (session) => {
  try {
    console.log('Creating booking from webhook session:', {
      tour: session.client_reference_id,
      email: session.customer_email,
      amount: session.amount_total,
    });

    // Перевіряємо наявність необхідних даних
    if (
      !session.client_reference_id ||
      !session.customer_email ||
      !session.amount_total
    ) {
      throw new Error('Missing required session data');
    }

    const tour = session.client_reference_id;

    // Знаходимо користувача за email
    const user = await User.findOne({ email: session.customer_email });

    if (!user) {
      throw new Error(`User not found with email: ${session.customer_email}`);
    }

    // Перевіряємо чи існує тур
    const tourExists = await Tour.findById(tour);
    if (!tourExists) {
      throw new Error(`Tour not found with id: ${tour}`);
    }

    const price = session.amount_total / 100;

    // Перевіряємо чи не існує вже таке бронювання
    const existingBooking = await Booking.findOne({
      tour,
      user: user.id,
      price,
    });

    if (existingBooking) {
      console.log('Booking already exists:', existingBooking);
      return existingBooking;
    }

    // Створюємо нове бронювання
    const booking = await Booking.create({
      tour,
      user: user.id,
      price,
    });

    console.log('Booking created successfully:', booking);
    return booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    // Можна додати сповіщення адміністратора або запис у систему логування
    throw error;
  }
};

exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // Обробляємо різні типи подій
  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object;

      // Логуємо отриману сесію для діагностики
      console.log('Received checkout.session.completed event:', {
        sessionId: session.id,
        clientReferenceId: session.client_reference_id,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        paymentStatus: session.payment_status,
      });

      // Створюємо бронювання тільки якщо платіж успішний
      if (session.payment_status === 'paid') {
        await createBookingCheckout(session);
      } else {
        console.log('Payment not completed, status:', session.payment_status);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Повертаємо 200, щоб Stripe не повторював webhook
      // але логуємо помилку для подальшого аналізу
    }
  }

  // Повертаємо успішну відповідь Stripe
  res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

// const Stripe = require('stripe');
// const Tour = require('../models/tourModel');
// const Booking = require('../models/bookingModel');
// const catchAsync = require('../utils/catchAsync');
// const factory = require('./handlerFactory');
// const User = require('../models/userModel');

// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// exports.getCheckoutSession = catchAsync(async (req, res, next) => {
//   // 1: Get the currently booked tour
//   const tour = await Tour.findById(req.params.tourId);

//   // 2: Create checkout session
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ['card'],
//     // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
//     success_url: `${req.protocol}://${req.get('host')}/my-tours`,
//     cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
//     customer_email: req.user.email,
//     client_reference_id: req.params.tourId,
//     line_items: [
//       {
//         quantity: 1,
//         price_data: {
//           currency: 'usd',
//           unit_amount: tour.price * 100,
//           product_data: {
//             name: `${tour.name} Tour`,
//             description: tour.summary,
//             images: [
//               `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
//             ],
//           },
//         },
//       },
//     ],
//     mode: 'payment',
//   });

//   res.status(200).json({
//     status: 'success',
//     session,
//   });
// });

// // exports.createBookingCheckout = catchAsync(async (req, res, next) => {
// //   // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
// //   const { tour, user, price } = req.query;

// //   if (!tour && !user && !price) return next();
// //   await Booking.create({ tour, user, price });

// //   res.redirect(req.originalUrl.split('?')[0]);
// // });

// const createBookingCheckout = async (session) => {
//   const tour = session.client_reference_id;
//   const user = (await User.findOne({ email: session.customer_email })).id;
//   // const price = session.line_items[0].amount_total / 100;
//   const price = session.amount_total / 100;
//   await Booking.create({ tour, user, price });
// };

// exports.webhookCheckout = (req, res, next) => {
//   const signature = req.headers['stripe-signature'];

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET,
//     );
//   } catch (err) {
//     return res.status(400).send(`Webhook error: ${err.message}`);
//   }

//   if (event.type === 'checkout.session.completed')
//     createBookingCheckout(event.data.object);

//   res.status(200).json({ received: true });
// };

// exports.createBooking = factory.createOne(Booking);
// exports.getBooking = factory.getOne(Booking);
// exports.getAllBooking = factory.getAll(Booking);
// exports.updateBooking = factory.updateOne(Booking);
// exports.deleteBooking = factory.deleteOne(Booking);

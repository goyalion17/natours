/* eslint-disable */
import { showAlert } from './alerts';

export async function bookTour(bookBtn) {
  bookBtn.textContent = 'Processing...';
  const { tourId } = bookBtn.dataset;
  try {
    const res = await fetch(`/api/v1/bookings/checkout-session/${tourId}`);
    const data = await res.json();
    // console.log(data)
    if (data.session && data.session.url) {
      window.location.href = data.session.url;
    } else {
      bookBtn.textContent = 'Book tour now!';
      showAlert('error', 'Error by creating Stripe Checkout.');
    }
  } catch (err) {
    bookBtn.textContent = 'Book tour now!';
    showAlert('error', err);
  }
}

// import axios from 'axios';

// const stripe = Stripe(process.env.STRIPE_PUBLIC_KEY);

// export const bookTour = async (tourId) => {
//   // 1. Get checkout session from API
//   const session = await axios(
//     `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
//   );
//   console.log(session);

//   // 2. Create checkout form + chanre credit card
// };





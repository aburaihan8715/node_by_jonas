/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51NPIZtBuABpbiaqFr21NjLotEhCO3dmlsuwP1EqlxgieAjmsqvzw0RhegMsRQADB9WMQ7gwR1N5DiCLjcs0MBkOU00QUOTNKI7',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:5000/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    console.log(error);
    showAlert('error', error);
  }
};

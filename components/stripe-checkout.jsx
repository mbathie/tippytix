'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ onSuccess, primaryColor }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-4"
        style={{ backgroundColor: primaryColor }}
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {loading ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
}

export function StripeCheckout({ clientSecret, onSuccess, primaryColor }) {
  if (!clientSecret) return null;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onSuccess={onSuccess} primaryColor={primaryColor} />
    </Elements>
  );
}

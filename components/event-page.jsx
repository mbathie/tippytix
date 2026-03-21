'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Ticket, MapPin, Calendar, Clock, Minus, Plus, Loader2, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getColorHex } from '@/components/ui/color-picker';
import { getPatternCSS } from '@/lib/patterns';
import { format as formatDate } from 'date-fns';
import { StripeCheckout } from '@/components/stripe-checkout';

export function EventPage({ event }) {
  const [step, setStep] = useState('tickets'); // tickets, details, payment, success
  const [cart, setCart] = useState({});
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [orderData, setOrderData] = useState(null);
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);

  const totalQuantity = Object.values(cart).reduce((sum, q) => sum + q, 0);

  // Calculate totals
  let subtotal = 0;
  for (const [catId, qty] of Object.entries(cart)) {
    const cat = event.ticketCategories.find(c => c._id === catId);
    if (cat) subtotal += cat.price * qty;
  }
  const platformFeePercent = Math.round(subtotal * 0.05);
  const platformFeeFlat = totalQuantity * 100; // $1/ticket
  const platformFee = platformFeePercent + platformFeeFlat;
  const total = subtotal + platformFee;

  function updateCart(catId, delta) {
    setCart(prev => {
      const cat = event.ticketCategories.find(c => c._id === catId);
      const current = prev[catId] || 0;
      const newQty = Math.max(0, Math.min(current + delta, cat.remaining));
      if (newQty === 0) {
        const { [catId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [catId]: newQty };
    });
  }

  async function handleProceedToPayment() {
    if (!customer.name || !customer.email) return;

    const items = Object.entries(cart).map(([categoryId, quantity]) => ({ categoryId, quantity }));

    try {
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event._id,
          items,
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          customerAddress: customer.address,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Failed to create order');
        return;
      }

      const data = await res.json();
      setOrderData(data);
      setStep('payment');
    } catch (err) {
      alert('Something went wrong. Please try again.');
    }
  }

  const startDate = event.startDate ? new Date(event.startDate) : null;
  const primaryHex = getColorHex(event.primaryColor) || event.primaryColor;
  const secondaryHex = getColorHex(event.secondaryColor) || event.secondaryColor;

  return (
    <div className="min-h-screen" suppressHydrationWarning style={{
      backgroundColor: `${secondaryHex}15`,
      backgroundImage: getPatternCSS(event.backgroundPattern, secondaryHex, 0.2) || undefined,
    }}>
      {/* Banner */}
      <div className="w-full">
        {event.bannerImage ? (
          <img src={event.bannerImage} alt={event.name} className="w-full h-auto" />
        ) : (
          <div className="w-full aspect-[3/1]" style={{ background: `linear-gradient(135deg, ${primaryHex}, ${secondaryHex})` }} />
        )}
      </div>

      <style suppressHydrationWarning>{`
        .event-content [data-slot="card"] {
          background: linear-gradient(${secondaryHex}18, ${secondaryHex}18), #fafafa;
          border-color: ${secondaryHex}30;
          background-image: none !important;
        }
      `}</style>
      <div className="event-content max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Event name and details below banner */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{event.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-gray-600 text-sm">
            {startDate && (
              <>
                <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(startDate, 'EEEE d MMMM yyyy')}
                </span>
                <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(startDate, 'h:mm a')}{event.endDate && ` – ${formatDate(new Date(event.endDate), 'h:mm a')}`}
                </span>
              </>
            )}
            {event.venue && (
              <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1">
                <MapPin className="w-4 h-4" /> {event.venue}
              </span>
            )}
          </div>
        </div>
        {step === 'success' ? (
          <Card className="border-green-500 border-2">
            <CardContent className="py-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tickets Confirmed!</h2>
              <p className="text-gray-600 mb-2">Order #{orderData?.orderNumber}</p>
              <p className="text-gray-500">Check your email ({customer.email}) for your tickets and QR codes.</p>
            </CardContent>
          </Card>
        ) : step === 'payment' ? (
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between text-sm mb-1">
                  <span>Subtotal ({totalQuantity} ticket{totalQuantity !== 1 ? 's' : ''})</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Service fee</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              <StripeCheckout
                clientSecret={orderData.clientSecret}
                onSuccess={() => setStep('success')}
                primaryColor={event.primaryColor}
              />
              <Button variant="ghost" className="w-full mt-3" onClick={() => { setStep('details'); setOrderData(null); }}>
                Back
              </Button>
            </CardContent>
          </Card>
        ) : step === 'details' ? (
          <Card>
            <CardHeader>
              <CardTitle>Your Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} required />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <h3 className="font-medium mb-2">Order Summary</h3>
                {Object.entries(cart).map(([catId, qty]) => {
                  const cat = event.ticketCategories.find(c => c._id === catId);
                  return (
                    <div key={catId} className="flex justify-between text-sm">
                      <span>{cat.name} x {qty}</span>
                      <span>{formatCurrency(cat.price * qty)}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm text-gray-500 border-t pt-2">
                  <span>Service fee</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('tickets')}>Back</Button>
                <Button
                  onClick={handleProceedToPayment}
                  disabled={!customer.name || !customer.email}
                  className="flex-1"
                  style={{ background: `linear-gradient(135deg, ${primaryHex}, ${secondaryHex})` }}
                >
                  Continue to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" /> Select Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.ticketCategories.map(cat => {
                  const qty = cart[cat._id] || 0;
                  return (
                    <div key={cat._id} className={`p-4 rounded-lg border transition-colors ${cat.isSoldOut ? 'bg-gray-50 opacity-60' : cat.isAvailable ? 'hover:border-violet-200' : 'bg-gray-50 opacity-60'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{cat.name}</h3>
                            {cat.isSoldOut && <Badge variant="destructive" className="text-xs line-through-none">Sold Out</Badge>}
                            {!cat.isAvailable && !cat.isSoldOut && <Badge variant="secondary" className="text-xs">Coming Soon</Badge>}
                          </div>
                          {cat.description && <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>}
                          <p className="text-lg font-bold mt-1" style={{ color: primaryHex }}>
                            {formatCurrency(cat.price)}
                          </p>
                          {!cat.isSoldOut && cat.quantity > 0 && (cat.sold / cat.quantity) >= 0.75 && (
                            <p className="text-xs text-orange-500 font-medium">Almost sold out</p>
                          )}
                        </div>
                        {cat.isAvailable && !cat.isSoldOut && (
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCart(cat._id, -1)} disabled={qty === 0}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{qty}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateCart(cat._id, 1)} disabled={qty >= cat.remaining}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {totalQuantity > 0 && (
              <div className="sticky bottom-4">
                <Card className="shadow-lg border-2" style={{ borderColor: primaryHex }}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{totalQuantity} ticket{totalQuantity !== 1 ? 's' : ''}</p>
                        <p className="text-xl font-bold">{formatCurrency(total)}</p>
                        <p className="text-xs text-gray-400">incl. {formatCurrency(platformFee)} service fee</p>
                      </div>
                      <Button size="lg" onClick={() => setStep('details')} style={{ background: `linear-gradient(135deg, ${primaryHex}, ${secondaryHex})` }}>
                        Get Tickets
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {event.description && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
                </CardContent>
              </Card>
            )}

            {event.refundPolicy?.length > 0 && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowRefundPolicy(prev => !prev)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showRefundPolicy ? 'Hide' : 'View'} Refund Policy
                </button>
                {showRefundPolicy && (
                  <Card className="mt-2 text-left">
                    <CardContent className="pt-4">
                      <ul className="text-sm text-gray-500 space-y-1">
                        {event.refundPolicy.sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent).map((tier, i) => (
                          <li key={i}>
                            {tier.daysBeforeEvent}+ days before event: {tier.refundPercentage}% refund
                            {tier.refundPercentage > 0 ? ' (minus $2 handling fee)' : ''}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        <p className="text-center text-xs text-gray-400 pb-4">
          Powered by <a href="https://tippytix.app" className="font-bold font-[family-name:var(--font-logo)] text-sm bg-gradient-to-r from-[#6d28d9] to-[#ec4899] bg-clip-text text-transparent hover:opacity-80">TippyTix</a>
        </p>
      </div>
    </div>
  );
}

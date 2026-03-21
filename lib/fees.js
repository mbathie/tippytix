// Platform fee calculations

const PLATFORM_FEE_PERCENT = 5; // 5% of ticket cost
const PLATFORM_FEE_FLAT_CENTS = 100; // $1 per ticket
const REFUND_HANDLING_FEE_CENTS = 200; // $2 per refund

export function calculatePlatformFee(ticketPriceCents, quantity = 1) {
  const percentageFee = Math.round(ticketPriceCents * quantity * PLATFORM_FEE_PERCENT / 100);
  const flatFee = PLATFORM_FEE_FLAT_CENTS * quantity;
  return percentageFee + flatFee;
}

export function calculateOrderTotal(items) {
  // items: [{ priceCents, quantity }]
  let subtotal = 0;
  let totalQuantity = 0;
  for (const item of items) {
    subtotal += item.priceCents * item.quantity;
    totalQuantity += item.quantity;
  }
  const platformFee = calculatePlatformFee(subtotal / totalQuantity, totalQuantity);
  return {
    subtotal,
    platformFee,
    total: subtotal + platformFee,
    totalQuantity,
  };
}

export function calculateRefundAmount(originalTicketPriceCents, refundPercentage) {
  const refundableAmount = Math.round(originalTicketPriceCents * refundPercentage / 100);
  const afterHandlingFee = Math.max(0, refundableAmount - REFUND_HANDLING_FEE_CENTS);
  return {
    refundAmount: afterHandlingFee,
    handlingFee: REFUND_HANDLING_FEE_CENTS,
    refundPercentage,
  };
}

export function getRefundPercentageForEvent(event, eventDate) {
  if (!event.refundPolicy || event.refundPolicy.length === 0) {
    return 0; // No refund policy = no refunds
  }

  const now = new Date();
  const eventStart = new Date(eventDate);
  const daysUntilEvent = Math.ceil((eventStart - now) / (1000 * 60 * 60 * 24));

  // Sort tiers by daysBeforeEvent descending (most generous first)
  const sortedTiers = [...event.refundPolicy].sort((a, b) => b.daysBeforeEvent - a.daysBeforeEvent);

  for (const tier of sortedTiers) {
    if (daysUntilEvent >= tier.daysBeforeEvent) {
      return tier.refundPercentage;
    }
  }

  return 0; // Past all refund windows
}

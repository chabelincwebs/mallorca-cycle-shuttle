import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { sendBookingConfirmation, sendPaymentReceipt } from './email';

const prisma = new PrismaClient();

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export interface CreatePaymentIntentParams {
  amount: number; // Amount in euros
  currency?: string;
  bookingReference: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, string>;
}

export interface RefundPaymentParams {
  paymentIntentId: string;
  amount?: number; // If not provided, refunds full amount
  reason?: string;
}

/**
 * Create a Stripe payment intent for a booking
 */
export async function createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
  const {
    amount,
    currency = 'eur',
    bookingReference,
    customerEmail,
    customerName,
    metadata = {}
  } = params;

  // Stripe expects amount in cents
  const amountInCents = Math.round(amount * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: customerEmail,
      metadata: {
        bookingReference,
        customerName,
        ...metadata
      },
      description: `Mallorca Cycle Shuttle - Booking ${bookingReference}`
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Retrieve a payment intent by ID
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error('Failed to retrieve payment intent');
  }
}

/**
 * Confirm a payment intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId?: string
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      ...(paymentMethodId && { payment_method: paymentMethodId })
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    throw new Error('Failed to confirm payment intent');
  }
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error cancelling payment intent:', error);
    throw new Error('Failed to cancel payment intent');
  }
}

/**
 * Refund a completed payment
 */
export async function refundPayment(params: RefundPaymentParams): Promise<Stripe.Refund> {
  const { paymentIntentId, amount, reason = 'requested_by_customer' } = params;

  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
      reason: reason as Stripe.RefundCreateParams.Reason
    };

    // If amount is specified, do partial refund
    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundParams);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Handle payment succeeded event
 */
export async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingReference = paymentIntent.metadata.bookingReference;

  if (!bookingReference) {
    console.error('No booking reference in payment intent metadata');
    return;
  }

  try {
    // Update booking payment status
    const booking = await prisma.scheduledBooking.update({
      where: { bookingReference },
      data: {
        paymentStatus: 'completed',
        paymentId: paymentIntent.id,
        paidAt: new Date()
      },
      include: {
        service: {
          include: {
            routePickup1: true,
            routePickup2: true,
            routeDropoff: true
          }
        },
        pickupLocation: true
      }
    });

    console.log(`Payment completed for booking ${bookingReference}`);

    // Send confirmation emails
    try {
      const emailData = {
        bookingReference: booking.bookingReference,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerLanguage: booking.customerLanguage,
        serviceDate: booking.service.serviceDate,
        departureTime: booking.service.departureTime,
        pickupLocation: booking.pickupLocation.nameEn, // TODO: use correct language
        dropoffLocation: booking.service.routeDropoff.nameEn, // TODO: use correct language
        seatsBooked: booking.seatsBooked,
        bikesCount: booking.bikesCount,
        totalAmount: parseFloat(booking.totalAmount.toString()),
        ticketType: booking.ticketType,
        paymentStatus: booking.paymentStatus,
        changeToken: booking.changeToken
      };

      // Send booking confirmation
      await sendBookingConfirmation(emailData);

      // Send payment receipt
      await sendPaymentReceipt(emailData);

      console.log(`Confirmation emails sent to ${booking.customerEmail}`);
    } catch (emailError) {
      // Log error but don't throw - payment was successful
      console.error('Error sending confirmation emails:', emailError);
    }
  } catch (error) {
    console.error('Error updating booking payment status:', error);
    throw error;
  }
}

/**
 * Handle payment failed event
 */
export async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingReference = paymentIntent.metadata.bookingReference;

  if (!bookingReference) {
    console.error('No booking reference in payment intent metadata');
    return;
  }

  try {
    await prisma.scheduledBooking.update({
      where: { bookingReference },
      data: {
        paymentStatus: 'failed',
        paymentId: paymentIntent.id
      }
    });

    console.log(`Payment failed for booking ${bookingReference}`);
  } catch (error) {
    console.error('Error updating booking payment status:', error);
    throw error;
  }
}

/**
 * Handle refund succeeded event
 */
export async function handleRefundSucceeded(refund: Stripe.Refund): Promise<void> {
  const paymentIntentId = refund.payment_intent as string;

  if (!paymentIntentId) {
    console.error('No payment intent ID in refund');
    return;
  }

  try {
    const booking = await prisma.scheduledBooking.findFirst({
      where: { paymentId: paymentIntentId }
    });

    if (!booking) {
      console.error(`No booking found for payment intent ${paymentIntentId}`);
      return;
    }

    // Update booking payment status to refunded
    await prisma.scheduledBooking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'refunded',
        cancellationRefundAmount: refund.amount / 100 // Convert from cents to euros
      }
    });

    console.log(`Refund completed for booking ${booking.bookingReference}, amount: €${refund.amount / 100}`);
  } catch (error) {
    console.error('Error handling refund:', error);
    throw error;
  }
}

export { stripe };

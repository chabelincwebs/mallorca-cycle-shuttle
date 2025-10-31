import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { sendBookingConfirmation, sendPaymentReceipt, sendAdminPrivateBookingNotification } from './email';
import { createInvoiceFromScheduledBooking, createInvoiceFromPrivateBooking } from './invoice';

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
  const bookingType = paymentIntent.metadata.bookingType as 'scheduled' | 'private';

  if (!bookingReference) {
    console.error('No booking reference in payment intent metadata');
    return;
  }

  try {
    if (bookingType === 'private') {
      // Handle private shuttle booking payment
      await handlePrivateBookingPaymentSucceeded(bookingReference, paymentIntent.id);
    } else {
      // Handle scheduled service booking payment (default)
      await handleScheduledBookingPaymentSucceeded(bookingReference, paymentIntent.id);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
}

/**
 * Handle scheduled booking payment succeeded
 */
async function handleScheduledBookingPaymentSucceeded(bookingReference: string, paymentIntentId: string): Promise<void> {
  // Update booking payment status
  const booking = await prisma.scheduledBooking.update({
    where: { bookingReference },
    data: {
      paymentStatus: 'completed',
      paymentId: paymentIntentId,
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

  console.log(`Payment completed for scheduled booking ${bookingReference}`);

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

  // Generate invoice automatically
  try {
    const invoice = await createInvoiceFromScheduledBooking(booking.id);
    console.log(`✅ Invoice ${invoice.invoiceNumber} generated for booking ${bookingReference}`);
  } catch (invoiceError) {
    // Log error but don't throw - payment was successful
    console.error('Error generating invoice:', invoiceError);
    // Invoice can be generated manually later from admin panel
  }
}

/**
 * Handle private booking payment succeeded
 */
async function handlePrivateBookingPaymentSucceeded(bookingReference: string, paymentIntentId: string): Promise<void> {
  // Update booking payment status
  const booking = await prisma.privateBooking.update({
    where: { bookingReference },
    data: {
      paymentStatus: 'completed',
      paymentId: paymentIntentId,
      paidAt: new Date()
      // Note: status stays 'pending' until admin manually confirms
    },
    include: {
      slot: {
        include: {
          bus: true
        }
      }
    }
  });

  console.log(`Payment completed for private booking ${bookingReference} (awaiting admin approval)`);

  // Send confirmation emails
  try {
    const emailData = {
      bookingReference: booking.bookingReference,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerLanguage: booking.customerLanguage,
      serviceDate: booking.serviceDate,
      departureTime: booking.departureTime,
      pickupLocation: booking.pickupAddress || '',
      dropoffLocation: booking.dropoffAddress || '',
      seatsBooked: booking.passengersCount,
      bikesCount: booking.bikesCount,
      totalAmount: parseFloat(booking.totalAmount.toString()),
      ticketType: 'private', // Private shuttles don't have flexi/standard
      paymentStatus: booking.paymentStatus,
      changeToken: null
    };

    // Send booking confirmation (with note about pending admin approval)
    await sendBookingConfirmation(emailData);

    // Send payment receipt
    await sendPaymentReceipt(emailData);

    console.log(`Confirmation emails sent to ${booking.customerEmail}`);
  } catch (emailError) {
    // Log error but don't throw - payment was successful
    console.error('Error sending confirmation emails:', emailError);
  }

  // Send admin notification
  try {
    await sendAdminPrivateBookingNotification(emailData);
    console.log(`Admin notification sent for private booking ${bookingReference}`);
  } catch (adminEmailError) {
    // Log error but don't throw - payment was successful
    console.error('Error sending admin notification:', adminEmailError);
  }

  // Note: Invoice generation happens after admin confirmation, not immediately after payment
  console.log(`Private booking ${bookingReference} is pending admin approval before invoice generation`);
}

/**
 * Handle payment failed event
 */
export async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const bookingReference = paymentIntent.metadata.bookingReference;
  const bookingType = paymentIntent.metadata.bookingType as 'scheduled' | 'private';

  if (!bookingReference) {
    console.error('No booking reference in payment intent metadata');
    return;
  }

  try {
    if (bookingType === 'private') {
      // Update private booking payment status
      await prisma.privateBooking.update({
        where: { bookingReference },
        data: {
          paymentStatus: 'failed',
          paymentId: paymentIntent.id
        }
      });
    } else {
      // Update scheduled booking payment status
      await prisma.scheduledBooking.update({
        where: { bookingReference },
        data: {
          paymentStatus: 'failed',
          paymentId: paymentIntent.id
        }
      });
    }

    console.log(`Payment failed for ${bookingType || 'scheduled'} booking ${bookingReference}`);
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
    // Try to find a scheduled booking first
    const scheduledBooking = await prisma.scheduledBooking.findFirst({
      where: { paymentId: paymentIntentId }
    });

    if (scheduledBooking) {
      // Update scheduled booking payment status to refunded
      await prisma.scheduledBooking.update({
        where: { id: scheduledBooking.id },
        data: {
          paymentStatus: 'refunded',
          cancellationRefundAmount: refund.amount / 100 // Convert from cents to euros
        }
      });

      console.log(`Refund completed for scheduled booking ${scheduledBooking.bookingReference}, amount: €${refund.amount / 100}`);
      return;
    }

    // Try to find a private booking
    const privateBooking = await prisma.privateBooking.findFirst({
      where: { paymentId: paymentIntentId }
    });

    if (privateBooking) {
      // Update private booking payment status to refunded
      await prisma.privateBooking.update({
        where: { id: privateBooking.id },
        data: {
          paymentStatus: 'refunded'
          // Note: Private bookings don't have cancellationRefundAmount field currently
        }
      });

      console.log(`Refund completed for private booking ${privateBooking.bookingReference}, amount: €${refund.amount / 100}`);
      return;
    }

    // No booking found
    console.error(`No booking found for payment intent ${paymentIntentId}`);
  } catch (error) {
    console.error('Error handling refund:', error);
    throw error;
  }
}

export { stripe };

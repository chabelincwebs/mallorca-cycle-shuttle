import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import {
  verifyWebhookSignature,
  handlePaymentSucceeded,
  handlePaymentFailed,
  handleRefundSucceeded
} from '../../services/payment';

const router = Router();

/**
 * Stripe webhook endpoint
 *
 * IMPORTANT: This endpoint must receive the raw body, not parsed JSON
 * The signature verification requires the raw request body
 */
router.post(
  '/',
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing stripe-signature header'
      });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return res.status(500).json({
        success: false,
        error: 'Webhook secret not configured'
      });
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = verifyWebhookSignature(
        req.body,
        signature,
        webhookSecret
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    console.log(`Received Stripe webhook event: ${event.type}`);

    // Handle different event types
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          // When a charge is refunded, we get both charge.refunded and refund.created/succeeded
          // We'll handle it in refund.succeeded to avoid duplicate processing
          console.log('Charge refunded event received (will be handled by refund.succeeded)');
          break;

        case 'refund.created':
          // Refund was initiated but not yet completed
          console.log('Refund created:', event.data.object.id);
          break;

        case 'refund.succeeded':
          await handleRefundSucceeded(event.data.object as Stripe.Refund);
          break;

        case 'refund.failed':
          console.log('Refund failed:', event.data.object.id);
          // TODO: Handle failed refund (notify admin)
          break;

        case 'payment_intent.canceled':
          console.log('Payment intent cancelled:', event.data.object.id);
          // Optionally handle cancellation
          break;

        case 'charge.succeeded':
          console.log('Charge succeeded:', event.data.object.id);
          // Payment intent succeeded event is more reliable
          break;

        case 'charge.failed':
          console.log('Charge failed:', event.data.object.id);
          // Payment intent failed event is more reliable
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Return success response to acknowledge receipt
      res.json({ received: true });
    } catch (error) {
      console.error('Error handling webhook event:', error);
      // Still return 200 to avoid Stripe retrying
      res.json({ received: true, error: 'Processing failed' });
    }
  }
);

export default router;

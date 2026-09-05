import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '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', {
  apiVersion: '2024-11-20.ac' as any,
})

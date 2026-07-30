import { getUncachableStripeClient } from './stripeClient';

async function seedUniverseProduct() {
  try {
    const stripe = await getUncachableStripeClient();

    console.log('Checking for existing Universe Order product...');
    const existing = await stripe.products.search({
      query: "name:'Universe Order' AND active:'true'",
    });

    const DESCRIPTION = 'A sealed intention, sent to the universe. $1 places your cosmic order — track it from Processing through In Transit to Delivered.';

    if (existing.data.length > 0) {
      const product = existing.data[0];
      console.log('Universe Order product already exists:', product.id);
      // Ensure description is set even on existing products
      if (product.description !== DESCRIPTION) {
        await stripe.products.update(product.id, { description: DESCRIPTION });
        console.log('Updated description on existing product.');
      }
      const prices = await stripe.prices.list({ product: product.id, active: true });
      if (prices.data.length > 0) {
        console.log('Price ID:', prices.data[0].id, '— Amount:', prices.data[0].unit_amount, prices.data[0].currency);
      }
      return;
    }

    console.log('Creating Universe Order product...');
    const product = await stripe.products.create({
      name: 'Universe Order',
      description: 'Seal and send your intention to the universe. $1 to place your cosmic order.',
    });
    console.log('Created product:', product.id);

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 100, // $1.00
      currency: 'usd',
    });
    console.log('Created price:', price.id, '— $1.00 one-time');

    console.log('\n✓ Universe Order product seeded successfully!');
    console.log('Webhook sync will populate the stripe schema tables automatically.');
  } catch (err: any) {
    console.error('Error seeding product:', err.message);
    process.exit(1);
  }
}

seedUniverseProduct();

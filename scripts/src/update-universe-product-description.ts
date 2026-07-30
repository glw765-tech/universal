import { getUncachableStripeClient } from './stripeClient';

const DESCRIPTION = 'A sealed intention, sent to the universe. $1 places your cosmic order — track it from Processing through In Transit to Delivered.';

async function updateProductDescription() {
  try {
    const stripe = await getUncachableStripeClient();

    const existing = await stripe.products.search({
      query: "name:'Universe Order' AND active:'true'",
    });

    if (existing.data.length === 0) {
      console.error('Universe Order product not found. Run seed-universe-product first.');
      process.exit(1);
    }

    const product = existing.data[0];
    console.log('Found product:', product.id, '— current description:', product.description ?? '(none)');

    const updated = await stripe.products.update(product.id, { description: DESCRIPTION });
    console.log('✓ Description updated:', updated.description);
  } catch (err: any) {
    console.error('Error updating product:', err.message);
    process.exit(1);
  }
}

updateProductDescription();

import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Setting } from "@/models/Setting";
const stripe = require('stripe')(process.env.STRIPE_SK);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name, email, city,
      postalCode, streetAddress, country,
      cartProducts,
    } = req.body;

    await mongooseConnect();

    if (!Array.isArray(cartProducts) || cartProducts.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const productsIds = cartProducts;
    const uniqueIds = [...new Set(productsIds)];
    const productsInfos = await Product.find({ _id: { $in: uniqueIds } });

    if (productsInfos.length === 0) {
      return res.status(404).json({ error: 'No products found' });
    }

    let line_items = [];
    for (const productId of uniqueIds) {
      const productInfo = productsInfos.find(p => p._id.toString() === productId);
      const quantity = productsIds.filter(id => id === productId).length;
      if (quantity > 0 && productInfo) {
        line_items.push({
          quantity,
          price_data: {
            currency: 'USD',
            product_data: { name: productInfo.title },
            unit_amount: quantity * productInfo.price * 100,
          },
        });
      }
    }

    const session = await getServerSession(req, res, authOptions);

    const orderDoc = await Order.create({
      line_items, name, email, city, postalCode,
      streetAddress, country, paid: false,
      userEmail: session?.user?.email,
    });

    const shippingFeeSetting = await Setting.findOne({ name: 'shippingFee' });
    const shippingFeeCents = parseInt(shippingFeeSetting?.value || '0') * 100;

    const stripeSession = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.PUBLIC_URL}/cart?success=1`,
      cancel_url: `${process.env.PUBLIC_URL}/cart?canceled=1`,
      metadata: { orderId: orderDoc._id.toString() },
      allow_promotion_codes: true,
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: 'shipping fee',
            type: 'fixed_amount',
            fixed_amount: { amount: shippingFeeCents, currency: 'USD' },
          },
        }
      ],
    });

    return res.json({ url: stripeSession.url });

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// api/stripeIntent.js
import Stripe from 'stripe';

// Khởi tạo Stripe với secret key của bạn
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// CatchAsyncErrors sẽ giúp bạn quản lý các lỗi bất đồng bộ
const catchAsyncErrors = (fn) => (req, res, next) =>
  fn(req, res, next).catch(next);

export const stripeIntent = catchAsyncErrors(async (req, res, next) => {
  const { email, price } = req.body;
  console.log(req.body);
  console.log("aloooooooooooooooooooooo");

  // Tạo customer mới hoặc sử dụng customer ID nếu là khách hàng quay lại
  const customer = await stripe.customers.create({
    name: email,
    email: email,
  });

  // Tạo ephemeral key
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: '2024-06-20' }
  );

  // Tạo payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: price * 100, // Stripe sử dụng đơn vị nhỏ nhất của tiền tệ (cent)
    currency: 'usd',
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Trả về các thông tin cần thiết
  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: 'pk_test_51PYNYkDJwhIyD25mUvMnlssII6IvkRAU6rvl6lyvzsu5RUg6SKv64fnOb7TfxpEN4A0sOHfLI6Pnv8h07UEah7ci00WiQnXJ18'
  });
});

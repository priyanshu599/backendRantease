// controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/payment');
const Booking = require('../models/booking');

// Initialize Razorpay instance safely
let instance;
try {
  instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (error) {
  console.error("Failed to initialize Razorpay. Check your .env file for API keys.", error);
}


// Create a Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
  if (!instance) {
    return res.status(500).json({ message: "Payment gateway is not configured." });
  }

  try {
    const amount = Number(req.body.amount);

    if (!amount || isNaN(amount) || amount < 1) {
      return res.status(400).json({ message: "Invalid payment amount provided." });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: "Failed to create order with Razorpay." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ message: "An error occurred while creating the payment order." });
  }
};

// Verify the payment
exports.verifyPayment = async (req, res) => {
    try {
        // FIX: Changed variable names to match what the frontend sends.
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, propertyId, bookingId } = req.body;
        
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            // FIX: Use the correct variable names to generate the signature.
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // Payment is successful, save the payment record
            await Payment.create({
                amount: amount,
                propertyId: propertyId,
                userId: req.user.id,
                status: 'success',
                paymentId: razorpay_payment_id, // Use correct variable
                orderId: razorpay_order_id      // Use correct variable
            });

            // Find the booking and update its status to paid
            await Booking.findByIdAndUpdate(bookingId, { isPaid: true });
            
            res.status(200).json({ success: true, message: "Payment has been verified" });
        } else {
            res.status(400).json({ success: false, message: "Payment verification failed: Signature mismatch." });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ message: "An error occurred during payment verification." });
    }
};

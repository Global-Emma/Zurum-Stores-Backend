const paystack = require('paystack-api');
const Order = require('../models/Orders');
const Paystack = paystack(process.env.PAYSTACK_SECRET);

const initializePayment = async (req, res) => {
  try {
    const { email, amountCents, orderId } = req.body;
    const response = await Paystack.transaction.initialize({
      email,
      amount: amountCents,
      metadata: { orderId }
    });
    return res.status(200).json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error initializing payment'
    });
  }
}

const paymentWebhook = async (req, res) => {
  try {
    // Paystack sends a POST request to this endpoint when a payment event occurs
    const event = req.body;
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const orderId = event.data.metadata.orderId;

      await Order.findByIdAndUpdate(
        orderId,
        { $set: { paymentStatus: 'PAID', status: 'confirmed', Reference: reference } },
        { new: true }
      );
      

      return res.status(200).json({
        success: true,
        message: 'Webhook received successfully',
      });

    }
  } catch (error) {

  }

}


const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const response = await Paystack.transaction.verify({ reference });
    if (response.data.status !== 'success') {

      await Order.findByIdAndUpdate(
        response.data.metadata.orderId,
        { paymentStatus: 'FAILED' },
        { new: true }
      );

      return res.status(400).json({
        success: false,
        message: 'Payment not successful'
      });

    } else if (response.data.status === 'success') {
      // updating order status in the database
      await Order.findByIdAndUpdate(
        response.data.metadata.orderId,
        { $set: { paymentStatus: 'PAID', status: 'confirmed', Reference: reference } },
        { new: true }
      );


      return res.status(200).json({
        success: true,
        data: response.data
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
}

module.exports = {
  initializePayment,
  verifyPayment,
  paymentWebhook,
};
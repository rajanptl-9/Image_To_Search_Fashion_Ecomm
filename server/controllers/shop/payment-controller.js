const Razorpay = require('razorpay');
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const checkout = async (req, res) => {
    const option = {
        amount: 10000,
        currency: "USD",
    }
    try {
        const response = await instance.orders.create(option);
        res.json({response, success: true});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

const paymentVerification = async (req, res) => {
    const {razorpayOrderId, razorpayPaymentId } = req.body;    
    res.json({razorpayOrderId, razorpayPaymentId});
};

module.exports = {
    checkout,
    paymentVerification,
};
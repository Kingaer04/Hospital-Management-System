// backend/controllers/paystackController.js
import axios from 'axios';
import crypto from 'crypto';
import HospitalAdminAccount from "../Models/AdminModel.js";
import Invoice from '../Models/InvoiceModel.js';

// Configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_3be4760349383fc0ef0a83c3def9c5e03c2d3d96";
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Initialize Paystack API
const paystackAPI = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Create hospital subaccount
export const createHospitalSubaccount = async (req, res) => {
  try {
    const { hospitalName, bankCode, accountNumber, percentageCharge = 0 } = req.body;
    
    const response = await paystackAPI.post('/subaccount', {
      business_name: hospitalName,
      settlement_bank: bankCode,
      account_number: accountNumber,
      percentage_charge: percentageCharge
    });
    
    res.status(200).json({
      success: true,
      subaccount: response.data.data
    });
  } catch (error) {
    console.error('Error creating subaccount:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
};

// Generate payment link
export const generatePaymentLink = async (req, res) => {
  try {
    const {
      amount, // in naira
      email,
      invoiceNumber,
      patientName,
      hospitalId
    } = req.body;

    console.log(hospitalId)
    
    // Get hospital details from your database
    const hospital = await HospitalAdminAccount.findById(hospitalId);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }
    
    // Generate unique reference
    const reference = `INV-${invoiceNumber}-${Date.now()}`;
    
    // Convert amount to kobo (smallest currency unit)
    const amountInKobo = Math.round(amount * 100);
    
    // Initialize transaction
    const response = await paystackAPI.post('/transaction/initialize', {
      amount: amountInKobo,
      email,
      reference,
      subaccount: hospital.subaccountCode,
      metadata: {
        invoice_number: invoiceNumber,
        patient_name: patientName,
        hospital_name: hospital.name,
        hospital_id: hospitalId
      },
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`
    });
    
    // Save invoice details to database
    await Invoice.create({
      invoiceNumber,
      patientName,
      patientEmail: email,
      amount: amountInKobo,
      hospitalId,
      reference,
      paymentStatus: 'pending',
      paymentLink: response.data.data.authorization_url,
      metadata: {
        invoice_number: invoiceNumber,
        patient_name: patientName,
        hospital_name: hospital.name,
        hospital_id: hospitalId
      }
    });
    
    res.status(200).json({
      success: true,
      paymentLink: response.data.data.authorization_url,
      reference
    });
  } catch (error) {
    console.error('Error generating payment link:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    
    const response = await paystackAPI.get(`/transaction/verify/${reference}`);
    
    const { status, amount, metadata } = response.data.data;
    
    if (status === 'success') {
      // Update invoice status in your database
      await Invoice.findOneAndUpdate(
        { reference },
        { 
          paymentStatus: 'paid',
          paidAmount: amount / 100,
          paidAt: new Date()
        },
        { new: true }
      );
      
      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: response.data.data
      });
    } else {
      res.status(200).json({
        success: false,
        message: 'Payment not successful',
        data: response.data.data
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
};

// Webhook handler
export const handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).send('Invalid signature');
    }

    // Handle the event
    const event = req.body;
    
    if (event.event === 'charge.success') {
      const { reference, amount, metadata } = event.data;
      
      // Update payment status in your database
      await Invoice.findOneAndUpdate(
        { reference },
        { 
          paymentStatus: 'paid',
          paidAmount: amount / 100,
          paidAt: new Date()
        },
        { new: true }
      );
      
      // You could also trigger additional actions here:
      // - Sending confirmation email to patient
      // - Notifying hospital about successful payment
      // - Generating receipt
    }
    
    // Always respond with 200 to acknowledge receipt
    return res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).send('Error processing webhook');
  }
};
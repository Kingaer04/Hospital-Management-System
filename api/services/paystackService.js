// backend/controllers/paystackController.js
import axios from 'axios';
import crypto from 'crypto';
import HospitalAdminAccount from "../Models/AdminModel.js";
import Invoice from '../Models/InvoiceModel.js';
import Payment from '../Models/PaymentModel.js'; // Assuming you have a Payment model

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

// Create invoice - common function for both payment methods
const createInvoice = async (invoiceData) => {
  const {
    invoiceNumber,
    patientName,
    patientId,
    patientEmail,
    amount,
    hospitalId,
    reference,
    paymentStatus,
    paymentMethod,
    paymentLink,
    hospital
  } = invoiceData;
  
  // Convert amount to kobo (smallest currency unit)
  const amountInKobo = Math.round(amount * 100);
  
  // Create invoice object
  const invoiceToCreate = {
    invoiceNumber,
    patientName,
    patientId,
    patientEmail,
    amount: amountInKobo,
    hospitalId,
    reference,
    paymentStatus,
    paymentMethod,
    metadata: {
      invoice_number: invoiceNumber,
      patient_name: patientName,
      hospital_name: hospital.name,
      hospital_id: hospitalId
    }
  };
  
  // Add payment link if present (for online payments)
  if (paymentLink) {
    invoiceToCreate.paymentLink = paymentLink;
  }
  
  // Add paid info if already paid (for cash payments)
  if (paymentStatus === 'paid') {
    invoiceToCreate.paidAmount = amount;
    invoiceToCreate.paidAt = new Date();
  }
  
  // Save invoice to database
  return await Invoice.create(invoiceToCreate);
};

// Generate payment link
export const generatePaymentLink = async (req, res) => {
  try {
    const {
      amount, // in naira
      email,
      invoiceNumber,
      patientName,
      hospitalId,
      patientId
    } = req.body;
    
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
        hospital_id: hospitalId,
        patient_id: patientId
      },
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`
    });
    
    // Create invoice in database
    const invoice = await createInvoice({
      invoiceNumber,
      patientName,
      patientId,
      patientEmail: email,
      amount,
      hospitalId,
      reference,
      paymentStatus: 'pending',
      paymentMethod: 'online',
      paymentLink: response.data.data.authorization_url,
      hospital
    });
    
    res.status(200).json({
      success: true,
      paymentLink: response.data.data.authorization_url,
      reference,
      invoiceId: invoice._id
    });
  } catch (error) {
    console.error('Error generating payment link:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
};

// Record cash payment
export const recordCashPayment = async (req, res) => {
  try {
    const {
      amount,
      invoiceNumber,
      patientId,
      patientName,
      hospitalId,
      recordedBy,
      patientEmail
    } = req.body;

    // Get hospital details from your database
    const hospital = await HospitalAdminAccount.findById(hospitalId);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found'
      });
    }
    
    // Generate unique reference
    const reference = `CASH-${invoiceNumber}-${Date.now()}`;
    
    // Create invoice in database using the common function
    const invoice = await createInvoice({
      invoiceNumber,
      patientName,
      patientId,
      patientEmail,
      amount,
      hospitalId,
      reference,
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      hospital
    });
    
    // Record payment
    const payment = await Payment.create({
      invoiceId: invoice._id,
      reference,
      amount: Math.round(amount * 100), // Convert to kobo
      paymentMethod: 'cash',
      recordedBy,
      hospitalId,
      patientId,
      patientName,
      status: 'successful',
      metadata: {
        invoice_number: invoiceNumber,
        hospital_name: hospital.name
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Cash payment recorded successfully',
      data: {
        invoice,
        payment
      }
    });
  } catch (error) {
    console.error('Error recording cash payment:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
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

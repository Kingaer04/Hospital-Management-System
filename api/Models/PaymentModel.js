// backend/Models/PaymentModel.js
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash', 'transfer', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'reversed'],
    default: 'pending'
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'  // Assuming you have a User model for staff/admin who records payments
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalAdminAccount',
    required: true
  },
  patientId: {
    type: String
  },
  patientName: {
    type: String
  },
  transactionFee: {
    type: Number
  },
  channel: {
    type: String
  },
  gateway: {
    type: String,
    default: 'paystack'
  },
  currency: {
    type: String,
    default: 'NGN'
  },
  metadata: {
    type: Object
  },
  gatewayResponse: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
PaymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Payment = mongoose.model('Payment', PaymentSchema);

export default Payment;

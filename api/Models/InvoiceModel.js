// backend/Models/InvoiceModel.js
import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientId: {
    type: String
  },
  patientEmail: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalAdminAccount',
    required: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'cash', 'transfer', 'other'],
    default: 'online'
  },
  paymentLink: {
    type: String
  },
  paidAmount: {
    type: Number
  },
  paidAt: {
    type: Date
  },
  metadata: {
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
InvoiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Invoice = mongoose.model('Invoice', InvoiceSchema);

export default Invoice;

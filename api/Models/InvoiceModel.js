import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalAdminAccount',
    required: true
  },
  reference: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'canceled'],
    default: 'pending'
  },
  paymentLink: {
    type: String,
    trim: true
  },
  paidAmount: {
    type: Number,
    min: 0
  },
  paidAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;

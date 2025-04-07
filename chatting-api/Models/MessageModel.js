import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalAdminAccount',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalAdminAccount'
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HospitalAdminAccount'
  },
  text: {
    type: String,
    trim: true
  },
  mediaUrl: {
    type: String,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'voice', 'document'],
    default: 'text'
  },
  readAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Compound index for faster fetching of conversations
MessageSchema.index({ sender: 1, receiver: 1 });
MessageSchema.index({ hospitalId: 1 });

export const Message = mongoose.model('Message', MessageSchema);

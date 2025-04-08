import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffData",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffData",
      required: true,
    },
    hospital_ID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HospitalAdminAccount",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ hospital_ID: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;

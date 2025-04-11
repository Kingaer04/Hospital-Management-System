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
    messageType: {
      type: String,
      enum: ["text", "file", "voice", "emoji"],
      default: "text",
    },
    // For file messages
    fileUrl: String,
    fileName: String,
    fileType: String,
    fileSize: Number,
    // For voice messages
    audioUrl: String,
    duration: Number,
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

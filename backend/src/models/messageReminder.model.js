import mongoose from "mongoose";

const messageReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    remindAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "triggered"],
      default: "pending",
      required: true,
    },
    processingAt: {
      type: Date,
    },
    triggeredAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

messageReminderSchema.index({ status: 1, remindAt: 1 });

const MessageReminder = mongoose.model("MessageReminder", messageReminderSchema);

export default MessageReminder;

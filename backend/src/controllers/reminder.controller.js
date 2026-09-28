import mongoose from "mongoose";
import Message from "../models/message.model.js";
import MessageReminder from "../models/messageReminder.model.js";

export async function createMessageReminder(req, res) {
  try {
    const { messageId, chatId, remindAt } = req.body;
    const userId = req.user._id;
    const reminderDate = new Date(remindAt);

    if (
      !mongoose.isValidObjectId(messageId) ||
      !mongoose.isValidObjectId(chatId) ||
      !Number.isFinite(reminderDate.getTime()) ||
      reminderDate <= new Date()
    ) {
      return res.status(400).json({ message: "A valid future reminder time is required" });
    }

    const message = await Message.findOne({
      _id: messageId,
      $or: [
        { senderId: userId, receiverId: chatId },
        { senderId: chatId, receiverId: userId },
      ],
    }).select("_id");

    if (!message) {
      return res.status(404).json({ message: "Message not found in this conversation" });
    }

    const reminder = await MessageReminder.create({
      userId,
      messageId: message._id,
      chatId,
      remindAt: reminderDate,
    });

    res.status(201).json({
      _id: reminder._id,
      remindAt: reminder.remindAt,
      status: reminder.status,
    });
  } catch (error) {
    console.error("Error in createMessageReminder:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

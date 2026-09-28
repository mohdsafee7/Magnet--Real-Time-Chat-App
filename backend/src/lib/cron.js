import { CronJob } from "cron";
import http from "node:http";
import https from "node:https";
import Message from "../models/message.model.js";
import MessageReminder from "../models/messageReminder.model.js";
import { getReceiverSocketId, io } from "./socket.js";

const PROCESSING_TIMEOUT_MS = 5 * 60 * 1000;

// every 14 minutes send a GET request to the health endpoint
const job = new CronJob("*/14 * * * *", function () {
  const base = process.env.FRONTEND_URL;
  if (!base) return;
  const url = new URL("/health", base).href;
  const client = url.startsWith("https:") ? https : http;

  client
    .get(url, (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfully");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (e) => console.error("Error while sending request", e));
});

let isProcessingReminders = false;

async function processDueReminders() {
  if (isProcessingReminders) return;

  isProcessingReminders = true;
  try {
    const now = new Date();
    const staleProcessingBefore = new Date(now.getTime() - PROCESSING_TIMEOUT_MS);
    const dueReminders = MessageReminder.find({
      remindAt: { $lte: new Date() },
      $or: [
        { status: "pending" },
        { status: "processing", processingAt: { $lte: staleProcessingBefore } },
      ],
    })
      .sort({ remindAt: 1 })
      .select("_id userId messageId chatId")
      .cursor();

    for await (const dueReminder of dueReminders) {
      const receiverSocketId = getReceiverSocketId(String(dueReminder.userId));
      if (!receiverSocketId) continue;

      const claimTime = new Date();
      const reminder = await MessageReminder.findOneAndUpdate(
        {
          _id: dueReminder._id,
          remindAt: { $lte: claimTime },
          $or: [
            { status: "pending" },
            { status: "processing", processingAt: { $lte: staleProcessingBefore } },
          ],
        },
        { $set: { status: "processing", processingAt: claimTime } },
        { new: true },
      );
      if (!reminder) continue;

      try {
        const message = await Message.findById(reminder.messageId).select("text");
        io.to(receiverSocketId).emit("messageReminder", {
          reminderId: String(reminder._id),
          messageId: String(reminder.messageId),
          chatId: String(reminder.chatId),
          messageText: message?.text?.slice(0, 120) || "A message you saved is due.",
        });

        await MessageReminder.updateOne(
          { _id: reminder._id, status: "processing" },
          { $set: { status: "triggered", triggeredAt: new Date() }, $unset: { processingAt: 1 } },
        );
      } catch (error) {
        console.error("Error while processing message reminder:", error.message);
      }
    }
  } catch (error) {
    console.error("Error in message reminder cron job:", error.message);
  } finally {
    isProcessingReminders = false;
  }
}

const reminderJob = new CronJob("* * * * *", processDueReminders);

export { reminderJob };
export default job;

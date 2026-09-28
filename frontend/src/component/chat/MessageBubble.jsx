import { withTransform } from "../../lib/imagekit.js";
import { MessageVideo } from "./MessageVideo";
import { Button, Modal, useOverlayState } from "@heroui/react";
import { useState } from "react";
import { BellIcon, MoreVerticalIcon } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

// Compress + size images for the bubble (q-auto works for images; f-auto picks WebP/AVIF).
const IMAGE_TRANSFORM = "q-auto,w-640,f-auto";

function getDateTimeLocalValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function MessageBubble({ message, chatId, isHighlighted }) {
  const isOwnMessage = message.role === "me";
  const hasImage = Boolean(message.imageUrl);
  const hasVideo = Boolean(message.videoUrl);
  const modal = useOverlayState();
  const createMessageReminder = useChatStore((state) => state.createMessageReminder);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reminderOption, setReminderOption] = useState("10 minutes");
  const [customDateTime, setCustomDateTime] = useState(() =>
    getDateTimeLocalValue(new Date(Date.now() + 10 * 60_000)),
  );
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  const selectedReminderTime = () => {
    const now = new Date();
    if (reminderOption === "10 minutes") return new Date(now.getTime() + 10 * 60_000);
    if (reminderOption === "1 hour") return new Date(now.getTime() + 60 * 60_000);
    if (reminderOption === "Tomorrow") {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    return new Date(customDateTime);
  };

  const handleCreateReminder = async () => {
    const remindAt = selectedReminderTime();
    if (!Number.isFinite(remindAt.getTime()) || remindAt <= new Date()) return;

    setIsSavingReminder(true);
    const created = await createMessageReminder({
      messageId: message.id,
      chatId,
      remindAt: remindAt.toISOString(),
    });
    setIsSavingReminder(false);
    if (created) modal.close();
  };

  const reminderOptions = ["10 minutes", "1 hour", "Tomorrow", "Custom date/time"];
  const minCustomDateTime = getDateTimeLocalValue(new Date());

  return (
    <>
      <div
        id={`message-${message.id}`}
        className={`group flex w-full items-start gap-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}
      >
        {!isOwnMessage ? (
          <MessageActions
            menuOpen={menuOpen}
            onToggleMenu={() => setMenuOpen((isOpen) => !isOpen)}
            onRemind={() => {
              setMenuOpen(false);
              modal.open();
            }}
          />
        ) : null}
        <div
          className={`max-w-[min(90%,28rem)] rounded-2xl px-3 py-2 text-[15px] leading-snug transition-shadow sm:max-w-[min(75%,28rem)] sm:px-3.5 ${
            isOwnMessage
              ? "rounded-br-md bg-accent text-accent-foreground"
              : "rounded-bl-md bg-surface"
          } ${isHighlighted ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : ""}`}
        >
          {hasImage ? (
            <img
              src={withTransform(message.imageUrl, IMAGE_TRANSFORM)}
              alt=""
              className="mb-1.5 max-h-40 max-w-full rounded-lg object-cover sm:max-h-52 sm:rounded-xl"
            />
          ) : null}
          {hasVideo ? <MessageVideo src={message.videoUrl} /> : null}
          {message.text ? (
            <p className="whitespace-pre-wrap wrap-break-word">{message.text}</p>
          ) : null}
          <p
            className={`mt-1 text-[11px] tabular-nums ${
              isOwnMessage ? "text-accent-foreground/75" : "text-muted"
            }`}
          >
            {message.time}
          </p>
        </div>
        {isOwnMessage ? (
          <MessageActions
            menuOpen={menuOpen}
            onToggleMenu={() => setMenuOpen((isOpen) => !isOpen)}
            onRemind={() => {
              setMenuOpen(false);
              modal.open();
            }}
          />
        ) : null}
      </div>
      <Modal.Root state={modal}>
        <Modal.Backdrop variant="opaque">
          <Modal.Container size="sm" placement="center">
            <Modal.Dialog className="border border-white/10 bg-[#2a2a2c] text-foreground shadow-2xl">
              <Modal.Header className="flex flex-row items-center justify-between gap-3 border-b border-white/10 pb-3">
                <Modal.Heading className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white">
                  <BellIcon className="size-5 text-accent" aria-hidden />
                  Remind me
                </Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-4 pt-4">
                <p className="line-clamp-2 text-sm text-zinc-400">
                  {message.text || (hasImage ? "Photo message" : hasVideo ? "Video message" : "Message")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {reminderOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={reminderOption === option}
                      onClick={() => setReminderOption(option)}
                      className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                        reminderOption === option
                          ? "border-accent bg-accent/15 text-foreground"
                          : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {reminderOption === "Custom date/time" ? (
                  <label className="block space-y-2 text-sm text-zinc-300">
                    Choose date and time
                    <input
                      type="datetime-local"
                      min={minCustomDateTime}
                      value={customDateTime}
                      onChange={(event) => setCustomDateTime(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-background px-3 py-2.5 text-foreground"
                    />
                  </label>
                ) : null}
                <Button
                  variant="primary"
                  className="w-full"
                  isDisabled={
                    isSavingReminder ||
                    (reminderOption === "Custom date/time" &&
                      (!Number.isFinite(selectedReminderTime().getTime()) ||
                        selectedReminderTime() <= new Date()))
                  }
                  onPress={handleCreateReminder}
                >
                  {isSavingReminder ? "Setting reminder..." : "Set reminder"}
                </Button>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>
    </>
  );
}

function MessageActions({ menuOpen, onToggleMenu, onRemind }) {
  return (
    <div className="relative z-10 mt-1 shrink-0">
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        aria-label="Message actions"
        aria-expanded={menuOpen}
        className="size-7 text-muted opacity-70 hover:bg-surface hover:text-foreground group-hover:opacity-100"
        onPress={onToggleMenu}
      >
        <MoreVerticalIcon className="size-4" aria-hidden />
      </Button>
      {menuOpen ? (
        <div className="absolute top-full z-20 mt-1 min-w-36 rounded-xl border border-border bg-background p-1 shadow-xl">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-surface"
            onClick={onRemind}
          >
            <BellIcon className="size-4 text-accent" aria-hidden />
            Remind me
          </button>
        </div>
      ) : null}
    </div>
  );
}

import useScrollToBottom from "../../hooks/useScrollToBottom";
import { MessageBubble } from "./MessageBubble";
import { NoConversationPlaceholder } from "./NoConversationPlaceholder";
import { useSelectedConversation } from "../../hooks/useSelectedConversation";
import { useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";

export function MessageList() {
  const { activeConversation, activeConversationId } = useSelectedConversation();
  const highlightedMessageId = useChatStore((state) => state.highlightedMessageId);
  const clearHighlightedMessage = useChatStore((state) => state.clearHighlightedMessage);

  const lastMessageId = activeConversation?.messages.at(-1)?.id;
  const messagesScrollRef = useScrollToBottom(activeConversationId, lastMessageId);

  useEffect(() => {
    if (!highlightedMessageId) return;
    const messageElement = document.getElementById(`message-${highlightedMessageId}`);
    if (!messageElement) return;

    messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    const timeout = window.setTimeout(clearHighlightedMessage, 3000);
    return () => window.clearTimeout(timeout);
  }, [activeConversationId, clearHighlightedMessage, highlightedMessageId, lastMessageId]);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {activeConversation ? (
        <div
          ref={messagesScrollRef}
          className="flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-2 py-3 sm:px-3 sm:py-4"
        >
          <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-wide text-muted">
            Today
          </p>
          {activeConversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              chatId={activeConversationId}
              isHighlighted={message.id === highlightedMessageId}
            />
          ))}
        </div>
      ) : (
        <NoConversationPlaceholder />
      )}
    </div>
  );
}

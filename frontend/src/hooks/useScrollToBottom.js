import { useEffect, useRef } from "react";

/**
 * Scrolls a container to the bottom when `threadKey` or `lastItemId` changes
 * (e.g. new message or switched conversation). Returns a ref for the scrollable element.
 */
function useScrollToBottom(threadKey, lastItemId) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (threadKey == null || threadKey === "") return;
    const el = scrollRef.current;
    if (!el) return;
    const scrollToBottom = () => {
      el.scrollTop = el.scrollHeight;
    };
    scrollToBottom();
    requestAnimationFrame(scrollToBottom);
  }, [threadKey, lastItemId]);

  return scrollRef;
}

export default useScrollToBottom;

/*This custom React hook, `useScrollToBottom`, is designed to automatically scroll a container to the bottom 
whenever the `threadKey` or `lastItemId` changes. It returns a ref that should be attached to the scrollable element. 
The hook uses the `useEffect` hook to perform the scrolling action whenever the specified dependencies change, ensuring 
that the latest content is always visible to the user. */
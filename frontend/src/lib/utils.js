export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

// This file contains utility functions that can be used throughout the application.
//  The `formatMessageTime` function takes a date as input and returns a formatted time string in the format
//  of "hour:minute" (e.g., "3:45 PM").
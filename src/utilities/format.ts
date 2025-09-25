// src/utilities/format.ts
import { Timestamp } from "firebase/firestore";

// Reused formatters
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/**
 * Format Firestore Timestamp or Date into a readable string.
 * Unknown values return an empty string.
 */
export function formatDate(value?: Date | Timestamp | null): string {
  if (!value) return "";

  let date: Date;
  if (value instanceof Timestamp) {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else {
    return "";
  }

  return DATE_FORMATTER.format(date);
}

/**
 * Format number into USD currency string.
 * Returns "$0.00" for null/undefined/NaN.
 */
export function formatPrice(amount?: number): string {
  if (!Number.isFinite(amount as number)) return "$0.00";
  return USD_FORMATTER.format(amount as number);
}

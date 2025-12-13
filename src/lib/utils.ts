import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formats a date string by subtracting 5 hours and 30 minutes.
 * Used to normalize UTC/Server timestamps if they are incorrect or requested by user.
 */
export function formatDateWithOffset(timestamp: string): string {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    // Subtract 5 hours and 30 minutes
    date.setMinutes(date.getMinutes() - 330);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

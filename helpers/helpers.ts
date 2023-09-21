import crypto from "crypto";
import { subMonths, differenceInDays } from "date-fns";

export const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const currentDate = `${year}-${month}-${day}`;
  return currentDate;
};

export const get2WeeksAgoDate = (): string => {
  const now = new Date();
  const twoWeeksAgo = new Date(now.setDate(now.getDate() - 14));
  const year = twoWeeksAgo.getFullYear().toString();
  const month = (twoWeeksAgo.getMonth() + 1).toString().padStart(2, "0");
  const day = twoWeeksAgo.getDate().toString().padStart(2, "0");
  const twoWeeksAgoDate = `${year}-${month}-${day}`;
  return twoWeeksAgoDate;
};

export const getTomorrowsDate = (): string => {
  const now = new Date();
  const tomorrow = new Date(now.setDate(now.getDate() + 1));
  const year = tomorrow.getFullYear().toString();
  const month = (tomorrow.getMonth() + 1).toString().padStart(2, "0");
  const day = tomorrow.getDate().toString().padStart(2, "0");
  const tomorrowsDate = `${year}-${month}-${day}`;
  return tomorrowsDate;
};

export function base64URLEncode(str: any) {
  return str
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function sha256(buffer: any) {
  return crypto.createHash("sha256").update(buffer).digest();
}

export const formatDuration = (duration: number): string => {
  const hours = Math.floor(duration / 3600);
  const remainingSeconds = duration % 3600;
  const minutes = Math.floor(remainingSeconds / 60);

  return `${hours}h ${minutes + 1}m`;
};

export const getDaysSinceLastMonth = (dateString: string): number => {
  const currentDate = new Date(dateString);
  const oneMonthBefore = subMonths(currentDate, 1);
  const daysSince = differenceInDays(currentDate, oneMonthBefore);

  return daysSince;
};

export const formatSteps = (steps: number): string => {
  return steps.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const getTimeSince = (date: string, time: string): string => {
  const currentDate = new Date();
  const inputDate = new Date(`${date}T${time}`);

  const diffInMs = currentDate.getTime() - inputDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInDays >= 1) {
    return `${diffInDays} days ago`;
  } else if (diffInHours >= 1) {
    return `${diffInHours} hours ago`;
  } else {
    return `${diffInMinutes} min ago`;
  }
};

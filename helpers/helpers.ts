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

  return `${hours}h ${minutes}m`;
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

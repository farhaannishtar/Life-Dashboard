import crypto from "crypto";

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

export const calculateSleepScorePercentageChange = (
  oldScore: number,
  newScore: number
): number => {
  let percentageChange = ((newScore - oldScore) / oldScore) * 100;
  return parseFloat(percentageChange.toFixed(1));
};

export const calculateStepCountPercentChange = (
  yesterdaySteps: number,
  todaySteps: number
): number => {
  let percentageChange = ((todaySteps - yesterdaySteps) / yesterdaySteps) * 100;
  return parseFloat(percentageChange.toFixed(1));
};

export const formatSteps = (steps: number): string => {
  return steps.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

import crypto from "crypto";
import { subMonths, differenceInDays, startOfWeek } from "date-fns";

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
    return diffInDays === 1
      ? `${diffInDays} day ago`
      : `${diffInDays} days ago`;
  } else if (diffInHours >= 1) {
    return `${diffInHours} hours ago`;
  } else {
    return `${diffInMinutes} min ago`;
  }
};

export function calculateCurrentStreak(
  checkedDays: boolean[],
  baseStreak: number,
  habitName: string
): number {
  const todayIndex = (new Date().getDay() - 1 + 7) % 7; // Assuming 0 is Monday

  // Special logic for the "Lift Weights" habit
  if (habitName === "Lift Weights") {
    let uncheckedDayCount = checkedDays
      .slice(0, todayIndex + 1)
      .filter((day) => !day).length;
    let daysPassedInWeek = todayIndex + 1;

    if (uncheckedDayCount >= 3) {
      return checkedDays[todayIndex] ? 1 : 0;
    } else {
      return baseStreak + daysPassedInWeek;
    }
  } else {
    // Logic for daily habits
    let dayMissedBeforeToday = checkedDays
      .slice(0, todayIndex)
      .some((day) => !day);

    // Reset streak to 1 if previous day is unchecked but today is checked
    if (
      todayIndex > 0 &&
      !checkedDays[todayIndex - 1] &&
      checkedDays[todayIndex]
    ) {
      return 1;
    } else if (dayMissedBeforeToday) {
      return 0; // Reset streak to 0 if any day before today is missed
    } else {
      // Continue streak including today if it's checked
      return (
        baseStreak +
        (checkedDays.slice(0, todayIndex).every((day) => day)
          ? todayIndex
          : 0) +
        (checkedDays[todayIndex] ? 1 : 0)
      );
    }
  }
}

export const setMidnightTimer = (callback: Function): NodeJS.Timeout => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const timeUntilMidnight = +tomorrow - +today;
  return setTimeout(() => callback(), timeUntilMidnight);
};

// Function to convert local date to a database-compatible date string
export const convertToDBCompatibleDate = (localDate: Date) => {
  const utcDate = new Date(
    localDate.getTime() - localDate.getTimezoneOffset() * 60000
  );
  utcDate.setTime(utcDate.getTime() + 5 * 60 * 60 * 1000);
  return utcDate.toISOString().replace("T", " ").replace(".000Z", "+00");
};

// Function to initialize the week's start date
export const initializeWeekStartDate = () => {
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // 1 for Monday
  currentWeekStart.setHours(0, 0, 0, 0);
  return currentWeekStart.toISOString();
};

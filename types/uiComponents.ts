type SleepScoreProps = {
  score: number;
};

type SleepTimeCardProps = {
  title: string;
  body: string;
  borderColor: string;
  textColor: string;
  bgColor: string;
};

interface PhysicalStatsCardProps {
  emoji: string;
  title: string;
  body: string;
  unit: string;
  borderColor: string;
  textColor: string;
  bgColor: string;
}

interface HabitWeekCalendarProps {
  emoji: string;
  habit: string;
  frequency: string;
  calendarBorderColor: string;
  calendarTextColor: string;
  calendarBgColor: string;
  calendarBubbleBgColor: string;
  calendarBubbleBorderColor: string;
}

interface HabitStreakCardProps {
  streak: number;
  borderColor: string;
  textColor: string;
  bgColor: string;
}

export type {
  SleepScoreProps,
  SleepTimeCardProps,
  PhysicalStatsCardProps,
  HabitWeekCalendarProps,
  HabitStreakCardProps,
};

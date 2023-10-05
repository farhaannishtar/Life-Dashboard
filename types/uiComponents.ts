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
  body: any;
  unit: string;
  borderColor: string;
  textColor: string;
  bgColor: string;
}

interface HabitStreakCardProps {
  streak: number;
  borderColor: string;
  textColor: string;
  bgColor: string;
}

interface HabitProps {
  emoji: string;
  habit: string;
  frequency: string;
  calendarBorderColor: string;
  calendarTextColor: string;
  calendarBgColor: string;
  calendarBubbleBgColorChecked: string;
  calendarBubbleBgColor: string;
  calendarBubbleBorderColor: string;
  streak: number;
  streakBorderColor: string;
  streakTextColor: string;
  streakBgColor: string;
  lineColor: string;
  habitData: HabitWeekData | undefined;
  start_monday_of_week: Date | undefined;
  updateCurrentWeek: (habitData: HabitWeekData) => void;
}

interface HabitWeekData {
  habit_name: string;
  streak_count: number;
  checked_days: boolean[];
}

interface CurrentWeek {
  start_monday_of_week: Date;
  habits: Record<string, HabitWeekData>;
}

export type {
  SleepScoreProps,
  SleepTimeCardProps,
  PhysicalStatsCardProps,
  HabitStreakCardProps,
  HabitProps,
  HabitWeekData,
  CurrentWeek,
};

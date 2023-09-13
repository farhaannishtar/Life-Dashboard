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

export type { SleepScoreProps, SleepTimeCardProps, PhysicalStatsCardProps };

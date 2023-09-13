interface OuraRingDailySleepData {
  data: Array<{
    score: number;
    day: string;
  }>;
}

interface OuraRingSleepData {
  data: Array<{
    time_in_bed: number;
    total_sleep_duration: string;
  }>;
}

interface OuraRingDailySleepDataChart {
  data: {
    score: number;
    day: number;
  }[];
}

type OuraRingActivityData = Array<{
  steps: number;
}>;

export type {
  OuraRingDailySleepData,
  OuraRingSleepData,
  OuraRingDailySleepDataChart,
  OuraRingActivityData,
};

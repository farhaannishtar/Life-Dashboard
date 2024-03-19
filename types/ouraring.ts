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

// Combined data type
interface CombinedOuraRingData {
  dailySleep?: OuraRingDailySleepData;
  sleep?: OuraRingSleepData;
  // dailySleepChart?: OuraRingDailySleepDataChart;
  activity?: OuraRingActivityData;
}

interface UseOuraDataReturnType {
  ouraData: CombinedOuraRingData;
  loading: boolean;
  error: string[];
}

export type {
  OuraRingDailySleepData,
  OuraRingSleepData,
  UseOuraDataReturnType,
  OuraRingActivityData,
  CombinedOuraRingData
};

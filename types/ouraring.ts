interface OuraSleepScoreData {
  data: Array<{
    score: number;
    day: string;
  }>;
}

interface OuraSleepDurationData {
  data: Array<{
    time_in_bed: number;
    total_sleep_duration: string;
  }>;
}

interface OuraActivityData {
  data: {
    steps: number;
  }[];
}

interface OuraRecommendedSleepTimeData {
  data: {
    bed_time_start: string;
    bed_time_end: string;
  }[];
}

// Combined data type
interface CombinedOuraData {
  sleepScore?: OuraSleepScoreData;
  sleep?: OuraSleepDurationData;
  activity?: OuraActivityData;
  recommendedSleepTime?: OuraRecommendedSleepTimeData;
}

interface UseOuraDataReturnType {
  ouraData: CombinedOuraData;
  loading: boolean;
  error: string[];
}

export type {
  UseOuraDataReturnType,
  OuraSleepScoreData,
  OuraSleepDurationData,
  OuraActivityData,
  OuraRecommendedSleepTimeData,
  CombinedOuraData
};

import { useState, useEffect } from 'react';
import { OuraSleepScoreData, OuraSleepDurationData, OuraRecommendedSleepTimeData, OuraActivityData, CombinedOuraData, UseOuraDataReturnType } from '../types/ouraring';
import { getLastWeeksDate, getTomorrowsDate } from '../helpers/helpers';

const useOuraData = (): UseOuraDataReturnType => {
  const [ouraData, setOuraData] = useState<CombinedOuraData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string[]>([]); // Store errors as an array of strings

  const startDate = getLastWeeksDate();
  const endDate = getTomorrowsDate();


  const fetchData = async () => {
    setLoading(true);
    setError([]);

    const results = await Promise.allSettled([
      fetch(`/api/fetchOuraSleepScore?start_date=${startDate}&end_date=${endDate}`),
      fetch(`/api/fetchOuraSleep?start_date=${startDate}&end_date=${endDate}`),
      fetch(`/api/fetchOuraActivity?start_date=${startDate}&end_date=${endDate}`),
      fetch(`/api/fetchOuraRecommendedSleepTime?start_date=${startDate}&end_date=${endDate}`)
    ]);

    const newData: CombinedOuraData = {};
    const newErrors: string[] = [];

    await Promise.all(results.map(async (result, index) => {
      if (result.status === 'fulfilled') {
        try {
          const jsonResponse = await result.value.json();
          switch (index) {
            case 0:
              newData.sleepScore = jsonResponse as OuraSleepScoreData;
              break;
            case 1:
              newData.sleep = jsonResponse as OuraSleepDurationData;
              break;
            case 2:
              newData.activity = jsonResponse as OuraActivityData;
              break;
            case 3:
              newData.recommendedSleepTime = jsonResponse as OuraRecommendedSleepTimeData;
              break;
            default:
              break;
          }
        } catch (e) {
          newErrors.push(`Error processing data from endpoint ${index + 1}: ${e}`);
        }
      } else { // 'rejected'
        newErrors.push(`Error fetching data from endpoint ${index + 1}: ${result.reason}`);
      }
    }));

    setOuraData(newData);
    if (newErrors.length > 0) {
      setError(newErrors);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { ouraData, loading, error };
};

export default useOuraData;
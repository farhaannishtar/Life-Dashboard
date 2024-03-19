import { useState, useEffect } from 'react';
import { OuraRingDailySleepData, OuraRingSleepData, OuraRingActivityData, CombinedOuraRingData, UseOuraDataReturnType } from '../types/ouraring';
import { getTomorrowsDate } from '../helpers/helpers';

const useOuraData = (): UseOuraDataReturnType => {
  const [ouraData, setOuraData] = useState<CombinedOuraRingData>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string[]>([]); // Store errors as an array of strings

  const endDate = getTomorrowsDate();


  const fetchData = async () => {
    setLoading(true);
    setError([]);

    const results = await Promise.allSettled([
      fetch(`/api/fetchOuraringDailySleep?start_date=2024-03-11`),
      fetch(`/api/fetchOuraRingSleep?start_date=2023-08-02&end_date=${endDate}`),
      fetch(`/api/fetchOuraringDailyActivity?start_date=2023-08-01&end_date=${endDate}`)
    ]);

    const newData: CombinedOuraRingData = {};
    const newErrors: string[] = [];

    await Promise.all(results.map(async (result, index) => {
      if (result.status === 'fulfilled') {
        try {
          const jsonResponse = await result.value.json();
          switch (index) {
            case 0:
              newData.dailySleep = jsonResponse as OuraRingDailySleepData;
              break;
            case 1:
              newData.sleep = jsonResponse as OuraRingSleepData;
              break;
            case 2:
              newData.activity = jsonResponse as OuraRingActivityData;
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
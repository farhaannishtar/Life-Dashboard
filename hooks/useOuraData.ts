import { useState, useEffect } from 'react';
import { OuraSleepScoreData, OuraSleepDurationData, OuraRecommendedSleepTimeData, OuraActivityData, CombinedOuraData, UseOuraDataReturnType } from '../types/ouraring';
import { getLastWeeksDate, getTomorrowsDate } from '../helpers/helpers';


// Calculate Bedtime Function move to helpers/helpers.ts later
function calculateBedtime(end_offset: number, start_offset: number): {startTime: string, endTime: string} {
  // Set timezone offset for EST (Eastern Standard Time)
  const tzOffsetHours = -5;

  // Convert offsets to hours, adjust for timezone, and wrap around 24 hours if necessary
  let startHour = (start_offset / 3600 + tzOffsetHours) % 24;
  let endHour = (end_offset / 3600 + tzOffsetHours) % 24;

  // If the hour is negative, adjust it to be within 0-23
  if (startHour < 0) startHour += 24;
  if (endHour < 0) endHour += 24;

  // Calculate minutes
  const startMinutes = Math.round((startHour % 1) * 60);
  const endMinutes = Math.round((endHour % 1) * 60);

  // Convert hours to 12-hour format with AM/PM
  const startTime = `${Math.floor(startHour) > 12 ? Math.floor(startHour) - 12 : Math.floor(startHour) === 0 ? 12 : Math.floor(startHour)}:${startMinutes.toString().padStart(2, '0')} ${startHour >= 12 ? 'PM' : 'AM'}`;
  const endTime = `${Math.floor(endHour) > 12 ? Math.floor(endHour) - 12 : Math.floor(endHour) === 0 ? 12 : Math.floor(endHour)}:${endMinutes.toString().padStart(2, '0')} ${endHour >= 12 ? 'PM' : 'AM'}`;

  return {startTime, endTime};
}

const bedtime = calculateBedtime(5400, 1800);
// console.log(`Start Time: ${bedtime.startTime}`);
// console.log(`End Time: ${bedtime.endTime}`);




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
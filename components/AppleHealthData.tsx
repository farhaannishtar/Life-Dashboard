import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, where, limit, getDocs, Timestamp } from 'firebase/firestore';

interface HealthData {
  type: string;
  value: string;
  unit: string;
  date: Timestamp;
}


export const AppleHealthData = () => {
  const [steps, setSteps] = useState<HealthData | null>(null);
  const [activeCalories, setActiveCalories] = useState<HealthData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const stepsQuery = query(collection(db, 'apple-health'), where('type', '==', 'Steps'), orderBy('date', 'desc'), limit(1));
      const stepsSnapshot = await getDocs(stepsQuery);
      const stepsData = stepsSnapshot.docs[0].data() as HealthData;
      setSteps(stepsData);

      const activeCaloriesQuery = query(collection(db, 'apple-health'), where('type', '==', 'Active Calories'), orderBy('date', 'desc'), limit(1));
      const activeCaloriesSnapshot = await getDocs(activeCaloriesQuery);
      const activeCaloriesData = activeCaloriesSnapshot.docs[0].data() as HealthData;
      setActiveCalories(activeCaloriesData);
    };
    
    fetchData();
  }, []);

  return (
    <div>
      <h2 className='mb-2 mt-0 text-5xl font-medium leading-tight text-primary'>Apple Health Data</h2>
      {steps && (
        <div className='flex gap-1'>
          <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>Last 24-hour step count:</p>
          <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>{steps.value} steps</p>
        </div>
      )}
      {activeCalories && (
        <div className='flex gap-1'>
          <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>Last 24-hour Burned Active Calories</p>
          <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>{Math.round(Number(activeCalories.value))} {activeCalories.unit}</p>
        </div>
      )}
    </div>
  );
}

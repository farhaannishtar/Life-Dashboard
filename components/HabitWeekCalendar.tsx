import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';

function HabitWeekCalendar() {
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);

  const getWeekDates = () => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // 1 for Monday
    const week = Array.from({ length: 7 }, (_, index) => addDays(start, index));
    setCurrentWeek(week);
  };

  useEffect(() => {
    getWeekDates();

    // Refresh every midnight to get the next week's dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const timeUntilMidnight = +tomorrow - +today;
    const timer = setTimeout(() => getWeekDates(), timeUntilMidnight);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='w-8/12 border rounded-3xl py-6 px-5 mb-96' 
      style={{ backgroundColor: "#FCFEFF", borderColor: "#B6C8DA" }}
      >
      <div className='flex flex-row justify-between'>
          <div>
              🧘‍♂️ Meditation
          </div>
          <div>
              Everyday
          </div>
      </div>
      <div className="flex justify-between mt-5">
        {currentWeek.map((date, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="font-bold">{format(date, 'EEE')}</div>
            <div className="p-2 w-10 h-10 mt-2 border rounded-full flex items-center justify-center">
              <div>{format(date, 'dd')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HabitWeekCalendar;

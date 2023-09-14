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
    <div>
      <div className='flex flex-row justify-between px-12'>
        <div>
          🧘‍♂️  Meditation
        </div>
        <div>
          Everyday
        </div>
      </div>
      <div className="grid grid-cols-7 text-center">
        {currentWeek.map((date, index) => (
          <div key={index} className="p-4">
            <div className="font-bold">{format(date, 'EEE')}</div>
            <div>{format(date, 'dd')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HabitWeekCalendar;

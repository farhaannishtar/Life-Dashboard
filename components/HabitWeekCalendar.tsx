import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';

interface HabitWeekCalendarProps {
  emoji: string;
  habit: string;
  frequency: string;
  calendarBorderColor: string;
  calendarTextColor: string;
  calendarBgColor: string;
  calendarBubbleBgColor: string;
  calendarBubbleBorderColor: string;
}

function HabitWeekCalendar( { emoji, habit, frequency, calendarBorderColor, calendarTextColor, calendarBgColor, calendarBubbleBgColor }: HabitWeekCalendarProps ) {
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
    <div className='border rounded-3xl py-6 px-5' 
      style={{ backgroundColor: "#FCFEFF", borderColor: "#B6C8DA" }}
      >
      <div className='flex flex-row justify-between'>
          <div className='font-bold text-22 leading-8 not-italic'
            style={{ letterSpacing: '-0.44px' }}  
          >
            {emoji} <span className='ml-2'>{habit}</span>
          </div>
          <div className='not-italic leading-8 font-medium text-lg'
            style={{ letterSpacing: '-0.36px' }} 
          >
            {frequency}
          </div>
      </div>
      <div className="flex justify-between mt-6">
        {currentWeek.map((date, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="font-bold text-base" style={{ color: calendarTextColor }} >{format(date, 'EEE')}</div>
            <div className="p-2 w-11 h-11 mt-2 border rounded-full flex items-center justify-center"
              style={{ borderColor: calendarBorderColor, backgroundColor: calendarBubbleBgColor }}  
            >
              <div className='text-xl leading-4 font-bold text-center' style={{ color: calendarTextColor, letterSpacing: '-0.4px' }} >{format(date, 'dd')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HabitWeekCalendar;

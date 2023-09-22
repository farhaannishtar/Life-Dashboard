import React, { useState, useEffect } from 'react';
import HabitStreakCard from 'components/HabitStreakCard';
import { format, addDays, startOfWeek } from 'date-fns';

interface HabitProps {
  emoji: string;
  habit: string;
  frequency: string;
  calendarBorderColor: string;
  calendarTextColor: string;
  calendarBgColor: string;
  calendarBubbleBgColorChecked: string;
  calendarBubbleBgColor: string;
  calendarBubbleBorderColor: string;
  streak: number;
  streakBorderColor: string;
  streakTextColor: string;
  streakBgColor: string;
  lineColor: string;
}

interface WeekData {
  date: Date;
  checked: boolean;
}


function Habit( { emoji, habit, frequency, calendarBorderColor, calendarTextColor, calendarBgColor, calendarBubbleBgColorChecked, calendarBubbleBgColor, calendarBubbleBorderColor, streak, streakBorderColor, streakTextColor, streakBgColor, lineColor }: HabitProps) {
  const [currentWeek, setCurrentWeek] = useState<WeekData[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(streak);


  const getWeekDates = () => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // 1 for Monday
    const week = Array.from({ length: 7 }, (_, index) => ({
      date: addDays(start, index),
      checked: false, // You can set a default value here
    }));
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

  const bubbleClickHandler = (index: number) => {
    setCurrentWeek(prevWeek => {
      const newWeek = [...prevWeek];
      newWeek[index].checked = !newWeek[index].checked;
      return newWeek;
    });
    setCurrentStreak(currentStreak + 1);
  }

  console.log(currentWeek);

  return (
    <div className='w-full flex mt-5 items-center'>
      <div className="flex-grow-2 flex-shrink">
        <div className='border rounded-3xl py-6 px-5' 
          style={{ borderColor: calendarBorderColor, backgroundColor: calendarBgColor }}
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
            {currentWeek.map(({ date, checked }, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="font-bold text-base" style={{ color: calendarTextColor }} >{format(date, 'EEE')}</div>
                <div className="p-2 w-11 h-11 mt-2 border rounded-full flex items-center justify-center"
                  style={{ 
                    borderColor: calendarBubbleBorderColor, 
                    backgroundColor: checked ? calendarBubbleBgColorChecked : calendarBubbleBgColor 
                  }}
                  onClick={() => bubbleClickHandler(index)}  // Notice the change here
                >
                  <div className='text-xl leading-4 font-bold text-center' style={{ color: calendarTextColor, letterSpacing: '-0.4px' }} >{format(date, 'dd')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="2" viewBox="0 0 20 2" fill="none">
          <path d="M0 1L20 1" stroke={lineColor} strokeDasharray="1 1"/>
        </svg>
      </div>
      <div className="flex-grow flex-shrink">
        <HabitStreakCard 
          streak={currentStreak} 
          borderColor={streakBorderColor}
          textColor={streakTextColor}
          bgColor={streakBgColor} 
        />
      </div>
    </div>
  )
}

export default Habit;
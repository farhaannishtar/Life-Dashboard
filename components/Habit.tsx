import React, { useState } from 'react';
import HabitStreakCard from 'components/HabitStreakCard';
import { format, addDays} from 'date-fns';
import { getDay } from 'date-fns';
import styles from './Habit.module.css';
import { calculateCurrentStreak, convertToDBCompatibleDate } from 'helpers/helpers';
import { HabitProps  } from '../types/uiComponents';
import { updateCheckedDaysInDB, updateStreakCountInDB } from 'lib/databaseOps';
import { HabitWeekData } from 'types/uiComponents';

function Habit( { emoji, habit, frequency, calendarBorderColor, calendarTextColor, calendarBgColor, calendarBubbleBgColor, calendarBubbleBorderColor, streak, streakBorderColor, streakTextColor, streakBgColor, lineColor, habitData, start_monday_of_week, updateCurrentWeek }: HabitProps) {

  const [shake, setShake] = useState<number | null>(null);

  const toggleCheck = async (dayIndex: number) => {
    if (!validateToggle(dayIndex, habitData!)) {
      return;
    }
  
    const newCheckedDays = [...habitData!.checked_days];
    newCheckedDays[dayIndex] = !newCheckedDays[dayIndex];
  
    const dbCompatibleDate = convertToDBCompatibleDate(new Date(start_monday_of_week!));
  
    try {
      await updateCheckedDaysInDB(newCheckedDays, dbCompatibleDate, habitData!.habit_name);
  
      const updatedHabitData = {
        ...habitData!,
        checked_days: newCheckedDays,
      };
  
      updateCurrentWeek(updatedHabitData);
  
      const updatedStreak = calculateCurrentStreak(newCheckedDays, habitData!.streak_count, habitData!.habit_name);
      await updateStreakCountInDB(updatedStreak, habitData!.habit_name);
  
    } catch (error) {
      console.error('An error occurred while toggling the check:', error);
    }
  };
  
  let newStreak = 0;
  if (habitData) {
    newStreak = calculateCurrentStreak(habitData.checked_days, habitData.streak_count, habitData.habit_name);
  }

  // Function to validate the day index and habit data
  const validateToggle = (dayIndex: number, habitData: HabitWeekData | null) => {
    const todayIndex = getDay(new Date()) - 1; // Assuming 0 is Monday
    if (dayIndex > todayIndex) {
      setShake(dayIndex);
      setTimeout(() => setShake(null), 1000); // Reset after 1 second
      return false;
    }

    if (!habitData || !habitData.habit_name) {
      console.error('habitData or habit_name is not defined');
      return false;
    }

    return true;
  };

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
            {habitData?.checked_days.map((checked, index) => {
              const todayIndex = getDay(new Date()) - 1; // Assuming 0 is Monday
              const isTodayOrBefore = index <= todayIndex;
              return (
                <div key={index} className="flex flex-col items-center cursor-pointer relative">
                  <div className="font-bold text-base" style={{ color: calendarTextColor }}>
                    {format(addDays(start_monday_of_week as Date, index), 'EEE')}
                  </div>
                  <div
                      className={`p-2 w-11 h-11 mt-2 rounded-full flex items-center justify-center ${styles['calendar-bubble']} ${checked ? styles['checked'] : ''} ${shake === index ? styles['shake-animation'] : ''} ${isTodayOrBefore ? '' : styles['no-hover']}`}
                      style={{
                        '--border-color': calendarBubbleBorderColor,
                        backgroundColor: calendarBubbleBgColor,
                      } as React.CSSProperties}
                      onClick={() => toggleCheck(index)}
                    >
                    <div className='text-xl leading-4 font-bold text-center' style={{ color: calendarTextColor, letterSpacing: '-0.4px' }}>
                      {format(addDays(start_monday_of_week as Date, index), 'dd')}
                    </div>
                    <div className={styles['checkmark']}>
                      ✓
                    </div>
                  </div>
                </div>
              )
            })}
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
          streak={newStreak} 
          borderColor={streakBorderColor}
          textColor={streakTextColor}
          bgColor={streakBgColor} 
        />
      </div>
    </div>
  )
}

export default Habit;
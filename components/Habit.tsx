import React, { useState } from 'react';
import HabitStreakCard from 'components/HabitStreakCard';
import { format, addDays} from 'date-fns';
import { supabase } from "../lib/supabaseClient";
import { getDay } from 'date-fns';
import styles from './Habit.module.css';
import { calculateCurrentStreak } from 'helpers/helpers';
import { HabitProps  } from '../types/uiComponents';

function Habit( { emoji, habit, frequency, calendarBorderColor, calendarTextColor, calendarBgColor, calendarBubbleBgColorChecked, calendarBubbleBgColor, calendarBubbleBorderColor, streak, streakBorderColor, streakTextColor, streakBgColor, lineColor, habitData, start_monday_of_week, updateCurrentWeek }: HabitProps) {

  const [shake, setShake] = useState<number | null>(null);

  const toggleCheck = async (dayIndex: number) => {
    const todayIndex = getDay(new Date()) - 1; // Assuming 0 is Monday
    if (dayIndex > todayIndex) {
      setShake(dayIndex);
      setTimeout(() => setShake(null), 1000); // Reset after 1 second
      return;
    }
    // Make sure habitData and habitData.habit_name are defined before proceeding
    if (!habitData || !habitData.habit_name) {
      console.error('habitData or habit_name is not defined');
      return;
    }

    // Create a new checked_days array with the toggled value for the clicked day
    const newCheckedDays = [...habitData.checked_days];
    newCheckedDays[dayIndex] = !newCheckedDays[dayIndex];

    // Convert local time to UTC
    const localDate = new Date(start_monday_of_week!);
    const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

    // Manually add 4 hours to match the database (4 hours = 4 * 60 * 60 * 1000 milliseconds)
    utcDate.setTime(utcDate.getTime() + 4 * 60 * 60 * 1000);

    // Format the date-time to match the database
    const dbCompatibleDate = utcDate.toISOString().replace("T", " ").replace(".000Z", "+00");
    const { error } = await supabase
        .from('weekly_habits')
        .update({ checked_days: newCheckedDays })
        .eq('start_monday_of_week', dbCompatibleDate)  // Using the adjusted date
        .eq('habit_name', habitData.habit_name);
    
    if (error) {
      console.error('Error updating checked_days:', error);
      return;
    }

    // Update the parent's 'currentWeek' state using the 'updateCurrentWeek' function
    const updatedHabitData = {
      ...habitData,
      checked_days: newCheckedDays,
    };

    updateCurrentWeek(updatedHabitData);

    // After successfully updating checked_days
    const updatedStreak = calculateCurrentStreak(newCheckedDays, habitData.streak_count, habitData.habit_name);
    await supabase
    .from('weekly_habits')
    .update({ streak_count: updatedStreak })
    .eq('start_monday_of_week', dbCompatibleDate)
    .eq('habit_name', habitData.habit_name);
  };
  
  let newStreak = 0;
  if (habitData) {
    newStreak = calculateCurrentStreak(habitData.checked_days, habitData.streak_count, habitData.habit_name);
  }

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
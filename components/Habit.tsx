import React, { useState } from 'react';
import HabitStreakCard from 'components/HabitStreakCard';
import { format, addDays} from 'date-fns';
import { getDay } from 'date-fns';
import styles from './Habit.module.css';
import { calculateCurrentStreak, convertToDBCompatibleDate } from 'helpers/helpers';
import { HabitProps } from '../types/uiComponents';
import { updateCheckedDaysInDB, updateStreakCountInDB } from 'lib/databaseOps';
import { HabitWeekData } from 'types/uiComponents';

function Habit( { emoji, habit, frequency, calendarBorderColor, calendarTextColor, calendarBgColor, calendarBubbleBgColor, calendarBubbleBorderColor, streak, streakBorderColor, streakTextColor, streakBgColor, lineColor, habitData, start_monday_of_week, updateCurrentWeek }: HabitProps) {

  const [shake, setShake] = useState<number | null>(null);

  const toggleCheck = async (dayIndex: number) => {

    console.log("habit name:", habitData?.habit_name)

    console.log('start monday of the week: ', start_monday_of_week)

    if (!validateToggle(dayIndex, habitData!)) {
      return;
    }
    // Clone the checked_days array and toggle the day
    const newCheckedDays = [...habitData!.checked_days];
    newCheckedDays[dayIndex] = !newCheckedDays[dayIndex];
  
    // Convert date to a format compatible with your database
    const dbCompatibleDate = convertToDBCompatibleDate(new Date(start_monday_of_week!));
 
    console.log("dbCompatibleDate: ", )

    try {
      // Update checked days in the database
      await updateCheckedDaysInDB(newCheckedDays, dbCompatibleDate, habitData!.habit_name);
  
      // Calculate the updated streak
      const updatedStreak = calculateCurrentStreak(newCheckedDays, habitData!.streak_count as number, habitData!.habit_name as string);
      
      // Update the streak count in the database
      await updateStreakCountInDB(updatedStreak, habitData!.habit_name);
  
      // Update the local habit data state
      const updatedHabitData = {
        ...habitData,
        checked_days: newCheckedDays,
        streak_count: updatedStreak, // Update the streak count here
      };
  
      // Update the parent component's state
      updateCurrentWeek(updatedHabitData);
  
    } catch (error) {
      console.error('An error occurred while toggling the check:', error);
    }
  };
  
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

  let newStreak = 0;

  if (habitData && habitData.checked_days && habitData.habit_name) {
    newStreak = calculateCurrentStreak(habitData.checked_days, streak, habitData.habit_name);
  }

  // Initialize the checked_days for the habit
  const initializeCheckedDays = () => {
    if (!habitData) {
      console.error("habitData is undefined");
      return; // Exit the function early if habitData is undefined
    }
  
    const todayIndex = new Date().getDay(); // Assuming 0 is Sunday, 1 is Monday, etc.
    const newCheckedDays = habitData.checked_days.map((_, index) => index <= todayIndex);
  
    // Update the habitData with the new checked_days
    const updatedHabitData = {
      ...habitData,
      checked_days: newCheckedDays,
    };

    // Propagate the change to the parent component
    updateCurrentWeek(updatedHabitData!);
  };

  // console.log("habitData: ", habitData);
  // console.log("new streak: ", newStreak)
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
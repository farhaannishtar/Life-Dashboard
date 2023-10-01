import Habit from './Habit'
import React, { useState, useEffect } from 'react';
import { startOfWeek, isSameWeek } from 'date-fns';
import { getLatestWeekData } from 'lib/databaseOps';

interface HabitWeekData {
  habit_name: string;
  checked_days: boolean[];
}

interface CurrentWeek {
  start_monday_of_week: Date;
  habits: HabitWeekData[];
}

function DailyVows() {

  const [currentWeek, setCurrentWeek] = useState<CurrentWeek>();
  
  
  const initializeWeek = async () => {
    const today = new Date();
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // 1 for Monday
    const latestWeekData = await getLatestWeekData();
    
    if (latestWeekData && isSameWeek(new Date(latestWeekData.start_monday_of_week), currentWeekStart)) {
      setCurrentWeek({
        start_monday_of_week: new Date(latestWeekData.start_monday_of_week),
        habits: latestWeekData.habits.map(habit => ({
          habit_name: habit.habit_name,
          checked_days: habit.checked_days,
        })),
      });
    }
  };
  
  useEffect(() => {
    initializeWeek();
    
    // Refresh every midnight to get the next week's dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = +tomorrow - +today;
    const timer = setTimeout(() => initializeWeek(), timeUntilMidnight);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='pb-12'>
        <div className='mt-7 font-bold text-28 leading-8 not-italic'
          style={{ letterSpacing: '-0.56px' }}
        >
          Daily Vows
        </div>
        <div className='flex flex-col space-y-6'>
          <Habit 
            emoji='🧘‍♂️'
            habit='Meditation'
            frequency='Everyday'
            calendarBorderColor={"#B6C8DA"}
            calendarTextColor={"#2C4763"}
            calendarBgColor={"#FCFEFF"}
            calendarBubbleBgColorChecked={"#F2F2F2"}
            calendarBubbleBgColor={"#FFF"}
            calendarBubbleBorderColor={"#ADBCCB"}
            streak={24}
            streakBorderColor={"#B6C8DA"}
            streakTextColor={"#506579"}
            streakBgColor={"#FCFEFF"}
            lineColor={"#B6C8DA"}
            habitData={currentWeek?.habits[0]}
            start_monday_of_week={currentWeek?.start_monday_of_week}
          />
          <Habit 
            emoji='🏋️'
            habit='Lift Weights'
            frequency='5 days a week'
            calendarBorderColor={"#DAD6B6"}
            calendarTextColor={"#634D2C"}
            calendarBgColor={"#FFFFFC"}
            calendarBubbleBgColorChecked={"#FDFCCF"}
            calendarBubbleBgColor={"#FFFEF1"}
            calendarBubbleBorderColor={"#CACBAD"}
            streak={45}
            streakBorderColor={"#DAD6B6"}
            streakTextColor={"#634D2C"}
            streakBgColor={"#FFFFFC"}
            lineColor={"#DAD6B6"}
            habitData={currentWeek?.habits[2]}
            start_monday_of_week={currentWeek?.start_monday_of_week}
          />
          <Habit 
            emoji='✒️'
            habit='Journal'
            frequency='Everyday'
            calendarBorderColor={"#DAB6B6"}
            calendarTextColor={"#632C2C"}
            calendarBgColor={"#FFFCFC"}
            calendarBubbleBgColorChecked={"#FFF4F4"}
            calendarBubbleBgColor={"#FFFBFB"}
            calendarBubbleBorderColor={"#CBADAD"}
            streak={4}
            streakBorderColor={"#DAB6B6"}
            streakTextColor={"#632C2C"}
            streakBgColor={"#FFFCFC"}
            lineColor={"#DAB6B6"}
            habitData={currentWeek?.habits[1]}
            start_monday_of_week={currentWeek?.start_monday_of_week}
          />
        </div>
      </div>
  )
}

export default DailyVows;
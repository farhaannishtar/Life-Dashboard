import Habit from './Habit'
import React, { useState, useEffect } from 'react';
import { startOfWeek, isSameWeek } from 'date-fns';
import { getLatestWeekData, getHabitsStreakData } from 'lib/databaseOps';

interface HabitWeekData {
  habit_name: string;
  streak_count: number;
  checked_days: boolean[];
}

interface CurrentWeek {
  start_monday_of_week: Date;
  habits: Record<string, HabitWeekData>; // Changed from HabitWeekData[] to Record<string, HabitWeekData>
}


function DailyVows() {

  const [currentWeek, setCurrentWeek] = useState<CurrentWeek>();
  
  const initializeWeek = async () => {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // 1 for Monday
    currentWeekStart.setHours(0, 0, 0, 0);
    const currentWeekStartISOString = currentWeekStart.toISOString();
  
    const latestWeekData = await getLatestWeekData();
    const habitsStreakData = await getHabitsStreakData();
  
    if (latestWeekData) {
      let latestWeekStart = new Date(latestWeekData?.start_monday_of_week);
      latestWeekStart.setHours(0, 0, 0, 0);
      const latestWeekStartISOString = latestWeekStart.toISOString();
  
      if (isSameWeek(new Date(currentWeekStartISOString), new Date(latestWeekStartISOString))) {
        const habitsObject = latestWeekData.habits.reduce((acc, habit) => {
          acc[habit.habit_name] = {
            habit_name: habit.habit_name,  // Add this line
            checked_days: habit.checked_days,
            streak_count: habitsStreakData[habit.habit_name] || 0,
          };
          return acc;
        }, {} as Record<string, HabitWeekData>);  // This should now be compatible
        
  
        setCurrentWeek({
          start_monday_of_week: latestWeekStart,
          habits: habitsObject,
        });
      }
    }
  };
  const journalHabit = currentWeek?.habits['Journal'];
  const liftWeightsHabit = currentWeek?.habits['Lift Weights'];
  const meditationHabit = currentWeek?.habits['Meditation'];
  
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

  const updateCurrentWeek = (updatedHabitData: HabitWeekData) => {
    // Check if 'currentWeek' and 'currentWeek.habits' exist
    if (currentWeek && currentWeek.habits) {
      // Create a new 'habits' object with the updated habit data
      const newHabits = {
        ...currentWeek.habits,
        [updatedHabitData.habit_name]: updatedHabitData,
      };
  
      // Update 'currentWeek' state
      setCurrentWeek({
        ...currentWeek,
        habits: newHabits,
        start_monday_of_week: currentWeek.start_monday_of_week,
      });
    }
  };
  

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
            habitData={meditationHabit}
            start_monday_of_week={currentWeek?.start_monday_of_week}
            updateCurrentWeek={updateCurrentWeek}
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
            habitData={liftWeightsHabit}
            start_monday_of_week={currentWeek?.start_monday_of_week}
            updateCurrentWeek={updateCurrentWeek}
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
            habitData={journalHabit}
            start_monday_of_week={currentWeek?.start_monday_of_week}
            updateCurrentWeek={updateCurrentWeek}
          />
        </div>
      </div>
  )
}

export default DailyVows;
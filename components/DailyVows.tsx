import Habit from './Habit'
import React, { useState, useEffect } from 'react';
import { isSameWeek } from 'date-fns';
import { getLatestWeekData, getHabitsStreakData, createNewWeekEntry } from 'lib/databaseOps';
import { HabitWeekData, CurrentWeek, LatestWeekData, HabitsStreakData } from 'types/uiComponents';
import { setMidnightTimer, initializeWeekStartDate } from 'helpers/helpers';

function DailyVows() {

  const [currentWeek, setCurrentWeek] = useState<CurrentWeek>();
  
  // Function to initialize the currentWeek state based on the latest week data
  const initializeCurrentWeekFromLatestData = (
    latestWeekData: LatestWeekData,
    habitsStreakData: HabitsStreakData
  ): void => {
    const habitsObject = latestWeekData.habits.reduce((acc, habit) => {
      acc[habit.habit_name] = {
        habit_name: habit.habit_name,
        checked_days: habit.checked_days,
        streak_count: habitsStreakData[habit.habit_name] || 0,
      };
      return acc;
    }, {} as Record<string, HabitWeekData>);

    setCurrentWeek({
      start_monday_of_week: new Date(latestWeekData.start_monday_of_week),
      habits: habitsObject,
    });
  };

  // Function to initialize the currentWeek state for a new week
  const initializeCurrentWeekForNewWeek = async (
    currentWeekStartISOString: string,
    habitsStreakData: HabitsStreakData
  ): Promise<void> => {
    const allHabits = Object.keys(habitsStreakData);
    for (const habit of allHabits) {
      await createNewWeekEntry(habit, currentWeekStartISOString);
    }

    const habitsObject = allHabits.reduce((acc, habit) => {
      acc[habit] = {
        habit_name: habit,
        checked_days: Array(7).fill(false),
        streak_count: habitsStreakData[habit] || 0,
      };
      return acc;
    }, {} as Record<string, HabitWeekData>);

    setCurrentWeek({
      start_monday_of_week: new Date(currentWeekStartISOString),
      habits: habitsObject,
    });
  };

  const initializeWeek = async (): Promise<void> => {
    const currentWeekStartISOString = initializeWeekStartDate();
    const latestWeekData = await getLatestWeekData() as LatestWeekData;
    const habitsStreakData = await getHabitsStreakData() as HabitsStreakData;

    if (latestWeekData) {
      const latestWeekStart = new Date(latestWeekData.start_monday_of_week);
      latestWeekStart.setHours(0, 0, 0, 0);

      if (isSameWeek(new Date(currentWeekStartISOString), latestWeekStart)) {
        initializeCurrentWeekFromLatestData(latestWeekData, habitsStreakData);
      } else {
        await initializeCurrentWeekForNewWeek(currentWeekStartISOString, habitsStreakData);
      }
    }
  };
    
  const journalHabit = currentWeek?.habits['Journal'];
  const liftWeightsHabit = currentWeek?.habits['Lift Weights'];
  const meditationHabit = currentWeek?.habits['Meditation'];
  
   // Refresh every midnight to get the next week's dates
  useEffect(() => {
    initializeWeek();
    const timer = setMidnightTimer(initializeWeek);
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
  
  const meditationHabitData = {
    checked_days: [true, false, true, false, true, false, true],
    habit_name: "Meditation",
    streak_count: 46,
  }
  const liftHabitData = {
    checked_days: [true, false, true, false, true, false, true],
    habit_name: "Lift Weights",
    streak_count: 46,
  }
  const journalHabitData = {
    checked_days: [true, false, true, false, true, false, true],
    habit_name: "Journal",
    streak_count: 11,
  }

  console.log(currentWeek)

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
            calendarBubbleBgColor={"#FFF"}
            calendarBubbleBorderColor={"#ADBCCB"}
            streak={24}
            streakBorderColor={"#B6C8DA"}
            streakTextColor={"#506579"}
            streakBgColor={"#FCFEFF"}
            lineColor={"#B6C8DA"}
            // habitData={meditationHabit}
            habitData={meditationHabitData}
            start_monday_of_week={new Date("2023-10-02T04:00:00.000Z")}
            // start_monday_of_week={currentWeek?.start_monday_of_week}
            updateCurrentWeek={updateCurrentWeek}
          />
          <Habit 
            emoji='🏋️'
            habit='Lift Weights'
            frequency='5 days a week'
            calendarBorderColor={"#DAD6B6"}
            calendarTextColor={"#634D2C"}
            calendarBgColor={"#FFFFFC"}
            calendarBubbleBgColor={"#FFFEF1"}
            calendarBubbleBorderColor={"#CACBAD"}
            streak={45}
            streakBorderColor={"#DAD6B6"}
            streakTextColor={"#634D2C"}
            streakBgColor={"#FFFFFC"}
            lineColor={"#DAD6B6"}
            habitData={liftHabitData}
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
            calendarBubbleBgColor={"#FFFBFB"}
            calendarBubbleBorderColor={"#CBADAD"}
            streak={4}
            streakBorderColor={"#DAB6B6"}
            streakTextColor={"#632C2C"}
            streakBgColor={"#FFFCFC"}
            lineColor={"#DAB6B6"}
            habitData={journalHabitData}
            start_monday_of_week={currentWeek?.start_monday_of_week}
            updateCurrentWeek={updateCurrentWeek}
          />
        </div>
      </div>
  )
}

export default DailyVows;
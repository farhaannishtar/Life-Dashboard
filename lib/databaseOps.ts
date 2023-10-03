import { supabase } from "./supabaseClient";

export const getLatestWeekData = async () => {
  // Get the latest 'start_monday_of_week' first
  const { data: latestWeekData, error: latestWeekError } = await supabase
    .from("weekly_habits")
    .select("start_monday_of_week")
    .order("start_monday_of_week", { ascending: false })
    .limit(1);

  if (latestWeekError) {
    console.error(
      "Error fetching latest start_monday_of_week:",
      latestWeekError
    );
    return null;
  }

  if (!latestWeekData || latestWeekData.length === 0) {
    console.log("No latest week data found.");
    return null;
  }

  const latestStartMonday = latestWeekData[0].start_monday_of_week;

  // Now fetch all habits for the most recent week
  const { data, error } = await supabase
    .from("weekly_habits")
    .select("habit_name, checked_days")
    .eq("start_monday_of_week", latestStartMonday);

  if (error) {
    console.error("Error fetching latest week data for each habit:", error);
    return null;
  }

  return data
    ? { start_monday_of_week: latestStartMonday, habits: data }
    : null;
};

export const getHabitsStreakData = async () => {
  const { data, error } = await supabase
    .from("habits")
    .select("habit_name, streak_count");

  if (error) {
    console.error("Error fetching streak data:", error);
    return {};
  }

  if (!data) {
    return {};
  }

  // Convert the array of objects into an object with habit_names as keys and streak_count as values
  const streakData: { [key: string]: number } = {};
  data.forEach((habit) => {
    streakData[habit.habit_name] = habit.streak_count;
  });

  return streakData;
};
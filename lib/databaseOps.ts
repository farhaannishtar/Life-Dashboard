import { supabase } from "./supabaseClient"; // supabase client

const getLatestWeekData = async () => {
  // Get the latest 'start_monday_of_week' first
  const { data: latestWeekData, error: latestWeekError } = await supabase
    .from("Weekly_Habits")
    .select("start_monday_of_week")
    .order("start_monday_of_week", { ascending: false })
    .limit(1);

  if (latestWeekError) {
    console.error("Error fetching latest week data:", latestWeekError);
    return null;
  }

  if (!latestWeekData || latestWeekData.length === 0) {
    return null;
  }

  const latestStartMonday = latestWeekData[0].start_monday_of_week;

  // Now fetch all habits for the most recent week
  const { data, error } = await supabase
    .from("Weekly_Habits")
    .select("habit_id, checked_days")
    .eq("start_monday_of_week", latestStartMonday);

  if (error) {
    console.error("Error fetching latest week data for each habit:", error);
    return null;
  }

  return data
    ? { start_monday_of_week: latestStartMonday, habits: data }
    : null;
};

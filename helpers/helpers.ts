export const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const currentDate = `${year}-${month}-${day}`;
  return currentDate;
};

export const getPreviousDate = (): string => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const previousDate = `${year}-${month}-${day}`;
  return previousDate;
};

export const calculatePercentageChange = (
  oldScore: number,
  newScore: number
): number => {
  let percentageChange = ((newScore - oldScore) / oldScore) * 100;
  return percentageChange;
};

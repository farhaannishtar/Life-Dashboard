import React from "react";

export const useDate = () => {
  const locale = "en";
  const [today, setDate] = React.useState(
    new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    )
  ); // Save the current date to be able to trigger an update

  React.useEffect(() => {
    const timer = setInterval(() => {
      // Creates an interval which will update the current data every minute
      // This will trigger a rerender every component that uses the useDate hook.
      setDate(
        new Date(
          new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
        )
      );
    }, 60 * 1000);
    return () => {
      clearInterval(timer); // Return a function to clear the timer so that it will stop being called on unmount
    };
  }, []);

  const day = today.toLocaleDateString(locale, { weekday: "long" });
  const date = `${day}, ${today.getDate()} ${today.toLocaleDateString(locale, {
    month: "long",
  })}\n\n`;

  const hour = today.getHours();
  const wish = `Good ${
    (hour < 12 && "Morning") || (hour < 17 && "Afternoon") || "Evening"
  }, `;

  const time = today.toLocaleTimeString(locale, {
    hour: "numeric",
    hour12: true,
    minute: "numeric",
  });

  return {
    date,
    time,
    wish,
  };
};

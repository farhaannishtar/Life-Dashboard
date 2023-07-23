import {useState, useEffect} from 'react';

export default function Time() {

  const [currentTime, setCurrentTime] = useState('');
  const [timeUntil9PM, setTimeUntil9PM] = useState('');

  useEffect(() => {
    // Update time immediately on component mount
    updateTime();

    // Update time every 10 seconds
    const intervalId = setInterval(() => {
      updateTime();
    }, 1000); // Change this value to set the update interval

    // Clear interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

   function getCurrentTime(): string {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    let hoursIn12HourFormat = hours % 12;
    hoursIn12HourFormat = hoursIn12HourFormat ? hoursIn12HourFormat : 12; // the hour '0' should be '12'

    const hoursStr = hoursIn12HourFormat.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');

    return `${hoursStr}:${minutesStr} ${ampm}`;
  }

  function updateTime() {
    setCurrentTime(getCurrentTime());
    setTimeUntil9PM(getTimeUntil9PM());
  }

  function getTimeUntil9PM(): string {
    const now = new Date();
    const ninePM = new Date();

    // Set the hours to 21 (9 PM in 24-hour format), minutes and seconds to 0
    ninePM.setHours(21, 0, 0);

    // Calculate the difference in milliseconds
    let diff = ninePM.getTime() - now.getTime();

    // If the difference is negative, it means 9 PM has already passed today
    // So, calculate the difference for 9 PM tomorrow instead
    if (diff < 0) {
      ninePM.setDate(ninePM.getDate() + 1);
      diff = ninePM.getTime() - now.getTime();
    }

    // Calculate hours and minutes
    let hours = Math.floor(diff / (1000 * 60 * 60));
    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    const seconds = Math.floor((diff % (1000 * 60)) / 1000); // Calculate remaining seconds

    if (seconds > 0) { // If any seconds remain, round up to the next whole minute
      minutes++;
      if (minutes === 60) { // If minutes turn to 60 after increment, then increment hours by 1 and reset minutes to 0
        hours++;
        minutes = 0;
      }
    }

    return `${hours} hours and ${minutes} minutes till bedtime`;
  }

  return (
    <div className='flex flex-col items-start justify-center'>
      <div className='text-left font-extralight mb-2'>Time</div>
      <div className=' text-[#1A2B88] text-2xl font-bold leading-normal tracking-tightest'>{currentTime}</div>
      <div className='font-extralight text-sm mt-1'>{timeUntil9PM}</div>
    </div>
  )
}
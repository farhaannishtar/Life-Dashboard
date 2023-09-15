import HabitWeekCalendar from 'components/HabitWeekCalendar';
import HabitStreakCard from 'components/HabitStreakCard';

function Habit() {
  return (
    <div className='w-full flex mt-5 items-center'>
        <div className="flex-grow-2 flex-shrink">
          <HabitWeekCalendar />
        </div>
        <div className="flex-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="2" viewBox="0 0 20 2" fill="none">
            <path d="M0 1L20 1" stroke="#B6C8DA" stroke-dasharray="1 1"/>
          </svg>
        </div>
        <div className="flex-grow flex-shrink">
          <HabitStreakCard 
            streak={24} 
            borderColor={"#B6C8DA"}
            textColor={"#506579"}
            bgColor={"#FCFEFF"} 
          />
        </div>
      </div>
  )
}

export default Habit;
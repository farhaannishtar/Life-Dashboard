import { HabitStreakCardProps } from "types/uiComponents";

function HabitStreakCard({ streak, borderColor, textColor, bgColor }: HabitStreakCardProps) {
  return (
    <div className={`flex flex-col justify-start items-center border rounded-3xl`}
    style={{ backgroundColor: bgColor, borderColor: borderColor }}
    >
      <div className='pt-6 pl-6 text-26 leading-8 font-bold m-0 w-full'> 
        🔥
      </div>
      <div className={`py-5 px-5_5 font-black text-64 leading-10 inline-block text-center min-w-[10rem] align-middle`}
        style={{ color: textColor }}
      >
        {streak} <span className="text-xl leading-5 text-center -ml-3 font-black">day</span>
      </div>
      <div className={`w-full text-center font-black text-lg leading-5 pb-5`}
        style={{ color: textColor }}
      >
       Streak
      </div>
    </div>
  )
}

export default HabitStreakCard;
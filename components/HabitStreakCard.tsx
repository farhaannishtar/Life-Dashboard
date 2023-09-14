
function HabitStreakCard() {
  return (
    <div className={`flex flex-col justify-start items-center border rounded-3xl`}>
      <div className='pt-8 pl-5 text-2xl leading-3 font-black m-0 w-full'> 
        🔥
      </div>
      <div className={`py-7 font-black text-5xl leading-10 inline-block align-middle`}>
        45 day
      </div>
      <div className={`w-full text-center font-black text-lg pb-3`}>
       Streak
      </div>
    </div>
  )
}

export default HabitStreakCard;
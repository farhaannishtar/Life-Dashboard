
interface PhysicalStatsCardProps {
  emoji: string;
  title: string;
  body: number;
  unit: string;
  color: string;
}

function PhysicalStatsCard({ emoji, title, body, unit,color }: PhysicalStatsCardProps) {
  return (
    <div className={`flex flex-col flex-1 justify-start items-center flex-shrink-0 rounded-3xl bg-${color}-bg border border-${color}-border m-0`}>
      <div className='pt-7 pl-5 text-2xl leading-3 font-black m-0 w-full'> 
        {emoji}
      </div>
      <div className={`py-10 text-${color}-text font-black text-5xl leading-10 inline-block align-middle`}>
          {body}
          { unit !== "mg/dl" ?
            <span className='ml-1 text-3xl align-middle leading-4 inline-block font-black'>{unit}</span>
            : 
            <span className='ml-1 text-xl align-middle leading-4 inline-block font-black'>{unit}</span>
          }
      </div>
      <div className={`w-full text-center font-black text-lg	text-${color}-text pb-4`}>
        {title}
      </div>
    </div>
  )
}

export default PhysicalStatsCard;
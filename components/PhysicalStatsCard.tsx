import { PhysicalStatsCardProps } from "../types/uiComponents";

function PhysicalStatsCard({ emoji, title, body, unit, borderColor, textColor, bgColor }: PhysicalStatsCardProps) {
  return (
    <div className={`flex flex-col flex-1 justify-start items-center flex-shrink-0 border rounded-3xl m-0`}
    style={{ backgroundColor: bgColor, borderColor: borderColor }}
    >
      <div className='pt-7 pl-5 text-2xl leading-3 font-black m-0 w-full'> 
        {emoji}
      </div>
      <div className={`py-10 font-black text-5xl leading-10 inline-block align-middle`}
        style={{ color: textColor }}
      >
          {body}
          { unit !== "mg/dL" ?
            <span className='ml-1 text-3xl align-middle leading-4 inline-block font-black'>{unit}</span>
            : 
            <span className='ml-1 text-xl align-middle leading-4 inline-block font-black'>{unit}</span>
          }
      </div>
      <div className={`w-full text-center mt-1 font-black text-lg pb-3`}
        style={{ color: textColor }}
      >
        {title}
      </div>
    </div>
  )
}

export default PhysicalStatsCard;
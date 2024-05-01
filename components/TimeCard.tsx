import { TimeCardProps } from "types/uiComponents";

function TimeCard({ title, body, borderColor, textColor, bgColor }: TimeCardProps) {
  return (
    <div className={`flex flex-col justify-start items-start flex-shrink-0 border rounded-3xl`} 
      style={{ backgroundColor: bgColor, borderColor: borderColor }}
    >
      <div className={`pt-3 pl-4 text-xs leading-3	font-black`}
        style={{ color: textColor }}
      > 
        {title}
      </div>
      <div className={`px-12 lg:px-20 py-6 h-full w-full leading-5 text-3xl font-black text-center`}
        style={{ color: textColor }}  
      >
        {body}
      </div>
    </div>
  )
}

export default TimeCard;
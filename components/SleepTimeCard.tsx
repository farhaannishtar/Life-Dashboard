// Define a type for the props
type SleepTimeCardProps = {
  title: string,
  body: string,
  color: string
};

function SleepTimeCard({ title, body, color }: SleepTimeCardProps) {
  return (
    <div className={`flex flex-col justify-start items-start flex-shrink-0 bg-${color}-bg border border-${color}-border rounded-3xl`}>
      <div className={`text-${color}-text pt-3 pl-4 text-xs	leading-3	font-black`}> 
        {title}
      </div>
      <div className={`px-12 lg:px-20 py-6 h-full w-full text-${color}-text leading-5 text-3xl font-black text-center`}>
        {body}
      </div>
    </div>
  )
}

export default SleepTimeCard;
import { useState, useEffect } from "react";
import { TimeCardProps } from "types/uiComponents";

function TimeCard({ title, body, borderColor, textColor, bgColor }: TimeCardProps) {

  const [mindfulMinutes, setMindfulMinutes] = useState<number>(0);

  useEffect(() => {
    const eventSource = new EventSource('/api/sse');

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const parsedData: number = JSON.parse(event.data);
        setMindfulMinutes(parsedData);
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
      }
    };

    // Cleanup on component unmount
    return () => {
      eventSource.close();
    };
  }, []);

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
        {title === "Minutes Meditated" ? `${mindfulMinutes} min` : body}
      </div>
    </div>
  )
}

export default TimeCard;
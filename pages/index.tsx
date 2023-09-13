import Head from 'next/head'
import React, {useState, useEffect} from 'react'
import {InferGetServerSidePropsType} from 'next'
import {getDaysSinceLastMonth, formatDuration, formatSteps} from 'helpers/helpers';
import SleepChart from 'components/SleepChart';
import SleepTimeCard from 'components/SleepTimeCard';
import SleepScore from 'components/SleepScoreCard';
import PhysicalStatsCard from 'components/PhysicalStatsCard';

export async function getServerSideProps() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    console.log("API URL:", apiUrl);
    const res = await fetch(`${apiUrl}api/fetchFitbitData`);
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.status}`);
    }
    const fitbitData = await res.json();
    console.log('Server-side fitbitData:', fitbitData);
    return {
      props: {
        fitbitData,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      notFound: true,
    };
  }
}


interface FitbitWeightEntry {
  dateTime: string;
  value: number;
}

interface FitbitWeightData {
  'body-weight': FitbitWeightEntry[];
}  

interface OuraRingDailySleepData {
  data: Array<{
    score: number;
    day: string;
    // Add other fields as necessary
  }>;
}

interface OuraRingSleepData {
  data: Array<{
    time_in_bed: number;
    total_sleep_duration: string;
    // Add other fields as necessary
  }>;
}

interface OuraRingDailySleepDataChart {
  data: {
    score: number;
    day: number;
    // Add other fields as necessary
  }[];
}


type OuraRingActivityData = Array<{
  steps: number;
  // Add other fields as necessary
}>;


export default function Home({ fitbitData }: InferGetServerSidePropsType<typeof getServerSideProps>) {

  const [ouraRingDailySleepData, setOuraRingDailySleepData] = useState<OuraRingDailySleepData | null>(null);
  const [ouraRingSleepData, setOuraRingSleepData] = useState<OuraRingSleepData | null>(null);
  const totalSleep = ouraRingSleepData && formatDuration(Number(ouraRingSleepData.data[ouraRingSleepData.data.length - 1].total_sleep_duration));
  const timeInBed = ouraRingSleepData && formatDuration(Number(ouraRingSleepData.data[ouraRingSleepData.data.length - 1].time_in_bed));
  // const [parsedOuraRingDailySleepData, setParsedOuraRingDailySleepData] = useState<OuraRingDailySleepDataChart | null>(null); 
  const [ouraRingActivityData, setOuraRingActivityData] = useState<OuraRingActivityData | null>(null);
  const recentFitbitWeightData = Math.round(fitbitData.data["body-weight"][fitbitData.data["body-weight"].length - 1].value * 2.2);
  const ouraRingSteps = ouraRingActivityData && formatSteps(ouraRingActivityData[ouraRingActivityData.length - 1].steps);
  const [ouraRingSleepScore, setOuraRingSleepScore] = useState<number | null>(null);

  // history of oura ring activity logs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 1);
        const end_date = currentDate.toISOString().split('T')[0];

        fetch(`/api/ouraringactivitylogs?start_date=2023-08-01&end_date=${end_date}`)
        .then(response => response.json())
        .then(data => {
          setOuraRingActivityData(data.data);
        })
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, []);

  // history of oura ring daily sleep logs
  useEffect(() => {
    fetch(`/api/ouraring-daily-sleep?start_date=2023-08-02`)
    .then(response => response.json())
    .then(data => {
      setOuraRingDailySleepData(data);
      // const parsedData = data.data.map((entry: any) => {
      //   const date = new Date(Date.parse(entry.day)); // Changed `data.day` to `entry.day`
      //   const dayOfMonth = date.getDate();
      //   return {
      //     day: dayOfMonth,
      //     score: entry.score,
      //   };
      // });
      // setParsedOuraRingDailySleepData({ data: parsedData});
  })
    .catch(error => console.error('Error:', error));
  }, []);

  // history of oura ring sleep logs
  useEffect(() => {
    fetch(`/api/ouraring-sleep?start_date=2023-08-02`)
    .then(response => response.json())
    .then(data => {
      setOuraRingSleepData(data);
      // const parsedData = data.data.map((entry: any) => {
      //   const date = new Date(Date.parse(entry.day)); // Changed `data.day` to `entry.day`
      //   const dayOfMonth = date.getDate();
      //   return {
      //     day: dayOfMonth,
      //     score: entry.score,
      //   };
      // });
      // setParsedOuraRingDailySleepData({ data: parsedData});
  })
    .catch(error => console.error('Error:', error));
  }, []);

  useEffect(() => {
    if (ouraRingDailySleepData && ouraRingDailySleepData.data.length > 0) {
      const score = ouraRingDailySleepData.data[ouraRingDailySleepData.data.length - 1].score;
      setOuraRingSleepScore(score);
    }
  }, [ouraRingDailySleepData]);
  
  // console.log("ouraRing Daily Sleep Data: ", ouraRingDailySleepData);
  // console.log("ouraRing Sleep Data: ", ouraRingSleepData);

  return (
    <div className="w-full max-w-5xl mx-auto px-10">
      <Head>
        <title>Life Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className='flex justify-between w-full'>
        <div className='mt-10'>
          <p className="text-black text-4xl font-bold leading-8 tracking-[0.02rem]">Good Afternoon, Faraaz.</p>
        </div>
      </div>
      <div className='mt-8 flex space-x-6 justify-between'>
        <div className='flex flex-1 flex-col gap-y-4'>
           <SleepTimeCard title={'Total Sleep'} body={totalSleep!} color={"brown"} />
           <SleepTimeCard title={'Time in Bed'} body={timeInBed!} color={"brown"} />
        </div>
        <SleepScore score={ouraRingSleepScore || 0} />
        <div className='flex flex-1 flex-col gap-y-4'>
          <SleepTimeCard title={'Bed Time'} body={"1:15 am"} color={"purple"} />
          <SleepTimeCard title={'Wake up'} body={"10:15 am"} color={"reddish-brown"} />
        </div>
      </div>
      <div className='w-full flex space-x-6 mt-6 justify-between'>
        <PhysicalStatsCard 
          emoji={"⚖️"} 
          title={"Weight"} 
          body={recentFitbitWeightData}
          unit={"lb"}
          color={"gray"} 
        />
        <PhysicalStatsCard 
          emoji={"🩸"} 
          title={"Blood Glucose"} 
          body={70}
          unit={"mg/dl"}
          color={"red"} 
        />
        <PhysicalStatsCard 
          emoji={"👟"} 
          title={"Step Count"} 
          body={Number(ouraRingSteps)}
          unit={""}
          color={"green"} 
        />
      </div>
    </div>
  )
}






 {/* <div className='w-full max-w-screen-2xl mx-auto px-10'>
        <div className='flex justify-between w-full'>
          <div className='mt-10'>
            <p className="text-black font-[Red Hat Text] text-3xl font-bold leading-normal tracking-[0.02rem]">Good Morning, Faraaz !</p>
          </div>
          <p className="flex items-center text-[#001EC0] font-[Red Hat Text] font-normal leading-normal tracking-[0.014rem] mt-6">
            <Image src="/images/logo.svg" alt="Logo" height={32} width={48} />
            <span className="ml-1 text-2xl font-light">life</span>
            <span className="ml-1 text-blue-800 font-red-hat text-2xl font-bold tracking-wide">dashboard</span>
          </p>
        </div>    
      </div>
      <div className="flex-shrink-0 m-10 max-w-screen-2xl mx-auto px-10">
        <div className="flex justify-around items-center rounded-lg border-gray-200 bg-white shadow-2xl flex-shrink-0 py-10">
          <Time />
          <div className="border-l border-dashed border-gray-300 h-24 self-center"></div>
          <div className='flex flex-col font-light items-start border-red justify-center'>
            <div className='font-extralight mb-2 flex items-center'>Latest Sleep Score
              <span className={`inline-flex p-1 ml-2 justify-center items-center space-x-1 rounded-full ${sleepScorePercentageMarkers.contentStyles} font-extralight text-xs`}>
              <span className='mr-1'>
                <Image src={`/images/${sleepScorePercentageMarkers.arrow}`} alt="Arrow up" height={10} width={10} />
              </span>
                {sleepPercentDiff}%
              </span>
            </div>
            <div className='text-[#1A2B88] text-2xl font-bold leading-normal tracking-tightest'>{ouraRingDailySleepData && ouraRingDailySleepData.data[ouraRingDailySleepData.data.length - 1].score}</div>
            <div className='font-extralight text-sm mt-1'> keep it up 💪🏾 </div>
          </div>
          <div className="border-l border-dashed border-gray-300 h-24 self-center"></div>
          <div className='flex flex-col items-start border-red justify-center'>
            <div className='font-extralight mb-2'>Today&apos;s steps
            <span className={`inline-flex p-1 ml-2 justify-center items-center space-x-1 rounded-full ${stepCountPercentageMarkers.contentStyles} font-extralight text-xs`}>
              <span className='mr-1'>
                <Image src={`/images/${stepCountPercentageMarkers.arrow}`} alt="Arrow up" height={10} width={10} />
              </span>
                {stepCountPercentDiff}%
              </span>
            </div>
            <div className='text-[#1A2B88] text-2xl font-bold leading-normal tracking-tightest mb-5'>{ouraRingSteps}</div>
          </div>
          <div className="border-l border-dashed border-gray-300 h-24 self-center"></div>
          <div className='flex flex-col items-start border-red justify-center mr-8'>
            <div className='font-extralight mb-2'>Latest Weight
              <span className={`inline-flex p-1 ml-2 justify-center items-center space-x-1 rounded-full ${weightMarkers.contentStyles} font-extralight text-xs`}>
                <span className='mr-1'>
                  <Image src={`/images/${weightMarkers.arrow}`} alt="Arrow up" height={10} width={10} />
                </span>
                {weightDiff} lbs since last month
              </span>
            </div>
            <div className='text-[#1A2B88] text-2xl font-bold leading-normal tracking-tightest'>{fitbitWeightData && fitbitWeightData["body-weight"] ? Math.round(fitbitWeightData["body-weight"][fitbitWeightData["body-weight"].length - 1].value * 2.2) : ''}lb</div>
            <div className='font-extralight text-sm mt-1'>{calculateBMI()}% BMI</div>
          </div>
        </div>
      </div>
      <div>
        <h1 className='max-w-screen-2xl mx-auto px-10 mt-10 text-2xl font-bold'>Trends</h1>
        {
          parsedOuraRingDailySleepData && 
          <div className='mx-auto w-full flex justify-center pb-10 mt-4'>
            <SleepChart sleepData={parsedOuraRingDailySleepData} />
          </div>
        }   
      </div> */}
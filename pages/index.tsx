import Head from 'next/head'
import Image from 'next/image';
import React, {useState, useEffect} from 'react'
import {InferGetServerSidePropsType} from 'next'
import Time from '../components/Time';
import {getDaysSinceLastMonth, calculateSleepScorePercentageChange, calculateMonthWeightChange, calculateStepCountPercentChange, formatSteps} from 'helpers/helpers';
import SleepChart from 'components/SleepChart';

export async function getServerSideProps() {
  const res = await fetch('https://life-dashboard-git-refactor-migrate-fitbi-162f9c-farhaannishtar.vercel.app/api/fetchFitbitData');
  const fitbitData = await res.json();
  console.log('Server-side fitbitData:', fitbitData);
  return {
    props: {
      fitbitData,
    },
  };
}




interface FitbitWeightEntry {
  dateTime: string;
  value: number;
}

interface FitbitWeightData {
  'body-weight': FitbitWeightEntry[];
}  

interface OuraRingSleepData {
  data: Array<{
    score: number;
    day: string;
    // Add other fields as necessary
  }>;
}

interface OuraRingSleepDataChart {
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

  const [ouraRingSleepData, setOuraRingSleepData] = useState<OuraRingSleepData | null>(null);
  const [parsedOuraRingSleepData, setParsedOuraRingSleepData] = useState<OuraRingSleepDataChart | null>(null); 
  const [ouraRingActivityData, setOuraRingActivityData] = useState<OuraRingActivityData | null>(null);
  const fitbitWeightData: FitbitWeightData | null = fitbitData.data;
  const [sleepScorePercentageMarkers, setSleepScorePercentageMarkers] = useState({
    arrow: 'bi_arrow-up.svg',
    contentStyles: "bg-[#F4F6F6] text-[#3D37F1]"
  });
  const [stepCountPercentageMarkers, setStepScorePercentageMarkers] = useState({
    arrow: 'bi_arrow-up.svg',
    contentStyles: "bg-[#F4F6F6] text-[#3D37F1]"
  });
  const [weightMarkers, setWeightMarkers] = useState({
    arrow: 'bi_arrow-up.svg',
    contentStyles: "bg-[#F4F6F6] text-[#3D37F1]"
  });
  const [sleepPercentDiff, setSleepPercentDiff] = useState('')
  const [stepCountPercentDiff, setStepCountPercentDiff] = useState('')
  const [weightDiff, setWeightDiff] = useState('')

  const ouraRingSteps = ouraRingActivityData && formatSteps(ouraRingActivityData[ouraRingActivityData.length - 1].steps);

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
          calculateStepCountDifference(data.data);
        })
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, []);

  // history of oura ring sleep logs
  useEffect(() => {
    fetch(`/api/ouraringsleeplogs?start_date=2023-08-02`)
    .then(response => response.json())
    .then(data => {
      setOuraRingSleepData(data);
      console.log("sleep data: ", data)
      
      const parsedData = data.data.map((entry: any) => {
        const date = new Date(Date.parse(entry.day)); // Changed `data.day` to `entry.day`
        const dayOfMonth = date.getDate();
        return {
          day: dayOfMonth,
          score: entry.score,
        };
      });
      setParsedOuraRingSleepData({ data: parsedData});
      calculateSleepScoreDifference(data);
  })
    .catch(error => console.error('Error:', error));
  }, []);
  
  // Calculating Fitbit weight difference since last month
  useEffect(() => {
    calculateWeightDifference(fitbitData.data);
  }, []);

  function calculateSleepScoreDifference(sleepData: OuraRingSleepData) {
    let lastNightSleepScore = sleepData.data[sleepData.data.length - 1].score
    let dayBeforeSleepScore = sleepData.data[sleepData.data.length - 2].score

    let percentageChange = calculateSleepScorePercentageChange(dayBeforeSleepScore, lastNightSleepScore);

    setSleepPercentDiff(String(Math.abs(percentageChange)))

    if (percentageChange < 0) {
      setSleepScorePercentageMarkers({
        arrow: 'bi_arrow-down.svg',
        contentStyles: 'bg-red-500 bg-opacity-10 text-red-600'
      })
    }
  }

  function calculateStepCountDifference(activityData: OuraRingActivityData) {
    let lastNightStepCount = activityData[activityData.length - 1].steps
    let dayBeforeStepCount = activityData[activityData.length - 2].steps

    let percentageChange = calculateStepCountPercentChange(dayBeforeStepCount, lastNightStepCount);

    setStepCountPercentDiff(String(Math.abs(percentageChange)))

    if (percentageChange < 0) {
      setStepScorePercentageMarkers({
        arrow: 'bi_arrow-down.svg',
        contentStyles: 'bg-red-500 bg-opacity-10 text-red-600'
      })
    }
  }

  function calculateWeightDifference(fitbitWeightData: FitbitWeightData) {
    let currentWeight = fitbitWeightData["body-weight"][fitbitWeightData["body-weight"].length - 1].value;
    let daysSinceLastMonth = getDaysSinceLastMonth(fitbitWeightData["body-weight"][fitbitWeightData["body-weight"].length - 1].dateTime);
    let lastMonthWeight = fitbitWeightData["body-weight"][fitbitWeightData["body-weight"].length - daysSinceLastMonth-1].value;

    let weightChange = calculateMonthWeightChange(lastMonthWeight, currentWeight);

    setWeightDiff(String(Math.abs(weightChange)))

    if (weightChange < 0) {
      setWeightMarkers({
        arrow: 'bi_arrow-down.svg',
        contentStyles: 'bg-red-500 bg-opacity-10 text-red-600'
      })
    }
  }

  function calculateBMI() {
    let kilos: number | null = null;

    if (
      fitbitWeightData &&
      fitbitWeightData["body-weight"] &&
      fitbitWeightData["body-weight"].length > 0 &&
      fitbitWeightData["body-weight"][fitbitWeightData["body-weight"].length - 1].value
    ) {
      kilos = fitbitWeightData["body-weight"][fitbitWeightData["body-weight"].length - 1].value;
    }

    return Math.round(Number(kilos) / (1.72 * 1.72)) 
  }

  return (
    <div className="">
      <Head>
        <title>Life Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      
      <div className='w-full max-w-screen-2xl mx-auto px-10'>
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
            <div className='text-[#1A2B88] text-2xl font-bold leading-normal tracking-tightest'>{ouraRingSleepData && ouraRingSleepData.data[ouraRingSleepData.data.length - 1].score}</div>
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
          parsedOuraRingSleepData && 
          <div className='mx-auto w-full flex justify-center pb-10 mt-4'>
            <SleepChart sleepData={parsedOuraRingSleepData} />
          </div>
        }   
      </div>
    </div>
  )
}
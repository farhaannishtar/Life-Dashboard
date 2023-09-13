import Head from 'next/head'
import React, {useState, useEffect} from 'react'
import {InferGetServerSidePropsType} from 'next'
import {formatDuration, formatSteps} from 'helpers/helpers';
import SleepTimeCard from 'components/SleepTimeCard';
import SleepScore from 'components/SleepScoreCard';
import PhysicalStatsCard from 'components/PhysicalStatsCard';
import {OuraRingDailySleepData, OuraRingSleepData, OuraRingActivityData} from '../types/ouraring';


export async function getServerSideProps() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
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

export default function Home({ fitbitData }: InferGetServerSidePropsType<typeof getServerSideProps>) {

  const [ouraRingDailySleepData, setOuraRingDailySleepData] = useState<OuraRingDailySleepData | null>(null);
  const [ouraRingSleepData, setOuraRingSleepData] = useState<OuraRingSleepData | null>(null);
  const totalSleep = ouraRingSleepData && formatDuration(Number(ouraRingSleepData.data[ouraRingSleepData.data.length - 1].total_sleep_duration));
  const timeInBed = ouraRingSleepData && formatDuration(Number(ouraRingSleepData.data[ouraRingSleepData.data.length - 1].time_in_bed));
  const [ouraRingActivityData, setOuraRingActivityData] = useState<OuraRingActivityData | null>(null);
  const recentFitbitWeightData = Math.round(fitbitData.data["body-weight"][fitbitData.data["body-weight"].length - 1].value * 2.2);
  const ouraRingSteps = ouraRingActivityData && formatSteps(Number(ouraRingActivityData[ouraRingActivityData.length - 1].steps));
  const [ouraRingSleepScore, setOuraRingSleepScore] = useState<number | null>(null);

  // history of oura ring activity log
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
  })
    .catch(error => console.error('Error:', error));
  }, []);

  // history of oura ring sleep logs
  useEffect(() => {
    fetch(`/api/ouraring-sleep?start_date=2023-08-02`)
    .then(response => response.json())
    .then(data => {
      setOuraRingSleepData(data);
  })
    .catch(error => console.error('Error:', error));
  }, []);

  useEffect(() => {
    if (ouraRingDailySleepData && ouraRingDailySleepData.data.length > 0) {
      const score = ouraRingDailySleepData.data[ouraRingDailySleepData.data.length - 1].score;
      setOuraRingSleepScore(score);
    }
  }, [ouraRingDailySleepData]);

  console.log("ouraRingSleepData", ouraRingSleepData);

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
          <SleepTimeCard 
            title={'Total Sleep'} 
            body={totalSleep!} 
            borderColor={"#ECD3C8"}
            textColor={"#A8440C"}
            bgColor={"#FFFAF8"}  />
          <SleepTimeCard 
            title={'Time in Bed'} 
            body={timeInBed!} 
            borderColor={"#ECD3C8"}
            textColor={"#A8440C"}
            bgColor={"#FFFAF8"} 
          />
        </div>
        <SleepScore score={ouraRingSleepScore || 0} />
        <div className='flex flex-1 flex-col gap-y-4'>
          <SleepTimeCard 
            title={'Bed Time'} 
            body={"1:15 am"} 
            borderColor={"#ECC8E4"}
            textColor={"#A80C73"}
            bgColor={"#FBF8FA"}  
          />
          <SleepTimeCard 
            title={'Wake up'} 
            body={"10:15 am"} 
            borderColor={"#ECC8C8"}
            textColor={"#A80C0C"}
            bgColor={"#FFF8F8"}   
          />
        </div>
      </div>
      <div className='w-full flex space-x-6 mt-6 justify-between'>
        <PhysicalStatsCard 
          emoji={"⚖️"} 
          title={"Weight"} 
          body={String(recentFitbitWeightData)}
          unit={"lb"}
          borderColor={"#D8DCE0"}
          textColor={"#506579"}
          bgColor={"#F4F7FA"} 
        />
        <PhysicalStatsCard 
          emoji={"🩸"} 
          title={"Blood Glucose"} 
          body={"70"}
          unit={"mg/dl"}
          borderColor={"#E9C1C1"}
          textColor={"#C52929"}
          bgColor={"#FFF1F1"}  
        />
        <PhysicalStatsCard 
          emoji={"👟"} 
          title={"Step Count"} 
          body={ouraRingSteps!}
          unit={""}
          borderColor={"#A9D09B"}
          textColor={"#387238"}
          bgColor={"#F1FFF1"} 
        />
      </div>
    </div>
  )
}
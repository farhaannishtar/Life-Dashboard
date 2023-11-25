import Head from 'next/head'
import React, {useState, useEffect} from 'react'
import {InferGetServerSidePropsType} from 'next'
import {formatDuration, formatSteps} from 'helpers/helpers';
import UserGreetingHeader from 'components/UserGreetingHeader';
import SleepTimeCard from 'components/SleepTimeCard';
import SleepScoreCard from 'components/SleepScoreCard';
import PhysicalStatsCard from 'components/PhysicalStatsCard';
import {OuraRingDailySleepData, OuraRingSleepData, OuraRingActivityData} from '../types/ouraring';
import DailyVows from 'components/DailyVows';
import { getTomorrowsDate } from 'helpers/helpers';

// export async function getServerSideProps() {
//   const apiUrl = process.env.NEXT_PUBLIC_API_URL;
//   try {
//     const res = await fetch(`${apiUrl}api/fetchFitbitData`);
//     if (!res.ok) {
//       throw new Error(`Failed to fetch data: ${res.status}`);
//     }
//     const fitbitData = await res.json();
//     return {
//       props: {
//         fitbitData,
//       },
//     };
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     return {
//       notFound: true,
//     };
//   }
// }

export default function Home() {

  const [ouraRingSleepScore, setOuraRingSleepScore] = useState<number | null>(null);
  const [ouraRingDailySleepData, setOuraRingDailySleepData] = useState<OuraRingDailySleepData | null>(null);
  const [ouraringSleepTimesData, setOuraringSleepTimesData] = useState<OuraRingDailySleepData | null>(null); // 
  const [ouraRingSleepData, setOuraRingSleepData] = useState<OuraRingSleepData | null>(null);
  const [ouraRingActivityData, setOuraRingActivityData] = useState<OuraRingActivityData | null>(null);
  const totalSleep = ouraRingSleepData && formatDuration(Number(ouraRingSleepData.data[ouraRingSleepData.data.length - 1].total_sleep_duration));
  const timeInBed = ouraRingSleepData && formatDuration(Number(ouraRingSleepData.data[ouraRingSleepData.data.length - 1].time_in_bed));
  // const recentFitbitWeightData = fitbitData.data["weight"][fitbitData.data["weight"].length - 1];
  const ouraRingSteps = ouraRingActivityData && formatSteps(Number(ouraRingActivityData[ouraRingActivityData.length - 1].steps));

  // // history of oura ring activity log
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const currentDate = new Date();
  //       currentDate.setDate(currentDate.getDate() + 1);
  //       const end_date = currentDate.toISOString().split('T')[0];

  //       fetch(`/api/fetchOuraringDailyActivity?start_date=2023-08-01&end_date=${end_date}`)
  //       .then(response => response.json())
  //       .then(data => {
  //         setOuraRingActivityData(data.data);
  //       })
  //     } catch (error) {
  //       console.error('Error:', error);
  //     }
  //   };
  //   fetchData();
  // }, []);

  // // history of oura ring daily sleep logs
  // useEffect(() => {
  //   fetch(`/api/fetchOuraringDailySleep?start_date=2023-09-11`)
  //   .then(response => response.json())
  //   .then(data => {
  //     setOuraRingDailySleepData(data);
  // })
  //   .catch(error => console.error('Error:', error));
  // }, []);

  // // history of oura ring sleep time logs
  // useEffect(() => {
  //   fetch(`/api/fetchOuraringSleepTimes?start_date=2023-09-11`)
  //   .then(response => response.json())
  //   .then(data => {
  //     setOuraringSleepTimesData(data);
  // })
  //   .catch(error => console.error('Error:', error));
  // }, []);

  // // history of oura ring sleep logs
  // useEffect(() => {
  //   const endDate = getTomorrowsDate();
  //   fetch(`/api/fetchOuraRingSleep?start_date=2023-08-02&end_date=${endDate}`)
  //   .then(response => response.json())
  //   .then(data => {
  //     setOuraRingSleepData(data);
  // })
  //   .catch(error => console.error('Error:', error));
  // }, []);

  // // calculate oura ring sleep score
  // useEffect(() => {
  //   if (ouraRingDailySleepData && ouraRingDailySleepData.data.length > 0) {
  //     const score = ouraRingDailySleepData.data[ouraRingDailySleepData.data.length - 1].score;
  //     setOuraRingSleepScore(score);
  //   }
  // }, [ouraRingDailySleepData]);

  return (
    <div className="w-full max-w-5xl mx-auto px-10">
      <Head>
        <title>Life Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <UserGreetingHeader />
      <div className='mt-8 flex space-x-6 justify-between'>
        <div className='flex flex-1 flex-col gap-y-4'>
          <SleepTimeCard 
            title={'Total Sleep'} 
            body={"8:05 hrs"} 
            borderColor={"#ECD3C8"}
            textColor={"#A8440C"}
            bgColor={"#FFFAF8"}  />
          <SleepTimeCard 
            title={'Time in Bed'} 
            body={"8:27 hrs"} 
            borderColor={"#ECD3C8"}
            textColor={"#A8440C"}
            bgColor={"#FFFAF8"} 
          />
        </div>
        {/* <SleepScoreCard score={ouraRingSleepScore || 0} /> */}
        <SleepScoreCard score={77} />
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
          body={142}
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
          // body={ouraRingSteps!}
          body={2335}
          unit={""}
          borderColor={"#A9D09B"}
          textColor={"#387238"}
          bgColor={"#F1FFF1"} 
        />
      </div>
      <DailyVows />
    </div>
  )
}
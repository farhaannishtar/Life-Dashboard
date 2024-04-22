import Head from 'next/head'
import React from 'react'
import { InferGetServerSidePropsType } from 'next'
import { formatDuration, formatSteps } from 'helpers/helpers';
import useOuraData from 'hooks/useOuraData';
import UserGreetingHeader from 'components/UserGreetingHeader';
import PhysicalStatsCard from 'components/PhysicalStatsCard';
import SleepTimeCard from 'components/SleepTimeCard';
import SleepScoreCard from 'components/SleepScoreCard';
import DailyVows from 'components/DailyVows';

// export async function getServerSideProps() {
//   const apiUrl = process.env.NEXT_PUBLIC_NGROK_URL;
//   try {
//     const res = await fetch(`${apiUrl}api/fetchFitbitData`);
//     if (!res.ok) {
//       throw new Error(`Failed to fetch data: ${res.status}`);
//     }
//     const fitbitData = await res.json();
//     console.log('fitbitData', fitbitData);
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

// export default function Home({ fitbitData }: InferGetServerSidePropsType<typeof getServerSideProps>) {
export default function Home() {
  // oura ring data
  const { ouraData, loading, error } = useOuraData();
  const totalSleep = ouraData.sleep && formatDuration(Number(ouraData.sleep.data[ouraData.sleep.data.length - 1].total_sleep_duration));
  const timeInBed = ouraData.sleep && formatDuration(Number(ouraData.sleep.data[ouraData.sleep.data.length - 1].time_in_bed));
  const sleepScore = ouraData.sleepScore && ouraData.sleepScore.data[ouraData.sleepScore.data.length - 1].score;
  const ouraRingSteps = ouraData.activity && formatSteps(Number(ouraData.activity.data[ouraData.activity.data.length - 1].steps));

  // fitbit weight data
  // const recentFitbitWeightData = fitbitData.data["weight"][fitbitData.data["weight"].length - 1];
  const recentFitbitWeightData = null;

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
            body={totalSleep!}
            borderColor={"#ECD3C8"}
            textColor={"#A8440C"}
            bgColor={"#FFFAF8"} />
          <SleepTimeCard
            title={'Time in Bed'}
            body={timeInBed!}
            borderColor={"#ECD3C8"}
            textColor={"#A8440C"}
            bgColor={"#FFFAF8"}
          />
        </div>
        <SleepScoreCard score={sleepScore || 0} />
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
        {recentFitbitWeightData !== null ? (
          <PhysicalStatsCard
            emoji={"⚖️"}
            title={"Weight"}
            body={recentFitbitWeightData}
            unit={"lb"}
            borderColor={"#D8DCE0"}
            textColor={"#506579"}
            bgColor={"#F4F7FA"}
          />
        ) : (
          <PhysicalStatsCard
            emoji={"⚖️"}
            title={"Connect"}
            body={"-"}
            unit={""}
            borderColor={"#D8DCE0"}
            textColor={"#506579"}
            bgColor={"#F4F7FA"}
          />
        )}
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
      <DailyVows />
    </div>
  )
}
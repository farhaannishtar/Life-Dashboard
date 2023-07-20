import Head from 'next/head'
import Image from 'next/image';
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import crypto from 'crypto';
import clientPromise from '../lib/mongodb'
import { InferGetServerSidePropsType } from 'next'
import Time from '../components/Time';
import { AppleHealthData } from 'components/AppleHealthData'

export async function getServerSideProps(context: any) {
  try {
    await clientPromise
    // `await clientPromise` will use the default database passed in the MONGODB_URI
    // However you can use another database (e.g. myDatabase) by replacing the `await clientPromise` with the following code:
    //
    // `const client = await clientPromise`
    // `const db = client.db("myDatabase")`
    //
    // Then you can execute queries against your database like so:
    // db.find({}) or any of the MongoDB Node Driver commands

    return {
      props: { isConnected: true },
    }
  } catch (e) {
    console.error(e)
    return {
      props: { isConnected: false },
    }
  }
}

interface FitbitWeightEntry {
  dateTime: string;
  value: number;
}

interface FitbitBmiDataEntry {
  dateTime: string;
  value: number;
}

interface FitbitWeightResponse {
  'body-weight': FitbitWeightEntry[];
}  

interface FitbitBmiResponse {
  'body-bmi': FitbitBmiDataEntry[]
}

interface OuraRingSleepData {
  data: Array<{
    score: number;
    // Add other fields as necessary
  }>;
}

export default function Home({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  const [ouraRingSleepData, setOuraRingSleepData] = useState<OuraRingSleepData | null>(null);
  const [fitbitAccessToken, setFitbitAccessToken] = useState<string | null>(null);
  const [fitbitWeightData, setFitbitWeightData] = useState<FitbitWeightResponse | null>(null);
  const [fitbitBmiData, setFitbitBmiData] = useState<FitbitBmiResponse | null>(null); 
  const router = useRouter();

  useEffect(() => {
    fetch('/api/ouraringpersonalinfo')
    .then(response => response.json())
    .catch(error => console.error('Error:', error));

    fetch('/api/ouraringsleeplogs?start_date=2023-01-01&end_date=2023-07-11')
    .then(response => response.json())
    .then(data => {
      setOuraRingSleepData(data);
    })
    .catch(error => console.error('Error:', error));

  }, []);
 
  function getDates(inputDateString: string) {
    const inputDate = new Date(inputDateString + ", " + new Date().getFullYear());
    const currentDate = new Date(inputDate.getTime()); // copy inputDate to currentDate
    const previousDate = new Date(currentDate.getTime() - (24 * 60 * 60 * 1000)); // subtract one day in milliseconds
    const year = previousDate.getFullYear();
    const month = String(previousDate.getMonth() + 1).padStart(2, "0");
    const day = String(previousDate.getDate()).padStart(2, "0");
    const formattedPreviousDate = `${year}-${month}-${day}`;
  
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
    const currentDay = String(currentDate.getDate()).padStart(2, "0");
    const formattedCurrentDate = `${currentYear}-${currentMonth}-${currentDay}`;
  
    return [formattedCurrentDate, formattedPreviousDate];
  }

  const getCurrentNYCDate = (): string => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    return currentDate;
  };

  // Dependency: Node.js crypto module
  // https://nodejs.org/api/crypto.html#crypto_crypto
  function base64URLEncode(str: any) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
  }
  
  // Dependency: Node.js crypto module
  // https://nodejs.org/api/crypto.html#crypto_crypto
  function sha256(buffer: any) {
    return crypto.createHash('sha256').update(buffer).digest();
  }

  useEffect(() => {
    const baseUrl = window.location.origin;
    const url = new URL(baseUrl + router.asPath);
    const searchParams = new URLSearchParams(url.search);
    const code = searchParams.get('code');
    let verifier: any;
    let challenge: any;

    if (!code) {
      verifier = base64URLEncode(crypto.randomBytes(32));
      challenge = base64URLEncode(sha256(verifier));
      const fitbitAuthUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23R3JP&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight&code_challenge=${challenge}&code_challenge_method=S256`
      localStorage.setItem('verifier', verifier);
      router.push(fitbitAuthUrl);
    }
    const storedToken = localStorage.getItem('fitbitAccessToken');

    if (storedToken) {
      setFitbitAccessToken(storedToken);
    } else {
        // console.log("code: ", code)
        verifier = localStorage.getItem('verifier');
        async function sendFitbitRequest() {
          const clientId = '23R3JP';
          const grantType = 'authorization_code';
          const url = 'https://api.fitbit.com/oauth2/token';
          const params = new URLSearchParams();
        
          params.append('client_id', clientId);
          params.append('grant_type', grantType);
          params.append('code', code || "");
          params.append('code_verifier', verifier);
        
          const requestOptions: RequestInit = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
          };
        
          const response = await fetch(url, requestOptions);
        
          if (response.ok) {
            const jsonData = await response.json();
            console.log("jsonData: ", jsonData);
            setFitbitAccessToken(jsonData.access_token)
            localStorage.setItem('fitbitAccessToken', jsonData.access_token);
          } else {
            console.log('HTTP-Error: ' + response.status);
          }
        }
        sendFitbitRequest();
    }
  }, []);
  
  useEffect(() => {
    if (fitbitAccessToken) {
      getFitbitWeightTimeSeries();
      // Clear query parameters
      // router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [fitbitAccessToken]);
  

  async function getFitbitWeightTimeSeries() {
    try {
      let date = getCurrentNYCDate();
      const weightTimeSeriesUrl = `https://api.fitbit.com/1/user/-/body/weight/date/2023-02-23/${date}.json`;
      const weightTimeSeriesHeaders = {
        "Authorization": `Bearer ${fitbitAccessToken}`
      };
      const weightTimeSeriesResponse = await fetch(weightTimeSeriesUrl, { headers: weightTimeSeriesHeaders });
      if (!weightTimeSeriesResponse.ok) {
        throw new Error("Request failed.");
      }
      const weightTimeSeriesResponseData = await weightTimeSeriesResponse.json();
      setFitbitWeightData(weightTimeSeriesResponseData);
    } catch (error) {
      console.error(error);
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

  function getCurrentTime(): string {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    let hoursIn12HourFormat = hours % 12;
    hoursIn12HourFormat = hoursIn12HourFormat ? hoursIn12HourFormat : 12; // the hour '0' should be '12'

    const hoursStr = hoursIn12HourFormat.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');

    return `${hoursStr}:${minutesStr} ${ampm}`;
  }
  
  // console.log("ouraRingSleepData: ", ouraRingSleepData);
  
  return (
    <div className="bg-gray-100 h-screen">
      <Head>
        <title>Life Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      
      <div className='flex justify-between w-full'>
        <div className='ml-10 mt-14'>
          <p className="text-black font-[Red Hat Text] text-2xl font-bold leading-normal tracking-[0.02rem]">Good Morning, Faraaz !</p>
        </div>
        <p className="flex items-center text-[#001EC0] font-[Red Hat Text] font-normal leading-normal tracking-[0.014rem] mt-10 mr-10">
          <Image src="/images/logo.svg" alt="Logo" height={32} width={48} />
          <span className="ml-1 text-2xl font-light">life</span>
          <span className="ml-1 text-blue-800 font-red-hat text-2xl font-bold tracking-wide">dashboard</span>
        </p>    
      </div>

      <div className="flex justify-around rounded-lg border-gray-200 bg-white shadow-2xl h-[10.25rem] flex-shrink-0 m-10">
        <Time />
        <div className='flex flex-col items-start border-red justify-center'>
          <div>Latest Sleep Score</div>
          <div className='text-[#1A2B88] text-lg font-bold leading-normal tracking-tightest'>{ouraRingSleepData && ouraRingSleepData.data[ouraRingSleepData.data.length - 1].score}</div>
          <div> keep it up 💪🏾 </div>
        </div>
        <div className='flex flex-col items-start border-red justify-center'>
          <div>Today's Steps</div>
          <div className='text-[#1A2B88] text-lg font-bold leading-normal tracking-tightest'>5,000</div>
        </div>
        <div className='flex flex-col items-start border-red justify-center'>
          <div>Latest Weight</div>
          <div className='text-[#1A2B88] text-lg font-bold leading-normal tracking-tightest'>{fitbitWeightData && fitbitWeightData["body-weight"] ? Math.round(fitbitWeightData["body-weight"][fitbitWeightData["body-weight"].length - 1].value * 2.2) : ''}lb</div>
          <div>{calculateBMI()}% BMI</div>
        </div>
      </div>


      {/* <div>
        <h2 className='mb-2 mt-0 text-5xl font-medium leading-tight text-primary'>Fitbit Data</h2>
        <div className='flex gap-1'>
          <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>Latest Weight Measurement:</p>
          <p className='mb- 2mt-0 text-3xl font-medium leading-tight text-primary'>{fitbitWeightData && fitbitWeightData["body-weight"] ? fitbitWeightData["body-weight"][fitbitWeightData["body-weight"].length - 1].value * 2.2 : ''}</p>
        </div>
      </div>
      <div>
        <h2 className='mb-2 mt-0 text-5xl font-medium leading-tight text-primary'>Oura Ring Data</h2>
        <div className='flex gap-1'>
          <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>Last Night's Sleep Score:</p>
          <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>{ouraRingSleepData && ouraRingSleepData.data[ouraRingSleepData.data.length - 1].score}</p>
        </div>
        <AppleHealthData />
      </div> */}
    </div>
  )
}
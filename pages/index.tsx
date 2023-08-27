import Head from 'next/head'
import Image from 'next/image';
import {useRouter} from 'next/router'
import React, {useState, useEffect} from 'react'
import crypto from 'crypto';
import {InferGetServerSidePropsType} from 'next'
import Time from '../components/Time';
import {getCurrentDate, getPreviousDate, calculateSleepScorePercentageChange, calculateStepCountPercentChange, formatSteps} from 'helpers/helpers';

export async function getServerSideProps(context: any) {
  try {
    // `await clientPromise` will use the default database passed in the MONGODB_URI
    // However you can use another database (e.g. myDatabase) by replacing the `await clientPromise` with the following code:
    //
    // `const client = await clientPromise`
    // `const db = client.db("myDatabase")`
    //
    // Then you can execute queries against your database like so:
    // db.find({}) or any of the MongoDB Node Driver commands

    return {
      props: {isConnected: true},
    }
  } catch (e) {
    console.error(e)
    return {
      props: {isConnected: false},
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

interface OuraRingSleepData {
  data: Array<{
    score: number;
    // Add other fields as necessary
  }>;
}

type OuraRingActivityData = Array<{
  steps: number;
  // Add other fields as necessary
}>;


export default function Home({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  const [ouraRingSleepData, setOuraRingSleepData] = useState<OuraRingSleepData | null>(null);
  const [ouraRingActivityData, setOuraRingActivityData] = useState<OuraRingActivityData | null>(null);
  const [fitbitAccessToken, setFitbitAccessToken] = useState<string | null>(null);
  const [fitbitWeightData, setFitbitWeightData] = useState<FitbitWeightResponse | null>(null);
  const [sleepScorePercentageMarkers, setSleepScorePercentageMarkers] = useState({
    arrow: 'bi_arrow-up.svg',
    contentStyles: "bg-[#F4F6F6] text-black"
  });
  const [stepCountPercentageMarkers, setStepScorePercentageMarkers] = useState({
    arrow: 'bi_arrow-up.svg',
    contentStyles: "bg-[#F4F6F6] text-black"
  });

  const [sleepPercentDiff, setSleepPercentDiff] = useState('')
  const [stepCountPercentDiff, setStepCountPercentDiff] = useState('')

  const ouraRingSteps = ouraRingActivityData && formatSteps(ouraRingActivityData[ouraRingActivityData.length - 1].steps);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetch(`/api/ouraringactivitylogs?start_date=2023-08-01&end_date=2023-08-28`)
        .then(response => response.json())
        .then(data => {
          setOuraRingActivityData(data.data);
          calculateStepCountDifference(data.data);
          console.log("oura ring activity data: ", data);
        })
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, []);
  


  useEffect(() => {
    const yesterday = getPreviousDate();
    fetch('/api/ouraringpersonalinfo')
    .then(response => response.json())
    .catch(error => console.error('Error:', error));

    fetch(`/api/ouraringsleeplogs?start_date=2023-08-01`)
    .then(response => response.json())
    .then(data => {
      setOuraRingSleepData(data);
      calculateSleepScoreDifference(data);
    })
    .catch(error => console.error('Error:', error));
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
  
 
  // Dependency: Node.js crypto module
  function base64URLEncode(str: any) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
  }
  
  // Dependency: Node.js crypto module
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
      // getFitbitWeightTimeSeries();
      // Clear query parameters
      // router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [fitbitAccessToken]);
  

  async function getFitbitWeightTimeSeries() {
    try {
      let date = getCurrentDate();
      const weightTimeSeriesUrl = `https://api.fitbit.com/1/user/-/body/weight/date/2023-02-23/${date}.json`;
      const weightTimeSeriesHeaders = {
        "Authorization": `Bearer ${fitbitAccessToken}`
      };
      const weightTimeSeriesResponse = await fetch(weightTimeSeriesUrl, {headers: weightTimeSeriesHeaders});
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

  // console.log("ouraRingSleepData: ", ouraRingSleepData);
  
  return (
    <div className="bg-gray-100 h-screen">
      <Head>
        <title>Life Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      
      <div className='flex justify-between w-full'>
        <div className='ml-10 mt-10'>
          <p className="text-black font-[Red Hat Text] text-3xl font-bold leading-normal tracking-[0.02rem]">Good Morning, Faraaz !</p>
        </div>
        <p className="flex items-center text-[#001EC0] font-[Red Hat Text] font-normal leading-normal tracking-[0.014rem] mt-6 mr-10">
          <Image src="/images/logo.svg" alt="Logo" height={32} width={48} />
          <span className="ml-1 text-2xl font-light">life</span>
          <span className="ml-1 text-blue-800 font-red-hat text-2xl font-bold tracking-wide">dashboard</span>
        </p>    
      </div>

      <div className="flex justify-around rounded-lg border-gray-200 bg-white shadow-2xl h-[11.25rem] flex-shrink-0 m-10">
        <Time />
        <div className="border-l border-dashed border-gray-300 h-24 transform translate-y-1/2"></div>
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
        <div className="border-l border-dashed border-gray-300 h-24 transform translate-y-1/2"></div>
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
        <div className="border-l border-dashed border-gray-300 h-24 transform translate-y-1/2"></div>
        <div className='flex flex-col items-start border-red justify-center mr-8'>
          <div className='font-extralight mb-2'>Latest Weight</div>
          <div className='text-[#1A2B88] text-2xl font-bold leading-normal tracking-tightest'>{fitbitWeightData && fitbitWeightData["body-weight"] ? Math.round(fitbitWeightData["body-weight"][fitbitWeightData["body-weight"].length - 1].value * 2.2) : ''}lb</div>
          <div className='font-extralight text-sm mt-1'>{calculateBMI()}% BMI</div>
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
      </div> */}
    </div>
  )
}
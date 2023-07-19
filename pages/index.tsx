import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import crypto from 'crypto';
import clientPromise from '../lib/mongodb'
import { InferGetServerSidePropsType } from 'next'
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
    console.log("code at beginning: ", code)
    let verifier: any;
    let challenge: any;

    if (!code) {
      verifier = base64URLEncode(crypto.randomBytes(32));
      challenge = base64URLEncode(sha256(verifier));
      const fitbitAuthUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23R3JP&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight&code_challenge=${challenge}&code_challenge_method=S256`
      console.log("fitbitAuthUrl: ", fitbitAuthUrl)
      console.log("verifier: ", verifier)
      localStorage.setItem('verifier', verifier);
      router.push(fitbitAuthUrl);
    }
    const storedToken = localStorage.getItem('fitbitAccessToken');

    if (storedToken) {
      setFitbitAccessToken(storedToken);
      console.log("token exists")
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
          } else {
            console.log('HTTP-Error: ' + response.status);
          }
        }
        console.log('I am gong to figure this out')
        sendFitbitRequest();
    }
  }, []);
  
  console.log("fitbitAccessToken: ", fitbitAccessToken);
  
  useEffect(() => {
    if (fitbitAccessToken) {
      getFitbitWeightTimeSeries();
      // getFitbitBmiTimeSeries();
      // Clear query parameters
      // router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [fitbitAccessToken]);
  
  async function getFitbitDeviceData() {
    try {
      const bmiTimeSeriesUrl = 'https://api.fitbit.com/1/user/-/body/bmi/date/2023-02-23/2023-05-23.json';
      const bmiTimeSeriesHeaders = {
        "Authorization": `Bearer ${fitbitAccessToken}`
      };
      const bmiTimeSeriesResponse = await fetch(bmiTimeSeriesUrl, { headers: bmiTimeSeriesHeaders });
      if (!bmiTimeSeriesResponse.ok) {
        throw new Error("Request failed.");
      }
      const bmiTimeSeriesResponseData = await bmiTimeSeriesResponse.json();
      setFitbitBmiData(bmiTimeSeriesResponseData);
    } catch (error) {
      console.error(error);
    }
  }

  async function getFitbitBmiTimeSeries() {
    try {
      const bmiTimeSeriesUrl = 'https://api.fitbit.com/1/user/-/body/bmi/date/2023-02-23/2023-05-23.json';
      const bmiTimeSeriesHeaders = {
        "Authorization": `Bearer ${fitbitAccessToken}`
      };
      const bmiTimeSeriesResponse = await fetch(bmiTimeSeriesUrl, { headers: bmiTimeSeriesHeaders });
      if (!bmiTimeSeriesResponse.ok) {
        throw new Error("Request failed.");
      }
      const bmiTimeSeriesResponseData = await bmiTimeSeriesResponse.json();
      setFitbitBmiData(bmiTimeSeriesResponseData);
    } catch (error) {
      console.error(error);
    }
  }

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
  
  // console.log("ouraRingSleepData: ", ouraRingSleepData);
  
  return (
    <div className="container">
      <Head>
        <title>Life Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Life Dashboard</h1>

      <main>
        <div>
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
        </div>
      </main>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .subtitle {
          font-size: 2rem;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import clientPromise from '../lib/mongodb'
import { InferGetServerSidePropsType } from 'next'
import { useDate } from '../custom-hooks/useDate';
import TimeSinceAwake from '../components/TimeSinceAwake';

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

interface OuraRingSleepData {
  score: number;
  bedtime_end: string;
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

export default function Home({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  const [ouraRingSleepData, setOuraRingSleepData] = useState({ 
    sleep: [{
      score: '',
      bedtime_end: '',
    }],
  });
  const { date, time } = useDate();
  const [fitbitAccessToken, setFitbitAccessToken] = useState<string | null>(null);
  const [fitbitWeightData, setFitbitWeightData] = useState<FitbitWeightResponse | null>(null);
  const [fitbitBmiData, setFitbitBmiData] = useState<FitbitBmiResponse | null>(null); 
  const router = useRouter();

  useEffect(() => {
    const fetchData = async (currentDate: string, previousDate: string): Promise<void> => {
      try {
        const response = await fetch(`https://api.ouraring.com/v1/sleep?start=${previousDate}&end=${currentDate}`, {
          headers: {
            'Authorization': 'Bearer 7FADD6MJ4TRXKFR33QOFYKGXH5P53T3J'
          }
        });
        const data = await response.json();
        if (data.sleep.length === 0) {
          let [newCurrentDate, newPreviousDate] = getDates(previousDate);
          fetchData(newCurrentDate, newPreviousDate);
        } else {
          setOuraRingSleepData(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    const [currentDate, previousDate] = getDates(date);
    fetchData(currentDate, previousDate);
  }, [date]);
 
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

  useEffect(() => {
    const baseUrl = window.location.origin;
    const url = new URL(baseUrl + router.asPath);
    const searchParams = new URLSearchParams(url.search);
    const code = searchParams.get('code');

    if (!code) {
      window.location.href = "https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23R3JP&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight&code_challenge=VoZtdt3PCnvoKJwu1BIbSHAlHvezwW7KMwnU8WCuonU&code_challenge_method=S256&state=26151j3j5a0n38626l5q1l132d5x6o4g";
    } else {
      const storedToken = localStorage.getItem('fitbitAccessToken');

      if (storedToken) {
        setFitbitAccessToken(storedToken);
      } else {
        const postData = new URLSearchParams();
        postData.append('client_id', '23R3JP');
        postData.append('grant_type', 'authorization_code');
        postData.append('redirect_uri', 'http://localhost:3000/');
        postData.append('code', `${code}`);
        postData.append(
          'code_verifier',
          '4j713q6f1n1f3j4f5r56440f4x5i16284b4j4o5b201133225f0b4s6n1i3k02633g2p1w1x0o3c0m4o6p4t2k4u4t2k000e6c2l4i065t2u3z18613j4v5j012k531b'
        );

        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: postData.toString(),
        };

        fetch('https://api.fitbit.com/oauth2/token', requestOptions)
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error('Error: ' + response.status);
            }
          })
          .then(async (data) => {
            setFitbitAccessToken(data.access_token);
            localStorage.setItem('fitbitAccessToken', data.access_token);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  }, []);

  useEffect(() => {
    if (fitbitAccessToken) {
      console.log(fitbitAccessToken);
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
      console.log("bmi time series data", bmiTimeSeriesResponseData);
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
      console.log("bmi time series data", bmiTimeSeriesResponseData);
      setFitbitBmiData(bmiTimeSeriesResponseData);
    } catch (error) {
      console.error(error);
    }
  }

  async function getFitbitWeightTimeSeries() {
    try {
      let date = getCurrentNYCDate();
      console.log("date: ", date);
      const weightTimeSeriesUrl = `https://api.fitbit.com/1/user/-/body/weight/date/2023-02-23/${date}.json`;
      const weightTimeSeriesHeaders = {
        "Authorization": `Bearer ${fitbitAccessToken}`
      };
      const weightTimeSeriesResponse = await fetch(weightTimeSeriesUrl, { headers: weightTimeSeriesHeaders });
      if (!weightTimeSeriesResponse.ok) {
        throw new Error("Request failed.");
      }
      const weightTimeSeriesResponseData = await weightTimeSeriesResponse.json();
      console.log("weight time series data: ", weightTimeSeriesResponseData);
      setFitbitWeightData(weightTimeSeriesResponseData);
    } catch (error) {
      console.error(error);
    }
  }
  
  // console.log("fitbit weight data: ", fitbitWeightData);
  // console.log("fitbit bmi data: ", fitbitBmiData);

  return (
    <div className="container">
      <Head>
        <title>Life Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1 className="title">Life Dashboard</h1>
      <div>
        <h3>
          {date}
          <br />
          {time}
          <br />
        </h3>
      </div>

      <main>
        <div className='mb-6'>
          <h2 className='mb-2 mt-0 text-5xl font-medium leading-tight text-primary'>Fitbit Data</h2>
          <div className='flex gap-1'>
            <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>Latest Weight Measurement:</p>
            <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>{fitbitWeightData && fitbitWeightData["body-weight"] ? fitbitWeightData["body-weight"][fitbitWeightData["body-weight"].length - 1].value * 2.2 : ''}</p>
          </div>
        </div>
        <div>
          <h2 className='mb-2 mt-0 text-5xl font-medium leading-tight text-primary'>Oura Ring Data</h2>
          <div className='flex gap-1'>
            <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>Last Night's Sleep Score:</p>
            <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>{ouraRingSleepData.sleep && ouraRingSleepData.sleep[0] ? ouraRingSleepData.sleep[ouraRingSleepData.sleep.length - 1].score : ''}</p>
          </div>
          <div className='flex gap-1'>
            <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>Time Since Awake:</p>
            { ouraRingSleepData.sleep && ouraRingSleepData.sleep[0] 
              ? <TimeSinceAwake bedTimeEnd={ouraRingSleepData.sleep[ouraRingSleepData.sleep.length - 1].bedtime_end} /> 
              : <p>Effort is the Goal</p>
            }
          </div>

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
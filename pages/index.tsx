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

export default function Home({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  const [ouraRingData, setOuraRingData] = useState({});
  const { date, time } = useDate();
  const [fitbitAccessToken, setFitbitAccessToken] = useState(null);
  const [fitbituserId, setFitbitUserId] = useState(null);
  const [fitbitWeightData, setFitbitWeightData] = useState(null);
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
          setOuraRingData(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    const [currentDate, previousDate] = getDates(date);
    fetchData(currentDate, previousDate);
  }, [date]);
  

  // console.log("ouraRingData: ", ouraRingData)

  function getDates(inputDateString: string) {
    // console.log("inputDateString: ", inputDateString)
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

  useEffect(() => {
    const baseUrl = window.location.origin;
    const url = new URL(baseUrl + router.asPath);
    const searchParams = new URLSearchParams(url.search);
    const code = searchParams.get('code');
    if (code) {
      const postData = new URLSearchParams();
      postData.append('client_id', '23QWKZ');
      postData.append('grant_type', 'authorization_code');
      postData.append('redirect_uri', 'http://localhost:3000/');
      postData.append('code', `${code}`);
      postData.append(
        'code_verifier',
        '4q5t6c2j2d712n5u0c4q1q081d2i5b1b6z4p0e1i5a0g3u4y1w6065535y6f4r350u2w363q0c082w3l4t5j5x6g6r6s315j6o660f470t6d2p1l4p5a24376s3y2q2u'
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
          const parsedData = JSON.parse(data);
          setFitbitAccessToken(parsedData.access_token);
          setFitbitUserId(parsedData.user_id);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, []);
  
  async function getFitBitWeightData() {
    try {
      const url = `https://api.fitbit.com/1/user/-/devices.json`;
      const headers = {
        "Authorization": `Bearer ${fitbitAccessToken}`
      };
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error("Request failed.");
      }
      const deviceData = await response.json();
      console.log(deviceData);
    } catch (error) {
      console.error(error);
    }
  }
  
  function fitbitLoginHandler() {
    window.location.href = 'https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23QWKZ&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight&code_challenge=gElACHZHC-JmCzGhzQCNGTdOvBSghEXJ3PnBP89p-zc&code_challenge_method=S256&state=3p1d1w0j05653q6i0t1e5w4t25325z46'
  }


  console.log("fitbitAccessToken: ", fitbitAccessToken)

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
        </h3>
      </div>

      <div>
        { !fitbitAccessToken && 
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={fitbitLoginHandler}>
            Login with Fitbit
          </button>
        }
      </div>

      <main>
        <div>
          <h2 className='mb-2 mt-0 text-5xl font-medium leading-tight text-primary'>Oura Ring Data</h2>
          <div className='flex gap-1'>
            <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>Last Night's Sleep Score:</p>
            <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>{ouraRingData.sleep && ouraRingData.sleep[0] ? ouraRingData.sleep[ouraRingData.sleep.length - 1].score : ''}</p>
          </div>
          <div className='flex gap-1'>
            <p className='mb-2 mt-0 text-3xl font-medium leading-tight text-primary'>Time Since Awake:</p>
            { ouraRingData.sleep && ouraRingData.sleep[0] 
              ? <TimeSinceAwake bedTimeEnd={ouraRingData.sleep[ouraRingData.sleep.length - 1].bedtime_end} /> 
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
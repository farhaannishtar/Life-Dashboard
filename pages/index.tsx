import Head from 'next/head'
import React, { useState, useEffect } from 'react'
import clientPromise from '../lib/mongodb'
import { InferGetServerSidePropsType } from 'next'
import { useSession } from 'next-auth/client';

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
  

  console.log("ouraRingData: ", ouraRingData)

  function getDates(inputDateString: string) {
    console.log("inputDateString: ", inputDateString)
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

  const [session, loading] = useSession();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Not authenticated. Please sign in.</div>;
  }

  // Access the Fitbit data from the session object
  const { user, accessToken } = session;
  
  // Make an API request to retrieve weight and body fat percentage
  const fetchFitbitData = async () => {
    try {
      const response = await fetch('https://api.fitbit.com/1/user/-/body/log/weight/date/today/1d.json', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const { weight, fat } = data['weight'][0];
        // Use the weight and fat variables to update your UI or store the values
      } else {
        console.log('Failed to fetch Fitbit data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching Fitbit data:', error);
    }
  };

  useEffect(() => {
    fetchFitbitData();
  }, []);


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
        
        {/* <SessionStatus /> */}

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
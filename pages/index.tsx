import Head from 'next/head'
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

  function retrieveAccessToken() {
    // URL for the POST request
    const url = 'https://api.fitbit.com/oauth2/token';

    // Create a URL object
    var urlObj = new URL(url);

    // Get the search parameters from the URL
    var searchParams = new URLSearchParams(urlObj.search);

    // Retrieve the value of the code parameter
    var code = searchParams.get("code");

    // Data to send in the request body
    const data = {
      client_id: '23QWKZ',
      code: code,
      code_verifier: '27381q5c3k622r1b2m254y5s053c1p5a352w0t423c1l1562215s211i3z5f1m5f4s6i14495v521b4p4s0a4y6c531z5q0a4b4q07455o592e2v4i6e3o6x2v226444',
      grant_type: 'authorization_code'
    };

    // Options for the fetch request
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: JSON.stringify(data) // Convert the data to JSON string
    };

    // Make the POST request
    fetch(url, options)
      .then(response => {
        // Handle the response
        if (response.ok) {
          return response.json(); // Parse the response body as JSON
        } else {
          throw new Error('Error: ' + response.status);
        }
      })
      .then(data => {
        // Handle the JSON data
        console.log(data);
      })
      .catch(error => {
        // Handle any errors
        console.error(error);
      });
  }
      

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
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          <a href="https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=23QWKZ&scope=activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight&code_challenge=mAtEgBIJq6tvEX06CtUyLxU2XxaO9pE4qTnQtYgWZZY&code_challenge_method=S256&state=00344m0n4q2v0q5v3f3l6g2z575y3f0w&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F">Login</a>  
        </button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={retrieveAccessToken}>
          Retrieve Access Token
        </button>
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
import { useEffect } from 'react';
import * as Plot from '@observablehq/plot';

// SleepChart.tsx
interface SleepChartProps {
  sleepData: { data: OuraRingSleepDataChart[] } | null;
}

interface OuraRingSleepDataChart {
  score: number;
  day: number;
  // Add other fields as necessary
}

const SleepChart: React.FC<SleepChartProps> = ({ sleepData }) => {
  useEffect(() => {
    const node = document.getElementById('plot');
    console.log("DOM node: ", node);
    console.log("sleepData inside sleepChart: ", sleepData)

    // Clear any existing plots
    if (node) {
      node.innerHTML = '';
    }

    // Check if sleepData is null or if it doesn't have a 'data' array
    if (sleepData === null || !Array.isArray(sleepData.data)) {
      return;
    }

    let parsedSleepData = {
      data: [
        ...sleepData.data,
      ]
    } 

    const filteredData = parsedSleepData.data.filter(entry => entry.day !== undefined && entry.score !== undefined);


    const chart = Plot.plot({
      x: {
        label: 'Day of the Month',
        domain: [1, 31]
      },
      y: {
        label: 'Sleep Score',
        domain: [1, 100]
      },
      marks: [
        Plot.line(filteredData, { x: 'day', y: 'score' })
      ],
    });

    if (node) {
      node.appendChild(chart);
    }

    // Clean up old plots when component is unmounted or before new plot
    return () => {
      if (node) {
        node.innerHTML = '';
      }
    };
  }, [sleepData]);

  return <div id='plot'></div>;
};



export default SleepChart;
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
    const sortedData = filteredData.sort((a, b) => a.day - b.day);

    const chart = Plot.plot({
      width: 1150, // width in pixels
      x: {
        label: 'Day of the Month',
        domain: [1, 31],
        ticks: Array.from({ length: 31 }, (_, i) => i + 1)
      },
      y: {
        label: 'Sleep Score',
        domain: [1, 100],
        grid: true  // adds grid lines for the y-axis
      },
      marks: [
        Plot.line(sortedData, { x: 'day', y: 'score', stroke: "#1A2B88" })
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
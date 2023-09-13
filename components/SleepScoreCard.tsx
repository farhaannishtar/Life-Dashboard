import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { SleepScoreProps } from '../types/uiComponents';

function SleepScore({ score }: SleepScoreProps) {
  return (
    <div className='flex flex-1 flex-col justify-start items-center flex-shrink-0 rounded-3xl bg-blue-bg border border-blue-border p-0 m-0'>
          <div className='pt-7 pl-5 text-2xl leading-3 font-black m-0 w-full'> 
            💤
          </div>
          <div className='flex justify-center items-center -m-8 p-0 -mt-12 w-full h-full lg:px-12'>
            <CircularProgressbar value={score || 0} text={`${score || 0}`} styles={{
                root: {
                  width: '60%', 
                  height: '60%',
                },
                path: {
                  stroke: `#2C73DD`,
                  strokeLinecap: 'round',
                  transition: 'stroke-dashoffset 0.5s ease 0s',
                  transformOrigin: 'center center',
                },
                trail: {
                  stroke: '#BFD9FF',
                  strokeLinecap: 'butt',
                  transformOrigin: 'center center',
                },
                text: {
                  fill: '#2C73DD',
                  fontSize: '2rem',
                  fontWeight: 900,
                  display: 'flex',
                },
                background: {
                  fill: '#3e98c7',
                },
            }} />
          </div>
          <div className='w-full text-center mt-1 font-black text-lg	text-blue-text pb-3'>
            Sleep Score
          </div>
        </div>
  )
}

export default SleepScore;
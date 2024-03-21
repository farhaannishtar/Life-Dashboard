import React from 'react';

const UserGreetingHeader: React.FC = () => {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  let greeting = 'Good ';

  if (currentHour >= 0 && currentHour < 12) {
    greeting += 'Morning,';
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting += 'Afternoon,';
  } else {
    greeting += 'Evening,';
  }
  greeting += ' Farhaan';

  return (
    <div className='flex justify-between w-full'>
      <div className='mt-10'>
        <p className="text-black text-4xl font-bold leading-8 tracking-[0.02rem]">{greeting}</p>
      </div>
    </div>
  );
}

export default UserGreetingHeader
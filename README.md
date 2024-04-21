# Life Dashboard

## Screenshot

<img width="494" alt="Screenshot 2024-03-21 at 11 39 02 AM" src="https://github.com/farhaannishtar/Life-Dashboard/assets/89179469/f3f4809a-f40b-411e-8760-43da817dcf21">


## About

Born out of a personal need, I created this full-stack web application as a solution to keep track of all my health metrics scattered across various devices and platforms – the Oura ring, Fitbit scale, and data from meditation and habit-tracking apps. I needed something that could bring it all together. As a developer, I saw an opportunity to not only help myself centrally monitor my health data but also to create something that could benefit others facing similar challenges.

The application is tailored to offer a user-friendly experience in monitoring and analyzing health data, providing real-time health and wellness metrics by integrating seamlessly with various devices, as well as offering a customizable habit tracker.

Life Dashboard currently supports the following health devices:
- **Oura Ring**
- **Fitbit Scale**

## Technology Stack

- **Frontend**: Next.js 12, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase
- **APIs**: Oura Ring, Fitbit
- **Deployment**: Vercel
- **Version Control**: GitHub
- **Code Editor**: VSCode

## Features and Functionality

- Real-time data visualization from Oura ring and Fitbit scale Aria 2.
- Customizable dashboard for tracking various health metrics.
- User authentication and secure data handling.
- Responsive design for optimal viewing on all device types.

## Installation and Setup Instructions

## Prerequisites
- Ensure you have Node.js [version] installed. You can download it from [Node.js official website](https://nodejs.org/).
- npm [version] or higher must be installed. npm is distributed with Node.js, which means that when you download Node.js, you automatically get npm installed on your computer.

## Cloning the Repository
Clone the project repository by running:
```
git clone https://github.com/your-username/Life-Dashboard.git
cd Life-Dashboard
```
Inside the project directory, install the required npm packages:

```
npm install
```

Environment Setup
Copy the .env.example file to a new file named .env.
Fill in the necessary API keys and database URLs in the .env file.

```
npm run dev
```

To run ngrok tunnel to connect your local development server to public URL
```
ngrok http 3000
```

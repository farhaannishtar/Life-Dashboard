# Life Dashboard

## Screenshot

<img width="505" alt="Screenshot 2023-11-28 at 12 32 59 PM" src="https://github.com/farhaannishtar/Life-Dashboard/assets/89179469/f3061a89-50f3-4df6-89b4-210063b15f1d">

## About

Born out of a personal need, this full-stack web application was my answer to a challenge faced by my brother. Struggling to keep track of his health metrics scattered across various devices – the Oura ring, Fitbit scale and Librelink, a blood glucose monitor – he needed something that could bring it all together. That's where I decided to leverage my skillsets. As a developer and a caring brother, I saw an opportunity to not only help him centralize his health data, but also to create something that could benefit others facing similar challenges.

The application is tailored to offer a user-friendly experience in monitoring and analyzing health data, providing real-time health and wellness metrics by integrating seamlessly with various devices. 

Life Dash board currently supports the following health devices:
- **Oura Ring**
- **Librelink** 
- **Fitbit Scale**

## Technology Stack

- **Frontend**: Next.js 12, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase
- **APIs**: Oura Ring, Fitbit, Librelink
- **Deployment**: Vercel
- **Version Control**: GitHub
- **Code Editor**: VSCode

## Features and Functionality

- Real-time data visualization from Oura ring, blood glucose monitors, and Fitbit scales.
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

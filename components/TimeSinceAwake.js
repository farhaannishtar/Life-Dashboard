import Clock from "react-live-clock";

function TimeSinceAwake(props) {
  console.log("TimeSinceAwake props", props);
  return <Clock format={"HH:mm:ss"} ticking={true} timezone={"US/Eastern"} />;
}

export default TimeSinceAwake;

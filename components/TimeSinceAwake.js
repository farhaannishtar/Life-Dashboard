import Clock from "react-live-clock";

function TimeSinceAwake(props) {
  return <Clock format={"HH:mm:ss"} ticking={true} timezone={"US/Eastern"} />;
}

export default TimeSinceAwake;

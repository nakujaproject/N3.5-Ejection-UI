import { useEffect, useState } from 'react'
import MQTT from 'paho-mqtt'
import nakuja from '/nakuja_logo.png'
import setting from './assets/setting.svg';

let client = new MQTT.Client("localhost", 1783, "dashboard");


  //called when client connects
  let onConnect = () => {
    console.log("connected");
    document.getElementById('connected').innerHTML = "Connected";

  }

  // connect the client
  client.connect({
    onSuccess: onConnect,
    keepAliveInterval: 3600,
  });




export default function App() {
  let initialTime = 5;
  let [seconds, setSeconds] = useState(initialTime);


  let [clicked, setClicked] = useState(false);
  let [clickedStandby, setClickedStandby] = useState(false);

  // called when the client loses its connection
  let onConnectionLost = (responseObject) => {
    if (responseObject.errorCode !== 0) {
      console.log("onConnectionLost:" + responseObject.errorMessage);
    }
  }


  // called when a message arrives
  // let onMessageArrived = (message) => {
  //   console.log("onMessageArrived:");
  //   setForce(parseFloat(message.payloadString.split(',')[1]));
  //   force>max?setMax(force):null;
  // }

  useEffect(() => {
    let intervalId;

    if (clicked && seconds > 0) {
      intervalId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000)
    } else if (seconds === 0) {
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId)
  }, [clicked, seconds])

  function resetTimer() {
    setSeconds(initialTime);
    setClicked(false);
    setClickedStandby(false);

  }
  function reset() {
    e => sendMessage(e, clicked ? "off" : "on");
    e => sendMessageStandby(e, clickedStandby ? "standby" : "ready");
    resetTimer();
  }

  //send message
  let sendMessage = (e, command) => {

    e.preventDefault();
    console.log('clicked');
    let message = new MQTT.Message(command);
    message.destinationName = "controls/ejection";
    client.send(message);
    setClicked(true);

  }

  //send message
  let sendMessageStandby = (e, command) => {

    e.preventDefault();
    console.log('clicked');
    let message = new MQTT.Message(command);
    message.destinationName = "controls/standby";
    client.send(message);
    setClickedStandby(true);

  }

  useEffect(() => {
    // set callback handlers
    onConnectionLost = onConnectionLost;
    // client.onMessageArrived = onMessageArrived;


    // return () => {
    //   client.disconnect();
    // };
  }, []);


  return (
    <div className='container mx-auto tracking-wide'>
      <div className='header flex justify-evenly items-center my-4'>
        <img className='w-2/12 md:w-[5%]' src={nakuja} alt="" />
        <div id='connected' className="text-sm lg:text-base text-center">
          Connecting...
        </div>
        <button onClick={e => { document.getElementById('settings').style.visibility = 'visible' }}><img src={setting} className="" /></button>
      </div>
      {/* <div className='text-center mt-32 md:mt-64'><span className='text-4xl'>{force} </span>N</div>
        <div className='text-center text-xl my-8 md:my-24'>Max {max}</div> */}
      <div className='countdown text-center text-4xl my-8 md:my-24'>{seconds}</div>

      <button className='bg-green-500 hover:bg-green-600 active:bg-green-700 active:text-white text-lg font-semibold tracking-wide py-4 md:w-1/4 w-3/4 my-8 rounded-full block mx-auto' onClick={e => sendMessage(e, clicked ? "off" : "on")}>
        {clicked ? "ABORT" : "EJECT"}

      </button><button className='bg-green-500 hover:bg-green-600 active:bg-green-700 active:text-white text-lg font-semibold tracking-wide py-4 md:w-1/4 w-3/4 my-8 rounded-full block mx-auto' onClick={e => sendMessageStandby(e, clickedStandby ? "standby" : "ready")}>
        {clickedStandby ? "STANDBY" : "READY"}
      </button>


      {clicked && <button className='bg-red-500 hover:bg-red-600 active:bg-red-700 active:text-white text-lg font-semibold tracking-wide py-4 md:w-1/4 w-3/4 my-8 rounded-full block mx-auto' onClick={reset}>RESET</button>
      }

      {clickedStandby && <button className='bg-red-500 hover:bg-red-600 active:bg-red-700 active:text-white text-lg font-semibold tracking-wide py-4 md:w-1/4 w-3/4 my-8 rounded-full block mx-auto' onClick={reset}>RESET</button>
      }
    </div>
  )
}
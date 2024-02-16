import { useEffect, useState } from 'react'
import MQTT from 'paho-mqtt'
import nakuja from '/nakuja_logo.png'
import setting from './assets/setting.svg';

// let socket = new WebSocket("ws://192.168.100.2:8001");
// socket.onopen = function(e) {
//   alert("[open] Connection established");
// };
let client = new MQTT.Client("192.168.137.1", 1783, "dashboard");

//called when client connects
let onConnect = () => {
  console.log("connected");
  // setConnection(true)
  client.subscribe("piston/force");
}

// connect the client
client.connect({
  onSuccess:onConnect,
  keepAliveInterval: 3600,
});

export default function App() {
  let initialTime = 5
  const [force, setForce] = useState(0.0);
  let [max,setMax] = useState(0.0);
  let [connection, setConnection] = useState(false)
  let [seconds, setSeconds] = useState(initialTime);
  // let [isActive, setIsActive] = useState(false);
  let [clicked,setClicked] = useState(false);

//   socket.onmessage = function(event) {
//     console.log(event);
//     document.getElementById("root").innerHTML = event.data;
//     alert(`[message] Data received from server: ${event.data}`);`
// }

// called when the client loses its connection
let onConnectionLost = (responseObject) => {
  if (responseObject.errorCode !== 0) {
  console.log("onConnectionLost:"+responseObject.errorMessage);
  }
  // connect the client
  client.connect({
    onSuccess:onConnect,
    keepAliveInterval: 3600,
  });
}

// called when a message arrives
let onMessageArrived = (message) => {
  console.log("onMessageArrived:");
  setForce(parseFloat(message.payloadString.split(',')[1]));
  force>max?setMax(force):null;
}

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

useEffect(() => {
  let intervalId

  if (clicked && seconds > 0) {
    intervalId = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds - 1)
    }, 1000)
  } else if (seconds === 0) {
    clearInterval(intervalId)
  }

  return () => clearInterval(intervalId)
}, [clicked, seconds])

function resetTimer() {
  setSeconds(initialTime)
  setClicked(false)

}
function reset(){
  e=>sendMessage(e, clicked?"off":"on")
  resetTimer()
}

//send message
let sendMessage = (e,command) => {
  e.preventDefault();
  // socket.send(JSON.stringify({message:command}));
  console.log('clicked')
  let message = new MQTT.Message(command)
  message.destinationName = "controls/ejection";
  client.send(message);
  setClicked(true)

  }


  return (
    <div className='container mx-auto tracking-wide'>
      <div className='header flex justify-evenly items-center my-4'>
        <img className='w-2/12 md:w-[5%]' src={nakuja} alt=""/>
        <div>{connection?"Connected":"Connecting..."}</div>
        <button onClick={e=>{document.getElementById('settings').style.visibility='visible'}}><img src={setting} className=""/></button>
      </div>
        {/* <div className='text-center mt-32 md:mt-64'><span className='text-4xl'>{force} </span>N</div>
        <div className='text-center text-xl my-8 md:my-24'>Max {max}</div> */}
        <div className='countdown text-center text-4xl my-8 md:my-24'>{seconds}</div>
        <button className='bg-green-500 hover:bg-green-600 active:bg-green-700 active:text-white text-lg font-semibold tracking-wide py-4 md:w-1/4 w-3/4 my-8 rounded-full block mx-auto' onClick={e=>sendMessage(e, clicked?"off":"on")}>{clicked?"ABORT":"EJECT"}</button>
        {clicked && <button className='bg-red-500 hover:bg-red-600 active:bg-red-700 active:text-white text-lg font-semibold tracking-wide py-4 md:w-1/4 w-3/4 my-8 rounded-full block mx-auto' onClick={reset}>RESET</button>
        }
     
    </div>
  )
}
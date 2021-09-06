import React, { useState } from 'react';

interface AppProps {}

function App({}: AppProps) {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);

  return (
    <div className="App">
    <header className="App-header">
      <button disabled={device !== null} onClick={async () => {
        try {

          function handleBatteryLevelChanged(event: Event) {
            // @ts-expect-error
            const batteryLevel = event?.target?.value?.getUint8(0);
            console.log('Battery percentage is ' + batteryLevel);
          }

          const blDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['battery_service'] // Required to access service later.
          });

          const server = await blDevice?.gatt?.connect();
          const batteryService = await server?.getPrimaryService('battery_service');
          const batteryCharacteristic = await batteryService?.getCharacteristic('battery_level');
          const batteryValue = await batteryCharacteristic?.readValue();

          batteryCharacteristic?.addEventListener('characteristicvaluechanged', handleBatteryLevelChanged);

          console.log('device', blDevice);
          console.log('server', server);
          console.log('batteryService', batteryService);
          console.log('batteryCharacteristic', batteryCharacteristic);
          console.log('batteryValue', batteryValue);

          setDevice(blDevice);
        } catch(err) {
          console.log('error on requestDevice', err);
        }
      }}>Request Bluetooth device</button>
      <button disabled={device === null} onClick={() => {
        if(!device) {
          return
        }

        device?.gatt?.disconnect();
        setDevice(null);
      }}>Disconnect from Bluetooth device</button>
    </header>
    </div>
  )
}


export default App;

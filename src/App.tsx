import React, { useState } from 'react';

import { parseHeartSensorData, SERVICE_NAME, CHARACTERISTIC } from './utils/heart';

interface AppProps {}

function App({}: AppProps) {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);

  return (
    <div className="App">
    <header className="App-header">
      <p>Connected to: {device?.name}</p>
      <button disabled={device !== null} onClick={async () => {
        try {

          function handleCharacteristicValueChanged(event: unknown) {
            // @ts-expect-error
            const value = event.target.value as DataView;
            console.log('Received ', value.buffer);

            const result = parseHeartSensorData(value);
            console.log('result', result);
          }

          const blDevice = await navigator.bluetooth.requestDevice({
            filters: [{services: ['heart_rate']}],
          });

          const server = await blDevice?.gatt?.connect();
          const service = await server?.getPrimaryService(SERVICE_NAME);
          const characteristic = await service?.getCharacteristic(CHARACTERISTIC);

          characteristic?.startNotifications();

          characteristic?.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

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

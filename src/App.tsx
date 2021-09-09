import React, { useState } from 'react';

import { parseHeartSensorData, SERVICE_NAME, CHARACTERISTIC } from './utils/heart';

const SERVICES = ['heart_rate'];

interface AppProps { }

function App({ }: AppProps) {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [contact, setContact] = useState(false);
  const [data, setData] = useState([] as number[]);

  console.log('data', data);

  const handleCharacteristicValueChanged = (event: unknown) => {
    // @ts-expect-error
    const value = event.target.value as DataView;

    const result = parseHeartSensorData(value);
    setContact(!!result.contactDetected);
    if (result.heartRate) {
      setData(oldData => { return [...oldData, result.heartRate ?? 0] });
    }
    console.log('result', result);
  }

  async function handleConnect() {
    try {
      const blDevice = await navigator.bluetooth.requestDevice({ filters: [{ services: SERVICES }] });

      const server = await blDevice?.gatt?.connect();
      const service = await server?.getPrimaryService(SERVICE_NAME);
      const characteristic = await service?.getCharacteristic(CHARACTERISTIC);

      characteristic?.startNotifications();

      characteristic?.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);

      setDevice(blDevice);
    } catch (err) {
      console.log('error on requestDevice', err);
    }
  }

  function handleDisconnect() {
    if (!device) {
      return
    }

    device?.gatt?.disconnect();
    setDevice(null);
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>Connected to: {device?.name} <span style={{ color: contact ? 'green' : 'red' }}>{'\u2b24'}</span></p>

        <button disabled={device !== null} onClick={handleConnect}>Request Bluetooth device</button>
        <button disabled={device === null} onClick={handleDisconnect}>Disconnect from Bluetooth device</button>
      </header>
      <ol>
        {data.map((item, idx) => <li key={idx}>{item}</li>)}
      </ol>
    </div>
  )
}


export default App;

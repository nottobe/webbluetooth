export const LITTLE_ENDIAN = true;
export const SERVICE_NAME = 'heart_rate';
export const CHARACTERISTIC = 'heart_rate_measurement';

export interface HeartRateSensorResult {
  heartRate?: number;
  contactDetected?: boolean;
  energyExpended?: number;
  rrIntervals?: number[];
}

// BIT0 Heart Rate Value Format UInt8 / UInt16
// BIT1 Sensor Contact Status
// BIT2 Sensor Contact Support
// BIT3 Energy Expended Status
// BIT4 RR-Interval

export function parseHeartSensorData(value: DataView): HeartRateSensorResult {
  const flags = value.getUint8(0);
  const rateAs16Bits = flags & 0b00000001;
  const contactDetected = flags & 0b00000010;
  const contactSensorPresent = flags & 0b00000100;
  const energyPresent = flags & 0b00001000;
  const rrIntervalPresent = flags & 0b00010000;

  let result : HeartRateSensorResult = {};
  let index = 1;

  if (rateAs16Bits) {
    result.heartRate = value.getUint16(index, LITTLE_ENDIAN);
    index += 2;
  } else {
    result.heartRate = value.getUint8(index);
    index += 1;
  }

  if (contactSensorPresent) {
    result.contactDetected = !!contactDetected;
  }

  if (energyPresent) {
    result.energyExpended = value.getUint16(index, LITTLE_ENDIAN);
    index += 2;
  }

  if (rrIntervalPresent) {
    const rrIntervals = [];
    for (; index + 1 < value.byteLength; index += 2) {
      rrIntervals.push(value.getUint16(index, LITTLE_ENDIAN));
    }
    result.rrIntervals = rrIntervals;
  }
  return result;
}

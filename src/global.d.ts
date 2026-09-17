declare module "*.css";

declare module "*.png" {
  const value: string;
  export default value;
}

interface weatherType {
  resolvedAddress: string | number;
  currentConditions: {
    temp: number;
    conditions: string;
    winddir: number;
    windspeed: number;
    humidity: number;
    uvindex: number;
    aqius: number;
  };
  alerts: alertsType[];
  conditions: string;
  days: dayType[];
  datetime: string;
}

interface dayType {
  hours: hourType[];
  tempmax: number;
  tempmin: number;
  feelslike: string;
}

interface hourType {
  datetime: "string";
  temp: number;
  winddir: number;
  windspeed: number;
  precip: number;
}

interface alertsType {
  event: string;
  headline: string;
  description: string;
}

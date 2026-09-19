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
  icon: string;
  days: dayType[];
  datetime: string;
}

interface dayType {
  description: string;
  windspeed: number;
  datetime: string;
  hours: hourType[];
  temp: number;
  tempmax: number;
  tempmin: number;
  feelslike: string;
  icon: string;
  precip: number;
  precipprob: number;
  preciptype: string[];
}

interface hourType {
  datetime: "string";
  temp: number;
  winddir: number;
  windspeed: number;
  precip: number;
  precipprob: number;
  preciptype: string[];
}

interface alertsType {
  event: string;
  headline: string;
  description: string;
}

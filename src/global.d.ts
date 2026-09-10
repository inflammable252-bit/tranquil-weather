declare module "*.css";

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
  days: daysType[];
  datetime: string;
}

interface daysType {
  tempmax: number;
  tempmin: number;
  feelslike: number;
}

interface alertsType {
  event: string;
  headline: string;
  description: string;
}

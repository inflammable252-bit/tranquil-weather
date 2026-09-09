export { domCurrent, Connection };

export interface weatherType {
  resolvedAddress: string | number;
  currentConditions: {
    temp: number;
    conditions: string;
  };
  conditions: string;
  days: daysType[];
}
export interface daysType {
  tempmax: number;
  tempmin: number;
}

const domCurrent = {
  temp: "current-temp",
  loc: "current-location",
  condition: "current-condition",
  high: "current-high",
  low: "current-low",
};

class Connection {
  location: string | number;
  constructor(location: string | number) {
    this.location = location;
  }
  public weatherData?: weatherType;
  #getKey() {
    return process.env.VC_KEY;
  }
  sayKey() {
    console.log("private key: ", this.#getKey());
  }
  // try() {
  //     try {
  //         if (process.env.nothing === undefined) throw new Error("Whoops")
  //         console.log(process.env.nothing)
  //     } catch (error) {
  //         console.log((error as Error).message, "Doesn't exist!")
  //     }
  // }
  protected async request() {
    try {
      const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${this.location}?unitGroup=us&include=days,hours,current,alerts,events&key=${this.#getKey()}&contentType=json`,
      );
      const data = await response.json();
      this.weatherData = data;
    } catch (error) {
      console.error("Unable to retrieve location.", error);
    }
  }
  setLoc(loc: string) {
    this.location = loc;
  }
  async getData(): Promise<weatherType | undefined> {
    await this.request();
    console.log("Data: ", this.weatherData);
    return this.weatherData;
  }
}

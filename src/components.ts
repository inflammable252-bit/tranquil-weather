export { domCurrent, domTodayInfo, Connection };

const domCurrent = {
  temp: "current-temp",
  loc: "current-location",
  condition: "current-condition",
  high: "current-high",
  low: "current-low",
};

const domTodayInfo = {
  feels: "feels-like",
  wind: "wind",
  humidity: "humidity",
  uv: "uv-index",
  air: "air-quality",
};

class Connection {
  location: string | number;
  unit: string;
  constructor(location: string | number) {
    this.location = location;
    this.unit = "us";
  }
  public weatherData?: weatherType | undefined;
  #getKey() {
    return process.env.VC_KEY;
  }
  sayKey() {
    console.log("private key: ", this.#getKey());
  }
  protected async request() {
    try {
      const response = await fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${this.location}?unitGroup=${this.unit}&iconSet=icons2&elements=add:aqius&include=days,hours,current,alerts,events&key=${this.#getKey()}&contentType=json`,
      );
      const data = await response.json();
      this.weatherData = data;
    } catch (error) {
      console.error("Unable to retrieve location.", error);
      this.weatherData = undefined;
    }
  }
  setLoc(loc: string | number) {
    this.location = loc;
  }
  setUnit(letter: string) {
    this.unit = letter === "C" ? "metric" : "us";
  }
  async getData(): Promise<weatherType | undefined> {
    await this.request();
    console.log("Data: ", this.weatherData);
    return this.weatherData;
  }
}

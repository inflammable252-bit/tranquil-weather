import "./style.css";
import "./reset.css";

import { domCurrent, domTodayInfo, Connection } from "./components.js";
import normalArrow from "./images/caret-up-bold-svgrepo-com.png";
import doubleArrow from "./images/caret-double-up-bold-svgrepo-com.png";
import rain from "./images/water-svgrepo-com.png";
import snow from "./images/snow-svgrepo-com.png";

let location: string | number;
location = "las vegas";
const mainConnection = new Connection(location);
let unitGlobal = "F";
let unitWind: string;
let retrievalTime: string | undefined;
let queryMS: number;

initialize();

async function initialize() {
  const start = performance.now();
  mainConnection.setLoc(location);
  mainConnection.setUnit(unitGlobal);
  unitWind = mainConnection.unit === "metric" ? "km/h" : "mph";
  const data = await mainConnection.getData();
  retrievalTime = data?.currentConditions.datetime;
  const end = performance.now();
  queryMS = end - start;
  initializeAllSections(data);
}

// Footer
function buildQueryText(): string {
  const text = `Retrieved: ${retrievalTime}, ${queryMS} ms.`;
  return text;
}
function updateFooter() {
  const queryInfo = document.getElementById(
    "updated-info",
  ) as HTMLParagraphElement;
  if (!queryInfo) return;
  queryInfo.textContent = buildQueryText();
}

// Search
const searchForm = document.getElementById("search-form") as HTMLFormElement;
const searchbar = document.getElementById("searchbar") as HTMLInputElement;
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  location = searchbar.value;
  initialize();
  searchbar.value = "";
});

// Sidebar
const sidebarUl = document.getElementById("location-list") as HTMLUListElement;
const sidebarButton = document.getElementById(
  "location-add",
) as HTMLButtonElement;

sidebarButton.addEventListener("click", () => {
  addLoc(location);
});

function addLoc(loc: string | number) {
  const item = document.createElement("li");
  item.classList.add("location-item");
  item.textContent = String(loc);
  if (sidebarUl.lastChild?.textContent == loc) return;
  sidebarUl.append(item);
}

// Unit
const convertTextDiv = document.getElementById("convert-wrapper");
convertTextDiv?.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (!target) return;
  const id = target.id;
  switch (id) {
    case "F":
      target.classList.add("convert-select");
      convertTextDiv.children[2]?.classList.remove("convert-select");
      unitGlobal = "F";
      break;
    case "C":
      console.log("celsius");
      target.classList.add("convert-select");
      convertTextDiv.children[0]?.classList.remove("convert-select");
      unitGlobal = "C";
      break;
  }
  initialize();
});

// Current
function updateEleText(id: string, value: string | number) {
  if (id === null) return;
  const element = document.getElementById(id);
  if (!element) {
    console.log(`No element found for ${id}.`);
    return;
  }
  element.textContent = String(value);
}
function updateCurrentSection(data: weatherType | undefined) {
  if (!data) return;

  updateEleText(
    domCurrent.temp,
    `${data.currentConditions.temp} ${unitGlobal}`,
  );

  const address: string[] = [];
  if (typeof data.resolvedAddress === "string") {
    const addressArr = data.resolvedAddress.split(" ");
    addressArr.forEach((word: string | number) => {
      if (typeof word == "string") {
        address.push(word[0]?.toUpperCase() + word.slice(1).toLowerCase());
      }
    });
    location = address.join(" ");
  }
  updateEleText(domCurrent.loc, location);

  updateEleText(
    domCurrent.high,
    `High: ${data.days[0]!.tempmax} ${unitGlobal}`,
  );
  updateEleText(domCurrent.low, `Low: ${data.days[0]!.tempmin} ${unitGlobal}`);

  updateEleText(domCurrent.condition, data.days[0]!.description);
}

// Alert
function updateAlertSection(data: weatherType | undefined) {
  const alertEle = document.getElementById("alert");
  data!.alerts.forEach((alert) => {
    const alertDrawer = document.createElement("details");
    alertDrawer.classList.add("alert-item");

    const alertHead = document.createElement("summary");
    alertHead.textContent = `${alert.event}: ${alert.headline}`;

    const alertBody = document.createElement("p");
    alertBody.textContent = alert.description;

    alertDrawer.append(alertHead, alertBody);
    alertEle?.append(alertDrawer);
  });
}

function updateTodaySection(data: weatherType | undefined) {
  if (!data) return;

  // Feels like
  const feelsCard = document.getElementById(domTodayInfo.feels);
  const feelsText = document.createElement("p");
  feelsText.textContent = String(data.days[0]!.feelslike + unitGlobal);
  feelsCard!.replaceChildren("Feels like", feelsText);

  // Wind
  const windCard = document.getElementById(domTodayInfo.wind);
  const windDirText = document.createElement("p");
  const windImg = document.createElement("img");
  const windValue = data.currentConditions.winddir;
  windImg.style.transform = String(`rotate(${windValue}deg)`);
  windDirText.textContent = String(getWindDir(windValue));
  windCard!.append(windDirText);
  const windSpeedText = document.createElement("p");
  const windSpeedValue = data.currentConditions.windspeed;
  windSpeedText.textContent = `${windSpeedValue} ${unitWind}`;
  if (mainConnection.unit === "us")
    windImg.src = windSpeedValue <= 25 ? normalArrow : doubleArrow;
  if (mainConnection.unit === "metric")
    windImg.src = windSpeedValue <= 39 ? normalArrow : doubleArrow;
  windCard!.replaceChildren("Wind", windDirText, windImg, windSpeedText);

  // Humidity
  const humidityCard = document.getElementById(domTodayInfo.humidity);
  const humidityText = document.createElement("p");
  humidityText.textContent = String(data.currentConditions.humidity + "%");
  humidityCard!.replaceChildren("Humidity", humidityText);

  // UV
  const uvCard = document.getElementById(domTodayInfo.uv);
  const uvText = document.createElement("p");
  uvText.textContent = String(data.currentConditions.uvindex);
  uvCard!.replaceChildren("UV Index", uvText);

  // AQI
  const airCard = document.getElementById(domTodayInfo.air);
  const airText = document.createElement("p");
  airText.textContent = String(data.currentConditions.aqius);
  airCard!.replaceChildren("Air Quality (AQI)", airText);
}

function getWindDir(angle: number) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const windDir = directions[Math.round(angle / 45) % 8];
  return windDir;
}

// Hour
function updateHourSection(data: weatherType) {
  if (!data) return;
  const hourWrapper = document.getElementById("hourly-wrapper");
  const hoursArr = getNext12Hours(data.days);
  console.log("hours array: ", hoursArr);
  createHourCards(hoursArr, hourWrapper);
}

function getNext12Hours(days: dayType[]) {
  if (!days[0] || !days[1]) {
    console.log("No days found!");
    return;
  }
  const currentDay = days[0];
  const nextDay = days[1];

  const now = new Date();
  const hourStartIndex = now.getHours() + 1;

  const next12Hours = [];

  for (let i = 0; i < 12; i++) {
    let day = currentDay;
    let hour = day.hours[hourStartIndex + i];
    // console.log(hour);
    if (hour === undefined) {
      day = nextDay;
      for (let j = 0; j < 12 - i; j++) {
        hour = day.hours[j];
        next12Hours.push(hour);
      }
      break;
    }
    next12Hours.push(hour);
  }
  return next12Hours;
}

function createHourCards(
  hours: (hourType | undefined)[] | undefined,
  wrapper: HTMLElement | null,
) {
  if (!hours || !wrapper) return;
  // console.log("Hours: ", hours);
  wrapper.replaceChildren("");
  hours.forEach((hour) => {
    const card = document.createElement("article");
    card.classList.add("card", "hour");
    const hourText = document.createElement("p");
    const hourTextValue = hour!.datetime;
    hourText.textContent = getHour(hourTextValue);

    const hourTemp = document.createElement("p");
    hourTemp.classList.add("hour-temp");
    hourTemp.textContent = `${hour!.temp} ${unitGlobal}`;

    const hourWindDiv = document.createElement("div");
    hourWindDiv.classList.add("hour-wind-wrapper");
    const hourWind = document.createElement("p");
    hourWind.classList.add("hour-wind");
    hourWind.textContent = `${hour!.windspeed} ${unitWind}`;
    const hourWindArrow = document.createElement("div");
    hourWindArrow.classList.add("hour-arrow");
    hourWindDiv.append(hourWind, hourWindArrow);
    hourWindArrow.style.transform = String(`rotate(${hour!.winddir}deg)`);

    const hourPrecipWrapper = document.createElement("div");
    hourPrecipWrapper.classList.add("hour-precip-wrapper");

    insertPrecip("hour", hour, hourPrecipWrapper);

    card.append(hourText, hourTemp, hourWindDiv, hourPrecipWrapper);
    wrapper.append(card);
  });
}

// Forecast
function updateForecast(data: weatherType | undefined) {
  if (!data) return;
  const forecastWrapper = document.getElementById("forecast-wrapper");
  const daysArr = getWeek(data.days);
  console.log("days array: ", daysArr);
  createForecastCards(daysArr, forecastWrapper);
}

function getWeek(days: dayType[]) {
  const next7Days = [];
  for (let i = 0; i < 7; i++) {
    next7Days.push(days[i]);
  }
  return next7Days;
}

function createForecastCards(
  days: (dayType | undefined)[],
  wrapper: HTMLElement | null,
) {
  wrapper?.replaceChildren("");
  if (!days || !wrapper) return;
  days.forEach((day) => {
    if (!day) return;
    const card = document.createElement("article");
    card.classList.add("card", "forecast");

    const date = document.createElement("p");
    date.classList.add("forecast-date");
    const dateMonth = parseInt(day.datetime.slice(5, 7));
    const dateDay = day.datetime.slice(8);
    date.textContent = `${dateMonth}/${dateDay}`;

    const forecastTemp = document.createElement("p");
    forecastTemp.classList.add("forecast-temp");
    forecastTemp.textContent = `${day.temp} ${unitGlobal}`;

    const forecastWind = document.createElement("p");
    forecastWind.classList.add("forecast-wind");
    forecastWind.textContent = `${day.windspeed} ${unitWind}`;

    const forecastPrecipWrapper = document.createElement("div");
    forecastPrecipWrapper.classList.add("forecast-precip-wrapper");

    insertPrecip("forecast", day, forecastPrecipWrapper);

    card.append(date, forecastTemp, forecastPrecipWrapper);
    wrapper.append(card);
  });
}

function insertPrecip(
  classPrefix: string,
  apiObj: dayType | hourType | undefined,
  wrapper: HTMLElement | null,
) {
  if (!apiObj || !wrapper) return;
  const precip = document.createElement("p");
  precip.classList.add(`${classPrefix}-precip`);
  precip.textContent = String(apiObj.precipprob) + "% ";
  wrapper.append(precip);

  const precipArr = apiObj.preciptype;
  if (!precipArr) return;
  precipArr.forEach((type) => {
    const icon = document.createElement("img");
    icon.src = type === "rain" || type === "freezingrain" ? rain : snow;
    icon.classList.add("forecast-precip-icon", "precip-icon");
    wrapper.append(icon);
  });
}

function getHour(timeString: string) {
  let hourString = parseInt(timeString.slice(0, 2));
  let hourAMorPM = "PM";
  if (hourString < 12) hourAMorPM = "AM";
  if (hourString === 0) hourString = 12;
  if (hourString >= 13) hourString -= 12;
  return `${hourString} ${hourAMorPM}`;
}

// Init
function initializeAllSections(data: weatherType | undefined) {
  if (!data) return;
  updateCurrentSection(data);
  updateTodaySection(data);
  updateAlertSection(data);
  updateHourSection(data);
  updateForecast(data);
  updateFooter();
}

// Object.entries(domCurrent).forEach((item) => {
//   console.log(item);
// });

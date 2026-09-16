import "./style.css";
import "./reset.css";

import { domCurrent, domTodayInfo, Connection } from "./components.js";
import normalArrow from "./images/caret-up-bold-svgrepo-com.png";
import doubleArrow from "./images/caret-double-up-bold-svgrepo-com.png";

const mainConnection = new Connection("las vegas");

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

  updateEleText(domCurrent.temp, data.currentConditions.temp);

  const address: string[] = [];
  if (typeof data.resolvedAddress === "string") {
    const addressArr = data.resolvedAddress.split(" ");
    addressArr.forEach((word: string | number) => {
      if (typeof word == "string") {
        address.push(word[0]?.toUpperCase() + word.slice(1).toLowerCase());
      }
    });
  }
  updateEleText(domCurrent.loc, address.join(" "));

  updateEleText(domCurrent.condition, data.currentConditions.conditions);
  updateEleText(domCurrent.high, `High: ${data.days[0]!.tempmax}`);
  updateEleText(domCurrent.low, `Low: ${data.days[0]!.tempmin}`);
}

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
  feelsText.textContent = String(data.days[0]!.feelslike + "F");
  feelsCard!.append(feelsText);

  // Wind
  const windCard = document.getElementById(domTodayInfo.wind);
  const windDirText = document.createElement("p");
  const windImg = document.createElement("img");
  const windValue = data.currentConditions.winddir;
  windImg.style.transform = String(`rotate(${windValue}deg)`);
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const windDir = directions[Math.round(windValue / 45) % 8];
  windDirText.textContent = String(windDir);
  windCard!.append(windDirText);
  const windSpeedText = document.createElement("p");
  const windSpeedValue = data.currentConditions.windspeed;
  windSpeedText.textContent = String(windSpeedValue + " mph");
  windImg.src = windSpeedValue <= 25 ? normalArrow : doubleArrow;
  windCard!.append(windDirText, windImg, windSpeedText);

  // Humidity
  const humidityCard = document.getElementById(domTodayInfo.humidity);
  const humidityText = document.createElement("p");
  humidityText.textContent = String(data.currentConditions.humidity + "%");
  humidityCard!.append(humidityText);

  // UV
  const uvCard = document.getElementById(domTodayInfo.uv);
  const uvText = document.createElement("p");
  uvText.textContent = String(data.currentConditions.uvindex);
  uvCard!.append(uvText);

  // AQI
  const airCard = document.getElementById(domTodayInfo.air);
  const airText = document.createElement("p");
  airText.textContent = String(data.currentConditions.aqius);
  airCard!.append(airText);
}

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
  console.log(next12Hours);
  return next12Hours;
}

function createHourCards(
  days: (hourType | undefined)[] | undefined,
  wrapper: HTMLElement | null,
) {
  if (!days || !wrapper) return;
  // console.log("Hours: ", hours);
  days.forEach((day) => {
    const card = document.createElement("article");
    card.classList.add("card", "hour");
    const hourText = document.createElement("p");
    let hourTextValue = parseInt(day!.datetime.slice(0, 2));
    let hourAMorPM = "PM";
    if (hourTextValue < 12) hourAMorPM = "AM";
    if (hourTextValue === 0) hourTextValue = 12;
    if (hourTextValue >= 13) hourTextValue -= 12;
    hourText.textContent = `${hourTextValue} ${hourAMorPM}`;
    const hourTemp = document.createElement("p");
    hourTemp.textContent = String(day!.temp);
    card.append(hourText, hourTemp);
    wrapper.append(card);
    // console.log(hour.day.datetime);
  });
}

function initializeAllSections(data: weatherType | undefined) {
  if (!data) return;
  updateCurrentSection(data);
  updateTodaySection(data);
  updateAlertSection(data);
  updateHourSection(data);
}
initializeAllSections(await mainConnection.getData());

// Object.entries(domCurrent).forEach((item) => {
//   console.log(item);
// });

import "./style.css";
import "./reset.css";

import { domCurrent, domTodayInfo, Connection } from "./components.js";
import normalArrow from "./images/caret-up-bold-svgrepo-com.png";
import doubleArrow from "./images/caret-double-up-bold-svgrepo-com.png";
import precipRain from "./images/drop-svgrepo-com.svg";
import precipSnow from "./images/snow-svgrepo-com.svg";
import {
  snow,
  thunder,
  rain,
  fog,
  wind,
  cloudy,
  partlyCloudyDay,
  partlyCloudyNight,
  day,
  night,
} from "./icon-imports.js";

let location: string;
location = "waikiki";
let prevLoc: string;
const mainConnection = new Connection(location);
let unitGlobal = "F";
let unitWind: string;
let retrievalTime: string | undefined;
let queryMS: number;
let currentMode = "night";
let savedLocations: string[];

async function initialize() {
  setProgress("reset");
  pulseBar("reset");
  const start = performance.now();
  mainConnection.setLoc(location);
  mainConnection.setUnit(unitGlobal);
  unitWind = mainConnection.unit === "metric" ? "km/h" : "mph";
  try {
    setProgress("set", 10);
    const data = await mainConnection.getData();
    if (!data) {
      location = prevLoc;
      throw new Error("Location not found.");
    }
    console.log("Initialized location: ", location);
    retrievalTime = data?.currentConditions.datetime;
    const end = performance.now();
    queryMS = end - start;
    setProgress("set", 50);
    initializeAllSections(data);
    pulseBar("success");
    prevLoc = location;
    return true;
  } catch (error) {
    console.log(error);
    displayFail();
    return false;
  }
}

async function loadLocations() {
  try {
    const retrievedLoc = localStorage.getItem("savedLocations");
    if (retrievedLoc) {
      savedLocations = JSON.parse(retrievedLoc);
      console.log(retrievedLoc);
    } else {
      throw new Error("No saved data.");
    }
  } catch (error) {
    savedLocations = [
      "Los Angeles, CA, United States",
      "Anchorage, AK, United States",
      "Des Moines, IA, United States",
      "Waikiki, Honolulu, HI, United States",
    ];
    if (error instanceof Error) console.log(error.message);
  } finally {
    updateSidebar(savedLocations);
  }
}

// Footer
function buildQueryText(): string {
  const roundedQuery = parseFloat(queryMS.toFixed(3));
  const text = `Data: ${retrievalTime}, Retrieved: ${roundedQuery} ms`;
  return text;
}
function updateFooter() {
  const queryInfo = document.getElementById(
    "updated-info",
  ) as HTMLParagraphElement;
  if (!queryInfo) return;
  queryInfo.textContent = buildQueryText();
}
// Mode
const modeSelect = document.getElementById("mode-select") as HTMLSelectElement;
modeSelect?.addEventListener("change", () => {
  currentMode = modeSelect.value;
  changeMode(currentMode);
});

function changeMode(mode: string) {
  const root = document.documentElement;
  root.style.setProperty("--current-bg", "var(--bg-" + mode);
  root.style.setProperty("--current-bg-color", "var(--bg-" + mode + "-color)");
  root.style.setProperty("--current-ui-bg", "var(--ui-bg-" + mode);
  root.style.setProperty(
    "--current-footer-color",
    "var(--footer-color-" + mode,
  );
  root.style.setProperty(
    "--current-logo-gradient",
    "var(--logo-gradient-" + mode,
  );
}

function setToggle(mode: string) {
  let selectIndex = 0;
  switch (mode) {
    case "day":
      selectIndex = 0;
      break;
    case "night":
      selectIndex = 1;
      break;
  }
  modeSelect[selectIndex]!.setAttribute("selected", "");
}

setToggle(currentMode);

// Search
const searchForm = document.getElementById("search-form") as HTMLFormElement;
const searchbar = document.getElementById("searchbar") as HTMLInputElement;
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  location = searchbar.value;
  const success = await initialize();
  if (!success) {
    displayFail();
  } else {
    searchCheck(location);
    searchbar.value = "";
  }
});

function displayFail() {
  pulseBar("fail");
  setProgress("set", 1);
  animateMsg("No location found!");
  setTimeout(() => {
    setProgress("set", 100);
  }, 1500);
}

function searchCheck(loc: string) {
  hideMsg();
  const checkForTwoOrMoreSpaces = (loc: string) => {
    const count = loc.split(" ").length;
    return count >= 3;
  };
  if (!checkForTwoOrMoreSpaces(loc) && !loc.includes(",")) {
    animateMsg(
      "For more accurate results, enter a city and a state, province, or region.",
    );
  } else {
    hideMsg();
  }
}

// localStorage
function saveLoc(loc: string) {
  savedLocations.push(loc);
  const jsonLoc = JSON.stringify(savedLocations);
  localStorage.setItem("savedLocations", jsonLoc);
  console.log("Saving location: ", loc);
  console.log("Current locations: " + savedLocations);
}
function updateLocStorage() {
  const updatedStorage = JSON.stringify(savedLocations);
  localStorage.setItem("savedLocations", updatedStorage);
  console.log("Saved locations updated!" + savedLocations);
}

function addLoc(loc: string) {
  const itemText = document.createElement("p");
  itemText.textContent = String(loc);
  return itemText;
}

// Sidebar
const sidebarIcon = document.getElementById("sidebar-button");
const sidebar = document.getElementById("location-sidebar");
sidebarIcon?.addEventListener("click", (e) => {
  e.preventDefault();
  sidebar?.classList.toggle("show");
  sidebar?.animate(
    [{ transform: "translateX(-100%)" }, { transform: "translateX(0)" }],
    150,
  );
});

const sidebarHide = document.getElementById("hide-sidebar");
sidebarHide?.addEventListener("click", (e) => {
  e.preventDefault();
  setTimeout(() => {
    sidebar?.classList.remove("show");
  }, 150);
  sidebar?.animate({ transform: "translateX(-100%)" }, 150);
});

const sidebarUl = document.getElementById("location-list") as HTMLUListElement;
const sidebarAddButton = document.getElementById(
  "location-add",
) as HTMLButtonElement;

sidebarAddButton.addEventListener("click", () => {
  // if (sidebarUl.lastChild?.firstChild?.textContent === location) return;
  if (savedLocations.includes(location)) {
    console.log("Location already added.");
    return;
  }
  addItem(location);
  saveLoc(location);
});

function updateSidebar(arr: string[]) {
  arr.forEach((item) => {
    addItem(item);
  });
}

function addItem(loc: string) {
  const item = document.createElement("li");
  item.classList.add("location-item");

  item.append(addLoc(loc));
  item.append(addDelete());
  sidebarUl.append(item);

  item.addEventListener("click", (e: Event) => {
    const target = e.target as HTMLElement;
    if (target.className == "delete-item") return;
    const p = target.firstChild as HTMLParagraphElement;
    const targetLocation = p.textContent;
    if (!target || toUpper(targetLocation) == toUpper(location)) return;
    console.log("Going to " + targetLocation);
    goToLoc(targetLocation);
  });
}

function addDelete() {
  const del = document.createElement("button");
  del.textContent = "x";
  del.classList.add("delete-item");

  del.addEventListener("click", (e) => deleteLoc(e));

  return del;
}

function goToLoc(tarLocation: string) {
  location = tarLocation;
  initialize();
}

function deleteLoc(event: Event) {
  const target = event.target as HTMLElement;
  const li = target.parentElement;
  const ul = li?.parentElement;
  if (!li || !ul) return;
  const index = [...ul.children].indexOf(li);
  console.log(`Removed item ${index}: ${savedLocations[index]}.`);
  li.remove();
  savedLocations.splice(index, 1);
  updateLocStorage();
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

function formLocName(address: string) {
  let locationName;
  if (address.includes(",")) {
    locationName = address;
  } else {
    const newAddress: (string | undefined)[] = [];
    const addressArray = address.split(" ");
    addressArray.forEach((word: string | undefined) => {
      newAddress.push(toUpper(word));
    });
    locationName = newAddress.join(" ");
  }
  console.log("Location resolved to: ", locationName);
  return locationName;
}

function updateCurrentSection(data: weatherType | undefined) {
  if (!data) return;

  updateEleText(
    domCurrent.temp,
    `${data.currentConditions.temp} ${unitGlobal}`,
  );

  const dataAddress = data.resolvedAddress;
  location = formLocName(dataAddress);
  updateEleText(domCurrent.loc, location);

  updateEleText(
    domCurrent.high,
    `High: ${data.days[0]!.tempmax} ${unitGlobal}`,
  );
  updateEleText(domCurrent.low, `Low: ${data.days[0]!.tempmin} ${unitGlobal}`);

  updateEleText(domCurrent.condition, data.days[0]!.description);
}

function toUpper(word: string | undefined) {
  if (typeof word !== "string") return;
  const fixedWord = word[0]!.toUpperCase() + word.slice(1).toLowerCase();
  return fixedWord;
}

// Alert
function updateAlertSection(data: weatherType | undefined) {
  const alertEle = document.getElementById("alert");

  alertEle?.replaceChildren("");
  if (data!.alerts.length === 0) return;

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

function createHead(text: string) {
  const head = document.createElement("p");
  head.textContent = text;
  return head;
}

function updateTodaySection(data: weatherType | undefined) {
  if (!data) return;

  // Feels like
  const feelsCard = document.getElementById(domTodayInfo.feels);
  const feelsText = document.createElement("p");
  feelsText.textContent = String(data.days[0]!.feelslike + unitGlobal);
  feelsCard!.replaceChildren(createHead("Feels like"), feelsText);

  // Wind
  const windCard = document.getElementById(domTodayInfo.wind);
  const windDirText = document.createElement("p");
  const windImg = document.createElement("img");
  const windValue = data.currentConditions.winddir;
  windImg.style.transform = String(`rotate(${windValue}deg)`);
  windDirText.textContent = String(getWindDir(windValue));
  const windSpeedText = document.createElement("p");
  const windSpeedValue = data.currentConditions.windspeed;
  windSpeedText.textContent = `${windSpeedValue} ${unitWind}`;
  if (mainConnection.unit === "us")
    windImg.src = windSpeedValue <= 25 ? normalArrow : doubleArrow;
  if (mainConnection.unit === "metric")
    windImg.src = windSpeedValue <= 39 ? normalArrow : doubleArrow;
  windCard!.replaceChildren(
    createHead("Wind"),
    windDirText,
    windImg,
    windSpeedText,
  );

  // Humidity
  const humidityCard = document.getElementById(domTodayInfo.humidity);
  const humidityText = document.createElement("p");
  humidityText.textContent = String(data.currentConditions.humidity + "%");
  humidityCard!.replaceChildren(createHead("Humidity"), humidityText);

  // UV
  const uvCard = document.getElementById(domTodayInfo.uv);
  const uvText = document.createElement("p");
  uvText.textContent = String(data.currentConditions.uvindex);
  uvCard!.replaceChildren(createHead("UV Index"), uvText);

  // AQI
  const airCard = document.getElementById(domTodayInfo.air);
  const airText = document.createElement("p");
  airText.textContent = String(data.currentConditions.aqius);
  const aqiText = document.createElement("p");
  aqiText.textContent = "(AQI)";
  airCard!.replaceChildren(createHead("Air Quality"), aqiText, airText);
}

function getWindDir(angle: number) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const windDir = directions[Math.round(angle / 45) % 8];
  return windDir;
}

// Hour
const hourWrapper = document.getElementById("hourly-wrapper");
addScroll(hourWrapper);

function updateHourSection(data: weatherType) {
  if (!data) return;
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

    const icon = document.createElement("img");
    insertIcon(hour, icon);

    // Hourly temp
    const hourTemp = document.createElement("p");
    hourTemp.classList.add("hour-temp");
    hourTemp.textContent = `${hour!.temp} ${unitGlobal}`;

    // Hourly wind
    const hourWindDiv = document.createElement("div");
    hourWindDiv.classList.add("hour-wind-wrapper");
    const hourWind = document.createElement("p");
    hourWind.classList.add("hour-wind");
    hourWind.textContent = `${hour!.windspeed} ${unitWind}`;
    const hourWindArrow = document.createElement("div");
    hourWindArrow.classList.add("hour-arrow");
    hourWindDiv.append(hourWind, hourWindArrow);
    hourWindArrow.style.transform = String(`rotate(${hour!.winddir}deg)`);

    // Hourly precipitation
    const hourPrecipWrapper = document.createElement("div");
    hourPrecipWrapper.classList.add("hour-precip-wrapper");

    insertPrecip("hour", hour, hourPrecipWrapper);

    // Additional Info
    const conditions = getConditions("hour", hour);

    // Build
    card.append(
      hourText,
      icon,
      hourTemp,
      conditions,
      hourWindDiv,
      hourPrecipWrapper,
    );
    wrapper.append(card);
  });
}

function getConditions(
  classPrefix: string,
  apiObj: hourType | dayType | undefined,
): HTMLElement {
  const p = document.createElement("p");
  p.classList.add(classPrefix + "-condition");
  if (apiObj) p.textContent = apiObj.conditions;
  return p;
}

// Forecast
const forecastWrapper = document.getElementById("forecast-wrapper");
addScroll(forecastWrapper);

function updateForecast(data: weatherType | undefined) {
  if (!data) return;
  const daysArr = getWeek(data.days);
  console.log("days array: ", daysArr);
  createForecastCards(daysArr, forecastWrapper);
}

function getWeek(days: dayType[]) {
  const nex14Days = [];
  for (let i = 0; i < 14; i++) {
    nex14Days.push(days[i]);
  }
  return nex14Days;
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

    // Date
    const date = document.createElement("p");
    date.classList.add("forecast-date");
    const dateMonth = parseInt(day.datetime.slice(5, 7));
    const dateDay = day.datetime.slice(8);
    date.textContent = `${dateMonth}/${dateDay}`;

    // Icon
    const icon = document.createElement("img");
    insertIcon(day, icon);

    // Temp
    const forecastTemp = document.createElement("p");
    forecastTemp.classList.add("forecast-temp");
    forecastTemp.textContent = `${day.temp} ${unitGlobal}`;

    // Condition
    const conditions = getConditions("forecast", day);

    // Wind
    const forecastWind = document.createElement("p");
    forecastWind.classList.add("forecast-wind");
    forecastWind.textContent = `${day.windspeed} ${unitWind}`;

    // Precip
    const forecastPrecipWrapper = document.createElement("div");
    forecastPrecipWrapper.classList.add("forecast-precip-wrapper");

    insertPrecip("forecast", day, forecastPrecipWrapper);

    card.append(date, icon, forecastTemp, conditions, forecastPrecipWrapper);
    wrapper.append(card);
  });
}

// note: builder fn for expanded info section on click

function insertIcon(
  dayOrHour: (dayType | hourType) | undefined,
  ele: HTMLImageElement,
) {
  if (!dayOrHour) return;
  const iconData = dayOrHour.icon;
  ele.src = getIcon(iconData)!;
  ele.title = iconData;
  ele.classList.add("weather-icons");
}

function getIcon(condition: string) {
  let icon;
  switch (condition) {
    case "snow":
    case "snow-showers-day":
    case "snow-showers-night":
      icon = snow;
      break;
    case "thunder-rain":
    case "thunder-showers-day":
    case "thunder-showers-night":
      icon = thunder;
      break;
    case "rain":
    case "showers-day":
    case "showers-night":
      icon = rain;
      break;
    case "fog":
      icon = fog;
      break;
    case "wind":
      icon = wind;
      break;
    case "cloudy":
      icon = cloudy;
      break;
    case "partly-cloudy-day":
      icon = partlyCloudyDay;
      break;
    case "partly-cloudy-night":
      icon = partlyCloudyNight;
      break;
    case "clear-day":
      icon = day;
      break;
    case "clear-night":
      icon = night;
      break;
  }
  return icon;
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

  const snowTypes = ["snow", "freezingrain", "sleet"];
  const precipArr = apiObj.preciptype;
  const cardPrecipIcons = [precipRain];

  if (precipArr?.some((item) => snowTypes.includes(item))) {
    cardPrecipIcons.unshift(precipSnow);
  }

  cardPrecipIcons.forEach((item) => {
    const img = document.createElement("img");
    img.src = item;
    img.classList.add("precip-icon");
    wrapper.prepend(img);
  });
  if (!apiObj.precipprob) wrapper.classList.add("no-precip");
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
function addScroll(container: HTMLElement | null) {
  if (container == null) return;
  container.addEventListener("wheel", (e) => {
    e.preventDefault();
    container.scrollLeft += e.deltaY;
  });
}
function initializeAllSections(data: weatherType | undefined) {
  if (!data) return;
  updateCurrentSection(data);
  updateTodaySection(data);
  updateAlertSection(data);
  updateHourSection(data);
  updateForecast(data);
  updateFooter();
  setProgress("set", 100);
}

const progressBar = document.getElementById("load-bar-prog") as HTMLDivElement;
const progressBarBg = document.getElementById("load-bar") as HTMLDivElement;

function setProgress(
  action: "increase" | "reset" | "set",
  amt?: number | string,
) {
  if (!progressBar) return;
  switch (action) {
    case "increase":
      if (!amt) return;
      progressBar.style.width += amt + "%";
      break;
    case "reset":
      progressBar.style.width = "0px";
      break;
    case "set":
      if (!amt) return;
      progressBar.style.width = amt + "%";
      break;
  }
}
function pulseBar(status: "reset" | "success" | "fail") {
  switch (status) {
    case "reset":
      progressBar.style.animation = "none";
      progressBarBg.style.animation = "none";
      break;
    case "success":
      progressBar.style.animation = "0.7s ease-in-out 2 pulse-white";
      break;
    case "fail":
      progressBarBg.style.animation = "0.5s ease-in-out 2.5 pulse-red";
      break;
  }
}

// Other
const searchbarMsg = document.getElementById(
  "searchbar-msg",
) as HTMLParagraphElement;
function animateMsg(msg: string) {
  searchbarMsg!.textContent = msg;
  searchbarMsg!.animate(
    [
      {
        visibility: "visible",
        opacity: 0,
      },
      {
        opacity: 1,
        offset: 0.05,
      },
      {
        opacity: 0,
        visibility: "hidden",
      },
    ],
    9000,
  );
}
function hideMsg() {
  searchbarMsg!.style.visibility = "hidden";
  searchbarMsg!.style.opacity = "0";
}

initialize();
loadLocations();
// Object.entries(domCurrent).forEach((item) => {
//   console.log(item);
// });

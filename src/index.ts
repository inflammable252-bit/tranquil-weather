import "./style.css";
import "./reset.css";

import { domCurrent, domTodayInfo, Connection } from "./components.js";
import normalArrow from "./images/caret-up-bold-svgrepo-com.png";

const mainConnection = new Connection("sAn diEgo");

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

  const feelsCard = document.getElementById(domTodayInfo.feels);
  const feelsText = document.createElement("p");
  feelsText.textContent = String(data.days[0]!.feelslike + "F");
  feelsCard!.append(feelsText);

  const windCard = document.getElementById(domTodayInfo.wind);
  const windDirText = document.createElement("p");
  const windImg = document.createElement("img");
  windImg.src = normalArrow;
  const windValue = data.currentConditions.winddir;
  windImg.style.transform = String(`rotate(${windValue}deg)`);

  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const windDir = directions[Math.round(windValue / 45) % 8];
  windDirText.textContent = String(windDir);
  windCard!.append(windDirText);
  const windSpeedText = document.createElement("p");
  windSpeedText.textContent = String(data.currentConditions.windspeed + " mph");
  windCard!.append(windDirText, windImg, windSpeedText);
  console.log("wind: ", {
    deg: windValue,
    direction: windDir,
    speed: windSpeedText.textContent,
  });

  const humidityCard = document.getElementById(domTodayInfo.humidity);
  const humidityText = document.createElement("p");
  humidityText.textContent = String(data.currentConditions.humidity + "%");
  humidityCard!.append(humidityText);

  const uvCard = document.getElementById(domTodayInfo.uv);
  const uvText = document.createElement("p");
  uvText.textContent = String(data.currentConditions.uvindex);
  uvCard!.append(uvText);

  const airCard = document.getElementById(domTodayInfo.air);
  const airText = document.createElement("p");
  airText.textContent = String(data.currentConditions.aqius);
  airCard!.append(airText);
}

function initializeAllSections(data: weatherType | undefined) {
  if (!data) return;
  updateCurrentSection(data);
  updateTodaySection(data);
  updateAlertSection(data);
}
initializeAllSections(await mainConnection.getData());

// Object.entries(domCurrent).forEach((item) => {
//   console.log(item);
// });

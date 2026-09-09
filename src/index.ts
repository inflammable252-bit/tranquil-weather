import "./style.css";
import "./reset.css";

import { domCurrent, Connection } from "./components.js";
import type { weatherType } from "./components.js";

function updateEleText(id: string, value: string | number) {
  if (id === null) return;
  const element = document.getElementById(id);
  if (!element) {
    console.log(`No element found for ${id}.`);
    return;
  }
  element.textContent = String(value);
  console.log(element);
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

const mainConnection = new Connection("sAn diEgo");
updateCurrentSection(await mainConnection.getData());
// Object.entries(domCurrent).forEach((item) => {
//   console.log(item);
// });

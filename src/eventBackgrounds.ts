const webpModules = import.meta.glob("./assets/event-backgrounds/*.webp", { eager:true, import:"default", query:"?url" }) as Record<string,string>;
const svgModules = import.meta.glob("./assets/event-backgrounds/*.svg", { eager:true, import:"default", query:"?url" }) as Record<string,string>;
const modules: Readonly<Record<string,string>> = { ...webpModules, ...svgModules };

const files: Readonly<Record<string,string>> = {
  "VB": "01-volleyball.webp",
  "FB": "02-football.webp",
  "BB": "03-basketball.webp",
  "TN": "04-tennis.webp",
  "GY": "05-gym.webp",
  "RN": "06-running.webp",
  "CY": "07-cycling.webp",
  "BD": "08-badminton.webp",
  "TT": "09-table-tennis.webp",
  "YG": "10-yoga.webp",
  "CF": "11-coffee.svg",
  "MV": "12-cinema.svg",
  "BW": "13-21-sprite.svg#bg13",
  "BG": "13-21-sprite.svg#bg14",
  "CH": "13-21-sprite.svg#bg15",
  "KR": "13-21-sprite.svg#bg16",
  "SK": "13-21-sprite.svg#bg17",
  "BR": "13-21-sprite.svg#bg18",
  "QZ": "13-21-sprite.svg#bg19",
  "WN": "13-21-sprite.svg#bg20",
  "CN": "13-21-sprite.svg#bg21",
  "FS": "22-festival.webp",
  "DN": "23-dancing.webp",
  "HK": "24-hiking.webp",
  "WK": "25-park-walk.webp",
  "SW": "26-swimming.webp",
  "PC": "27-picnic.webp",
  "CP": "28-camping.webp",
  "FI": "29-fishing.webp",
  "KY": "30-kayaking.webp",
  "CT": "31-city-walk.webp",
  "DR": "32-dinner-v2.png",
  "LX": "33-language-exchange.webp",
  "CW": "34-coworking.webp",
  "MT": "35-new-connections.webp",
  "AR": "36-drawing.webp",
  "PH": "37-photo-walk.webp",
  "CR": "38-ceramics.webp",
  "JM": "39-music-jam.webp",
  "WS": "40-workshop.webp"
};

export const getEventBackground = (code:string) => {
  const file = files[code];
  if (!file) return null;
  const [asset, fragment] = file.split("#");
  const url = modules[`./assets/event-backgrounds/${asset}`];
  return url ? `${url}${fragment ? `#${fragment}` : ""}` : null;
};

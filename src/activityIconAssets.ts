const emojiFiles: Readonly<Record<string, string>> = {
  "🏐": "01-volleyball.webp",
  "⚽": "02-football.webp",
  "🏀": "03-basketball.webp",
  "🎾": "04-tennis.webp",
  "🏋️": "05-gym.webp",
  "🏋": "05-gym.webp",
  "🏃": "06-running.webp",
  "🚴": "07-cycling.webp",
  "🏸": "08-badminton.webp",
  "🏓": "09-table-tennis.webp",
  "🧘": "10-yoga.webp",
  "☕": "11-coffee.webp",
  "🎬": "12-cinema.webp",
  "🎳": "13-bowling.webp",
  "🎲": "14-board-games.webp",
  "♟️": "15-chess.webp",
  "♟": "15-chess.webp",
  "🎤": "16-karaoke.webp",
  "🛼": "17-roller-skating.webp",
  "🍺": "18-beer.webp",
  "🧠": "19-pub-quiz.webp",
  "🍷": "20-wine-evening.webp",
  "🎵": "21-concert.webp",
  "🎪": "22-festival.webp",
  "💃": "23-dancing.webp",
  "🥾": "24-hiking.webp",
  "🚶": "25-park-walk.webp",
  "🏊": "26-swimming.webp",
  "🧺": "27-picnic.webp",
  "⛺": "28-camping.webp",
  "🎣": "29-fishing.webp",
  "🛶": "30-kayaking.webp",
  "🍽️": "32-dinner.webp",
  "🍽": "32-dinner.webp",
  "🗣️": "33-language-exchange.webp",
  "🗣": "33-language-exchange.webp",
  "💻": "34-coworking.webp",
  "🤝": "35-new-connections.webp",
  "🎨": "36-drawing.webp",
  "📸": "37-photo-walk.webp",
  "🏺": "38-ceramics.webp",
  "🎸": "39-music-jam.webp",
  "🧶": "40-workshop.webp",
};

const categoryFiles: Readonly<Record<string, string>> = {
  sport: "i01-sport.webp",
  activities: "i02-activities.webp",
  party: "i03-party.webp",
  nature: "i04-nature.webp",
  social: "i05-social.webp",
  creativity: "i06-creativity.webp",
};

const resolveFile = (file?: string) => file ? `/activities/icons/${file}` : null;

const cityWalkPattern = /^(?:прогулка|прогулянка|procházka|walk)$/iu;

export const getActivityIconAsset = (emoji: string, label = "") => {
  if (emoji === "🚶" && cityWalkPattern.test(label.trim())) {
    return resolveFile("31-city-walk.webp");
  }
  return resolveFile(emojiFiles[emoji]);
};
export const getCategoryIconAsset = (categoryId: string) => resolveFile(categoryFiles[categoryId]);
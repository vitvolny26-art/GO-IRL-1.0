import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { renderTelegramShareCardJpeg } from "../api/_shared/telegram-share-card-image.js";
import { activityOptions } from "../src/data.js";

const outputDirectory = join(process.cwd(), "tmp", "share-card-export");
const categoryOrder = ["sport", "activities", "party", "nature", "social", "creativity"] as const;

const categoryEnvironment: Record<(typeof categoryOrder)[number], string> = {
  sport: "Для всех",
  activities: "В помещении",
  party: "Вечером",
  nature: "На свежем воздухе",
  social: "Свободный формат",
  creativity: "Творческая встреча",
};

const slugify = (value: string) => value
  .toLocaleLowerCase("ru")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^\p{L}\p{N}]+/gu, "-")
  .replace(/^-+|-+$/g, "");

describe("export the 40 real sharing cards", () => {
  it("renders every taxonomy option through the production share renderer", async () => {
    mkdirSync(outputDirectory, { recursive: true });

    const options = categoryOrder.flatMap((categoryId) =>
      activityOptions[categoryId].map((option) => ({ categoryId, option })),
    );

    expect(options).toHaveLength(40);

    const cards: Buffer[] = [];

    for (const [index, { categoryId, option }] of options.entries()) {
      const isSport = categoryId === "sport";
      const title = option.name.ru;
      const image = await renderTelegramShareCardJpeg({
        eventId: `share-preview-${index + 1}`,
        title,
        activity: `${option.icon} ${title}`,
        date: "Сб, 18 июля",
        eventDate: "2026-07-18",
        time: "18:30",
        address: "Horní náměstí",
        participants: 4,
        capacity: 12,
        icon: option.icon,
        inviteUrl: "https://t.me/goirl_bot",
        city: "Olomouc",
        durationMinutes: 90,
        price: 0,
        level: isSport ? "Для всех" : "",
        format: isSport ? "Дружеский формат" : "",
        environment: categoryEnvironment[categoryId],
        isSport,
        language: "ru",
      });

      const filename = `${String(index + 1).padStart(2, "0")}-${slugify(title)}.jpg`;
      writeFileSync(join(outputDirectory, filename), image);
      cards.push(image);
    }

    const columns = 4;
    const rows = 10;
    const cardWidth = 432;
    const cardHeight = 360;
    const contactSheet = sharp({
      create: {
        width: columns * cardWidth,
        height: rows * cardHeight,
        channels: 3,
        background: { r: 8, g: 11, b: 13 },
      },
    });

    const composites = await Promise.all(cards.map(async (image, index) => ({
      input: await sharp(image).resize(cardWidth, cardHeight, { fit: "cover" }).jpeg({ quality: 88 }).toBuffer(),
      left: (index % columns) * cardWidth,
      top: Math.floor(index / columns) * cardHeight,
    })));

    await contactSheet
      .composite(composites)
      .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
      .toFile(join(outputDirectory, "00-all-40-share-cards.jpg"));
  }, 120_000);
});

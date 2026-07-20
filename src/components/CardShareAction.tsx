import { useEffect, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { buildCardShareTarget, buildCardShareText, buildMessengerPreviewUrl } from "../cardShare";
import { openTelegramShareTarget } from "../cardShareNavigation";
import type { PreparedTelegramShareResult } from "../telegramPreparedShare";

type CardShareActionProps = {
  title: string;
  date: string;
  address: string;
  url: string;
  label: string;
  onTelegramShare?: () => Promise<PreparedTelegramShareResult>;
};

type ShareChannel = "telegram" | "messenger" | "native";

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: {
      openLink?: (url: string) =>
import { useEffect, useRef, useState } from "react";
import { CalendarDays, CalendarPlus, Check, ChevronRight, CircleUserRound, Clock3, Bug, Dumbbell, Ellipsis, MapPin, Pencil, Share2, ShieldCheck, Sparkles, Ticket, Trash2, UsersRound, X } from "lucide-react";
import { getTranslation, localeByLanguage } from "../i18n";
import { openBugReport } from "../bugReport";
import { getEventWeather,
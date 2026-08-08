import eventPreviewHandler from "./event-preview.js";
import {
  buildActivityAttributionSession,
  socialAttributionParamKeys,
  socialAttributionSessionKey,
} from "../../src/socialAttribution.js";

type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  end(body?: string | Uint8Array): void;
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
};

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export const buildEventAttributionCapture = (
  eventId: string,
  query: VercelRequest["query"],
) => {
  const params = new URLSearchParams();
  for (const key of socialAttributionParamKeys) {
    const value = first(query?.[key]);
    if (value) params.set(key, value);
  }

  const session = buildActivityAttributionSession({
    activityId: eventId,
    entryPath: `/e/${eventId}`,
    search: params,
  });
  const storageKey = JSON.stringify(socialAttributionSessionKey);
  if (!session) {
    return {
      attributed: false,
      script: `<script>try{sessionStorage.removeItem(${storageKey})}catch{}</script>`,
    };
  }

  return {
    attributed: true,
    script: `<script>try{sessionStorage.setItem(${storageKey},${JSON.stringify(JSON.stringify(session))})}catch{}</script>`,
  };
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const eventId = first(request.query?.event) || "";
  const capture = buildEventAttributionCapture(eventId, request.query);

  const wrappedResponse: VercelResponse = {
    setHeader(name, value) {
      response.setHeader(name, value);
    },
    status(code) {
      response.status(code);
      return wrappedResponse;
    },
    end(body) {
      if (typeof body === "string" && body.includes("</head>")) {
        if (capture.attributed) response.setHeader("Cache-Control", "no-store");
        return response.end(body.replace("</head>", `${capture.script}\n</head>`));
      }
      return response.end(body);
    },
  };

  return eventPreviewHandler(request, wrappedResponse);
}

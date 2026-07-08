export type TelegramInitDataUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

export type VerifiedTelegramInitData = {
  authDate: number;
  hash: string;
  queryId?: string;
  startParam?: string;
  user: TelegramInitDataUser;
};

export type TelegramInitDataValidationErrorCode =
  | "malformed_init_data"
  | "missing_hash"
  | "missing_auth_date"
  | "missing_user"
  | "expired_auth_date"
  | "invalid_hash";

export class TelegramInitDataValidationError extends Error {
  constructor(
    public code: TelegramInitDataValidationErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "TelegramInitDataValidationError";
  }
}

const textEncoder = new TextEncoder();

const asArrayBuffer = (bytes: Uint8Array) => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

const bytesToHex = (bytes: Uint8Array) =>
  [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");

const hexToBytes = (hex: string) => {
  if (!/^[a-f0-9]+$/i.test(hex) || hex.length % 2 !== 0) {
    throw new TelegramInitDataValidationError("invalid_hash", "Telegram initData hash is not valid hex");
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
};

const timingSafeEqual = (left: Uint8Array, right: Uint8Array) => {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }
  return diff === 0;
};

async function hmacSha256(key: string | Uint8Array, data: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    asArrayBuffer(typeof key === "string" ? textEncoder.encode(key) : key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, textEncoder.encode(data)));
}

export async function sha256Hex(data: string) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(data));
  return bytesToHex(new Uint8Array(digest));
}

export async function createTelegramReplayKey(hash: string) {
  return sha256Hex(hash);
}

export function parseTelegramInitData(initData: string) {
  if (!initData || typeof initData !== "string") {
    throw new TelegramInitDataValidationError("malformed_init_data", "Telegram initData is empty");
  }

  const params = new URLSearchParams(initData);
  const entries = [...params.entries()];
  if (!entries.length) {
    throw new TelegramInitDataValidationError("malformed_init_data", "Telegram initData has no fields");
  }

  return params;
}

export function buildTelegramDataCheckString(params: URLSearchParams) {
  return [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

export async function createTelegramInitDataHash(initDataWithoutHash: string, botToken: string) {
  const params = parseTelegramInitData(initDataWithoutHash);
  const dataCheckString = buildTelegramDataCheckString(params);
  const secretKey = await hmacSha256("WebAppData", botToken);
  return bytesToHex(await hmacSha256(secretKey, dataCheckString));
}

export async function validateTelegramInitData(options: {
  initData: string;
  botToken: string;
  nowSeconds?: number;
  maxAgeSeconds?: number;
}): Promise<VerifiedTelegramInitData> {
  const params = parseTelegramInitData(options.initData);
  const hash = params.get("hash");
  if (!hash) {
    throw new TelegramInitDataValidationError("missing_hash", "Telegram initData hash is missing");
  }

  const authDateRaw = params.get("auth_date");
  if (!authDateRaw) {
    throw new TelegramInitDataValidationError("missing_auth_date", "Telegram auth_date is missing");
  }

  const authDate = Number(authDateRaw);
  if (!Number.isFinite(authDate)) {
    throw new TelegramInitDataValidationError("missing_auth_date", "Telegram auth_date is invalid");
  }

  const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const maxAgeSeconds = options.maxAgeSeconds ?? 86400;
  if (authDate > nowSeconds + 60 || nowSeconds - authDate > maxAgeSeconds) {
    throw new TelegramInitDataValidationError("expired_auth_date", "Telegram auth_date is expired");
  }

  const userRaw = params.get("user");
  if (!userRaw) {
    throw new TelegramInitDataValidationError("missing_user", "Telegram user is missing");
  }

  let user: TelegramInitDataUser;
  try {
    user = JSON.parse(userRaw) as TelegramInitDataUser;
  } catch {
    throw new TelegramInitDataValidationError("missing_user", "Telegram user payload is invalid");
  }

  if (!Number.isFinite(user.id)) {
    throw new TelegramInitDataValidationError("missing_user", "Telegram user id is missing");
  }

  const dataCheckString = buildTelegramDataCheckString(params);
  const secretKey = await hmacSha256("WebAppData", options.botToken);
  const expectedHash = await hmacSha256(secretKey, dataCheckString);
  const actualHash = hexToBytes(hash);
  if (!timingSafeEqual(expectedHash, actualHash)) {
    throw new TelegramInitDataValidationError("invalid_hash", "Telegram initData hash is invalid");
  }

  return {
    authDate,
    hash,
    queryId: params.get("query_id") || undefined,
    startParam: params.get("start_param") || undefined,
    user,
  };
}

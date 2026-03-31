import { createHmac } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_DIGITS = 6;
const TOTP_PERIOD_MS = 30_000;
const MINIMUM_STABLE_WINDOW_MS = 5_000;

const sleep = (timeMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, timeMs);
  });

const decodeBase32 = (value: string) => {
  let bits = "";

  for (const character of value.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "")) {
    const index = BASE32_ALPHABET.indexOf(character);

    if (index < 0) {
      throw new Error("TOTP secret contains characters outside the base32 alphabet.");
    }

    bits += index.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];

  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  }

  return Buffer.from(bytes);
};

export const generateTotpCode = (secret: string, timeMs = Date.now()) => {
  const normalizedSecret = secret.trim();

  if (!normalizedSecret) {
    throw new Error("TOTP secret is empty.");
  }

  const key = decodeBase32(normalizedSecret);
  const counter = Math.floor(timeMs / TOTP_PERIOD_MS);
  const counterBuffer = Buffer.alloc(8);

  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", key).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const truncated =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return (truncated % 10 ** TOTP_DIGITS).toString().padStart(TOTP_DIGITS, "0");
};

export const createFreshTotpCode = async (secret: string) => {
  const remainingWindowMs = TOTP_PERIOD_MS - (Date.now() % TOTP_PERIOD_MS);

  if (remainingWindowMs < MINIMUM_STABLE_WINDOW_MS) {
    await sleep(remainingWindowMs + 250);
  }

  return generateTotpCode(secret);
};

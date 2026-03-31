const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GMAIL_API_BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me";

interface GmailMessagePart {
  body?: {
    data?: string;
  };
  mimeType?: string;
  parts?: GmailMessagePart[];
}

interface GmailMessage {
  id: string;
  internalDate: string;
  payload?: GmailMessagePart;
  snippet?: string;
}

interface GmailListResponse {
  messages?: Array<{
    id: string;
  }>;
}

interface GmailTokenResponse {
  access_token: string;
}

interface WaitForMagicLinkOptions {
  clientId: string;
  clientSecret: string;
  expectedOrigin: string;
  pollIntervalMs?: number;
  recipient: string;
  refreshToken: string;
  sentAfter: number;
  timeoutMs?: number;
}

const sleep = (timeMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, timeMs);
  });

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalized.length % 4)) % 4;

  return Buffer.from(`${normalized}${"=".repeat(paddingLength)}`, "base64").toString("utf8");
};

const decodeQuotedPrintable = (value: string) =>
  value
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-F]{2})/gi, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    );

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#x3d;/gi, "=")
    .replace(/&#61;/gi, "=")
    .replace(/&#x2f;/gi, "/")
    .replace(/&#47;/gi, "/");

const collectTextBodies = (part?: GmailMessagePart): string[] => {
  if (!part) {
    return [];
  }

  const bodyValues: string[] = [];

  if (part.body?.data && (!part.mimeType || part.mimeType.startsWith("text/"))) {
    bodyValues.push(decodeHtmlEntities(decodeQuotedPrintable(decodeBase64Url(part.body.data))));
  }

  for (const nestedPart of part.parts ?? []) {
    bodyValues.push(...collectTextBodies(nestedPart));
  }

  return bodyValues;
};

const extractCandidateUrls = (message: GmailMessage) => {
  const textBodies = collectTextBodies(message.payload);
  const searchableContent = [...textBodies, message.snippet ?? ""].join("\n");
  const rawMatches = searchableContent.match(/https:\/\/[^\s"'<>]+/g) ?? [];

  return rawMatches.map((url) =>
    url
      .replace(/&amp;/g, "&")
      .replace(/[>)\].,]+$/g, ""),
  );
};

const isExpectedMagicLink = (candidateUrl: string, expectedOrigin: string) => {
  try {
    const parsedUrl = new URL(candidateUrl);
    const redirectTarget = parsedUrl.searchParams.get("redirect_to");

    if (parsedUrl.origin === expectedOrigin) {
      return /(token_hash=|access_token=|type=magiclink|type=signup)/i.test(candidateUrl);
    }

    if (!redirectTarget) {
      return false;
    }

    return new URL(redirectTarget).origin === expectedOrigin;
  } catch {
    return false;
  }
};

const fetchAccessToken = async ({
  clientId,
  clientSecret,
  refreshToken,
}: Pick<WaitForMagicLinkOptions, "clientId" | "clientSecret" | "refreshToken">) => {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to refresh Gmail access token (${response.status}).`);
  }

  const payload = (await response.json()) as GmailTokenResponse;

  if (!payload.access_token) {
    throw new Error("Gmail token response did not include an access token.");
  }

  return payload.access_token;
};

const fetchJson = async <T>(accessToken: string, url: string) => {
  const response = await fetch(url, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Gmail API request failed (${response.status}) for ${url}.`);
  }

  return (await response.json()) as T;
};

const listRecentMessages = async (accessToken: string, recipient: string) => {
  const query = encodeURIComponent(`to:${recipient} newer_than:2d`);
  const listUrl = `${GMAIL_API_BASE_URL}/messages?q=${query}&maxResults=10`;
  const listResponse = await fetchJson<GmailListResponse>(accessToken, listUrl);

  if (!listResponse.messages?.length) {
    return [];
  }

  const messages = await Promise.all(
    listResponse.messages.map(({ id }) =>
      fetchJson<GmailMessage>(accessToken, `${GMAIL_API_BASE_URL}/messages/${id}?format=full`),
    ),
  );

  return messages.sort((left, right) => Number(right.internalDate) - Number(left.internalDate));
};

export const waitForMagicLink = async ({
  clientId,
  clientSecret,
  expectedOrigin,
  pollIntervalMs = 5_000,
  recipient,
  refreshToken,
  sentAfter,
  timeoutMs = 90_000,
}: WaitForMagicLinkOptions) => {
  const deadline = Date.now() + timeoutMs;
  const accessToken = await fetchAccessToken({ clientId, clientSecret, refreshToken });

  while (Date.now() < deadline) {
    const messages = await listRecentMessages(accessToken, recipient);

    for (const message of messages) {
      if (Number(message.internalDate) < sentAfter) {
        continue;
      }

      const magicLink = extractCandidateUrls(message).find((candidateUrl) =>
        isExpectedMagicLink(candidateUrl, expectedOrigin),
      );

      if (magicLink) {
        return magicLink;
      }
    }

    await sleep(pollIntervalMs);
  }

  throw new Error(`Timed out waiting for a Supabase magic link email for ${recipient}.`);
};

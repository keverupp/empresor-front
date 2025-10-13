const cryptoObj = globalThis.crypto;

if (!cryptoObj) {
  throw new Error("Web Crypto API is not available in this runtime");
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export interface Auth0Config {
  domain: string;
  clientId: string;
  clientSecret: string;
  audience?: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  dbConnection?: string;
  cookieSecret: string;
}

export interface Auth0Tokens {
  access_token: string;
  id_token?: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface StoredSession {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface PkceSessionData {
  codeVerifier: string;
  state: string;
  returnTo?: string;
  screenHint?: string;
}

const AUTH_COOKIE_NAME = "empresor_auth";
const PKCE_COOKIE_NAME = "empresor_pkce";
const SECURE_FLAG = process.env.NODE_ENV === "production" ? "; Secure" : "";

const buildCookieAttributes = (maxAge: number): string => {
  return `Path=/; HttpOnly${SECURE_FLAG}; SameSite=Lax; Max-Age=${maxAge}`;
};

const encodeBase64 = (bytes: Uint8Array): string => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const decodeBase64 = (value: string): Uint8Array => {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64"));
  }

  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const base64UrlEncode = (source: Uint8Array): string => {
  return encodeBase64(source).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

const base64UrlDecode = (value: string): Uint8Array => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = normalized + "===".slice(0, pad === 0 ? 0 : 4 - pad);
  return decodeBase64(padded);
};

const getRandomBytes = (size: number): Uint8Array => {
  const bytes = new Uint8Array(size);
  cryptoObj.getRandomValues(bytes);
  return bytes;
};

const computeHmac = async (secret: string, payload: string): Promise<string> => {
  const keyMaterial = textEncoder.encode(secret);
  const cryptoKey = await cryptoObj.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await cryptoObj.subtle.sign(
    "HMAC",
    cryptoKey,
    textEncoder.encode(payload)
  );
  return base64UrlEncode(new Uint8Array(signature));
};

const sha256 = async (value: string): Promise<Uint8Array> => {
  const digest = await cryptoObj.subtle.digest(
    "SHA-256",
    textEncoder.encode(value)
  );
  return new Uint8Array(digest);
};

export const getAuth0Config = (): Auth0Config => {
  const {
    AUTH0_DOMAIN,
    AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET,
    AUTH0_AUDIENCE,
    AUTH0_REDIRECT_URI,
    AUTH0_POST_LOGOUT_REDIRECT_URI,
    AUTH0_DB_CONNECTION,
    AUTH0_COOKIE_SECRET,
  } = process.env;

  if (!AUTH0_DOMAIN || !AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET) {
    throw new Error("Missing Auth0 environment variables");
  }

  if (!AUTH0_REDIRECT_URI) {
    throw new Error("AUTH0_REDIRECT_URI is required");
  }

  if (!AUTH0_POST_LOGOUT_REDIRECT_URI) {
    throw new Error("AUTH0_POST_LOGOUT_REDIRECT_URI is required");
  }

  if (!AUTH0_COOKIE_SECRET) {
    throw new Error("AUTH0_COOKIE_SECRET is required to sign session cookies");
  }

  return {
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    audience: AUTH0_AUDIENCE,
    redirectUri: AUTH0_REDIRECT_URI,
    postLogoutRedirectUri: AUTH0_POST_LOGOUT_REDIRECT_URI,
    dbConnection: AUTH0_DB_CONNECTION,
    cookieSecret: AUTH0_COOKIE_SECRET,
  };
};

export const signSession = async (payload: StoredSession): Promise<string> => {
  const config = getAuth0Config();
  const body = base64UrlEncode(textEncoder.encode(JSON.stringify(payload)));
  const signature = await computeHmac(config.cookieSecret, body);
  return `${body}.${signature}`;
};

export const readSession = async (
  value: string | undefined
): Promise<StoredSession | null> => {
  if (!value) return null;
  const config = getAuth0Config();
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = await computeHmac(config.cookieSecret, body);
  if (expected !== signature) {
    return null;
  }

  try {
    const decoded = textDecoder.decode(base64UrlDecode(body));
    return JSON.parse(decoded) as StoredSession;
  } catch (error) {
    console.error("Failed to parse session cookie", error);
    return null;
  }
};

export const createPkceSession = async (
  data: PkceSessionData
): Promise<string> => {
  const config = getAuth0Config();
  const body = base64UrlEncode(textEncoder.encode(JSON.stringify(data)));
  const signature = await computeHmac(config.cookieSecret, body);
  return `${body}.${signature}`;
};

export const readPkceSession = async (
  value: string | undefined
): Promise<PkceSessionData | null> => {
  if (!value) return null;
  const config = getAuth0Config();
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = await computeHmac(config.cookieSecret, body);
  if (expected !== signature) return null;

  try {
    const decoded = textDecoder.decode(base64UrlDecode(body));
    return JSON.parse(decoded) as PkceSessionData;
  } catch (error) {
    console.error("Failed to parse PKCE cookie", error);
    return null;
  }
};

export const clearCookie = (name: string): string => {
  return `${name}=; ${buildCookieAttributes(0)}`;
};

export const sessionCookie = async (session: StoredSession): Promise<string> => {
  const value = await signSession(session);
  const maxAge = Math.max(Math.floor((session.expiresAt - Date.now()) / 1000), 0);
  return `${AUTH_COOKIE_NAME}=${value}; ${buildCookieAttributes(maxAge)}`;
};

export const pkceCookie = async (data: PkceSessionData): Promise<string> => {
  const value = await createPkceSession(data);
  return `${PKCE_COOKIE_NAME}=${value}; ${buildCookieAttributes(900)}`;
};

export const getAuthCookieName = (): string => AUTH_COOKIE_NAME;
export const getPkceCookieName = (): string => PKCE_COOKIE_NAME;

export const buildAuthorizeUrl = (
  config: Auth0Config,
  params: { state: string; codeChallenge: string; screenHint?: string; returnTo?: string }
): string => {
  const url = new URL(`https://${config.domain}/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("scope", "openid profile email offline_access");
  if (config.audience) {
    url.searchParams.set("audience", config.audience);
  }
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("state", params.state);
  if (params.screenHint) {
    url.searchParams.set("screen_hint", params.screenHint);
  }
  if (params.returnTo) {
    url.searchParams.set("app_return_to", params.returnTo);
  }
  return url.toString();
};

export const generatePkce = async (): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> => {
  const verifierBytes = getRandomBytes(32);
  const codeVerifier = base64UrlEncode(verifierBytes);
  const challengeBytes = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(challengeBytes);
  return { codeVerifier, codeChallenge };
};

export const decodeIdToken = (token?: string): Record<string, unknown> | null => {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = textDecoder.decode(base64UrlDecode(parts[1] ?? ""));
    return JSON.parse(payload) as Record<string, unknown>;
  } catch (error) {
    console.error("Failed to decode id_token", error);
    return null;
  }
};

export const createSessionFromTokens = (tokens: Auth0Tokens): StoredSession => {
  return {
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
};

export const shouldRefresh = (session: StoredSession, thresholdSeconds = 60): boolean => {
  return session.expiresAt - Date.now() < thresholdSeconds * 1000;
};

export const buildLogoutUrl = (config: Auth0Config, returnTo?: string): string => {
  const url = new URL(`https://${config.domain}/v2/logout`);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set(
    "returnTo",
    returnTo || config.postLogoutRedirectUri
  );
  return url.toString();
};

export const AUTH0_CONSTANTS = {
  AUTH_COOKIE_NAME,
  PKCE_COOKIE_NAME,
};

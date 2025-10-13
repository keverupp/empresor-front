import {
  Auth0Tokens,
  Auth0Config,
  StoredSession,
  getAuth0Config,
  createSessionFromTokens,
  decodeIdToken,
  shouldRefresh,
} from "./config";

interface TokenResponse extends Auth0Tokens {
  scope?: string;
}

const buildHeaders = () => ({
  "Content-Type": "application/json",
});

const callAuth0 = async <T>(
  config: Auth0Config,
  path: string,
  payload: Record<string, unknown>
): Promise<T> => {
  const response = await fetch(`https://${config.domain}${path}`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response
      .json()
      .catch(async () => ({ message: await response.text() }));
    throw new Error(
      (message as { error?: string; error_description?: string; message?: string })
        .error_description ||
        (message as { message?: string }).message ||
        "Auth0 request failed"
    );
  }

  return (await response.json()) as T;
};

export const exchangeCodeForTokens = async (
  code: string,
  codeVerifier: string
): Promise<StoredSession> => {
  const config = getAuth0Config();
  const tokenResponse = await callAuth0<TokenResponse>(config, "/oauth/token", {
    grant_type: "authorization_code",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier,
  });

  return createSessionFromTokens(tokenResponse);
};

export const refreshTokens = async (
  refreshToken: string
): Promise<StoredSession> => {
  const config = getAuth0Config();
  const tokenResponse = await callAuth0<TokenResponse>(config, "/oauth/token", {
    grant_type: "refresh_token",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
  });

  return createSessionFromTokens({
    ...tokenResponse,
    refresh_token: tokenResponse.refresh_token ?? refreshToken,
  });
};

export const createUserInAuth0 = async (data: {
  email: string;
  password: string;
  name?: string;
}) => {
  const config = getAuth0Config();
  if (!config.dbConnection) {
    throw new Error("AUTH0_DB_CONNECTION is required for user registration");
  }

  await callAuth0(config, "/dbconnections/signup", {
    client_id: config.clientId,
    connection: config.dbConnection,
    email: data.email,
    password: data.password,
    name: data.name,
  });
};

export const requestPasswordResetEmail = async (email: string) => {
  const config = getAuth0Config();
  if (!config.dbConnection) {
    throw new Error("AUTH0_DB_CONNECTION is required for password reset");
  }

  await callAuth0(config, "/dbconnections/change_password", {
    client_id: config.clientId,
    connection: config.dbConnection,
    email,
  });
};

export const getUserFromSession = (session: StoredSession | null) => {
  if (!session) return null;
  const payload = decodeIdToken(session.idToken);
  return payload;
};

export const ensureFreshSession = async (
  session: StoredSession | null
): Promise<StoredSession | null> => {
  if (!session) return null;
  if (!session.refreshToken) return session;

  if (!shouldRefresh(session)) {
    return session;
  }

  try {
    const refreshed = await refreshTokens(session.refreshToken);
    return refreshed;
  } catch (error) {
    console.error("Failed to refresh Auth0 session", error);
    return null;
  }
};

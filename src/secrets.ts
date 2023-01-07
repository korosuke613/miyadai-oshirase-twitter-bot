import { Env } from "../deps.ts";
import { path } from "../dev_deps.ts";

const __dirname = new URL(".", import.meta.url).pathname;

export type Secrets = {
  twitterClientId: string;
  twitterClientSecret: string;
  twitterUserId: string;
  twitterUserRefreshToken: string;
};

const twitterUserRefreshTokenFilePath = path.join(
  __dirname,
  "..",
  ".TWITTER_USER_REFRESH_TOKEN",
);

export const readLocalEnv = async (
  env?: Env,
): Promise<Secrets> => {
  const _env = env ? env : new Env();

  let twitterUserRefreshToken = _env.get("TWITTER_USER_REFRESH_TOKEN");
  if (twitterUserRefreshToken === undefined) {
    const refreshTokenFile = await Deno.readTextFile(
      twitterUserRefreshTokenFilePath,
    );
    twitterUserRefreshToken = refreshTokenFile;
  }

  return {
    twitterClientId: _env.require("TWITTER_OAUTH_CLIENT_ID"),
    twitterClientSecret: _env.require("TWITTER_OAUTH_CLIENT_SECRET"),
    twitterUserId: _env.require("TWITTER_USER_ID"),
    twitterUserRefreshToken: twitterUserRefreshToken,
  };
};

export const saveTwitterUserRefreshTokenToLocalFile = async (
  refreshToken: string,
) => {
  await Deno.writeTextFile(twitterUserRefreshTokenFilePath, refreshToken);
};

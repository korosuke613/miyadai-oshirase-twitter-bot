import { Env } from "../deps.ts";
import { path } from "../dev_deps.ts";

const __dirname = new URL(".", import.meta.url).pathname;

const env = new Env();

type Secrets = {
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

export const readLocalEnv = async (): Promise<Secrets> => {
  let twitterUserRefreshToken = env.get("TWITTER_USER_REFRESH_TOKEN");
  if (twitterUserRefreshToken === undefined) {
    const refreshTokenFile = await Deno.readTextFile(
      twitterUserRefreshTokenFilePath,
    );
    twitterUserRefreshToken = refreshTokenFile;
  }

  return {
    twitterClientId: env.require("TWITTER_OAUTH_CLIENT_ID"),
    twitterClientSecret: env.require("TWITTER_OAUTH_CLIENT_SECRET"),
    twitterUserId: env.require("TWITTER_USER_ID"),
    twitterUserRefreshToken: twitterUserRefreshToken,
  };
};

export const saveTwitterUserRefreshTokenToLocalFile = async (
  refreshToken: string,
) => {
  await Deno.writeTextFile(twitterUserRefreshTokenFilePath, refreshToken);
};

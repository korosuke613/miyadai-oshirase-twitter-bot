import { assertEquals, describe, it } from "../../dev_deps.ts";
import { Env } from "../../deps.ts";
import { readLocalEnv } from "../secrets.ts";

const __dirname = new URL(".", import.meta.url).pathname;

const env = new Env({
  TWITTER_OAUTH_CLIENT_ID: "a",
  TWITTER_OAUTH_CLIENT_SECRET: "b",
  TWITTER_USER_ID: "c",
  TWITTER_USER_REFRESH_TOKEN: "d",
});

describe("readLocalEnv()", () => {
  it("success: from env", async () => {
    const actual = await readLocalEnv(env);
    assertEquals(actual, {
      twitterClientId: "a",
      twitterClientSecret: "b",
      twitterUserId: "c",
      twitterUserRefreshToken: "d",
    });
  });
});

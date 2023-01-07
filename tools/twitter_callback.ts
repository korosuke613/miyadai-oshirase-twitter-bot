import { Env, twitterSdk } from "../deps.ts";
import { express } from "../dev_deps.ts";

const env = new Env();

const app = express();

const authClient = new twitterSdk.auth.OAuth2User({
  client_id: env.require("TWITTER_OAUTH_CLIENT_ID"),
  client_secret: env.require("TWITTER_OAUTH_CLIENT_SECRET"),
  callback: "http://127.0.0.1:3000/callback",
  scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
});

const client = new twitterSdk.Client(authClient);

const STATE = "my-state";

app.get(
  "/callback",
  async (req: { query: { code: string; state: string } }, res) => {
    try {
      const { code, state } = req.query;
      if (state !== STATE) return res.status(500).send("State isn't matching");
      const token = await authClient.requestAccessToken(code);
      console.log({ token });
      res.redirect("/tweets");
    } catch (error) {
      console.log(error);
    }
  },
);

app.get("/login", (_req, res) => {
  const authUrl = authClient.generateAuthURL({
    state: STATE,
    code_challenge_method: "s256",
  });
  res.redirect(authUrl);
});

app.get("/tweets", async (_req, res) => {
  try {
    const tweets = await client.tweets.findTweetById("20");
    res.send(tweets);
  } catch (error) {
    console.log("tweets error", error);
  }
});

app.get("/revoke", async (_req, res) => {
  try {
    const response = await authClient.revokeAccessToken();
    res.send(response);
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => {
  console.log(`Go here to login: http://127.0.0.1:3000/login`);
});

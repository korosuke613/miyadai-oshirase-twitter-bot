import { twitterSdk } from "../deps.ts";

export const refreshToken = async (
  clientId: string,
  clientSecret: string,
  refreshToken: string,
) => {
  try {
    const authClient = new twitterSdk.auth.OAuth2User(
      {
        token: { refresh_token: refreshToken },
        client_id: clientId,
        client_secret: clientSecret,
        callback: "http://127.0.0.1:3000/callback",
        scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      },
    );
    const { token } = await authClient.refreshAccessToken();
    return token;
  } catch (e) {
    console.error(JSON.stringify(e, null, 2));
  }
};

export class Twitter {
  constructor(private client: twitterSdk.Client, private userId: string) {}

  async getRecentTweets(maxResults = 10) {
    try {
      const result = await this.client.tweets.usersIdTweets(this.userId, {
        max_results: maxResults,
        "tweet.fields": ["entities", "created_at"],
      });
      const data = result.data?.map((d) => {
        const expandedUrls = d.entities?.urls
          ?.filter((url) => url.expanded_url !== undefined)
          .map((url) => url.expanded_url!);

        return {
          id: d.id,
          text: d.text,
          expandedUrls: expandedUrls ? expandedUrls : [],
          createdAt: d.created_at,
        };
      });

      return data;
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
    }
  }

  async tweet(
    param: twitterSdk.types.TwitterBody<twitterSdk.types.createTweet>,
  ) {
    try {
      const result = await this.client.tweets.createTweet(param);
      return result;
    } catch (e) {
      console.error(JSON.stringify(e, null, 2));
    }
  }
}

export const makeTwitter = (param: {
  bearerToken: string;
  userId: string;
}) => {
  const client = new twitterSdk.Client(
    param.bearerToken,
  );

  return new Twitter(client, param.userId);
};

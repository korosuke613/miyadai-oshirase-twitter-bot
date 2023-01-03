import { twitterSdk } from "../deps.ts";

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

import { Env } from "./deps.ts";
import { makeScraper } from "./src/scraper.ts";
import { makeTwitter } from "./src/twitter.ts";

const env = new Env();

const twitter = await makeTwitter({
  bearerToken: env.require("TWITTER_USER_BEARER_TOKEN"),
  userId: env.require("TWITTER_USER_ID"),
});
const recentTweets = await twitter.getRecentTweets();
if (recentTweets === undefined) {
  throw new Error("Failed get recent tweets.");
}

const recentTweetUrls = recentTweets.filter((t) => t.expandedUrls.length).map(
  (t) => t.expandedUrls[0],
);

const scraper = await makeScraper({
  sinceDate: new Date("2022-12-01"),
});
const allNewsPage = await scraper.createAllNewsPage();
const newNewsList = await scraper.listNewNewsSinceYesterday(allNewsPage);
await scraper.close();

const notTweetNewsList = newNewsList.filter((n) =>
  !recentTweetUrls.includes(n.url)
);

console.log(JSON.stringify(notTweetNewsList, null, 2));

// await twitter.tweet();

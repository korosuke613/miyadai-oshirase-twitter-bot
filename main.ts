import { makeScraper } from "./src/scraper.ts";
import {
  readLocalEnv,
  saveTwitterUserRefreshTokenToLocalFile,
} from "./src/secrets.ts";
import { makeTwitter, refreshToken } from "./src/twitter.ts";

const secrets = await readLocalEnv();

const userToken = await refreshToken(
  secrets.twitterClientId,
  secrets.twitterClientSecret,
  secrets.twitterUserRefreshToken,
);

if (
  userToken === undefined ||
  userToken.access_token === undefined ||
  userToken.refresh_token === undefined
) {
  throw new Error("Failed refresh access token");
}
await saveTwitterUserRefreshTokenToLocalFile(userToken.refresh_token);

const twitter = await makeTwitter({
  bearerToken: userToken.access_token,
  userId: secrets.twitterUserId,
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

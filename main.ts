import { puppeteer } from "./deps.ts";
import { DetailNews } from "./src/news.ts";
// import { convertPng, downloadPdf } from "./src/pdf.ts";
import { makeAllNewsScraper, makeBrowser, NewsScraper } from "./src/scraper.ts";
import {
  readLocalEnv,
  saveTwitterUserRefreshTokenToLocalFile,
} from "./src/secrets.ts";
import { makeTwitter, refreshToken } from "./src/twitter.ts";

// const secrets = await readLocalEnv();

// const userToken = await refreshToken(
//   secrets.twitterClientId,
//   secrets.twitterClientSecret,
//   secrets.twitterUserRefreshToken,
// );

// if (
//   userToken === undefined ||
//   userToken.access_token === undefined ||
//   userToken.refresh_token === undefined
// ) {
//   throw new Error("Failed refresh access token");
// }
// await saveTwitterUserRefreshTokenToLocalFile(userToken.refresh_token);

// const twitter = await makeTwitter({
//   bearerToken: userToken.access_token,
//   userId: secrets.twitterUserId,
// });

// const recentTweets = await twitter.getRecentTweets();
// if (recentTweets === undefined) {
//   throw new Error("Failed get recent tweets.");
// }

// const recentTweetUrls = recentTweets.filter((t) => t.expandedUrls.length).map(
//   (t) => t.expandedUrls[0],
// );

const browser = await makeBrowser();

// const scraper = await makeScraper({
//   sinceDate: new Date("2022-12-01"),
// });

// const allNewsPage = await scraper.createAllNewsPage();
// const newNewsList = await scraper.listNewNewsSinceYesterday(allNewsPage);

// const notTweetNewsList = newNewsList.filter((n) =>
//   !recentTweetUrls.includes(n.url)
// );

// console.log(JSON.stringify(notTweetNewsList, null, 2));

let newNewsDetailPage: DetailNews;

try {
  const newsPage = await browser.newPage(
    "http://gakumu.of.miyazaki-u.ac.jp/gakumu/campuslifeinfo/campuslifeinfo/5641-2023-1-6.html",
  );
  const newsScraper = new NewsScraper(newsPage, {
    "title":
      "令和4年度後期入学料免除・入学料徴収猶予・授業料免除の結果について",
    "url":
      "http://gakumu.of.miyazaki-u.ac.jp/gakumu/campuslifeinfo/campuslifeinfo/4983-2020-12-10-05-50-50.html",
    "date": new Date("2022-12-07T00:00:00.000Z"),
  });

  newNewsDetailPage = await newsScraper.analyze();
  console.log(newNewsDetailPage);
} finally {
  browser.close();
}

// await downloadPdf(newNewsDetailPage.pdfLinks[0], "hoge.pdf");
// await convertPng("hoge.pdf");
// await twitter.tweet();

Deno.exit(0);

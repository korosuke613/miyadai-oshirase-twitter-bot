import { dateFns } from "../deps.ts";
import { DetailNews, ListedNews } from "./news.ts";
import { convertPng, downloadPdf, pngToBase64 } from "./pdf.ts";
import {
  Browser,
  makeAllNewsScraper,
  makeBrowser,
  NewsScraper,
} from "./scraper.ts";
import {
  readLocalEnv,
  saveTwitterUserRefreshTokenToLocalFile,
  Secrets,
} from "./secrets.ts";
import { makeTwitter, refreshToken } from "./twitter.ts";

export class Bot {
  private secrets: Secrets = {
    twitterClientId: "dummy",
    twitterClientSecret: "dummy",
    twitterUserId: "dummy",
    twitterUserRefreshToken: "dummy",
  };
  private tmpTwitterUserAccessToken = "dummy";

  async setup() {
    this.secrets = await readLocalEnv();
  }

  private async refreshTwitterToken() {
    const userToken = await refreshToken(
      this.secrets.twitterClientId,
      this.secrets.twitterClientSecret,
      this.secrets.twitterUserRefreshToken,
    );

    if (
      userToken === undefined ||
      userToken.access_token === undefined ||
      userToken.refresh_token === undefined
    ) {
      throw new Error("Failed refresh access token");
    }

    this.tmpTwitterUserAccessToken = userToken.access_token;
    await saveTwitterUserRefreshTokenToLocalFile(userToken.refresh_token);
  }

  async getRecentTweets() {
    await this.refreshTwitterToken();

    const twitter = await makeTwitter({
      bearerToken: this.tmpTwitterUserAccessToken,
      userId: this.secrets.twitterUserId,
    });

    const recentTweets = await twitter.getRecentTweets();
    if (recentTweets === undefined) {
      throw new Error("Failed get recent tweets.");
    }

    return recentTweets.filter((t) => t.expandedUrls.length)
      .map(
        (t) => t.expandedUrls[0],
      );
  }

  async getAllNewsFromDate(date?: Date) {
    const browser = await makeBrowser();

    try {
      const scraper = await makeAllNewsScraper(browser, {
        sinceDate: date ? date : new Date(),
      });

      return await scraper.listNewNewsSinceYesterday();
    } finally {
      await browser.close();
    }
  }

  extractNewNews(newNewsList: ListedNews[], alreadyTweetLinks: string[]) {
    return newNewsList.filter((n) => !alreadyTweetLinks.includes(n.url));
  }

  async getNewsDetail(listedNews: ListedNews, browser?: Browser) {
    if (browser === undefined) {
      browser = await makeBrowser();
    }

    const newsPage = await browser.newPage(
      listedNews.url,
    );

    try {
      const newsScraper = new NewsScraper(newsPage, listedNews);
      return await newsScraper.analyze();
    } finally {
      await newsPage.close();
    }
  }

  async pdfToBase64(detailNews: DetailNews) {
    const tempFile = await Deno.makeTempFile(); // e.g. /tmp/2894ea76

    await downloadPdf(detailNews.pdfLinks[0], tempFile);
    await convertPng(tempFile);
    detailNews.pdfShots[0] = await pngToBase64(`${tempFile}.png`);

    return detailNews;
  }

  private createTweetText(detailNews: DetailNews) {
    const date = dateFns.format(detailNews.date, "yyyy年MM月dd日");

    return `${date}
    ${detailNews.title}
    ${detailNews.url}`;
  }

  async tweet(detailNews: DetailNews) {
    const twitter = await makeTwitter({
      bearerToken: this.tmpTwitterUserAccessToken,
      userId: this.secrets.twitterUserId,
    });

    const tweetText = this.createTweetText(detailNews);

    const mediaIdsPromises: Promise<string>[] = [];
    if (detailNews.screenshot) {
      mediaIdsPromises.push(twitter.uploadMedia(
        detailNews.screenshot,
        "screenshot of news body",
        this.tmpTwitterUserAccessToken,
      ));
    }
    if (detailNews.pdfShots.length > 0) {
      mediaIdsPromises.push(twitter.uploadMedia(
        detailNews.pdfShots[0],
        "screenshot of Page 1 of the attached PDF",
        this.tmpTwitterUserAccessToken,
      ));
    }
    const mediaIds = await Promise.all(mediaIdsPromises);

    await twitter.tweet({
      text: tweetText,
      media: {
        media_ids: mediaIds,
      },
    });
  }
}

import { dateFns, delay, puppeteer, puppeteerTypes } from "../deps.ts";
import { DetailNews, ListedNews } from "./news.ts";

export class Browser {
  constructor(
    protected browser: puppeteerTypes.Browser,
  ) {}

  async newPage(url: string, option?: {
    timeout?: number;
  }) {
    let page: puppeteerTypes.Page;
    // Retry because the page may not finish loading
    const maxCount = 5;
    for (let i = 0; i < maxCount; i++) {
      page = await this.browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
      );

      try {
        await page.goto(url, {
          timeout: option?.timeout ? option.timeout : 2000,
        });
      } catch (e) {
        await page.close();
        console.error(e);
        console.debug("retry: goto");
        await delay(1000);
        continue;
      }
      return page;
    }

    throw new Error(`Failed goto ${url}`);
  }

  async close() {
    await this.browser.close();
  }
}

export const makeBrowser = async () => {
  // const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.launch();
  return new Browser(browser);
};

export class AllNewsScraper {
  constructor(
    private page: puppeteerTypes.Page,
    private existUrls: string[],
    public sinceDate: Date,
  ) {
  }

  async listNewNewsSinceYesterday() {
    const dates = await this.page.$$(
      ".mod-articles-category-date",
    );

    const list: ListedNews[] = [];

    for (const dateElement of dates) {
      // dateElement example
      // <span class="mod-articles-category-date">2022年12月15日</span>

      // ex: 2017年08月23日
      const dateString = await dateElement.evaluate((span) => span.textContent);

      const date = dateFns.parse(dateString, "yyyy年MM月dd日", new Date());
      if (date <= this.sinceDate) {
        // Ignore news prior to yesterday.
        continue;
      }

      // parent example
      /**
         <li>
					 <a class="mod-articles-category-title " href="/gakumu/educationalinfo/educationalinfo/5637-2022-12-15.html">
             令和５年度博物館実習の説明会（オンデマンド）についてのお知らせ
           </a>
           <span class="mod-articles-category-date">2022年12月15日</span>
				 </li>
       */
      const parent = await dateElement.getProperty("parentNode");

      const titleElement = await parent.$("a");
      if (titleElement === null) {
        continue;
      }

      const url = await titleElement.evaluate((a) => a.href);
      if (this.existUrls.includes(url)) {
        continue;
      }

      // Excluded because tab characters and line breaks are mixed.
      const titleString = (await titleElement.evaluate((a) => a.textContent))
        .replace(/[\n\t]/g, "");

      list.push(
        {
          title: titleString,
          url,
          date,
        },
      );
    }

    return list;
  }
}

export const makeAllNewsScraper = async (
  browser: Browser,
  config: {
    existUrls?: string[];
    sinceDate?: Date;
    page?: puppeteerTypes.Page;
  } = {},
) => {
  let _page = config.page;
  if (_page === undefined) {
    _page = await browser.newPage(
      "http://gakumu.of.miyazaki-u.ac.jp/gakumu/allnews",
    );
  }

  return new AllNewsScraper(
    await _page,
    config.existUrls ? config.existUrls : [],
    config.sinceDate ? config.sinceDate : new Date(),
  );
};

export class NewsScraper {
  readonly screenshotBuffer = 20;

  constructor(
    private page: puppeteerTypes.Page,
    private listedNews: ListedNews,
  ) {
  }

  async getCategory() {
    try {
      const selector = ".current.active.parent > a";
      await this.page.waitForSelector(selector);
      /**
       * ex
       * <li class="item-104 current active parent">
       *   <a href="/gakumu/campuslifeinfo/campuslifeinfo.html">
       *     学生生活情報
       *   </a>
       * </li>
       */
      const parentCategoryA = await this.page.$(
        selector,
      );
      if (parentCategoryA !== null) {
        const category = await parentCategoryA.evaluate((a) => a.textContent);
        if (category) return category;
      }
    } catch (e) {
      // Exit 0 even if category not found
      console.debug(e);
    }
    return undefined;
  }

  async screenshot(config?: { path?: string }) {
    const selector = "#wrapper2";
    await this.page.waitForSelector(selector);

    const screenShotAreaElement = await this.page.$(selector);
    if (screenShotAreaElement === null) {
      throw new Error("Failed get screenshot area.");
    }
    const screenshotAreaBox = await screenShotAreaElement.boundingBox();
    if (screenshotAreaBox === null) {
      throw new Error("Failed get screenshot area boundingBox.");
    }

    await screenShotAreaElement.screenshot({
      clip: {
        x: screenshotAreaBox.x - this.screenshotBuffer,
        y: screenshotAreaBox.y,
        width: screenshotAreaBox.width + this.screenshotBuffer * 2,
        height: screenshotAreaBox.height,
      },
      path: config?.path ? config.path : "news_screenshot.png",
    });
  }

  async searchPdfLink(): Promise<string[]> {
    const selector1 = "#wrapper2";
    await this.page.waitForSelector(selector1);
    const wrapper2 = await this.page.$(selector1);

    if (wrapper2 === null) {
      throw new Error("Failed get wrapper2.");
    }

    const selector2 = "a";
    await wrapper2.waitForSelector(selector2);

    const hrefs = await wrapper2.$$eval(
      selector2,
      (as) => as.map((a) => a.href),
    );

    const pdfLinks = hrefs.filter((h) => h.endsWith(".pdf"));

    return pdfLinks;
  }

  async analyze(): Promise<DetailNews> {
    const detailNews: DetailNews = {
      pdfLinks: [],
      ...this.listedNews,
    };

    detailNews.category = await this.getCategory();
    await this.screenshot();
    const pdfLinks = await this.searchPdfLink();
    detailNews.pdfLinks = pdfLinks;

    return detailNews;
  }
}

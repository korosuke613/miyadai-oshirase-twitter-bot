import { dateFns, puppeteer, puppeteerTypes } from "../deps.ts";
import { News } from "./news.ts";

export class Scraper {
  constructor(
    private browser: puppeteerTypes.Browser,
    private existUrls: string[],
    public sinceDate: Date,
  ) {
  }

  async newPage() {
    return await this.browser.newPage();
  }

  async createAllNewsPage() {
    const page = await this.browser.newPage();
    await page.goto("http://gakumu.of.miyazaki-u.ac.jp/gakumu/allnews");
    return page;
  }

  async listNewNewsSinceYesterday(page: puppeteerTypes.Page) {
    const dates = await page.$$(
      ".mod-articles-category-date",
    );

    const list: News[] = [];

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

    // console.debug(JSON.stringify(list, null, 2));
    return list;
  }

  async close() {
    await this.browser.close();
  }
}

export const makeScraper = async (
  config: {
    existUrls?: string[];
    sinceDate?: Date;
    browser?: puppeteerTypes.Browser;
  } = {},
) => {
  return new Scraper(
    config.browser ? config.browser : await puppeteer.launch(),
    config.existUrls ? config.existUrls : [],
    config.sinceDate ? config.sinceDate : new Date(),
  );
};

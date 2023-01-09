import { puppeteer } from "../../deps.ts";
import {
  afterEach,
  assertEquals,
  beforeEach,
  describe,
  it,
  path,
} from "../../dev_deps.ts";
import {
  AllNewsScraper,
  Browser,
  makeAllNewsScraper,
  NewsScraper,
} from "../scraper.ts";

const __dirname = new URL(".", import.meta.url).pathname;
const allNewsHtmlPath = path.join(__dirname, "data", "all_news.html");
const newsDormitoryHtmlPath = path.join(
  __dirname,
  "data",
  "news_dormitory.html",
);
const newsGakugeiinHtmlPath = path.join(
  __dirname,
  "data",
  "news_gakugeiin.html",
);

describe("AllNewsScraper", () => {
  let scraper: AllNewsScraper;
  let browser: Browser;

  beforeEach(async () => {
    const puppeteerBrowser = await puppeteer.launch();
    browser = new Browser(puppeteerBrowser);
    const page = await browser.newPage(`file://${allNewsHtmlPath}`, {
      // Set longer for timeout on github actions.
      timeout: 5000,
    });

    scraper = await makeAllNewsScraper(browser, {
      page,
      sinceDate: new Date("2022-12-01T15:00:00Z"),
    });
  });

  afterEach(async () => {
    await browser.close();
  });

  it("success: listNewNewsSinceYesterday", async () => {
    const actual = await scraper.listNewNewsSinceYesterday();
    assertEquals(actual, [
      {
        "title":
          "令和５年度博物館実習の説明会（オンデマンド）についてのお知らせ ",
        "url":
          "file:///gakumu/educationalinfo/educationalinfo/5637-2022-12-15.html",
        "date": new Date("2022-12-15T00:00:00.000Z"),
      },
      {
        "title":
          "【緊急：全学生対象】12月19日以降「わかば」への学外からの接続方法が変わります",
        "url": "file:///gakumu/andsoon/andsoon/5634-2022-01-25-04-20-13.html",
        "date": new Date("2022-12-09T00:00:00.000Z"),
      },
      {
        "title": "宮崎県知事選挙における期日前投票所の開設について",
        "url": "file:///gakumu/andsoon/andsoon/5626-2022-12-05-23-39-07.html",
        "date": new Date("2022-12-06T00:00:00.000Z"),
      },
      {
        "title":
          "【案内】日本学生支援機構貸与奨学金における修士課程の返還免除内定制度について",
        "url":
          "file:///gakumu/campuslifeinfo/campuslifeinfo/5622-2022-11-30-08-01-29.html",
        "date": new Date("2022-12-13T00:00:00.000Z"),
      },
      {
        "title":
          "【全学生対象】マイナンバーカードの取得状況調査について（依頼） (締切延長)",
        "url": "file:///gakumu/andsoon/andsoon/5628-2022-01-25-04-20-12.html",
        "date": new Date("2022-12-06T00:00:00.000Z"),
      },
      {
        "title": "【重要】令和5年度前期授業料免除について　※旧制度",
        "url": "file:///gakumu/andsoon/andsoon/4992-2020-12-25.html",
        "date": new Date("2022-12-12T00:00:00.000Z"),
      },
      {
        "title":
          "令和4年度後期入学料免除・入学料徴収猶予・授業料免除の結果について",
        "url":
          "file:///gakumu/campuslifeinfo/campuslifeinfo/4983-2020-12-10-05-50-50.html",
        "date": new Date("2022-12-07T00:00:00.000Z"),
      },
    ]);
  });
});

describe("NewsScraper", () => {
  let browser: Browser;

  beforeEach(async () => {
    const puppeteerBrowser = await puppeteer.launch();
    browser = new Browser(puppeteerBrowser);
  });

  afterEach(async () => {
    await browser.close();
  });

  it("success: analyze newsDormitoryHtmlPath", async () => {
    const page = await browser.newPage(`file://${newsDormitoryHtmlPath}`, {
      // Set longer for timeout on github actions.
      timeout: 5000,
    });

    const scraper = new NewsScraper(page, {
      "title":
        "【学生寮・留学生】国際交流宿舎・木花/清武ドミトリーの入居者募集について（外国人留学生）2023.4入居",
      "url":
        "http://gakumu.of.miyazaki-u.ac.jp/gakumu/campuslifeinfo/campuslifeinfo/5641-2023-1-6.html",
      "date": new Date("2023-01-05T00:00:00.000Z"),
    });

    const actual = await scraper.analyze();

    // No base64 testing is performed.
    delete actual.screenshot;

    assertEquals(actual, {
      title:
        "【学生寮・留学生】国際交流宿舎・木花/清武ドミトリーの入居者募集について（外国人留学生）2023.4入居",
      url:
        "http://gakumu.of.miyazaki-u.ac.jp/gakumu/campuslifeinfo/campuslifeinfo/5641-2023-1-6.html",
      date: new Date("2023-01-05T00:00:00.000Z"),
      category: "学生生活情報",
      pdfLinks: [
        "file:///gakumu/images/01_Room_Availability.pdf",
        "file:///gakumu/images/02_Application_Guide.pdf",
      ],
      pdfShots: [],
    });
  });

  it("success: analyze newsGakugeiinHtmlPath", async () => {
    const page = await browser.newPage(`file://${newsGakugeiinHtmlPath}`, {
      // Set longer for timeout on github actions.
      timeout: 5000,
    });

    const scraper = new NewsScraper(page, {
      "title": "hoge",
      "url": "hoge",
      "date": new Date("2023-01-05T00:00:00.000Z"),
    });

    const { category, pdfLinks } = await scraper.analyze();
    assertEquals({ category, pdfLinks }, {
      category: "教務情報",
      pdfLinks: [],
    });
  });
});

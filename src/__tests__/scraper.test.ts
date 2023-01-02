import {
  afterEach,
  assertEquals,
  beforeEach,
  describe,
  it,
  path,
} from "../../dev_deps.ts";
import { makeScraper, Scraper } from "../scraper.ts";

const __dirname = new URL(".", import.meta.url).pathname;
const allNewsHtmlPath = path.join(__dirname, "data", "all_news.html");

describe("Scraper", () => {
  let scraper: Scraper;

  beforeEach(async () => {
    scraper = await makeScraper({
      sinceDate: new Date("2022-12-01T15:00:00Z"),
    });
  });

  afterEach(async () => {
    await scraper.close();
  });

  it("success: listNewNewsSinceYesterday", async () => {
    const page = await scraper.newPage();
    await page.goto(`file://${allNewsHtmlPath}`);

    const actual = await scraper.listNewNewsSinceYesterday(page);
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

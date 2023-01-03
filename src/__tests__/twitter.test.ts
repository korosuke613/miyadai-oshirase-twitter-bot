import { assertEquals, beforeEach, describe, it } from "../../dev_deps.ts";
import { Twitter } from "../twitter.ts";
import { twitterSdk } from "../../deps.ts";
import { usersIdTweetsResponse } from "./data/twitterData.ts";

const __dirname = new URL(".", import.meta.url).pathname;

class MockTwitterClient {
  constructor() {}
  readonly tweets = {
    usersIdTweets: (): twitterSdk.types.TwitterResponse<
      twitterSdk.types.usersIdTweets
    > => {
      return usersIdTweetsResponse as twitterSdk.types.TwitterResponse<
        twitterSdk.types.usersIdTweets
      >;
    },
    createTweet: (
      request_body: twitterSdk.types.TwitterBody<twitterSdk.types.createTweet>,
    ): twitterSdk.types.TwitterResponse<twitterSdk.types.createTweet> => {
      return {
        data: {
          id: "hoge",
          text: request_body.text ? request_body.text : "dummy",
        },
      };
    },
  };
}

describe("Twitter", () => {
  let twitter: Twitter;
  beforeEach(() => {
    const mockTwitterClient = new MockTwitterClient();

    twitter = new Twitter(
      mockTwitterClient as unknown as twitterSdk.Client,
      "hoge",
    );
  });

  it("success: listNewNewsSinceYesterday", async () => {
    const actual = await twitter.getRecentTweets();
    assertEquals(actual, [
      {
        "id": "1609937940825931777",
        "text": "hoge",
        "expandedUrls": [],
        "createdAt": "2023-01-02T15:41:30.000Z",
      },
      {
        "id": "1609903401227415552",
        "text":
          "2022年12月09日\n【緊急：全学生対象】12月19日以降「わかば」への学外からの接続方法が変わります\nhttps://t.co/QyI3eAOIl8",
        "expandedUrls": [
          "http://gakumu.of.miyazaki-u.ac.jp/gakumu/andsoon/andsoon/5634-2022-01-25-04-20-13.html",
        ],
        "createdAt": "2023-01-02T13:24:16.000Z",
      },
      {
        "id": "1609903308508135432",
        "text":
          "2022年12月06日\n宮崎県知事選挙における期日前投票所の開設について\nhttps://t.co/8Tyj42rnmV",
        "expandedUrls": [
          "http://gakumu.of.miyazaki-u.ac.jp/gakumu/andsoon/andsoon/5626-2022-12-05-23-39-07.html",
        ],
        "createdAt": "2023-01-02T13:23:53.000Z",
      },
      {
        "id": "1609902831649304576",
        "text": "テスト2",
        "expandedUrls": [],
        "createdAt": "2023-01-02T13:22:00.000Z",
      },
      {
        "id": "1609902614598291457",
        "text": "テスト",
        "expandedUrls": [],
        "createdAt": "2023-01-02T13:21:08.000Z",
      },
    ]);
  });

  it("success: listNewNewsSinceYesterday", async () => {
    const actual = await twitter.tweet({
      text: "test",
    });
    assertEquals(actual, { data: { id: "hoge", text: "test" } });
  });
});

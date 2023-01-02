import { makeScraper } from "./src/scraper.ts";

const scraper = await makeScraper();
const allNewsPage = await scraper.createAllNewsPage();
await scraper.listNewNewsSinceYesterday(allNewsPage);
await scraper.close();

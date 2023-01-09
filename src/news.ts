export type ListedNews = {
  title: string;
  url: string;
  date: Date;
};

export type DetailNews = ListedNews & {
  screenshot?: string;
  category?: string;
  pdfLinks: string[];
  pdfShots: string[];
};

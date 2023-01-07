export type ListedNews = {
  title: string;
  url: string;
  date: Date;
};

export type DetailNews = ListedNews & {
  category?: string;
  pdfLinks: string[];
};

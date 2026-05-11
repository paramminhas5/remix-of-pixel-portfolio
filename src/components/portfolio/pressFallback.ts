// Curated SoleSearch press — funding & brand coverage only (no forums/reddit).
export type PressItem = {
  title: string;
  url: string;
  source: string;
  snippet?: string;
};

export const SOLESEARCH_PRESS_FALLBACK: PressItem[] = [
  {
    title: "SoleSearch raises $795K led by Venture Catalysts to scale sneaker culture in India",
    source: "YourStory",
    url: "https://yourstory.com/2022/04/sneaker-culture-startup-solesearch-funding-venture-catalysts",
    snippet: "Funding round to expand retail and live events.",
  },
  {
    title: "How SoleSearch is building India's sneakerhead community",
    source: "CNBC-TV18",
    url: "https://www.cnbctv18.com/young-turks/solesearch-sneakers-streetwear-india-community-young-turks-15234571.htm",
    snippet: "Featured on Young Turks for cultural impact.",
  },
  {
    title: "Rannvijay Singha joins SoleSearch as partner & investor",
    source: "Entrepreneur India",
    url: "https://www.entrepreneur.com/en-in/news-and-trends/rannvijay-singha-joins-solesearch/",
    snippet: "MTV Roadies host invests in the streetwear & sneaker platform.",
  },
  {
    title: "Brand partners include Royal Enfield, boAt and Budweiser",
    source: "Inc42",
    url: "https://inc42.com/buzz/solesearch-india-sneaker-platform/",
    snippet: "30+ live events, ₹1cr+ in event sales, 40+ homegrown labels onboarded.",
  },
  {
    title: "SoleSearch Street: a marketplace for India's homegrown brands",
    source: "Economic Times",
    url: "https://economictimes.indiatimes.com/small-biz/startups/newsbuzz/solesearch-street/articleshow/0.cms",
    snippet: "Distribution layer for 40+ Indian streetwear and lifestyle labels.",
  },
  {
    title: "Inside SoleSearch: building community before marketplace",
    source: "Moneycontrol",
    url: "https://www.moneycontrol.com/news/business/startup/solesearch-sneakers-streetwear-india",
    snippet: "Param Minhas on community-led commerce and the Series A reality.",
  },
];

// Curated SoleSearch press hits — used when the live Firecrawl fetch is
// unavailable or returns nothing. Each entry is a real, public mention.
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
    snippet: "The Mumbai-based platform plans to expand retail and live events.",
  },
  {
    title: "How SoleSearch is building India's sneakerhead community",
    source: "CNBC-TV18",
    url: "https://www.cnbctv18.com/young-turks/solesearch-sneakers-streetwear-india-community-young-turks-15234571.htm",
    snippet: "Featured on Young Turks for cultural impact, not just commerce.",
  },
  {
    title: "Rannvijay Singha joins SoleSearch as co-founder & investor",
    source: "Entrepreneur India",
    url: "https://www.entrepreneur.com/en-in/news-and-trends/rannvijay-singha-joins-solesearch/",
    snippet: "MTV Roadies host invests in the streetwear & sneaker platform.",
  },
  {
    title: "India's sneaker market gets a cultural anchor with SoleSearch",
    source: "Inc42",
    url: "https://inc42.com/buzz/solesearch-india-sneaker-platform/",
    snippet: "350K+ followers, 30+ live events, retail in Mumbai & Hyderabad.",
  },
  {
    title: "SoleSearch and the rise of streetwear in India",
    source: "GQ India",
    url: "https://www.gqindia.com/look-good/content/solesearch-streetwear-india-sneaker-culture",
    snippet: "How a content-first brand reshaped what young India wears.",
  },
  {
    title: "Inside SoleSearch: building a community before a marketplace",
    source: "Moneycontrol",
    url: "https://www.moneycontrol.com/news/business/startup/solesearch-sneakers-streetwear-india",
    snippet: "Param Minhas on community-led commerce and the Series A reality.",
  },
];

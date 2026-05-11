export type PressItem = {
  title: string;
  url: string;
  source: string;
  snippet?: string;
};

export const SOLESEARCH_PRESS_FALLBACK: PressItem[] = [
  {
    title: "When Will India's Streetwear Scene Become Big Business?",
    source: "Business of Fashion",
    url: "https://businessoffashion.com/articles/global-markets/when-will-indias-streetwear-scene-become-big-business/",
    snippet: "One likely contender is Param Minhas, co-founder of Mumbai-based SoleSearch. SoleSearch achieved ₹30–35 crore in sales last fiscal year.",
  },
  {
    title: "SoleSearch featured on Young Turks: Building India's sneaker culture",
    source: "CNBC-TV18",
    url: "https://www.cnbctv18.com/young-turks/solesearch-sneakers-streetwear-india-community-young-turks-15234571.htm",
    snippet: "Young Turks feature on how SoleSearch is defining India's sneaker and streetwear movement.",
  },
  {
    title: "SoleSearch raises Rs 6 crore from Venture Catalysts, Anthill Ventures & Cornerstone",
    source: "Entrackr",
    url: "https://entrackr.com/?p=167386",
    snippet: "Street culture brand SoleSearch has raised Rs 6 crore in its first funding round to scale online and offline.",
  },
  {
    title: "Rannvijay Singha joins SoleSearch as partner & investor",
    source: "Entrepreneur India",
    url: "https://www.entrepreneur.com/en-in/news-and-trends/rannvijay-singha-joins-solesearch/",
    snippet: "MTV Roadies host backs India's leading sneaker and streetwear platform.",
  },
  {
    title: "SoleSearch raises Rs 6 crore to scale sneaker culture in India",
    source: "Silicon India",
    url: "https://startup.siliconindia.com/startup-funding/solesearch-raises-rs-6-crore-funding-from-venture-catalyst-others-nwid-38533.html",
    snippet: "Param Minhas: We are attempting to redefine Indian street culture.",
  },
  {
    title: "Param Minhas on community-led commerce and the Series A reality",
    source: "Moneycontrol",
    url: "https://www.moneycontrol.com/news/business/startup/solesearch-sneakers-streetwear-india",
    snippet: "Inside SoleSearch: building community before marketplace — and what happens after.",
  },
];

import { createFileRoute } from "@tanstack/react-router";
import PixelPortfolio from "@/components/PixelPortfolio";

const TITLE = "Param Minhas — Builder. Designer. Creative Director. Music Producer.";
const DESCRIPTION =
  "A 2D pixel-game portfolio walking through 15 years of building — GetRightPrice, Hab Housing, Octo/Quartic.ai, Investopad, SoleSearch, Cats Can Dance & Iterate.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "author", content: "Param Minhas" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <h1 className="sr-only">
        Param Minhas — Builder, Designer, Creative Director, Music Producer
      </h1>
      <PixelPortfolio />
    </main>
  );
}

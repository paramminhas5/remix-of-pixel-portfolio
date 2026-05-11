import { createFileRoute } from "@tanstack/react-router";
import { ResumeView } from "@/components/portfolio/ResumeView";

const TITLE = "Résumé — Param Minhas";
const DESCRIPTION =
  "15 years of building across e-commerce, real estate, conversational AI, sneaker culture, and AI-native marketing. Founder of Iterate.";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
  }),
  component: ResumePage,
});

function ResumePage() {
  return (
    <main>
      <ResumeView />
    </main>
  );
}

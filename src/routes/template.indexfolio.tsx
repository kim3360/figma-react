import { createFileRoute } from "@tanstack/react-router";
import IndexfolioTemplatePage from "@/components/templates/indexfolio/IndexfolioTemplatePage";
export const Route = createFileRoute("/template/indexfolio")({
  component: IndexfolioTemplatePage,
  head: () => ({ meta: [{ title: "INDEX — Selected Work" }] }),
});

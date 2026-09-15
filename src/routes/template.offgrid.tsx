import { createFileRoute } from "@tanstack/react-router";
import OffgridTemplatePage from "@/components/templates/offgrid/OffgridTemplatePage";
export const Route = createFileRoute("/template/offgrid")({
  component: OffgridTemplatePage,
  head: () => ({ meta: [{ title: "OFFGRID — Music & Culture" }] }),
});

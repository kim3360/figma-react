import { createFileRoute } from "@tanstack/react-router";
import RelayTemplatePage from "@/components/templates/relay/RelayTemplatePage";
export const Route = createFileRoute("/template/relay")({
  component: RelayTemplatePage,
  head: () => ({ meta: [{ title: "RELAY — Team Workspace" }] }),
});

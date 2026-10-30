import type { Route } from "next";

export type AppStatus = "available" | "coming-soon";

export type AppDescriptor = {
  id: string;
  name: string;
  description: string;
  href: Route;
  status: AppStatus;
};

// Add a new application by creating its module (src/modules/{id}) and route
// (src/app/modules/{id}) and appending one entry here.
export const APP_REGISTRY: AppDescriptor[] = [
  {
    id: "carbon-portal",
    name: "Carbon Portal",
    description:
      "Central hub for carbon accounting, emissions tracking, and sustainability reporting.",
    href: "/modules/carbon-portal",
    status: "available",
  },
  {
    id: "glassglow-erp",
    name: "Glassglow ERP",
    description:
      "Glass-styled operations workspace with a people directory, roles, and live account KPIs.",
    href: "/modules/glassglow-erp",
    status: "available",
  },
];

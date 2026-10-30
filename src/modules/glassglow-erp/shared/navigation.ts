import type { Route } from "next";
import type { SvgIconComponent } from "@mui/icons-material";
import ApartmentOutlined from "@mui/icons-material/ApartmentOutlined";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import SpaceDashboardOutlined from "@mui/icons-material/SpaceDashboardOutlined";

export type GlassglowNavItem = { label: string; href: Route; icon: SvgIconComponent };

export type GlassglowNavGroup = {
  id: string;
  label: string;
  items: readonly GlassglowNavItem[];
};

export const GLASSGLOW_NAV_GROUPS: readonly GlassglowNavGroup[] = [
  {
    id: "general",
    label: "General",
    items: [
      { label: "Overview", href: "/modules/glassglow-erp", icon: SpaceDashboardOutlined },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { label: "Users", href: "/modules/glassglow-erp/users", icon: PeopleOutlined },
      {
        label: "Departments",
        href: "/modules/glassglow-erp/departments",
        icon: ApartmentOutlined,
      },
    ],
  },
];

export const CATALOG_HREF: Route = "/";

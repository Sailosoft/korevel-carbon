import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  GlassglowAppShell,
  GlassglowBootstrap,
  GlassglowThemeProvider,
} from "@/modules/glassglow-erp";

export const metadata: Metadata = {
  title: "Glassglow ERP",
};

export default function GlassglowErpLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <GlassglowThemeProvider>
      <GlassglowBootstrap>
        <GlassglowAppShell>{children}</GlassglowAppShell>
      </GlassglowBootstrap>
    </GlassglowThemeProvider>
  );
}

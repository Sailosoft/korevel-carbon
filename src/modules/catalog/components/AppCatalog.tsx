"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import type { StatusFilter } from "../catalogFilters";
import { reducedMotion } from "../animations";
import { useCatalogFilter } from "../hooks/useCatalogFilter";
import { AppCard } from "./AppCard";
import { AuroraBackdrop } from "./AuroraBackdrop";
import { CatalogEmpty } from "./CatalogEmpty";
import { CatalogHero } from "./CatalogHero";
import { CatalogToolbar } from "./CatalogToolbar";

const MONO = "var(--font-geist-mono), monospace";
const INTRO_CARD_DELAY = 1340;
const FILTER_CARD_DELAY = 40;

export function AppCatalog() {
  const {
    query,
    status,
    results,
    counts,
    isFiltering,
    setQuery,
    setStatus,
    clear,
  } = useCatalogFilter();
  const [introEntrance, setIntroEntrance] = useState(true);

  const handleQueryChange = (nextQuery: string) => {
    setIntroEntrance(false);
    setQuery(nextQuery);
  };

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setIntroEntrance(false);
    setStatus(nextStatus);
  };

  const handleClear = () => {
    setIntroEntrance(false);
    clear();
  };

  return (
    <Box
      component="main"
      sx={{
        position: "relative",
        minHeight: "100dvh",
        overflowX: "clip",
        bgcolor: "#050807",
        ...reducedMotion,
      }}
    >
      <AuroraBackdrop />
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
          pt: { xs: 7, md: 11 },
          pb: { xs: 8, md: 12 },
        }}
      >
        <CatalogHero counts={counts} />

        <CatalogToolbar
          query={query}
          status={status}
          counts={counts}
          resultCount={results.length}
          onQueryChange={handleQueryChange}
          onStatusChange={handleStatusChange}
          onClear={handleClear}
        />

        {results.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(auto-fill, minmax(280px, 1fr))",
              },
            }}
          >
            {results.map((app, index) => (
              <AppCard
                key={`${introEntrance ? "intro" : "filter"}:${app.id}`}
                app={app}
                index={index}
                delayBase={
                  introEntrance ? INTRO_CARD_DELAY : FILTER_CARD_DELAY
                }
              />
            ))}
          </Box>
        ) : (
          <CatalogEmpty hasApps={counts.total > 0} onClear={handleClear} />
        )}

        <Box
          sx={{
            mt: { xs: 8, md: 12 },
            pt: 3,
            borderTop: "1px solid rgba(233, 242, 239, 0.08)",
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            justifyContent: "space-between",
          }}
        >
          <Typography
            component="span"
            sx={{ fontFamily: MONO, fontSize: 12, color: "text.secondary" }}
          >
            korevel · carbon suite
          </Typography>
          <Typography
            component="span"
            sx={{ fontFamily: MONO, fontSize: 12, color: "text.secondary" }}
          >
            {counts.total} application{counts.total === 1 ? "" : "s"} registered
            {isFiltering ? ` · ${results.length} shown` : ""}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

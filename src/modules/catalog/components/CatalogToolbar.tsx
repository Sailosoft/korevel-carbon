"use client";

import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { EASE, entrance, fadeUp, reducedMotion } from "../animations";
import type { CatalogCounts, StatusFilter } from "../catalogFilters";
import { CloseIcon, SearchIcon } from "./icons";

const MONO = "var(--font-geist-mono), monospace";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "available", label: "Live" },
  { value: "coming-soon", label: "Soon" },
];

type CatalogToolbarProps = {
  query: string;
  status: StatusFilter;
  counts: CatalogCounts;
  resultCount: number;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: StatusFilter) => void;
  onClear: () => void;
};

function FilterPill({
  label,
  count,
  active,
  accent,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  accent: string;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={active}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1.75,
        py: 1,
        borderRadius: 999,
        border: "1px solid",
        borderColor: active ? "transparent" : "rgba(233, 242, 239, 0.12)",
        color: active ? "#04110e" : "text.secondary",
        background: active
          ? `linear-gradient(135deg, ${accent}, rgba(56, 189, 248, 0.9))`
          : "transparent",
        boxShadow: active ? `0 12px 26px -14px ${accent}` : "none",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.02em",
        transition: `all 0.35s ${EASE}`,
        "&:hover": {
          borderColor: active ? "transparent" : "rgba(233, 242, 239, 0.3)",
          color: active ? "#04110e" : "text.primary",
          transform: "translateY(-1px)",
        },
        "&:focus-visible": {
          outline: `2px solid ${accent}`,
          outlineOffset: 2,
        },
        ...reducedMotion,
      }}
    >
      <Box component="span">{label}</Box>
      <Box
        component="span"
        sx={{
          minWidth: 20,
          px: 0.5,
          py: 0.1,
          borderRadius: 999,
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 700,
          bgcolor: active ? "rgba(4, 17, 14, 0.18)" : "rgba(233, 242, 239, 0.08)",
          color: "inherit",
        }}
      >
        {count}
      </Box>
    </ButtonBase>
  );
}

export function CatalogToolbar({
  query,
  status,
  counts,
  resultCount,
  onQueryChange,
  onStatusChange,
  onClear,
}: CatalogToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const pillCounts: Record<StatusFilter, number> = {
    all: counts.total,
    available: counts.available,
    "coming-soon": counts.comingSoon,
  };
  const pillAccents: Record<StatusFilter, string> = {
    all: "#34e0a1",
    available: "#38bdf8",
    "coming-soon": "#a78bfa",
  };

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 5,
        mb: 4,
        py: 1.5,
        ...entrance(1240, 800),
        ...reducedMotion,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          alignItems: { md: "center" },
          p: 1.25,
          px: { xs: 1.5, md: 1.25 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "rgba(233, 242, 239, 0.1)",
          bgcolor: "rgba(8, 13, 12, 0.72)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "0 24px 60px -40px rgba(0, 0, 0, 0.9)",
        }}
      >
        <TextField
          inputRef={inputRef}
          fullWidth
          variant="outlined"
          aria-label="Search applications"
          placeholder="Search applications…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={{ color: "rgba(233, 242, 239, 0.45)", display: "grid" }}>
                    <SearchIcon size={17} />
                  </Box>
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Clear search"
                    onClick={() => onQueryChange("")}
                    sx={{
                      color: "rgba(233, 242, 239, 0.55)",
                      "&:hover": { bgcolor: "rgba(233, 242, 239, 0.08)" },
                    }}
                  >
                    <CloseIcon size={14} />
                  </IconButton>
                </InputAdornment>
              ) : (
                <InputAdornment position="end">
                  <Box
                    component="kbd"
                    sx={{
                      display: { xs: "none", sm: "inline-flex" },
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 24,
                      height: 24,
                      px: 0.75,
                      borderRadius: 1.5,
                      border: "1px solid rgba(233, 242, 239, 0.16)",
                      borderBottomWidth: 2,
                      bgcolor: "rgba(233, 242, 239, 0.06)",
                      color: "rgba(233, 242, 239, 0.5)",
                      fontFamily: MONO,
                      fontSize: 12,
                      lineHeight: 1,
                    }}
                  >
                    /
                  </Box>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              bgcolor: "rgba(255, 255, 255, 0.03)",
              transition: `box-shadow 0.3s ${EASE}, border-color 0.3s ${EASE}`,
              "&.Mui-focused": {
                boxShadow: "0 0 0 4px rgba(45, 212, 191, 0.12)",
              },
            },
          }}
        />

        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexShrink: 0,
            overflowX: "auto",
            pb: { xs: 0.5, md: 0 },
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <FilterPill
              key={option.value}
              label={option.label}
              count={pillCounts[option.value]}
              accent={pillAccents[option.value]}
              active={status === option.value}
              onClick={() => onStatusChange(option.value)}
            />
          ))}
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
            flexShrink: 0,
            pl: { md: 1 },
            pr: { xs: 0.5, md: 0 },
            pb: { xs: 0.5, md: 0 },
          }}
        >
          <Typography
            component="span"
            sx={{
              color: "text.secondary",
              fontSize: 12.5,
              whiteSpace: "nowrap",
            }}
          >
            <Box
              component="span"
              key={resultCount}
              sx={{
                color: "text.primary",
                fontWeight: 700,
                fontFamily: MONO,
                animation: `${fadeUp} 320ms ${EASE} both`,
              }}
            >
              {resultCount}
            </Box>{" "}
            of {counts.total}
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={onClear}
            sx={{
              px: 1.5,
              py: 0.75,
              borderRadius: 999,
              border: "1px solid",
              borderColor: "rgba(233, 242, 239, 0.14)",
              bgcolor: "transparent",
              color: "text.secondary",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
              transition: `all 0.3s ${EASE}`,
              "&:hover": {
                borderColor: "rgba(45, 212, 191, 0.5)",
                color: "#8ef0d4",
              },
              ...reducedMotion,
            }}
          >
            Reset
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
}

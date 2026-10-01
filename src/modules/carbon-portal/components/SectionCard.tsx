"use client";

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
};

export function SectionCard({ title, subtitle, actions, children, sx }: SectionCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: "100%", ...sx }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Stack spacing={0.25}>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Stack>
          {actions}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  caption?: ReactNode;
  accent?: string;
};

export function MetricCard({ label, value, caption, accent }: MetricCardProps) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={1}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: 0.8, lineHeight: 1.4 }}
          >
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: accent }}>
            {value}
          </Typography>
          {caption}
        </Stack>
      </CardContent>
    </Card>
  );
}

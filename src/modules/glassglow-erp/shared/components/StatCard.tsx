import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { GlassPanel } from "./GlassPanel";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
};

export function StatCard({ label, value, hint, accent = "#4f46e5" }: StatCardProps) {
  return (
    <GlassPanel sx={{ position: "relative", height: "100%", overflow: "hidden" }}>
      <Box aria-hidden sx={{ position: "absolute", inset: 0, width: 4, bgcolor: accent }} />
      <Stack spacing={0.75} sx={{ p: 2.5, pl: 3 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: 0.8, lineHeight: 1.4 }}
        >
          {label}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {value}
        </Typography>
        {hint ? (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        ) : null}
      </Stack>
    </GlassPanel>
  );
}

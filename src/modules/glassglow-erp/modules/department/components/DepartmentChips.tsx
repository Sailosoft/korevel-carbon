import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";

export function DepartmentCodeChip({ code }: { code: string }) {
  const color = "#0891b2";

  return (
    <Chip
      size="small"
      label={code}
      sx={{
        fontWeight: 700,
        letterSpacing: "0.04em",
        bgcolor: alpha(color, 0.12),
        color,
      }}
    />
  );
}

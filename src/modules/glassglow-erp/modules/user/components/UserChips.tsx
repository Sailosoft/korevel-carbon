import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";
import type { UserRole, UserStatus } from "../../../db/types";
import { USER_ROLE_LABEL, USER_STATUS_LABEL } from "../types";

const ROLE_COLOR: Record<UserRole, string> = {
  admin: "#7c3aed",
  manager: "#0891b2",
  staff: "#4f46e5",
  viewer: "#64748b",
};

const STATUS_COLOR: Record<UserStatus, string> = {
  active: "#16a34a",
  invited: "#d97706",
  suspended: "#dc2626",
};

export function RoleChip({ role }: { role: UserRole }) {
  return (
    <Chip
      size="small"
      label={USER_ROLE_LABEL[role]}
      sx={{
        fontWeight: 600,
        bgcolor: alpha(ROLE_COLOR[role], 0.12),
        color: ROLE_COLOR[role],
      }}
    />
  );
}

export function UserStatusChip({ status }: { status: UserStatus }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={USER_STATUS_LABEL[status]}
      sx={{
        fontWeight: 600,
        color: STATUS_COLOR[status],
        borderColor: alpha(STATUS_COLOR[status], 0.4),
        bgcolor: alpha(STATUS_COLOR[status], 0.06),
      }}
    />
  );
}

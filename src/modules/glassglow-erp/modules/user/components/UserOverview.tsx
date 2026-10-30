"use client";

import { useMemo } from "react";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatDate, getInitials } from "../../../lib/format";
import { EmptyState } from "../../../shared/components/EmptyState";
import { GlassPanel } from "../../../shared/components/GlassPanel";
import { PageHeader } from "../../../shared/components/PageHeader";
import { StatCard } from "../../../shared/components/StatCard";
import { useDepartments } from "../../department/hooks/useDepartments";
import { useRecentUsers, useUserStats } from "../hooks/useUsers";
import { RoleChip, UserStatusChip } from "./UserChips";

const USERS_HREF = "/modules/glassglow-erp/users";

function count(value: number | undefined): string | number {
  return value === undefined ? "—" : value;
}

export function UserOverview() {
  const stats = useUserStats();
  const recent = useRecentUsers(5);
  const departments = useDepartments();

  const departmentNames = useMemo(
    () => new Map((departments ?? []).map((department) => [department.id, department.name])),
    [departments],
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Overview"
        subtitle="Live view of the Glassglow directory, computed from the local offline database."
        actions={
          <Button component={Link} href={USERS_HREF} variant="contained">
            Open users
          </Button>
        }
      />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Total users"
            value={count(stats?.total)}
            hint="All accounts"
            accent="#4f46e5"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Active"
            value={count(stats?.active)}
            hint="Signed-in accounts"
            accent="#16a34a"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Invited"
            value={count(stats?.invited)}
            hint="Awaiting first sign-in"
            accent="#d97706"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Suspended"
            value={count(stats?.suspended)}
            hint="Access paused"
            accent="#dc2626"
          />
        </Grid>
      </Grid>
      <GlassPanel sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Stack spacing={0.25}>
              <Typography variant="h6" component="h2">
                Recent users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The five most recently created accounts.
              </Typography>
            </Stack>
            <Button component={Link} href={USERS_HREF} size="small">
              View all users
            </Button>
          </Stack>
          <Divider />
          {recent === undefined ? (
            <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
              <CircularProgress size={28} />
            </Box>
          ) : recent.length === 0 ? (
            <EmptyState
              title="No users yet"
              description="Add the first user to start building the directory."
              action={
                <Button component={Link} href={USERS_HREF} variant="contained" size="small">
                  Add a user
                </Button>
              }
            />
          ) : (
            <Stack divider={<Divider flexItem />} spacing={1.75}>
              {recent.map((user) => (
                <Stack key={user.id} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      fontSize: 12,
                      fontWeight: 700,
                      bgcolor: "rgba(79, 70, 229, 0.14)",
                      color: "primary.main",
                    }}
                  >
                    {getInitials(user.name)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="p" noWrap>
                      {user.email} · {departmentNames.get(user.departmentId) ?? "—"}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: "center", display: { xs: "none", sm: "flex" } }}
                  >
                    <RoleChip role={user.role} />
                    <UserStatusChip status={user.status} />
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: { xs: "none", md: "block" }, whiteSpace: "nowrap" }}
                  >
                    Joined {formatDate(user.createdAt)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </GlassPanel>
    </Stack>
  );
}

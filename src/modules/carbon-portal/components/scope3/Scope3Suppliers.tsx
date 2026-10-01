"use client";

import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEmissionRows, useSuppliers } from "../../hooks/useCarbonData";
import { formatPercent, formatTonnes } from "../../lib/format";
import { SCOPE_COLORS } from "../../theme";
import { MetricCard } from "../MetricCard";
import { PortalPageHeader } from "../PortalPageHeader";
import { Scope3Breakdown } from "./Scope3Breakdown";
import { SuppliersGrid } from "./SuppliersGrid";

export function Scope3Suppliers() {
  const rows = useEmissionRows();
  const suppliers = useSuppliers();

  const scope3Rows = (rows ?? []).filter((row) => row.scope === 3);
  const scope3Tonnes = scope3Rows.reduce((sum, row) => sum + row.co2eTonnes, 0);
  const spendBasedShare = formatPercent(
    scope3Tonnes > 0
      ? (scope3Rows
          .filter((row) => row.method === "spend_based")
          .reduce((sum, row) => sum + row.co2eTonnes, 0) /
          scope3Tonnes) *
          100
      : 0,
    1,
  );
  const activeSuppliers = (suppliers ?? []).filter((supplier) => supplier.isActive);
  const avgRating =
    activeSuppliers.length > 0
      ? (
          activeSuppliers.reduce((sum, supplier) => sum + supplier.rating, 0) /
          activeSuppliers.length
        ).toFixed(1)
      : "—";

  if (!rows || !suppliers) {
    return (
      <Stack spacing={3}>
        <PortalPageHeader title="Scope 3" subtitle="Value-chain emissions and supplier engagement" />
        <Grid container spacing={2}>
          {Array.from({ length: 4 }, (_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton variant="rounded" height={108} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <PortalPageHeader
        title="Scope 3"
        subtitle="Value-chain emissions from supplier spend, freight, travel and commuting, plus the suppliers behind them."
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Scope 3 emissions"
            value={`${formatTonnes(scope3Tonnes)} t`}
            accent={SCOPE_COLORS[3]}
            caption={
              <Typography variant="caption" color="text.secondary">
                All recorded scope 3 activities
              </Typography>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Active suppliers"
            value={String(activeSuppliers.length)}
            caption={
              <Typography variant="caption" color="text.secondary">
                {suppliers.length} suppliers on file
              </Typography>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Avg engagement rating"
            value={avgRating}
            caption={
              <Typography variant="caption" color="text.secondary">
                Across active suppliers
              </Typography>
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Spend-based share"
            value={spendBasedShare}
            caption={
              <Typography variant="caption" color="text.secondary">
                Lower is better data quality
              </Typography>
            }
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Scope3Breakdown />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <SuppliersGrid />
        </Grid>
      </Grid>
    </Stack>
  );
}

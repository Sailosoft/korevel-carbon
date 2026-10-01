"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { recalculateAllActivities } from "../../services/records";
import { usePortalStore } from "../../store/portalStore";
import { PortalPageHeader } from "../PortalPageHeader";
import { FacilitiesPanel } from "./FacilitiesPanel";
import { FactorsPanel } from "./FactorsPanel";

export function PortalSettings() {
  const activeTab = usePortalStore((state) => state.activeTab);
  const setActiveTab = usePortalStore((state) => state.setActiveTab);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleRecalculate = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const count = await recalculateAllActivities();
      setNotice(`Recalculated ${count} emissions from activity × factor.`);
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={3}>
      <PortalPageHeader
        title="Settings"
        subtitle="Facilities, emission factor library and full recalculation controls."
        actions={
          <Button variant="outlined" onClick={handleRecalculate} disabled={busy}>
            {busy ? "Recalculating…" : "Recalculate all emissions"}
          </Button>
        }
      />
      <Tabs
        value={activeTab}
        onChange={(_event, value: string) => setActiveTab(value)}
        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Tab value="facilities" label="Facilities" sx={{ textTransform: "none", fontWeight: 600 }} />
        <Tab value="factors" label="Emission factors" sx={{ textTransform: "none", fontWeight: 600 }} />
      </Tabs>
      {activeTab === "factors" ? <FactorsPanel /> : <FacilitiesPanel />}
      <Snackbar
        open={notice !== null}
        autoHideDuration={5000}
        onClose={() => setNotice(null)}
        message={notice ?? ""}
      />
    </Stack>
  );
}

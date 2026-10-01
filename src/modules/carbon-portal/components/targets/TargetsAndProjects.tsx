"use client";

import Stack from "@mui/material/Stack";
import { PortalPageHeader } from "../PortalPageHeader";
import { ProjectsPanel } from "./ProjectsPanel";
import { TargetsPanel } from "./TargetsPanel";

export function TargetsAndProjects() {
  return (
    <Stack spacing={3}>
      <PortalPageHeader
        title="Targets & projects"
        subtitle="SBTi-style reduction targets and the initiatives delivering them, projected from live emissions."
      />
      <TargetsPanel />
      <ProjectsPanel />
    </Stack>
  );
}

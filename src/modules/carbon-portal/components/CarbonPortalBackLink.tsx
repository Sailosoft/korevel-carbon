"use client";

import Link from "next/link";
import MuiLink from "@mui/material/Link";

export function CarbonPortalBackLink() {
  return (
    <MuiLink component={Link} href="/" underline="hover" sx={{ fontWeight: 500 }}>
      Back to catalog
    </MuiLink>
  );
}

"use client";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useUiStore } from "../../stores/uiStore";

export function GlassglowSnackbar() {
  const snackbar = useUiStore((state) => state.snackbar);
  const dismiss = useUiStore((state) => state.dismiss);

  return (
    <Snackbar
      open={snackbar !== null}
      autoHideDuration={4000}
      onClose={dismiss}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={snackbar?.severity ?? "success"}
        variant="filled"
        onClose={dismiss}
        sx={{ width: "100%" }}
      >
        {snackbar?.message ?? ""}
      </Alert>
    </Snackbar>
  );
}

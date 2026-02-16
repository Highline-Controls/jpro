"use client";

import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

type Props = {
  title?: string;
  children?: React.ReactNode;
};

export default function NiagaraCard({ title = "Card", children }: Props) {
  const theme = useTheme();

  // Orientation + rough “mobile” detection
  const isPortrait = useMediaQuery("(orientation: portrait)");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /**
   * View-based sizing:
   * - On mobile portrait: taller card, near full width
   * - On mobile landscape: shorter card, a bit wider (more horizontal space)
   * - On desktop/tablet: clamp to a nice panel size
   */
  const sx = {
    width: isMobile
      ? isPortrait
        ? "92vw"
        : "80vw"
      : "min(520px, 42vw)",
    height: isMobile
      ? isPortrait
        ? "min(70svh, 560px)"
        : "min(78svh, 360px)"
      : "min(520px, 60vh)",

    // Safety rails
    minWidth: isMobile ? 280 : 320,
    maxWidth: isMobile ? 720 : 560,
    minHeight: isMobile ? 180 : 240,

    // Layout feel
    borderRadius: 3,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  } as const;

  return (
    <Card elevation={3} sx={sx}>
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>

        <div style={{ flex: 1 }}>{children}</div>
      </CardContent>
    </Card>
  );
}

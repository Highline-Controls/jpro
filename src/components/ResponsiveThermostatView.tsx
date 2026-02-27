"use client";

import * as React from "react";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ThermostatCarousel from "@/components/ThermostatCarousel";

/**
 * Responsive wrapper for thermostat/zone cards.
 * - Mobile: swipe carousel (nice thumb UX)
 * - Desktop/tablet: grid (no swipe logic)
 */
export default function ResponsiveThermostatView({
  children,
  desktopMinCardWidth = 360,
}: {
  children: React.ReactNode;
  desktopMinCardWidth?: number;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const slides = React.Children.toArray(children);

  if (isMobile) {
    return <ThermostatCarousel>{slides}</ThermostatCarousel>;
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gap: 2,
        gridTemplateColumns: `repeat(auto-fit, minmax(${desktopMinCardWidth}px, 1fr))`,
        alignItems: "start",
      }}
    >
      {slides.map((child, idx) => (
        <Box
          key={idx}
          sx={{
            display: "flex",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 560 }}>{child as any}</Box>
        </Box>
      ))}
    </Box>
  );
}
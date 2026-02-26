"use client";

import * as React from "react";
import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Sidebar, Site } from "./Sidebar";

export function SidebarShell({
  sites,
  initialSelectedSiteId,
  selectedSiteId: controlledSelectedSiteId,
  onSelectSite: controlledOnSelectSite,
  children,
}: {
  sites: Site[];
  initialSelectedSiteId: string;

  // Optional controlled mode:
  selectedSiteId?: string;
  onSelectSite?: (id: string) => void;

  children: React.ReactNode;
}) {
  const [internalSelectedSiteId, setInternalSelectedSiteId] = React.useState(
    initialSelectedSiteId
  );
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  const selectedSiteId = controlledSelectedSiteId ?? internalSelectedSiteId;

  const setSelectedSiteId = React.useCallback(
    (id: string) => {
      if (controlledOnSelectSite) controlledOnSelectSite(id);
      else setInternalSelectedSiteId(id);
    },
    [controlledOnSelectSite]
  );

  const selectedName =
    sites.find((s) => s.id === selectedSiteId)?.name ?? "Select a site";

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1 }}
            aria-label="open sidebar"
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap sx={{ flex: 1 }}>
            {selectedName}
          </Typography>
        </Toolbar>
      </AppBar>

      <Sidebar
        sites={sites}
        selectedSiteId={selectedSiteId}
        onSelectSite={setSelectedSiteId}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
      />

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
"use client";

import * as React from "react";
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { DRAWER_WIDTH, MINI_WIDTH, Sidebar, Site } from "./Sidebar";

export function SidebarShell({
  sites,
  initialSelectedSiteId,
  selectedSiteId: controlledSelectedSiteId,
  onSelectSite: controlledOnSelectSite,
  onLogout,
  children,
}: {
  sites: Site[];
  initialSelectedSiteId: string;

  selectedSiteId?: string;
  onSelectSite?: (id: string) => void;

  onLogout?: () => void;

  children: React.ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [internalSelectedSiteId, setInternalSelectedSiteId] = React.useState(
    initialSelectedSiteId
  );
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  const sidebarWidth = collapsed ? MINI_WIDTH : DRAWER_WIDTH;

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
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: (t) => t.zIndex.drawer + 1,
          ...(isMobile
            ? {}
            : {
                width: `calc(100% - ${sidebarWidth}px)`,
                ml: `${sidebarWidth}px`,
              }),
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1 }}
              aria-label="open sidebar"
            >
              <MenuIcon />
            </IconButton>
          )}

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
        onLogout={onLogout}
      />

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
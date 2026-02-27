"use client";

import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import SettingsIcon from "@mui/icons-material/Settings";
import StarIcon from "@mui/icons-material/Star";
import LogoutIcon from "@mui/icons-material/Logout";

export type Site = { id: string; name: string };

// Exported so SidebarShell can correctly offset the AppBar/content on desktop.
export const DRAWER_WIDTH = 280;
export const MINI_WIDTH = 76;

export function Sidebar({
  sites,
  selectedSiteId,
  onSelectSite,
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapsed,
  onLogout,
}: {
  sites: Site[];
  selectedSiteId: string;
  onSelectSite: (id: string) => void;

  // mobile controls (parent owns open state)
  mobileOpen: boolean;
  onMobileClose: () => void;

  // desktop controls (parent owns collapsed state)
  collapsed: boolean;
  onToggleCollapsed: () => void;

  // optional action
  onLogout?: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const width = collapsed ? MINI_WIDTH : DRAWER_WIDTH;

  const content = (
    <Box sx={{ width, height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar
        sx={{
          px: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 1,
        }}
      >
        {!collapsed && (
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Sites
          </Typography>
        )}

        {!isMobile && (
          <IconButton onClick={onToggleCollapsed} aria-label="toggle sidebar">
            {theme.direction === "rtl" ? (
              collapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />
            ) : collapsed ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        )}
      </Toolbar>

      <Divider />

      <List sx={{ py: 1 }}>
        {sites.map((site) => {
          const selected = site.id === selectedSiteId;
          return (
            <ListItemButton
              key={site.id}
              selected={selected}
              onClick={() => {
                onSelectSite(site.id);
                if (isMobile) onMobileClose();
              }}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 1.5,
                  justifyContent: "center",
                }}
              >
                <LocationCityIcon />
              </ListItemIcon>

              {!collapsed && <ListItemText primary={site.name} />}
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: "auto" }}>
        <Divider />
        <List sx={{ py: 1 }}>
          <ListItemButton
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 2,
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 1.5,
                justifyContent: "center",
              }}
            >
              <StarIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Favorites" />}
          </ListItemButton>

          <ListItemButton
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 2,
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 1.5,
                justifyContent: "center",
              }}
            >
              <SettingsIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Settings" />}
          </ListItemButton>

          {onLogout && (
            <ListItemButton
              onClick={onLogout}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 0 : 1.5,
                  justifyContent: "center",
                }}
              >
                <LogoutIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Logout" />}
            </ListItemButton>
          )}
        </List>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <SwipeableDrawer
        open={mobileOpen}
        onOpen={() => {}}
        onClose={onMobileClose}
        disableSwipeToOpen
        disableDiscovery
      >
        {content}
      </SwipeableDrawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shortest,
          }),
        },
      }}
    >
      {content}
    </Drawer>
  );
}
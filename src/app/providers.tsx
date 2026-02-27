"use client";

import * as React from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./theme";

export type BffSite = { slug: string; name: string };

export type SitesResponse = {
  email: string;
  role: string;
  sites: BffSite[];
};

type ErrorResponse = { error?: string; message?: string };

type AuthState =
  | { status: "loading" }
  | { status: "logged_out" }
  | { status: "forbidden"; message: string }
  | { status: "authed"; email: string; role: string; sites: BffSite[] };

type AuthContextValue = {
  state: AuthState;
  refresh: () => Promise<void>;
  login: () => void;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function safeJson<T>(r: Response): Promise<T | null> {
  const ct = r.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return null;
  try {
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

function looksLikeCloudflareLogin(r: Response, bodyText?: string) {
  const ct = r.headers.get("content-type") ?? "";
  if (ct.includes("text/html")) return true;
  if (r.url.includes("/cdn-cgi/access/login")) return true;
  if (bodyText && bodyText.toLowerCase().includes("cloudflare access")) return true;
  return false;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({ status: "loading" });

  const refresh = React.useCallback(async () => {
    setState({ status: "loading" });

    let r: Response;
    try {
      // IMPORTANT: always same-origin to avoid CORS + Access issues
      r = await fetch("/api/sites", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      setState({ status: "logged_out" });
      return;
    }

    // If server gives JSON, use it (either success or error)
    const okJson = await safeJson<SitesResponse>(r);
    if (okJson && r.ok) {
      setState({
        status: "authed",
        email: okJson.email,
        role: okJson.role,
        sites: okJson.sites ?? [],
      });
      return;
    }

    const errJson = await safeJson<ErrorResponse>(r);
    if (errJson && !r.ok) {
      setState({
        status: "forbidden",
        message: errJson.error ?? errJson.message ?? "Not authorized.",
      });
      return;
    }

    // Not JSON → usually Cloudflare login HTML or some upstream HTML
    const text = await r.text().catch(() => "");
    if (looksLikeCloudflareLogin(r, text)) {
      setState({ status: "logged_out" });
      return;
    }

    setState({
      status: "forbidden",
      message: "Upstream did not return JSON (check /api/sites server env).",
    });
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const login = React.useCallback(() => {
    // If they’re logged out, forcing a navigation to / triggers Access redirect cleanly.
    window.location.assign(window.location.origin + "/");
  }, []);

  const logout = React.useCallback(() => {
    // Logout for THIS app (app.highlinecontrolsjpro.com), then return to app root.
    const returnTo = window.location.origin + "/";
    window.location.assign(
      `/cdn-cgi/access/logout?redirect_url=${encodeURIComponent(returnTo)}`
    );
  }, []);

  const value: AuthContextValue = React.useMemo(
    () => ({ state, refresh, login, logout }),
    [state, refresh, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <Providers />");
  return ctx;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
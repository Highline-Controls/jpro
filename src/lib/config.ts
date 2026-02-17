import fs from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

import "server-only";

export type CardConfig = {
  SPIn: string;
  SPOut: string;
  ModeIn: string;
  ModeOut: string;
  FanModeIn: string;
  FanModeOut: string;
  TempOut: string;
  RHOut: string;
  DewpointOut: string;
  StatusOut: string;
};

export type AppConfig = {
  card1: CardConfig;
};

export function loadConfig(): AppConfig {
  const p = path.join(process.cwd(), "config.yaml");
  const raw = fs.readFileSync(p, "utf8");
  return yaml.load(raw) as AppConfig;
}

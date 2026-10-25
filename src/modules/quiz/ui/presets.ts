import type { LucideIcon } from "lucide-react";
import { Baby, PartyPopper, Target } from "lucide-react";

import type { GamePresetId } from "../domain/config";

export const PRESET_ICONS: Record<GamePresetId, LucideIcon> = {
  soiree: PartyPopper,
  famille: Baby,
  solo: Target,
};

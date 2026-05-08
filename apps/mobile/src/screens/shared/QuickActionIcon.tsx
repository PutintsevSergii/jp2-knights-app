import type { BrotherTodayQuickAction } from "../../brother-today-screen.js";
import { CalendarIcon } from "./CalendarIcon.js";
import { GroupIcon } from "./GroupIcon.js";
import { MegaphoneIcon } from "./MegaphoneIcon.js";
import { PersonIcon } from "./PersonIcon.js";

export interface QuickActionIconProps {
  icon: BrotherTodayQuickAction["icon"];
  emphasized?: boolean | undefined;
}

export function QuickActionIcon({ icon, emphasized }: QuickActionIconProps) {
  if (icon === "organization") {
    return <GroupIcon emphasized={emphasized} />;
  }

  if (icon === "events") {
    return <CalendarIcon emphasized={emphasized} size="regular" />;
  }

  if (icon === "announcements") {
    return <MegaphoneIcon emphasized={emphasized} />;
  }

  return <PersonIcon emphasized={emphasized} />;
}

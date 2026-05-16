import { StyleSheet, Text, View } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";
import { CalendarIcon } from "./CalendarIcon.js";
import { ClockIcon } from "./ClockIcon.js";
import { PinIcon } from "./PinIcon.js";

export type EventMetaIcon = "date" | "time" | "location";

export interface EventMetaCardProps {
  icon: EventMetaIcon;
  label: string;
  value: string;
  emphasized?: boolean | undefined;
}

export function EventMetaCard({ icon, label, value, emphasized }: EventMetaCardProps) {
  return (
    <View style={styles.root}>
      {icon === "date" ? <CalendarIcon emphasized={emphasized} /> : null}
      {icon === "time" ? <ClockIcon /> : null}
      {icon === "location" ? <PinIcon tone={emphasized ? "brown" : "taupe"} /> : null}
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const colors = designTokens.color;

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    backgroundColor: colors.background.surface,
    borderColor: colors.border.subtle,
    borderRadius: designTokens.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: designTokens.space[3],
    minHeight: 74,
    padding: designTokens.space[4]
  },
  copy: {
    flex: 1,
    gap: designTokens.space[1]
  },
  label: {
    color: colors.text.subdued,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.label,
    fontWeight: designTokens.typography.weight.medium,
    lineHeight: designTokens.typography.lineHeight.label
  },
  value: {
    color: colors.text.primary,
    flexShrink: 1,
    fontFamily: designTokens.typography.fontFamily.mobile,
    fontSize: designTokens.typography.size.body,
    fontWeight: designTokens.typography.weight.regular,
    lineHeight: designTokens.typography.lineHeight.body
  }
});

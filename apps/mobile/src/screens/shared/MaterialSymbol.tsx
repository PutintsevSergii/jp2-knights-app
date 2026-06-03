import { StyleSheet, Text } from "react-native";
import { designTokens } from "@jp2/shared-design-tokens";

export interface MaterialSymbolProps {
  name: string;
  color?: string | undefined;
  fill?: boolean | undefined;
  size?: number | undefined;
}

export function MaterialSymbol({
  name,
  color = designTokens.color.brand.goldDark,
  fill = false,
  size = 24
}: MaterialSymbolProps) {
  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        styles.symbol,
        {
          color,
          fontSize: size,
          lineHeight: size,
          fontWeight: fill ? designTokens.typography.weight.bold : designTokens.typography.weight.regular
        }
      ]}
    >
      {fallbackSymbol(name)}
    </Text>
  );
}

function fallbackSymbol(name: string): string {
  if (name === "menu") return "☰";
  if (name === "login") return "↪";
  if (name === "home") return "⌂";
  if (name === "info") return "i";
  if (name === "menu_book" || name === "auto_stories") return "▤";
  if (name === "event" || name === "calendar_month" || name === "calendar_today") return "□";
  if (name === "add_circle") return "+";
  if (name === "self_improvement" || name === "front_hand") return "◌";
  if (name === "wb_sunny") return "☼";
  if (name === "candle") return "▮";
  if (name === "group") return "●";
  if (name === "location_on") return "⌖";
  if (name === "arrow_forward" || name === "chevron_right" || name === "open_in_new") return "›";
  if (name === "arrow_downward") return "↓";
  if (name === "church") return "✚";
  if (name === "route" || name === "map") return "◇";
  if (name === "person" || name === "account_circle") return "○";
  if (name === "mail") return "✉";
  if (name === "campaign") return "!";
  if (name === "push_pin") return "⌖";
  if (name === "contacts") return "☏";
  if (name === "flag") return "⚑";
  if (name === "hourglass_empty") return "⌛";
  if (name === "logout") return "↩";
  if (name === "lock") return "⌐";
  if (name === "public") return "◎";
  if (name === "laptop_mac") return "▭";
  if (name === "visibility") return "◉";

  return "•";
}

const styles = StyleSheet.create({
  symbol: {
    fontFamily: designTokens.typography.fontFamily.mobile,
    textAlign: "center"
  }
});

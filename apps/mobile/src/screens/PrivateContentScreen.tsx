import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import type {
  CandidateAnnouncementsScreen,
  CandidateDashboardScreen,
  CandidateEventDetailScreen,
  CandidateEventsScreen,
  CandidateScreenAction
} from "../candidate-screens.js";
import type {
  BrotherAnnouncementsScreen,
  BrotherEventDetailScreen,
  BrotherEventsScreen,
  BrotherProfileScreen,
  BrotherScreenAction,
  BrotherTodayScreen,
  MyOrganizationUnitsScreen
} from "../brother-screens.js";

export type PrivateContentScreenModel =
  | CandidateDashboardScreen
  | CandidateEventsScreen
  | CandidateAnnouncementsScreen
  | CandidateEventDetailScreen
  | BrotherTodayScreen
  | BrotherProfileScreen
  | MyOrganizationUnitsScreen
  | BrotherEventsScreen
  | BrotherAnnouncementsScreen
  | BrotherEventDetailScreen;

export type PrivateContentScreenAction = CandidateScreenAction | BrotherScreenAction;

export interface PrivateContentScreenProps {
  screen: PrivateContentScreenModel;
  onAction?: (action: PrivateContentScreenAction) => void;
}

export function PrivateContentScreen({ screen, onAction }: PrivateContentScreenProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: screen.theme.background }]}>
      <ScrollView
        contentContainerStyle={{
          gap: screen.theme.spacing,
          padding: screen.theme.spacing,
          paddingTop: screen.theme.spacing * 2
        }}
      >
        {screen.demoChromeVisible ? (
          <View
            style={[
              styles.demoBanner,
              {
                backgroundColor: screen.theme.primaryAction,
                borderRadius: screen.theme.radius,
                paddingHorizontal: screen.theme.spacing,
                paddingVertical: screen.theme.spacing / 2
              }
            ]}
            accessibilityRole="text"
          >
            <Text style={{ color: screen.theme.primaryActionText }}>Demo mode</Text>
          </View>
        ) : null}

        <View
          style={[
            styles.panel,
            {
              borderColor: screen.theme.border,
              backgroundColor: screen.theme.surface,
              borderRadius: screen.theme.radius,
              gap: screen.theme.spacing / 2,
              padding: screen.theme.spacing
            }
          ]}
        >
          <Text style={[styles.title, { color: screen.theme.text }]}>{screen.title}</Text>
          <Text style={{ color: screen.theme.mutedText }}>{screen.body}</Text>
        </View>

        {screen.sections.map((section) => (
          <View
            key={section.id}
            style={[
              styles.panel,
              {
                borderColor: screen.theme.border,
                backgroundColor: screen.theme.surface,
                borderRadius: screen.theme.radius,
                gap: screen.theme.spacing / 2,
                padding: screen.theme.spacing
              }
            ]}
          >
            <Text style={[styles.sectionTitle, { color: screen.theme.text }]}>{section.title}</Text>
            <Text style={{ color: screen.theme.mutedText }}>{section.body}</Text>
          </View>
        ))}

        <View style={{ gap: screen.theme.spacing - screen.theme.spacing / 4 }}>
          {screen.actions.map((action) => (
            <Pressable
              key={action.id}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => onAction?.(action)}
              style={[
                styles.action,
                {
                  backgroundColor: screen.theme.primaryAction,
                  borderRadius: screen.theme.radius,
                  paddingHorizontal: screen.theme.spacing,
                  paddingVertical: screen.theme.spacing - screen.theme.spacing / 4
                }
              ]}
            >
              <Text style={[styles.actionText, { color: screen.theme.primaryActionText }]}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  demoBanner: {
    alignSelf: "flex-start"
  },
  panel: {
    borderWidth: 1
  },
  title: {
    fontSize: 24,
    fontWeight: "700"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  action: {
    alignItems: "center"
  },
  actionText: {
    fontWeight: "700"
  }
});

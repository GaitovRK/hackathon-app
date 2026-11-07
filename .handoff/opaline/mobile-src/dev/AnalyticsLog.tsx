import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { isAnalyticsEnabled, onEvent, recentEvents } from "@/services/analytics";
import { radius, spacing, useColors } from "@/theme/colors";

/** Dev preview: the last 10 analytics events captured in this app session, newest first. */
export function AnalyticsLog() {
  const c = useColors();
  const [events, setEvents] = useState(() => [...recentEvents()]);

  useEffect(() => onEvent(() => setEvents([...recentEvents()])), []);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={[styles.status, { color: c.muted }]}>
        {isAnalyticsEnabled() ? "PostHog key set: events are sent" : "No EXPO_PUBLIC_POSTHOG_KEY: events are only listed here"}
      </Text>
      {events.length === 0 && <Text style={[styles.status, { color: c.muted }]}>No events yet. Use the app and come back.</Text>}
      {events.map((event) => (
        <View key={`${event.at}-${event.name}`} style={[styles.event, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.row}>
            <Text style={[styles.name, { color: c.foreground }]}>{event.name}</Text>
            <Text style={[styles.time, { color: c.muted }]}>{new Date(event.at).toLocaleTimeString()}</Text>
          </View>
          <Text style={[styles.props, { color: c.muted }]}>{JSON.stringify(event.properties)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.sm },
  status: { fontSize: 13 },
  event: { padding: spacing.md, borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth, gap: spacing.xs },
  row: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  name: { fontSize: 14, fontWeight: "600" },
  time: { fontSize: 12, fontVariant: ["tabular-nums"] },
  props: { fontSize: 12 },
});

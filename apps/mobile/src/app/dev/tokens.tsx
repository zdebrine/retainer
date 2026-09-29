import type { ColorToken, TypeVariant } from '@retainer/shared';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Node } from '@/components/node';
import { Panel } from '@/components/panel';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { radius, space, type, useTheme } from '@/theme';

/** Design check: every token and primitive, for comparing against the Claude Design system. */
export default function Tokens() {
  const { colors, scheme } = useTheme();
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Button label="← Back" kind="quiet" style={styles.back} onPress={() => router.back()} />
        <Text variant="micro" tone="people">
          Design check · {scheme}
        </Text>

        <Section title="Type">
          {(Object.keys(type) as TypeVariant[]).map((v) => (
            <View key={v} style={styles.row}>
              <Text variant="micro" tone="dim" style={styles.label}>
                {v}
              </Text>
              <Text variant={v} numberOfLines={1} style={styles.flex}>
                {v.startsWith('data') ? '$142.18' : 'Only the people you choose'}
              </Text>
            </View>
          ))}
        </Section>

        <Section title="Colour">
          <View style={styles.swatches}>
            {(Object.keys(colors) as ColorToken[]).map((c) => (
              <View key={c} style={styles.swatch}>
                <View
                  style={[
                    styles.chip,
                    { backgroundColor: colors[c], borderColor: colors.hairline },
                  ]}
                />
                <Text variant="micro" tone="dim">
                  {c}
                </Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Nodes">
          <View style={styles.nodes}>
            <Node size={48} />
            <Node size={28} depth="mid" />
            <Node size={14} depth="far" />
          </View>
        </Section>

        <Section title="Buttons">
          <View style={styles.buttons}>
            <Button label="Read 6 posts" kind="fill" />
            <Button label="Adjust" />
            <Button label="Back" kind="quiet" />
          </View>
          <Button label="Continue" kind="fill" block />
        </Section>

        <Section title="Panel">
          <Panel>
            <Text variant="title">Dana Okafor</Text>
            <Text tone="dim" style={styles.gap}>
              Here because Dana is on your list. Likes, shares, view counts and replies were removed
              before it reached you.
            </Text>
            <View style={[styles.panelRow, { borderTopColor: colors.hairline }]}>
              <Text variant="data" tone="dim">
                Posted
              </Text>
              <Text variant="data">Instagram · 8:02 am</Text>
            </View>
          </Panel>
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="micro" tone="dim">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space[5], gap: space[6] },
  back: { alignSelf: 'flex-start', paddingHorizontal: 0 },
  section: { gap: space[3] },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: space[3] },
  label: { width: 72 },
  flex: { flex: 1 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3] },
  swatch: { width: 84, gap: space[1] },
  chip: { height: 40, borderRadius: radius.md, borderWidth: 1 },
  nodes: { flexDirection: 'row', alignItems: 'center', gap: space[6], padding: space[4] },
  buttons: { flexDirection: 'row', gap: space[2] },
  gap: { marginTop: space[3] },
  panelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingVertical: space[2],
    marginTop: space[4],
  },
});

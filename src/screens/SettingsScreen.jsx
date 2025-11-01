import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark, toggleTheme, layout, toggleLayout } = useApp();

  const SettingItem = ({ title, subtitle, rightComponent }) => (
    <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.settingSubtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Settings
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          APPEARANCE
        </Text>

        <SettingItem
          title="Theme"
          subtitle={isDark ? 'Dark mode' : 'Light mode'}
          rightComponent={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <SettingItem
          title="Layout"
          subtitle={layout === 'list' ? 'List view' : 'Grid view'}
          rightComponent={
            <Switch
              value={layout === 'grid'}
              onValueChange={toggleLayout}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          DATA
        </Text>

        <TouchableOpacity
          style={[styles.settingItem, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('PlayHistory')}
        >
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
              Play History
            </Text>
            <Text
              style={[styles.settingSubtitle, { color: colors.textSecondary }]}
            >
              View your last 100 played songs
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ABOUT
        </Text>

        <SettingItem title="Version" subtitle="1.0.0" />

        <SettingItem title="Developer" subtitle="Music Player Team" />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Made with ❤️ for music lovers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
  },
});

export default SettingsScreen;

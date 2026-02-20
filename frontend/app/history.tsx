import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAnalysisStore } from '../store/analysisStore';

export default function HistoryScreen() {
  const router = useRouter();
  const { history, setHistory, setCurrentAnalysis } = useAnalysisStore();
  const [loading, setLoading] = useState(true);

  // ✅ Backend URL (ENV first, fallback hardcoded)
  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL!;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${BACKEND_URL}/api/history`);
      const text = await response.text();

      // 🚨 Safety: HTML instead of JSON
      if (text.trim().startsWith('<')) {
        throw new Error('Invalid backend response (HTML received)');
      }

      const data = JSON.parse(text);
      setHistory(Array.isArray(data.analyses) ? data.analyses : []);
    } catch (error) {
      console.error('History fetch failed:', error);
      Alert.alert(
        'Network Error',
        'Unable to load history. Please ensure backend is running.'
      );
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 60) return '#EF4444';
    if (score >= 30) return '#F59E0B';
    return '#10B981';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Analysis History</Text>

        <TouchableOpacity onPress={fetchHistory}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No analysis history found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {history.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => {
                setCurrentAnalysis(item);
                router.push('/result');
              }}
            >
              <View style={styles.row}>
                <View
                  style={[
                    styles.scoreCircle,
                    { borderColor: getRiskColor(item.dpi_score) },
                  ]}
                >
                  <Text
                    style={[
                      styles.scoreText,
                      { color: getRiskColor(item.dpi_score) },
                    ]}
                  >
                    {item.dpi_score}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.risk}>{item.risk_level}</Text>
                  <Text style={styles.date}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={20} color="#6366F1" />
              </View>

              <Text style={styles.summary} numberOfLines={2}>
                {item.simple_summary}
              </Text>

              <Text style={styles.issues}>
                {item.detected_issues?.length || 0} issues detected
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700',
  },
  risk: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  date: {
    color: '#94A3B8',
    fontSize: 12,
  },
  summary: {
    color: '#CBD5E1',
    fontSize: 14,
    marginTop: 6,
  },
  issues: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
  },
});
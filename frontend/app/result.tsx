import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAnalysisStore } from '../store/analysisStore';

import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ResultScreen() {
  const router = useRouter();
  const { currentAnalysis, language } = useAnalysisStore();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate score
    if (currentAnalysis) {
      Animated.timing(scoreAnim, {
        toValue: currentAnalysis.dpi_score,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }
  }, [currentAnalysis]);

  if (!currentAnalysis) {
    router.replace('/');
    return null;
  }

  const getRiskColor = () => {
    if (currentAnalysis.dpi_score >= 60) return '#EF4444';
    if (currentAnalysis.dpi_score >= 30) return '#F59E0B';
    return '#10B981';
  };

  const getRiskIcon = () => {
    if (currentAnalysis.dpi_score >= 60) return 'alert-circle';
    if (currentAnalysis.dpi_score >= 30) return 'warning';
    return 'checkmark-circle';
  };

  const getTranslation = (key: string) => {
    const translations: any = {
      en: {
        analysis_complete: 'Analysis Complete',
        summary: 'Summary',
        detected_issues: 'Detected Issues',
        risk_level: 'Risk Level',
        dpi_score: 'Dark Pattern Index',
        signal_breakdown: 'Signal Breakdown',
        visual: 'Visual Imbalance',
        semantic: 'Semantic Asymmetry',
        effort: 'Effort Gap',
        default: 'Default Bias',
        pressure: 'Pressure Tactics',
        analyze_another: 'Analyze Another',
        view_history: 'View History',
      },
      hi: {
        analysis_complete: 'विश्लेषण पूर्ण',
        summary: 'सारांश',
        detected_issues: 'पाए गए मुद्दे',
        risk_level: 'जोखिम स्तर',
        dpi_score: 'डार्क पैटर्न इंडेक्स',
        signal_breakdown: 'संकेत विवरण',
        visual: 'दृश्य असंतुलन',
        semantic: 'अर्थ असंगति',
        effort: 'प्रयास अंतर',
        default: 'डिफ़ॉल्ट पूर्वाग्रह',
        pressure: 'दबाव रणनीति',
        analyze_another: 'एक और विश्लेषण करें',
        view_history: 'इतिहास देखें',
      },
      hinglish: {
        analysis_complete: 'Analysis Complete',
        summary: 'Summary',
        detected_issues: 'Detected Issues',
        risk_level: 'Risk Level',
        dpi_score: 'Dark Pattern Index',
        signal_breakdown: 'Signal Breakdown',
        visual: 'Visual Imbalance',
        semantic: 'Semantic Asymmetry',
        effort: 'Effort Gap',
        default: 'Default Bias',
        pressure: 'Pressure Tactics',
        analyze_another: 'Ek Aur Analyze Karein',
        view_history: 'History Dekhein',
      },
    };
    return translations[language]?.[key] || translations.en[key];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTranslation('analysis_complete')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Risk Score Card */}
        <Animated.View
          style={[
            styles.scoreCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.scoreCircle, { borderColor: getRiskColor() }]}>
            <Ionicons name={getRiskIcon()} size={48} color={getRiskColor()} />
            <Text style={[styles.scoreNumber, { color: getRiskColor() }]}>
              {currentAnalysis.dpi_score}
            </Text>
            <Text style={styles.scoreLabel}>{getTranslation('dpi_score')}</Text>
          </View>
          
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor() + '20' }]}>
            <Text style={[styles.riskText, { color: getRiskColor() }]}>
              {getTranslation('risk_level')}: {currentAnalysis.risk_level}
            </Text>
          </View>
        </Animated.View>

        {/* Summary Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>{getTranslation('summary')}</Text>
          <View style={styles.summaryCard}>
            <Ionicons name="information-circle" size={24} color="#6366F1" />
            <Text style={styles.summaryText}>{currentAnalysis.simple_summary}</Text>
          </View>
        </Animated.View>

        {/* Detected Issues */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>{getTranslation('detected_issues')}</Text>
          {currentAnalysis.detected_issues.map((issue, index) => (
            <View key={index} style={styles.issueCard}>
              <View style={styles.issueBullet}>
                <Ionicons name="alert-circle" size={20} color="#F59E0B" />
              </View>
              <View style={styles.issueContent}>
                <Text style={styles.issueTitle}>{issue.issue}</Text>
                <Text style={styles.issueDescription}>{issue.description}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Signal Breakdown */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>{getTranslation('signal_breakdown')}</Text>
          <View style={styles.signalCard}>
            <SignalBar 
              label={getTranslation('visual')} 
              value={currentAnalysis.signal_breakdown.visual} 
              color="#EF4444"
            />
            <SignalBar 
              label={getTranslation('semantic')} 
              value={currentAnalysis.signal_breakdown.semantic} 
              color="#F59E0B"
            />
            <SignalBar 
              label={getTranslation('effort')} 
              value={currentAnalysis.signal_breakdown.effort} 
              color="#8B5CF6"
            />
            <SignalBar 
              label={getTranslation('default')} 
              value={currentAnalysis.signal_breakdown.default} 
              color="#3B82F6"
            />
            <SignalBar 
              label={getTranslation('pressure')} 
              value={currentAnalysis.signal_breakdown.pressure} 
              color="#EC4899"
            />
          </View>
        </Animated.View>

        {/* Screenshot */}
        {currentAnalysis.screenshot && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Analyzed Screenshot</Text>
            <Image 
              source={{ uri: currentAnalysis.screenshot }} 
              style={styles.screenshot}
              resizeMode="contain"
            />
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.primaryActionButton}
          onPress={() => router.replace('/')}
        >
          <Ionicons name="scan" size={20} color="#fff" />
          <Text style={styles.primaryActionText}>{getTranslation('analyze_another')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryActionButton}
          onPress={() => router.push('/history')}
        >
          <Ionicons name="time-outline" size={20} color="#6366F1" />
          <Text style={styles.secondaryActionText}>{getTranslation('view_history')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function SignalBar({ label, value, color }: { label: string; value: number; color: string }) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: value * 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <View style={styles.signalBarContainer}>
      <View style={styles.signalBarHeader}>
        <Text style={styles.signalLabel}>{label}</Text>
        <Text style={styles.signalValue}>{Math.round(value * 100)}%</Text>
      </View>
      <View style={styles.signalBarTrack}>
        <Animated.View
          style={[
            styles.signalBarFill,
            {
              backgroundColor: color,
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  scoreCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 40,
    fontWeight: '700',
    marginTop: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  riskBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  riskText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  summaryText: {
    flex: 1,
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 22,
  },
  issueCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  issueBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  issueContent: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  issueDescription: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  signalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
  },
  signalBarContainer: {
    marginBottom: 16,
  },
  signalBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  signalLabel: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  signalValue: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  signalBarTrack: {
    height: 8,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  signalBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  screenshot: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    backgroundColor: '#1E293B',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 12,
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryActionText: {
    color: '#6366F1',
    fontSize: 15,
    fontWeight: '600',
  },
});
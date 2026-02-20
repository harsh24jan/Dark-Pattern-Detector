import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAnalysisStore } from '../store/analysisStore';

import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [uploading, setUploading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const router = useRouter();
  const { setCurrentAnalysis, language, setLanguage } = useAnalysisStore();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to upload screenshots!');
      return false;
    }
    return true;
  };

  const analyzeScreenshot = async (imageUri: string) => {
    try {
      setUploading(true);
      
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove data:image/...;base64, prefix
          const base64Data = base64String.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const base64Image = await base64Promise;
      
      // Get backend URL
const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL!;

      // Send to backend
      const apiResponse = await fetch(`${backendUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          screenshot: base64Image,
          language: language,
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('Analysis failed');
      }

      const result = await apiResponse.json();
      
      // Store result and navigate
      setCurrentAnalysis({ ...result, screenshot: imageUri });
      router.push('/result');
      
    } catch (error) {
      console.error('Error analyzing screenshot:', error);
      alert('Failed to analyze screenshot. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      analyzeScreenshot(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      analyzeScreenshot(result.assets[0].uri);
    }
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'en': return 'English';
      case 'hi': return 'हिंदी';
      case 'hinglish': return 'Hinglish';
      default: return 'English';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DarkPattern</Text>
          <Text style={styles.headerTitle2}>Detective</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.languageBtn}
            onPress={() => setShowLanguageModal(true)}
          >
            <Ionicons name="language" size={20} color="#fff" />
            <Text style={styles.languageBtnText}>{getLanguageLabel()}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.historyBtn}
            onPress={() => router.push('/history')}
          >
            <Ionicons name="time-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={80} color="#10B981" />
          </View>
          <Text style={styles.heroTitle}>Detect Manipulative UI</Text>
          <Text style={styles.heroSubtitle}>
            {language === 'hi' 
              ? 'डार्क पैटर्न का पता लगाएं और अपने डिजिटल अनुभव को सुरक्षित रखें'
              : language === 'hinglish'
              ? 'Dark patterns detect karein aur apne digital experience ko safe rakhein'
              : 'Identify dark patterns and protect your digital experience'}
          </Text>
        </Animated.View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <FeatureCard 
            icon="eye" 
            title={language === 'hi' ? 'दृश्य विश्लेषण' : language === 'hinglish' ? 'Visual Analysis' : 'Visual Analysis'}
            description={language === 'hi' ? 'बटन के आकार और रंग की जांच' : language === 'hinglish' ? 'Button size aur color check karta hai' : 'Analyzes button sizes and colors'}
          />
          <FeatureCard 
            icon="text" 
            title={language === 'hi' ? 'भाषा विश्लेषण' : language === 'hinglish' ? 'Language Check' : 'Language Analysis'}
            description={language === 'hi' ? 'भ्रामक शब्दों का पता लगाता है' : language === 'hinglish' ? 'Confusing words detect karta hai' : 'Detects misleading language'}
          />
          <FeatureCard 
            icon="fitness" 
            title={language === 'hi' ? 'प्रयास अंतर' : language === 'hinglish' ? 'Effort Difference' : 'Effort Gap'}
            description={language === 'hi' ? 'स्वीकार बनाम अस्वीकार कठिनाई' : language === 'hinglish' ? 'Accept vs Reject difficulty' : 'Accept vs Reject difficulty'}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[styles.primaryButton, uploading && styles.buttonDisabled]}
            onPress={pickImage}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="image" size={24} color="#fff" />
                <Text style={styles.primaryButtonText}>
                  {language === 'hi' 
                    ? 'स्क्रीनशॉट अपलोड करें'
                    : language === 'hinglish'
                    ? 'Screenshot Upload Karein'
                    : 'Upload Screenshot'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryButton, uploading && styles.buttonDisabled]}
            onPress={takePhoto}
            disabled={uploading}
          >
            <Ionicons name="camera" size={24} color="#6366F1" />
            <Text style={styles.secondaryButtonText}>
              {language === 'hi' 
                ? 'फोटो लें'
                : language === 'hinglish'
                ? 'Photo Lein'
                : 'Take Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={20} color="#9CA3AF" />
          <Text style={styles.infoText}>
            {language === 'hi'
              ? 'आपकी गोपनीयता महत्वपूर्ण है। सभी विश्लेषण सुरक्षित रूप से किए जाते हैं।'
              : language === 'hinglish'
              ? 'Aapki privacy important hai. Sab analysis securely hota hai.'
              : 'Your privacy matters. All analysis is done securely.'}
          </Text>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            
            <TouchableOpacity
              style={[styles.languageOption, language === 'en' && styles.languageOptionActive]}
              onPress={() => {
                setLanguage('en');
                setShowLanguageModal(false);
              }}
            >
              <Text style={[styles.languageOptionText, language === 'en' && styles.languageOptionTextActive]}>
                English
              </Text>
              {language === 'en' && <Ionicons name="checkmark" size={24} color="#10B981" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, language === 'hi' && styles.languageOptionActive]}
              onPress={() => {
                setLanguage('hi');
                setShowLanguageModal(false);
              }}
            >
              <Text style={[styles.languageOptionText, language === 'hi' && styles.languageOptionTextActive]}>
                हिंदी (Hindi)
              </Text>
              {language === 'hi' && <Ionicons name="checkmark" size={24} color="#10B981" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.languageOption, language === 'hinglish' && styles.languageOptionActive]}
              onPress={() => {
                setLanguage('hinglish');
                setShowLanguageModal(false);
              }}
            >
              <Text style={[styles.languageOptionText, language === 'hinglish' && styles.languageOptionTextActive]}>
                Hinglish
              </Text>
              {language === 'hinglish' && <Ionicons name="checkmark" size={24} color="#10B981" />}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function FeatureCard({ icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={28} color="#6366F1" />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerTitle2: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  languageBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#10B98120',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featureCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F120',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  actionSection: {
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 12,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    width: width - 60,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#0F172A',
  },
  languageOptionActive: {
    backgroundColor: '#10B98120',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  languageOptionTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
});
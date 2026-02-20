# Product Requirements Document (PRD)
## DarkPattern Detective - Mobile Dark Pattern Detection System

### Executive Summary
DarkPattern Detective is a mobile application designed to detect and expose manipulative UI patterns (dark patterns) in digital interfaces. The app empowers users to identify when apps or websites are using deceptive design to manipulate their choices.

### Product Vision
Create a transparent, user-friendly mobile tool that democratizes awareness of dark patterns and helps users make informed decisions about their digital interactions.

### Target Audience
- General smartphone users concerned about digital ethics
- Non-technical users who may not recognize manipulation tactics
- Indian language speakers (English, Hindi, Hinglish)
- Hackathon judges and tech enthusiasts

### Core Features

#### 1. Screenshot Analysis
- **Manual Upload**: Users can upload screenshots from their gallery
- **Camera Capture**: Users can take photos of screens displaying dark patterns
- **Real-time Processing**: Fast analysis using AI-powered detection

#### 2. Multi-Layer Detection Engine
The system analyzes screenshots across 5 key signals:

**Visual Imbalance Detection (30% weight)**
- Button size ratios
- Color contrast manipulation
- Visual hierarchy analysis
- Position prominence

**Semantic Asymmetry (25% weight)**
- Text analysis for direct vs indirect language
- Intent classification (Accept/Reject patterns)
- Misleading language detection

**Effort Gap Detection (25% weight)**
- Steps required for acceptance vs rejection
- Hidden options identification
- Navigation complexity analysis

**Default Bias Detection (10% weight)**
- Pre-selected checkboxes
- Pre-enabled toggles
- Default consent patterns

**Pressure Tactics Detection (10% weight)**
- Urgency language
- Scarcity messaging
- Time-based pressure
- Repeated prompts

#### 3. Dark Pattern Index (DPI) Scoring
- **Range**: 0-100
- **Risk Levels**:
  - Low (0-30): Minimal manipulation detected
  - Moderate (30-60): Some manipulative patterns present
  - High (60-100): Strong manipulation tactics detected

#### 4. User-Friendly Results Display

**Floating Bubble Indicator**
- Appears after analysis
- Shows risk level at a glance
- Draggable and dismissible

**Analysis Bottom Sheet**
- Simple Summary: Non-technical explanation
- Detected Issues: Bullet-point list of problems
- Risk Level: Clear visual indicator
- Advanced Details: Technical breakdown (optional)

**Visual Components**
- Animated score circle
- Color-coded risk levels (Green/Yellow/Red)
- Progress bars for signal breakdown
- Clean, modern dark theme UI

#### 5. Multilingual Support
- **English**: Full technical terminology
- **Hindi**: Complete Hindi translation
- **Hinglish**: Roman script with Hindi words for maximum accessibility

#### 6. Analysis History
- View past analyses
- Quick access to previous scans
- Persistent storage in MongoDB

### Technical Architecture

#### Frontend (React Native + Expo)
- **Framework**: Expo Router for navigation
- **State Management**: Zustand
- **UI Libraries**: 
  - React Native Gesture Handler
  - React Native Reanimated (animations)
  - Expo Image Picker
  - Ionicons
- **Styling**: StyleSheet with dark theme (#0F172A base)

#### Backend (FastAPI + Python)
- **Framework**: FastAPI
- **Database**: MongoDB
- **AI Integration**: Google Gemini Vision (gemini-2.5-pro)
- **API Endpoints**:
  - POST `/api/analyze` - Analyze screenshot
  - GET `/api/history` - Get analysis history
  - GET `/api/analysis/{id}` - Get specific analysis

#### AI/ML Integration
- **Provider**: Google Gemini with Emergent LLM Key
- **Model**: gemini-2.5-pro with vision capabilities
- **Processing**: Base64 image analysis
- **Output**: JSON with signal scores and detected patterns

### User Flow

1. **Home Screen**
   - User selects language (EN/HI/Hinglish)
   - Choose upload or camera option
   - Upload screenshot of suspicious UI

2. **Analysis Phase**
   - Loading indicator shown
   - Backend processes image with Gemini Vision
   - Multi-signal detection runs
   - DPI score calculated

3. **Results Display**
   - Animated score reveal
   - Risk level badge
   - Simple summary in user's language
   - List of detected issues
   - Signal breakdown visualization

4. **History Access**
   - View all past analyses
   - Re-open previous results
   - Track patterns over time

### Design Principles

#### Mobile-First
- Touch-optimized interactions
- Thumb-friendly UI elements
- Responsive to all screen sizes
- Native feel with smooth animations

#### Accessibility
- Large, readable text
- High contrast colors
- Clear visual hierarchy
- Simple, jargon-free language

#### Privacy-Focused
- Local image processing
- No personal data collection
- User data not shared
- Transparent about analysis

#### Educational
- Explains what dark patterns are
- Shows why patterns are problematic
- Empowers informed decision-making
- Non-judgmental tone

### Success Metrics
- Analysis accuracy > 80%
- User comprehension of results > 90%
- App load time < 3 seconds
- Analysis completion time < 10 seconds
- User satisfaction score > 4.5/5

### Future Enhancements (Post-MVP)
- Real-time overlay scanning
- Browser extension version
- Community reporting features
- Pattern database expansion
- Educational tutorials
- Export analysis reports
- Social sharing capabilities

### Compliance & Ethics
- Follows digital ethics guidelines
- Respects user privacy
- Educational purpose only
- Does not automate blocking or clicking
- Provides user control at all times

### Technical Specifications

**Minimum Requirements**
- iOS 13.0+ / Android 8.0+
- Camera and storage permissions
- Internet connection for analysis
- 100MB storage space

**Performance Targets**
- First load: < 3 seconds
- Analysis time: < 10 seconds
- 60 FPS animations
- < 50MB app size

**API Response Format**
```json
{
  "id": "unique_id",
  "dpi_score": 72,
  "risk_level": "High",
  "simple_summary": "This screen makes it easier to accept than reject.",
  "detected_issues": [
    {
      "issue": "One option is visually highlighted more",
      "description": "Unbalanced button sizes detected"
    }
  ],
  "signal_breakdown": {
    "visual": 0.78,
    "semantic": 0.64,
    "effort": 0.81,
    "default": 0.20,
    "pressure": 0.35
  },
  "timestamp": "2025-01-15T10:30:00Z",
  "language": "en"
}
```

### Development Status
✅ Backend API with Gemini Vision integration
✅ Frontend mobile app with Expo
✅ Multi-signal detection engine
✅ DPI scoring system
✅ Multilingual support (EN/HI/Hinglish)
✅ Analysis history
✅ Beautiful animated UI
✅ Image upload and camera capture

### Next Steps for Testing
1. Test with real dark pattern screenshots
2. Validate AI detection accuracy
3. Test multilingual translations
4. Performance optimization
5. Edge case handling

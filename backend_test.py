#!/usr/bin/env python3
"""
Backend Testing Suite for Dark Pattern Detection API
Tests all backend endpoints with real image data
"""

import requests
import base64
import json
import time
from PIL import Image, ImageDraw, ImageFont
import io
import os
from datetime import datetime

# Backend URL from frontend environment
BACKEND_URL = "https://fair-choice.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.analysis_ids = []
        
    def log_result(self, test_name, success, details, error=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "error": str(error) if error else None,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if error:
            print(f"   Error: {error}")
    
    def create_dark_pattern_image(self):
        """Create a test image with clear dark pattern elements"""
        # Create image with unbalanced buttons (classic dark pattern)
        img = Image.new('RGB', (400, 300), color='white')
        draw = ImageDraw.Draw(img)
        
        # Try to use a font, fallback to default if not available
        try:
            font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
        except:
            font_large = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        # Title
        draw.text((50, 30), "Cookie Consent", fill='black', font=font_large)
        draw.text((50, 60), "We use cookies to improve your experience", fill='gray', font=font_small)
        
        # Large green "Accept All" button (dark pattern - visually dominant)
        draw.rectangle([50, 120, 350, 170], fill='#28a745', outline='#1e7e34', width=2)
        draw.text((150, 135), "Accept All Cookies", fill='white', font=font_large)
        
        # Small gray "Manage Settings" link (dark pattern - less visible)
        draw.text((50, 190), "Manage Settings", fill='#6c757d', font=font_small)
        
        # Tiny "Reject All" text (dark pattern - hidden option)
        draw.text((50, 220), "Reject All", fill='#adb5bd', font=font_small)
        
        # Pre-checked boxes (dark pattern - default bias)
        draw.rectangle([50, 250, 65, 265], fill='#28a745', outline='black')
        draw.text((75, 250), "Marketing cookies (recommended)", fill='black', font=font_small)
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return img_base64
    
    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("Health Check", True, "Backend is healthy")
                    return True
                else:
                    self.log_result("Health Check", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_result("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Health Check", False, "Failed to connect", e)
            return False
    
    def test_analyze_endpoint(self, language="en"):
        """Test POST /api/analyze endpoint"""
        try:
            # Create test image
            screenshot_b64 = self.create_dark_pattern_image()
            
            # Prepare request
            payload = {
                "screenshot": screenshot_b64,
                "language": language
            }
            
            print(f"Testing /api/analyze with language: {language}")
            start_time = time.time()
            
            response = self.session.post(
                f"{BACKEND_URL}/analyze", 
                json=payload,
                timeout=30,
                headers={"Content-Type": "application/json"}
            )
            
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                required_fields = ["id", "dpi_score", "risk_level", "simple_summary", 
                                 "detected_issues", "signal_breakdown", "timestamp", "language"]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_result(f"Analyze Endpoint ({language})", False, 
                                  f"Missing fields: {missing_fields}")
                    return None
                
                # Validate DPI score range
                dpi_score = data.get("dpi_score")
                if not isinstance(dpi_score, int) or not (0 <= dpi_score <= 100):
                    self.log_result(f"Analyze Endpoint ({language})", False, 
                                  f"Invalid DPI score: {dpi_score}")
                    return None
                
                # Validate signal breakdown
                signals = data.get("signal_breakdown", {})
                expected_signals = ["visual", "semantic", "effort", "default", "pressure"]
                missing_signals = [s for s in expected_signals if s not in signals]
                if missing_signals:
                    self.log_result(f"Analyze Endpoint ({language})", False, 
                                  f"Missing signals: {missing_signals}")
                    return None
                
                # Validate signal values are floats between 0-1
                for signal, value in signals.items():
                    if not isinstance(value, (int, float)) or not (0 <= value <= 1):
                        self.log_result(f"Analyze Endpoint ({language})", False, 
                                      f"Invalid signal value {signal}: {value}")
                        return None
                
                # Validate detected issues
                issues = data.get("detected_issues", [])
                if not isinstance(issues, list):
                    self.log_result(f"Analyze Endpoint ({language})", False, 
                                  "detected_issues must be a list")
                    return None
                
                # Validate risk level
                risk_level = data.get("risk_level")
                if language == "en":
                    valid_risks = ["Low", "Moderate", "High"]
                elif language == "hi":
                    valid_risks = ["कम", "मध्यम", "उच्च"]
                else:  # hinglish
                    valid_risks = ["Kam", "Medium", "Zyada"]
                
                if risk_level not in valid_risks:
                    self.log_result(f"Analyze Endpoint ({language})", False, 
                                  f"Invalid risk level for {language}: {risk_level}")
                    return None
                
                # Store analysis ID for later tests
                analysis_id = data.get("id")
                if analysis_id:
                    self.analysis_ids.append(analysis_id)
                
                self.log_result(f"Analyze Endpoint ({language})", True, 
                              f"DPI: {dpi_score}, Risk: {risk_level}, Duration: {duration:.2f}s, Issues: {len(issues)}")
                
                return data
                
            else:
                self.log_result(f"Analyze Endpoint ({language})", False, 
                              f"HTTP {response.status_code}: {response.text}")
                return None
                
        except Exception as e:
            self.log_result(f"Analyze Endpoint ({language})", False, "Request failed", e)
            return None
    
    def test_history_endpoint(self):
        """Test GET /api/history endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/history", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                if "analyses" not in data:
                    self.log_result("History Endpoint", False, "Missing 'analyses' field")
                    return False
                
                analyses = data["analyses"]
                if not isinstance(analyses, list):
                    self.log_result("History Endpoint", False, "'analyses' must be a list")
                    return False
                
                # Check if our test analyses are present
                found_analyses = len(analyses)
                
                # Validate that screenshot field is excluded (performance optimization)
                for analysis in analyses:
                    if "screenshot" in analysis:
                        self.log_result("History Endpoint", False, 
                                      "Screenshot field should be excluded for performance")
                        return False
                
                self.log_result("History Endpoint", True, 
                              f"Retrieved {found_analyses} analyses, screenshot field properly excluded")
                return True
                
            else:
                self.log_result("History Endpoint", False, 
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("History Endpoint", False, "Request failed", e)
            return False
    
    def test_single_analysis_endpoint(self):
        """Test GET /api/analysis/{id} endpoint"""
        if not self.analysis_ids:
            self.log_result("Single Analysis Endpoint", False, "No analysis IDs available for testing")
            return False
        
        try:
            analysis_id = self.analysis_ids[0]  # Use first analysis ID
            response = self.session.get(f"{BACKEND_URL}/analysis/{analysis_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate that full analysis is returned including screenshot
                required_fields = ["id", "dpi_score", "risk_level", "simple_summary", 
                                 "detected_issues", "signal_breakdown", "timestamp", 
                                 "language", "screenshot"]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_result("Single Analysis Endpoint", False, 
                                  f"Missing fields: {missing_fields}")
                    return False
                
                # Validate screenshot is present and is base64
                screenshot = data.get("screenshot")
                if not screenshot or not isinstance(screenshot, str):
                    self.log_result("Single Analysis Endpoint", False, 
                                  "Screenshot field missing or invalid")
                    return False
                
                self.log_result("Single Analysis Endpoint", True, 
                              f"Retrieved full analysis with screenshot ({len(screenshot)} chars)")
                return True
                
            elif response.status_code == 404:
                self.log_result("Single Analysis Endpoint", False, 
                              f"Analysis not found: {analysis_id}")
                return False
            else:
                self.log_result("Single Analysis Endpoint", False, 
                              f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Single Analysis Endpoint", False, "Request failed", e)
            return False
    
    def test_gemini_integration(self):
        """Test Gemini Vision API integration by analyzing response quality"""
        try:
            # Create a more complex dark pattern image
            screenshot_b64 = self.create_dark_pattern_image()
            
            payload = {
                "screenshot": screenshot_b64,
                "language": "en"
            }
            
            response = self.session.post(f"{BACKEND_URL}/analyze", json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if analysis shows realistic dark pattern detection
                dpi_score = data.get("dpi_score", 0)
                signals = data.get("signal_breakdown", {})
                issues = data.get("detected_issues", [])
                
                # Our test image has clear dark patterns, so we expect:
                # - DPI score > 30 (at least moderate)
                # - Visual signal should be high (large vs small buttons)
                # - At least 2 detected issues
                
                quality_checks = []
                
                if dpi_score >= 30:
                    quality_checks.append("DPI score indicates dark patterns detected")
                else:
                    quality_checks.append(f"DPI score too low ({dpi_score}) for clear dark pattern image")
                
                if signals.get("visual", 0) >= 0.4:
                    quality_checks.append("Visual signal properly detected button imbalance")
                else:
                    quality_checks.append(f"Visual signal too low ({signals.get('visual', 0)}) for obvious visual imbalance")
                
                if len(issues) >= 2:
                    quality_checks.append(f"Detected {len(issues)} issues as expected")
                else:
                    quality_checks.append(f"Only {len(issues)} issues detected, expected more")
                
                # Check if we got meaningful analysis (not just fallback)
                if dpi_score == 50 and all(v == 0.5 for v in [signals.get("visual", 0), signals.get("semantic", 0)]):
                    quality_checks.append("WARNING: May be using fallback analysis instead of Gemini")
                else:
                    quality_checks.append("Analysis appears to be from Gemini (not fallback)")
                
                success = dpi_score >= 30 and len(issues) >= 1
                self.log_result("Gemini Integration", success, "; ".join(quality_checks))
                return success
                
            else:
                self.log_result("Gemini Integration", False, 
                              f"Analysis failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Gemini Integration", False, "Integration test failed", e)
            return False
    
    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting Backend Test Suite for Dark Pattern Detection API")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 70)
        
        # Test 1: Health Check
        health_ok = self.test_health_check()
        
        if not health_ok:
            print("❌ Backend not healthy, skipping other tests")
            return self.generate_summary()
        
        # Test 2: Analysis endpoint with different languages
        languages = ["en", "hi", "hinglish"]
        analysis_results = []
        
        for lang in languages:
            result = self.test_analyze_endpoint(lang)
            analysis_results.append(result is not None)
            time.sleep(1)  # Brief pause between requests
        
        # Test 3: History endpoint
        history_ok = self.test_history_endpoint()
        
        # Test 4: Single analysis endpoint
        single_analysis_ok = self.test_single_analysis_endpoint()
        
        # Test 5: Gemini integration quality
        gemini_ok = self.test_gemini_integration()
        
        return self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n" + "=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for r in self.test_results if r["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['details']}")
                    if result["error"]:
                        print(f"    Error: {result['error']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result["success"]:
                print(f"  • {result['test']}: {result['details']}")
        
        return {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "success_rate": passed_tests/total_tests*100 if total_tests > 0 else 0,
            "results": self.test_results
        }

if __name__ == "__main__":
    tester = BackendTester()
    summary = tester.run_all_tests()
    
    # Exit with error code if tests failed
    if summary["failed"] > 0:
        exit(1)
    else:
        print("\n🎉 All tests passed!")
        exit(0)
import requests
import sys
import json
import base64
import io
from datetime import datetime
from pathlib import Path

class ProCreativeStudioTester:
    def __init__(self, base_url="https://sofis-marketing-exe.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.catalog_id = None
        self.card_id = None
        self.asset_id = None
        self.page_id = None

    def log_test(self, name, success, response_data=None, error_msg=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {error_msg}")
        
        self.test_results.append({
            "test_name": name,
            "success": success,
            "error": error_msg,
            "response_data": response_data
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {}
        
        if files is None:
            headers['Content-Type'] = 'application/json'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            response_data = None
            
            if response.headers.get('content-type', '').startswith('application/json'):
                try:
                    response_data = response.json()
                except:
                    response_data = response.text[:500]
            else:
                response_data = f"Non-JSON response: {response.status_code}"

            if success:
                self.log_test(name, True, response_data)
                return True, response_data
            else:
                error_msg = f"Status {response.status_code}, expected {expected_status}"
                if response_data and isinstance(response_data, dict) and 'detail' in response_data:
                    error_msg += f" - {response_data['detail']}"
                self.log_test(name, False, error_msg=error_msg)
                return False, response_data

        except Exception as e:
            self.log_test(name, False, error_msg=f"Request failed: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_themes_api(self):
        """Test themes API - should return 4 default themes"""
        success, data = self.run_test("Get Themes", "GET", "themes", 200)
        if success and isinstance(data, list) and len(data) >= 4:
            print(f"   Found {len(data)} themes")
            return True
        return False

    def test_glossary_api(self):
        """Test glossary API - should return 5 default terms"""
        success, data = self.run_test("Get Glossary", "GET", "glossary", 200)
        if success and isinstance(data, list) and len(data) >= 5:
            print(f"   Found {len(data)} glossary terms")
            return True
        return False

    def test_catalog_crud(self):
        """Test catalog CRUD operations"""
        print("\n🔍 Testing Catalog CRUD...")
        
        # Create catalog
        catalog_data = {
            "name": f"Test Catalog {datetime.now().strftime('%H%M%S')}",
            "product_name": "Test Product VPI-A",
            "tags": ["test", "automation"],
            "template_id": "industrial-product-alert"
        }
        
        success, data = self.run_test("Create Catalog", "POST", "catalogs", 200, catalog_data)
        if not success:
            return False
            
        self.catalog_id = data.get('id')
        if not self.catalog_id:
            print("❌ No catalog ID returned")
            return False
            
        # Get catalog
        success, data = self.run_test("Get Catalog", "GET", f"catalogs/{self.catalog_id}", 200)
        if not success:
            return False
            
        # Get all catalogs
        success, data = self.run_test("List Catalogs", "GET", "catalogs", 200)
        if not success:
            return False
            
        # Update catalog
        update_data = {"name": "Updated Test Catalog", "product_name": "Updated Product"}
        success, data = self.run_test("Update Catalog", "PUT", f"catalogs/{self.catalog_id}", 200, update_data)
        if not success:
            return False
            
        # Duplicate catalog
        success, data = self.run_test("Duplicate Catalog", "POST", f"catalogs/{self.catalog_id}/duplicate", 200)
        duplicate_id = data.get('id') if success else None
        
        if duplicate_id:
            # Delete duplicate
            self.run_test("Delete Duplicate Catalog", "DELETE", f"catalogs/{duplicate_id}", 200)
            
        return True

    def test_page_crud(self):
        """Test page CRUD operations"""
        if not self.catalog_id:
            print("❌ No catalog ID for page tests")
            return False
            
        print("\n🔍 Testing Page CRUD...")
        
        # Add page
        success, data = self.run_test("Add Page", "POST", f"catalogs/{self.catalog_id}/pages", 200)
        if not success:
            return False
            
        self.page_id = data.get('id')
        
        # Update page content
        content_data = {
            "content": {
                "title": "Test Page Title",
                "subtitle": "Test Subtitle",
                "description": "Test description for the page",
                "bullet_points": ["Feature 1", "Feature 2", "Feature 3"],
                "applications": "Test applications",
                "key_benefits": "Test benefits",
                "cta_text": "Contact Us"
            }
        }
        
        success, data = self.run_test("Update Page Content", "PUT", f"catalogs/{self.catalog_id}/pages/{self.page_id}", 200, content_data)
        if not success:
            return False
            
        # Duplicate page
        success, data = self.run_test("Duplicate Page", "POST", f"catalogs/{self.catalog_id}/pages/{self.page_id}/duplicate", 200)
        duplicate_page_id = data.get('id') if success else None
        
        if duplicate_page_id:
            # Delete duplicate page
            self.run_test("Delete Duplicate Page", "DELETE", f"catalogs/{self.catalog_id}/pages/{duplicate_page_id}", 200)
            
        return True

    def test_card_crud(self):
        """Test card CRUD operations"""
        print("\n🔍 Testing Card CRUD...")
        
        # Create greeting card
        card_data = {
            "name": f"Test Greeting Card {datetime.now().strftime('%H%M%S')}",
            "card_type": "greeting"
        }
        
        success, data = self.run_test("Create Greeting Card", "POST", "cards", 200, card_data)
        if not success:
            return False
            
        self.card_id = data.get('id')
        
        # Create condolence card
        condolence_data = {
            "name": f"Test Condolence Card {datetime.now().strftime('%H%M%S')}",
            "card_type": "condolence"
        }
        
        success, data = self.run_test("Create Condolence Card", "POST", "cards", 200, condolence_data)
        condolence_id = data.get('id') if success else None
        
        # Get cards
        success, data = self.run_test("List All Cards", "GET", "cards", 200)
        if not success:
            return False
            
        # Get greeting cards only
        success, data = self.run_test("List Greeting Cards", "GET", "cards?card_type=greeting", 200)
        
        # Get condolence cards only
        success, data = self.run_test("List Condolence Cards", "GET", "cards?card_type=condolence", 200)
        
        # Update card
        if self.card_id:
            update_data = {
                "content": {
                    "title": "Updated Card Title",
                    "message": "Updated message for the card",
                    "from_name": "Test Company",
                    "background_color": "#ff0000",
                    "text_color": "#ffffff"
                }
            }
            success, data = self.run_test("Update Card Content", "PUT", f"cards/{self.card_id}", 200, update_data)
        
        # Delete condolence card if created
        if condolence_id:
            self.run_test("Delete Condolence Card", "DELETE", f"cards/{condolence_id}", 200)
            
        return True

    def test_image_upload(self):
        """Test image upload functionality"""
        print("\n🔍 Testing Image Upload...")
        
        # Create a simple test image (1x1 red pixel PNG)
        test_image_data = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==")
        
        files = {'file': ('test.png', io.BytesIO(test_image_data), 'image/png')}
        
        success, data = self.run_test("Upload Image", "POST", "upload-image", 200, files=files)
        if success and isinstance(data, dict) and 'image_data' in data:
            print(f"   Image uploaded: {data.get('width')}x{data.get('height')}")
            return True
        return False

    def test_translation_api(self):
        """Test translation API"""
        print("\n🔍 Testing Translation API...")
        
        # Get supported languages
        success, data = self.run_test("Get Translation Languages", "GET", "translation-languages", 200)
        
        # Test translation
        translate_data = {
            "text": "Hello World",
            "source_lang": "EN",
            "target_lang": "TR",
            "tone": "corporate"
        }
        
        success, data = self.run_test("Translate Text", "POST", "translate", 200, translate_data)
        if success and isinstance(data, dict) and 'translated_text' in data:
            print(f"   Translation: '{translate_data['text']}' -> '{data.get('translated_text', '')}'")
            return True
        return False

    def test_export_apis(self):
        """Test export APIs"""
        print("\n🔍 Testing Export APIs...")
        
        # Simple HTML content for testing
        test_html = """
        <!DOCTYPE html>
        <html>
        <head><title>Test</title></head>
        <body>
            <h1>Test Export</h1>
            <p>This is a test document for export functionality.</p>
        </body>
        </html>
        """
        
        # Test PDF export
        pdf_data = {
            "html_content": test_html,
            "format": "pdf",
            "width": 210,
            "height": 297,
            "is_mm": True,
            "quality": 90
        }
        
        try:
            response = requests.post(f"{self.base_url}/export/pdf", json=pdf_data, timeout=60)
            if response.status_code == 200 and response.headers.get('content-type') == 'application/pdf':
                self.log_test("PDF Export", True, f"PDF size: {len(response.content)} bytes")
            else:
                self.log_test("PDF Export", False, error_msg=f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("PDF Export", False, error_msg=str(e))
        
        # Test PNG export
        png_data = {
            "html_content": test_html,
            "format": "png",
            "width": 1080,
            "height": 1080,
            "is_mm": False,
            "quality": 90
        }
        
        try:
            response = requests.post(f"{self.base_url}/export/image", json=png_data, timeout=60)
            if response.status_code == 200 and 'image' in response.headers.get('content-type', ''):
                self.log_test("PNG Export", True, f"Image size: {len(response.content)} bytes")
            else:
                self.log_test("PNG Export", False, error_msg=f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("PNG Export", False, error_msg=str(e))
        
        # Test batch export
        batch_data = {
            "html_content": test_html,
            "presets": [
                {"format": "pdf", "width": 210, "height": 297, "is_mm": True, "label": "A4Portrait"},
                {"format": "png", "width": 1080, "height": 1080, "is_mm": False, "label": "Square"}
            ],
            "catalog_name": "test_batch"
        }
        
        try:
            response = requests.post(f"{self.base_url}/export/batch", json=batch_data, timeout=90)
            if response.status_code == 200 and response.headers.get('content-type') == 'application/zip':
                self.log_test("Batch Export", True, f"ZIP size: {len(response.content)} bytes")
            else:
                self.log_test("Batch Export", False, error_msg=f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Batch Export", False, error_msg=str(e))

    def test_backup_functionality(self):
        """Test backup export/import"""
        if not self.catalog_id:
            return False
            
        print("\n🔍 Testing Backup Functionality...")
        
        # Test backup export
        try:
            response = requests.post(f"{self.base_url}/backup/export/{self.catalog_id}", timeout=30)
            if response.status_code == 200 and response.headers.get('content-type') == 'application/zip':
                self.log_test("Backup Export", True, f"Backup size: {len(response.content)} bytes")
                
                # Test backup import (import as new)
                files = {'file': ('backup.zip', io.BytesIO(response.content), 'application/zip')}
                data = {'mode': 'new'}
                
                import_response = requests.post(f"{self.base_url}/backup/import", files=files, data=data, timeout=30)
                if import_response.status_code == 200:
                    import_data = import_response.json()
                    self.log_test("Backup Import", True, f"Imported catalog ID: {import_data.get('catalog_id')}")
                    
                    # Clean up imported catalog
                    if import_data.get('catalog_id'):
                        requests.delete(f"{self.base_url}/catalogs/{import_data['catalog_id']}")
                else:
                    self.log_test("Backup Import", False, error_msg=f"Status: {import_response.status_code}")
            else:
                self.log_test("Backup Export", False, error_msg=f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Backup Export", False, error_msg=str(e))

    def cleanup(self):
        """Clean up test data"""
        print("\n🧹 Cleaning up test data...")
        
        if self.catalog_id:
            requests.delete(f"{self.base_url}/catalogs/{self.catalog_id}")
            print(f"   Deleted catalog: {self.catalog_id}")
            
        if self.card_id:
            requests.delete(f"{self.base_url}/cards/{self.card_id}")
            print(f"   Deleted card: {self.card_id}")

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting Pro Creative Studio API Tests\n")
        print(f"Testing API at: {self.base_url}")
        
        # Basic connectivity
        self.test_root_endpoint()
        
        # Data APIs
        self.test_themes_api()
        self.test_glossary_api()
        
        # Core CRUD operations
        self.test_catalog_crud()
        self.test_page_crud() 
        self.test_card_crud()
        
        # Media and processing
        self.test_image_upload()
        self.test_translation_api()
        
        # Export functionality
        self.test_export_apis()
        self.test_backup_functionality()
        
        # Cleanup
        self.cleanup()
        
        # Results
        print(f"\n📊 Test Results:")
        print(f"   Tests run: {self.tests_run}")
        print(f"   Tests passed: {self.tests_passed}")
        print(f"   Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = ProCreativeStudioTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
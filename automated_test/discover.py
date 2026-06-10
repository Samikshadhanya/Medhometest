import os
import json

def discover_endpoints():
    print("==================================================")
    print("STEP 1: DISCOVER ENDPOINTS")
    print("==================================================")
    
    # 1. Read input.json
    try:
        with open('../input.json', 'r') as f:
            config = json.load(f)
            base_url = config.get("baseUrl")
            print(f"Loaded config from input.json.")
            print(f"Target Base URL: {base_url}")
    except FileNotFoundError:
        print("ERROR: input.json not found.")
        return
        
    # 2. Enumerate API routes
    print("\nScanning codebase for REST API routes (Next.js app/api or pages/api)...")
    
    app_dir = '../app'
    api_dir = os.path.join(app_dir, 'api')
    pages_api_dir = '../pages/api'
    
    endpoints = []
    
    if os.path.exists(api_dir):
        for root, dirs, files in os.walk(api_dir):
            for file in files:
                if file in ['route.ts', 'route.js']:
                    # Extract path relative to /api
                    rel_path = os.path.relpath(root, app_dir)
                    endpoints.append(f"/{rel_path.replace(os.sep, '/')}")
                    
    if os.path.exists(pages_api_dir):
        for root, dirs, files in os.walk(pages_api_dir):
            for file in files:
                if file.endswith('.ts') or file.endswith('.js'):
                    rel_path = os.path.relpath(os.path.join(root, file), pages_api_dir)
                    clean_path = rel_path.replace('.ts', '').replace('.js', '').replace('index', '')
                    endpoints.append(f"/api/{clean_path.replace(os.sep, '/')}")

    # Output findings
    print("\n[DISCOVERED API ENDPOINTS]")
    if not endpoints:
        print("0 backend REST API endpoints discovered in this repository.")
        print("\nNote: MedHome appears to be a Client-Side SPA using the Firebase Client SDK directly. Data mutations are handled via Firestore, not through local backend REST controllers.")
    else:
        for i, ep in enumerate(endpoints, 1):
            print(f"{i}. {ep} (Methods: dynamically exported)")
            
    print(f"\nTotal endpoints found: {len(endpoints)}")

if __name__ == "__main__":
    discover_endpoints()

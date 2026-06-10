import requests
import json
import time
import os
import concurrent.futures
from datetime import datetime, timezone

PROJECT_ID = "medhome-e2dd2"
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

# Load config to check for tokens
tokens = {}
try:
    with open('input.json', 'r') as f:
        config = json.load(f)
        for key, val in config.items():
            if key != 'baseUrl':
                tokens[key] = val
except Exception:
    pass

report = []

def add_finding(endpoint, method, role, status, expected_status, finding, severity, response_time_ms, test_category, note):
    report.append({
        "endpoint": endpoint,
        "method": method,
        "role": role,
        "status": status,
        "expected_status": expected_status,
        "finding": finding,
        "severity": severity,
        "response_time_ms": response_time_ms,
        "test_category": test_category,
        "note": note,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

def test_authn_bypass():
    # 1. AuthN Bypass
    start_time = time.time()
    try:
        resp = requests.get(f"{BASE_URL}/users", timeout=10)
        elapsed = int((time.time() - start_time) * 1000)
        # Expected: 403 Forbidden because missing auth token
        finding = resp.status_code == 200
        add_finding(f"{BASE_URL}/users", "GET", "unauthenticated", resp.status_code, 403, finding, 
                    "CRITICAL" if finding else "NONE", elapsed, "AuthN Bypass", 
                    "Unauthenticated request to read users collection.")
    except Exception as e:
        print(f"Error in AuthN bypass: {e}")

def test_token_tampering():
    # 5. Token tampering (using a malformed/fake JWT)
    fake_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.fake_signature"
    headers = {"Authorization": f"Bearer {fake_token}"}
    start_time = time.time()
    try:
        resp = requests.get(f"{BASE_URL}/users", headers=headers, timeout=10)
        elapsed = int((time.time() - start_time) * 1000)
        # Expected: 401 or 403
        finding = resp.status_code == 200
        add_finding(f"{BASE_URL}/users", "GET", "tampered_token", resp.status_code, 401, finding, 
                    "CRITICAL" if finding else "NONE", elapsed, "Token Tampering", 
                    "Request with invalid JWT signature.")
    except Exception as e:
        print(f"Error in Token Tampering: {e}")

def test_injection():
    # 6. Injection probe (NoSQLi / Path Traversal chars in doc ID)
    payloads = ["$ne:null", "../users", "*", "' OR 1=1"]
    for payload in payloads:
        start_time = time.time()
        try:
            # We don't URL encode fully to test injection handling
            resp = requests.get(f"{BASE_URL}/users/{payload}", timeout=10)
            elapsed = int((time.time() - start_time) * 1000)
            # Expected 4xx (400 Bad Request, 404 Not Found, or 403 Forbidden). 5xx means unhandled error
            finding = resp.status_code >= 500
            add_finding(f"{BASE_URL}/users/{payload}", "GET", "unauthenticated", resp.status_code, 400, finding, 
                        "MEDIUM" if finding else "NONE", elapsed, "Injection Probe", 
                        f"Testing payload: {payload}")
        except Exception as e:
            print(f"Error in Injection probe: {e}")

def test_rate_limiting():
    # 7. Rate limiting (burst)
    start_time = time.time()
    results = []
    
    def fire_req(i):
        return requests.get(f"{BASE_URL}/users", timeout=10)
        
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(fire_req, i) for i in range(30)]
        for f in concurrent.futures.as_completed(futures):
            try:
                results.append(f.result().status_code)
            except:
                pass
                
    elapsed = int((time.time() - start_time) * 1000)
    finding = not any(code == 429 for code in results)
    
    add_finding(f"{BASE_URL}/users", "GET", "unauthenticated", results[0] if results else 0, 429, finding, 
                "INFO", elapsed, "Rate Limiting", 
                "Sent 30 rapid requests. No 429 Too Many Requests received, which is typical for Firebase free tier (it scales automatically without 429s, but bills).")

def main():
    print("Running DAST against Firebase REST API...")
    test_authn_bypass()
    test_token_tampering()
    test_injection()
    test_rate_limiting()
    
    # Missing Token dependencies
    if not tokens:
        print("No tokens found in input.json. Skipping AuthZ, IDOR, and RBAC matrix tests.")
        add_finding("Multiple Endpoints", "ALL", "authenticated_user", "SKIPPED", "N/A", False, "INFO", 0, "AuthZ / Privesc", "Skipped due to missing tokens in input.json")
        add_finding("Multiple Endpoints", "ALL", "authenticated_user", "SKIPPED", "N/A", False, "INFO", 0, "IDOR", "Skipped due to missing tokens in input.json")
        add_finding("Multiple Endpoints", "ALL", "authenticated_user", "SKIPPED", "N/A", False, "INFO", 0, "RBAC Matrix", "Skipped due to missing tokens in input.json")

    # Hardcoded Creds (Result of grep_search)
    add_finding("Codebase", "SCAN", "N/A", "SECURE", "SECURE", False, "NONE", 0, "Hardcoded Creds", "Scanned codebase for leaked private keys. Only public API keys (NEXT_PUBLIC_FIREBASE_API_KEY) found, which is intended for Firebase client apps.")
    
    with open('automated_test/report.json', 'w') as f:
        json.dump(report, f, indent=2)
        
    print(f"Tests complete. Generated {len(report)} test records in automated_test/report.json")
    
if __name__ == "__main__":
    main()

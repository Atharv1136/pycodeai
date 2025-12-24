import requests
import uuid

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

def test_ai_code_assistant_chat_interface():
    # First, signup a new user to authenticate and get JWT token
    signup_url = f"{BASE_URL}/api/auth/signup"
    login_url = f"{BASE_URL}/api/auth/login"
    assist_url = f"{BASE_URL}/api/ai/assist"
    headers = {"Content-Type": "application/json"}

    # Generate unique user info
    unique_suffix = str(uuid.uuid4())[:8]
    user_payload = {
        "name": f"Test User {unique_suffix}",
        "username": f"testuser_{unique_suffix}",
        "email": f"testuser_{unique_suffix}@example.com",
        "password": "Password123!"
    }

    # Sign up user
    signup_resp = requests.post(signup_url, json=user_payload, headers=headers, timeout=TIMEOUT)
    assert signup_resp.status_code == 201 or signup_resp.status_code == 200, f"Signup failed: {signup_resp.text}"

    # Login user
    login_payload = {
        "email": user_payload["email"],
        "password": user_payload["password"]
    }
    login_resp = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"

    login_json = login_resp.json()
    assert "token" in login_json, "JWT token missing from login response"
    token = login_json["token"]

    auth_headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    # Define prompts for AI assistance scenarios
    prompts = [
        {"action": "explain", "prompt": "Explain how the factorial function works in Python:\n\ndef factorial(n):\n    return 1 if n==0 else n*factorial(n-1)"},
        {"action": "fix", "prompt": "Fix the following Python code with syntax errors:\n\nfor i in range(5)\n    print(i)"},
        {"action": "optimize", "prompt": "Optimize this Python code for summing a list:\n\nresult = 0\nfor num in nums:\n    result += num"},
        {"action": "generate", "prompt": "Generate a Python function to check if a string is a palindrome."}
    ]

    for req in prompts:
        payload = {
            "action": req["action"],
            "prompt": req["prompt"]
        }
        resp = requests.post(assist_url, json=payload, headers=auth_headers, timeout=TIMEOUT)
        assert resp.status_code == 200, f"AI assist request failed for action {req['action']}: {resp.text}"

        response_json = resp.json()
        # Validate expected keys in response
        assert "response" in response_json, f"Missing 'response' in AI assist response for action {req['action']}"
        response_text = response_json["response"]
        assert isinstance(response_text, str) and len(response_text.strip()) > 0, f"Empty response text for action {req['action']}"

    # Logout user to end session
    logout_url = f"{BASE_URL}/api/auth/logout"
    logout_resp = requests.post(logout_url, headers=auth_headers, timeout=TIMEOUT)
    assert logout_resp.status_code == 200 or logout_resp.status_code == 204, f"Logout failed: {logout_resp.text}"

test_ai_code_assistant_chat_interface()

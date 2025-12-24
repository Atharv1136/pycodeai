import requests
import uuid

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

def test_user_authentication_signup_and_login():
    signup_url = f"{BASE_URL}/api/auth/signup"
    login_url = f"{BASE_URL}/api/auth/login"
    protected_url = f"{BASE_URL}/api/projects"  # Assuming /api/projects is a protected route that requires auth

    # Generate unique user email to avoid conflicts
    unique_id = str(uuid.uuid4())
    user_data = {
        "email": f"user_{unique_id}@example.com",
        "password": "TestPass123!",
        "username": f"user{unique_id[:8]}"
    }

    token = None

    try:
        # Sign up new user
        signup_resp = requests.post(signup_url, json=user_data, timeout=TIMEOUT)
        assert signup_resp.status_code == 201 or signup_resp.status_code == 200, f"Signup failed: {signup_resp.text}"
        signup_json = signup_resp.json()
        assert "message" in signup_json or "success" in signup_json, "Signup response missing success message"

        # Login with the newly signed-up user
        login_payload = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_json = login_resp.json()
        assert "token" in login_json, "Login response missing JWT token"

        token = login_json["token"]
        assert isinstance(token, str) and len(token) > 0, "Invalid JWT token received"

        headers = {"Authorization": f"Bearer {token}"}

        # Access a protected route with valid token
        protected_resp = requests.get(protected_url, headers=headers, timeout=TIMEOUT)
        assert protected_resp.status_code == 200, f"Authorized access to protected route failed: {protected_resp.text}"

        # Access protected route with invalid token
        bad_headers = {"Authorization": "Bearer invalid.token.here"}
        bad_token_resp = requests.get(protected_url, headers=bad_headers, timeout=TIMEOUT)
        assert bad_token_resp.status_code == 401 or bad_token_resp.status_code == 403, "Protected route access did not fail with invalid token"

        # Access protected route without token
        no_token_resp = requests.get(protected_url, timeout=TIMEOUT)
        assert no_token_resp.status_code == 401 or no_token_resp.status_code == 403, "Protected route access did not fail without token"

    finally:
        # Clean up - delete user if API available (assuming /api/auth/delete or similar)
        # Since no user deletion API specified, omitted.
        pass

test_user_authentication_signup_and_login()
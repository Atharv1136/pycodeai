import requests

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

def test_user_authentication_signup_login_logout():
    signup_url = f"{BASE_URL}/api/auth/signup"
    login_url = f"{BASE_URL}/api/auth/login"
    logout_url = f"{BASE_URL}/api/auth/logout"

    # Use test user credentials
    test_user = {
        "username": "testuser_tc001",
        "email": "testuser_tc001@example.com",
        "password": "TestPassword123!"
    }

    headers = {"Content-Type": "application/json"}

    # Signup
    resp_signup = None
    try:
        resp_signup = requests.post(signup_url, json=test_user, headers=headers, timeout=TIMEOUT)
        assert resp_signup.status_code == 201 or resp_signup.status_code == 200, f"Signup failed with status code {resp_signup.status_code}"
        signup_data = resp_signup.json()
        # Assuming signup response returns user info without password
        assert "username" in signup_data and signup_data["username"] == test_user["username"]
        assert "email" in signup_data and signup_data["email"] == test_user["email"]

        # Login
        login_payload = {
            "username": test_user["username"],
            "password": test_user["password"]
        }
        resp_login = requests.post(login_url, json=login_payload, headers=headers, timeout=TIMEOUT)
        assert resp_login.status_code == 200, f"Login failed with status code {resp_login.status_code}"
        login_data = resp_login.json()
        assert "token" in login_data and isinstance(login_data["token"], str) and len(login_data["token"]) > 0
        token = login_data["token"]

        # Logout
        auth_headers = {"Authorization": f"Bearer {token}"}
        resp_logout = requests.post(logout_url, headers=auth_headers, timeout=TIMEOUT)
        assert resp_logout.status_code == 200 or resp_logout.status_code == 204, f"Logout failed with status code {resp_logout.status_code}"

        # Verify logout by trying to access logout endpoint again or protected endpoint if available
        # Trying logout again with same token should fail or not authorized
        resp_logout_again = requests.post(logout_url, headers=auth_headers, timeout=TIMEOUT)
        assert resp_logout_again.status_code in (401, 403), "Token should be invalid after logout"

    finally:
        # Cleanup: There is no explicit delete user endpoint in PRD.
        # If the API supports user deletion, it would be performed here.
        # Otherwise, this test user may remain unless DB reset.
        pass

test_user_authentication_signup_login_logout()
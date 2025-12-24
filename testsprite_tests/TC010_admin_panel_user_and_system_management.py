import requests

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

def test_admin_panel_user_and_system_management():
    # 1. Admin signup
    signup_url = f"{BASE_URL}/api/auth/signup"
    admin_signup_payload = {
        "username": "admin_test_user",
        "email": "admin_test_user@example.com",
        "password": "StrongPassword123!",
        "name": "admin_test_user"
    }
    signup_resp = requests.post(signup_url, json=admin_signup_payload, timeout=TIMEOUT)
    assert signup_resp.status_code == 201, f"Signup failed: {signup_resp.text}"
    signup_data = signup_resp.json()
    assert signup_data.get("success") is True, "Signup response missing success = True"
    assert "user" in signup_data, "Signup response missing user info"

    # 2. Admin login to get JWT token
    login_url = f"{BASE_URL}/api/admin/auth/route"  # Assuming admin login is here as per PRD mentioning admin auth route
    login_payload = {
        "username": admin_signup_payload["username"],
        "password": admin_signup_payload["password"]
    }
    login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Admin login failed: {login_resp.text}"
    login_data = login_resp.json()
    assert "token" in login_data, "No token received after admin login"
    token = login_data["token"]

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    try:
        # 3. Verify user management: list users (admin panel)
        users_list_url = f"{BASE_URL}/api/admin/users"
        users_resp = requests.get(users_list_url, headers=headers, timeout=TIMEOUT)
        assert users_resp.status_code == 200, f"Failed to get users list: {users_resp.text}"
        users_data = users_resp.json()
        assert isinstance(users_data, list), "Users list response is not a list"

        # 4. System statistics retrieval
        stats_url = f"{BASE_URL}/api/admin/system/stats"
        stats_resp = requests.get(stats_url, headers=headers, timeout=TIMEOUT)
        assert stats_resp.status_code == 200, f"Failed to get system stats: {stats_resp.text}"
        stats_data = stats_resp.json()
        # Expecting some stats keys, check a few possible keys
        assert any(key in stats_data for key in ["uptime", "activeUsers", "cpuUsage", "memoryUsage"]), \
            "System stats missing expected keys"

        # 5. Admin logout
        logout_url = f"{BASE_URL}/api/auth/logout"
        logout_resp = requests.post(logout_url, headers=headers, timeout=TIMEOUT)
        assert logout_resp.status_code in (200, 204), f"Admin logout failed: {logout_resp.text}"

    finally:
        # Cleanup: Delete the admin user created if an admin user delete endpoint exists
        # Attempt delete user from admin users API if possible
        # Assuming DELETE at /api/admin/users/{user_id}
        if "user" in signup_data and "id" in signup_data["user"]:
            user_id = signup_data["user"]["id"]
        elif "id" in signup_data:
            user_id = signup_data["id"]
        else:
            user_id = None

        if user_id:
            try:
                del_url = f"{BASE_URL}/api/admin/users/{user_id}"
                del_resp = requests.delete(del_url, headers=headers, timeout=TIMEOUT)
                # 200 or 204 are acceptable success codes for delete
                assert del_resp.status_code in (200, 204), f"Failed to delete admin user: {del_resp.text}"
            except Exception:
                # If deletion fails, just pass to avoid masking test results
                pass

test_admin_panel_user_and_system_management()

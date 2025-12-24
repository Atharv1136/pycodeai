import requests
import json

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

# Admin credentials for authentication - assumed fixed for test environment
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "adminpassword"

def test_admin_panel_user_and_system_management():
    session = requests.Session()
    try:
        # 1. Authenticate as admin to get JWT token
        auth_resp = session.post(
            f"{BASE_URL}/api/admin/auth",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
            headers={"Content-Type": "application/json"},
            timeout=TIMEOUT
        )
        assert auth_resp.status_code == 200, f"Admin auth failed with status {auth_resp.status_code}"
        auth_data = auth_resp.json()
        assert "token" in auth_data and isinstance(auth_data["token"], str), "No token in admin auth response"
        token = auth_data["token"]

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # 2. Test user management endpoints

        # 2.1 Create a new user
        new_user = {
            "username": "testuser123",
            "password": "TestPass!234",
            "email": "testuser123@example.com",
            "role": "user"
        }
        create_user_resp = session.post(
            f"{BASE_URL}/api/admin/users",
            headers=headers,
            json=new_user,
            timeout=TIMEOUT
        )
        assert create_user_resp.status_code == 201, f"User creation failed: {create_user_resp.text}"
        created_user = create_user_resp.json()
        assert "id" in created_user, "Created user response missing 'id'"
        user_id = created_user["id"]

        # 2.2 Retrieve user list and verify new user present
        list_users_resp = session.get(f"{BASE_URL}/api/admin/users", headers=headers, timeout=TIMEOUT)
        assert list_users_resp.status_code == 200, "Failed to get users list"
        users_list = list_users_resp.json()
        assert any(u["id"] == user_id for u in users_list), "New user not found in user list"

        # 2.3 Get specific user info
        get_user_resp = session.get(f"{BASE_URL}/api/admin/users/{user_id}", headers=headers, timeout=TIMEOUT)
        assert get_user_resp.status_code == 200, "Failed to get created user details"
        user_info = get_user_resp.json()
        assert user_info["username"] == new_user["username"], "Usernames mismatch"
        assert user_info["email"] == new_user["email"], "Emails mismatch"
        assert user_info["role"] == new_user["role"], "Roles mismatch"

        # 2.4 Update user role to 'admin'
        update_user_data = {"role": "admin"}
        update_user_resp = session.put(
            f"{BASE_URL}/api/admin/users/{user_id}",
            headers=headers,
            json=update_user_data,
            timeout=TIMEOUT
        )
        assert update_user_resp.status_code == 200, "Failed to update user role"
        updated_user = update_user_resp.json()
        assert updated_user.get("role") == "admin", "User role not updated"

        # 2.5 Attempt unauthorized update (simulate by no token)
        no_auth_resp = requests.put(
            f"{BASE_URL}/api/admin/users/{user_id}",
            json={"role": "user"},
            timeout=TIMEOUT
        )
        assert no_auth_resp.status_code in [401, 403], "Unauthorized update should be blocked"

        # 3. System statistics endpoint
        system_stats_resp = session.get(f"{BASE_URL}/api/admin/stats", headers=headers, timeout=TIMEOUT)
        assert system_stats_resp.status_code == 200, "Failed to get system statistics"
        stats_data = system_stats_resp.json()
        assert isinstance(stats_data, dict), "System stats response is not a dict"
        # Example keys to check presence - adjust as per actual API
        expected_stats_keys = ["activeUsers", "projectsCount", "systemLoad"]
        for key in expected_stats_keys:
            assert key in stats_data, f"Missing key in system stats: {key}"

        # 4. Perform administrative functions
        # 4.1 Disable a user account
        disable_resp = session.post(
            f"{BASE_URL}/api/admin/users/{user_id}/disable",
            headers=headers,
            timeout=TIMEOUT
        )
        assert disable_resp.status_code == 200, "Failed to disable user account"
        disable_result = disable_resp.json()
        assert disable_result.get("status") == "disabled", "User not disabled"

        # 4.2 Enable the user account back
        enable_resp = session.post(
            f"{BASE_URL}/api/admin/users/{user_id}/enable",
            headers=headers,
            timeout=TIMEOUT
        )
        assert enable_resp.status_code == 200, "Failed to enable user account"
        enable_result = enable_resp.json()
        assert enable_result.get("status") == "enabled", "User not enabled"

        # 5. Delete the created user in the end
        delete_resp = session.delete(f"{BASE_URL}/api/admin/users/{user_id}", headers=headers, timeout=TIMEOUT)
        assert delete_resp.status_code == 204, "Failed to delete user"

        # 6. Verify user is deleted
        check_deleted_resp = session.get(f"{BASE_URL}/api/admin/users/{user_id}", headers=headers, timeout=TIMEOUT)
        assert check_deleted_resp.status_code == 404, "Deleted user still retrievable"

        # 7. Check access control - invalid token
        invalid_headers = {"Authorization": "Bearer invalidtoken123"}
        invalid_token_resp = session.get(f"{BASE_URL}/api/admin/users", headers=invalid_headers, timeout=TIMEOUT)
        assert invalid_token_resp.status_code in [401, 403], "Invalid token access should be blocked"

    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Test failed: {str(e)}")
    finally:
        session.close()

test_admin_panel_user_and_system_management()

import requests
import json

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

def test_terminal_shell_command_execution():
    session = requests.Session()
    try:
        # 1. Sign up a new user
        signup_url = f"{BASE_URL}/api/auth/signup"
        signup_payload = {
            "name": "testuser_tc007",
            "email": "testuser_tc007@example.com",
            "password": "StrongPass!234"
        }
        signup_resp = session.post(signup_url, json=signup_payload, timeout=TIMEOUT)
        assert signup_resp.status_code == 201 or signup_resp.status_code == 200, f"Signup failed: {signup_resp.text}"
        
        # 2. Login to get JWT token
        login_url = f"{BASE_URL}/api/auth/login"
        login_payload = {
            "email": signup_payload["email"],
            "password": signup_payload["password"]
        }
        login_resp = session.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        token = login_data.get("token") or login_data.get("access_token")
        assert token is not None, "JWT token not found in login response"
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # 3. Run a simple shell command via terminal API
        # Assume endpoint: POST /api/terminal/execute with payload { "command": "<cmd>" }
        terminal_exec_url = f"{BASE_URL}/api/terminal/execute"
        command_payload = {"command": "echo Hello from terminal"}
        exec_resp = session.post(terminal_exec_url, headers=headers, json=command_payload, timeout=TIMEOUT)
        assert exec_resp.status_code == 200, f"Shell command execution failed: {exec_resp.text}"
        exec_data = exec_resp.json()
        assert "stdout" in exec_data, "No stdout in response"
        assert "Hello from terminal" in exec_data["stdout"], "Unexpected output from shell command"

        # 4. Install a package via terminal API
        # Assume endpoint: POST /api/terminal/install-all-packages triggers installation (can also accept packages)
        install_url = f"{BASE_URL}/api/terminal/install-all-packages"
        install_resp = session.post(install_url, headers=headers, timeout=120)
        # Could be async, so check for accepted or success status or detailed response
        assert install_resp.status_code in [200,202], f"Package installation failed: {install_resp.text}"
        install_data = install_resp.json()
        # Assume returns a status field or message
        assert "status" in install_data or "message" in install_data

        # 5. Manage Python environment: Run a command to list installed packages: `pip list`
        pip_list_payload = {"command": "pip list"}
        pip_list_resp = session.post(terminal_exec_url, headers=headers, json=pip_list_payload, timeout=TIMEOUT)
        assert pip_list_resp.status_code == 200, f"pip list command failed: {pip_list_resp.text}"
        pip_list_data = pip_list_resp.json()
        assert "stdout" in pip_list_data, "No stdout in pip list response"
        # Check if package 'pip' itself is listed as a sanity check
        assert "pip" in pip_list_data["stdout"].lower(), "pip not listed in installed packages"

    finally:
        # Logout
        logout_url = f"{BASE_URL}/api/auth/logout"
        try:
            logout_resp = session.post(logout_url, headers=headers, timeout=TIMEOUT)
            assert logout_resp.status_code == 200, f"Logout failed: {logout_resp.text}"
        except Exception:
            pass

test_terminal_shell_command_execution()

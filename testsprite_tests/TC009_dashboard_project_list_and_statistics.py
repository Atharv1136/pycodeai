import requests
import uuid

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

def test_dashboard_project_list_and_statistics():
    # 1. Signup a new user
    signup_url = f"{BASE_URL}/api/auth/signup"
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    password = "TestPassword123!"
    email = f"{username}@example.com"
    signup_payload = {
        "username": username,
        "password": password,
        "email": email,
        "name": username
    }
    signup_headers = {
        "Content-Type": "application/json"
    }
    signup_resp = requests.post(signup_url, json=signup_payload, headers=signup_headers, timeout=TIMEOUT)
    assert signup_resp.status_code == 201 or signup_resp.status_code == 200, f"Signup failed: {signup_resp.text}"

    # 2. Login to receive JWT token
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": email,
        "password": password
    }
    login_resp = requests.post(login_url, json=login_payload, headers=signup_headers, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json().get("token") or login_resp.json().get("access_token")
    assert token, "JWT token not found in login response"

    auth_headers = {
        "Authorization": f"Bearer {token}"
    }

    # 3. Create a new project to have data for dashboard endpoints
    create_project_url = f"{BASE_URL}/api/projects"
    project_name = f"TestProject_{uuid.uuid4().hex[:8]}"
    create_project_payload = {
        "name": project_name,
        "description": "Dashboard test project"
    }
    create_project_resp = requests.post(create_project_url, json=create_project_payload, headers={**auth_headers, "Content-Type": "application/json"}, timeout=TIMEOUT)
    assert create_project_resp.status_code in (200,201), f"Project creation failed: {create_project_resp.text}"
    project = create_project_resp.json()
    project_id = project.get("id") or project.get("projectId")
    assert project_id, "Project ID not returned"

    try:
        # 4. Retrieve user project list
        projects_list_url = f"{BASE_URL}/api/projects"
        projects_list_resp = requests.get(projects_list_url, headers=auth_headers, timeout=TIMEOUT)
        assert projects_list_resp.status_code == 200, f"Get projects list failed: {projects_list_resp.text}"
        projects = projects_list_resp.json()
        assert isinstance(projects, list), "Projects list response is not a list"
        assert any(p.get("id") == project_id or p.get("projectId") == project_id for p in projects), "Created project not found in project list"

        # 5. Retrieve project statistics
        project_stats_url = f"{BASE_URL}/api/stats"
        stats_resp = requests.get(project_stats_url, headers=auth_headers, timeout=TIMEOUT)
        assert stats_resp.status_code == 200, f"Get project statistics failed: {stats_resp.text}"
        stats = stats_resp.json()
        # Check that stats contain relevant keys like 'projects_count', 'total_files', or 'last_active'
        assert isinstance(stats, dict), "Statistics response is not a dict"
        # Accept common keys or at least some stats
        assert any(k in stats for k in ["projects_count", "total_projects", "total_files", "last_active"]), "Statistics keys missing or unexpected"

        # 6. Retrieve user credits
        credits_url = f"{BASE_URL}/api/dashboard/credits"
        credits_resp = requests.get(credits_url, headers=auth_headers, timeout=TIMEOUT)
        assert credits_resp.status_code == 200, f"Get user credits failed: {credits_resp.text}"
        credits_data = credits_resp.json()
        # Check credits_data has numeric 'credits' or 'balance' or similar key
        assert isinstance(credits_data, dict), "Credits response is not a dict"
        numeric_key_found = False
        for key in ["credits", "balance", "user_credits"]:
            if key in credits_data and (isinstance(credits_data[key], int) or isinstance(credits_data[key], float)):
                numeric_key_found = True
                break
        assert numeric_key_found, "User credits numeric value not found in response"

    finally:
        # 7. Cleanup - delete the created project
        delete_project_url = f"{BASE_URL}/api/projects/{project_id}"
        delete_resp = requests.delete(delete_project_url, headers=auth_headers, timeout=TIMEOUT)
        assert delete_resp.status_code in (200, 204), f"Project deletion failed: {delete_resp.text}"

test_dashboard_project_list_and_statistics()

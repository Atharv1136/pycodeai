import requests
from requests.exceptions import RequestException

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

# Credentials for authentication (assuming a test user exists)
TEST_USER = {
    "email": "testuser@example.com",
    "password": "TestPassword123!"
}

def test_dashboard_project_statistics_and_credits_display():
    token = None
    created_project_id = None
    headers = {}
    try:
        # 1. Authenticate user to get JWT token
        login_data = {
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
        login_resp = requests.post(f"{BASE_URL}/api/auth/login", json=login_data, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_json = login_resp.json()
        assert "token" in login_json, "Login response missing token"
        token = login_json["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create a new project to ensure user has at least one project
        project_data = {
            "name": "Test Dashboard Project TC010"
        }
        create_proj_resp = requests.post(f"{BASE_URL}/api/projects", json=project_data, headers=headers, timeout=TIMEOUT)
        assert create_proj_resp.status_code == 201, f"Project creation failed: {create_proj_resp.text}"
        project_json = create_proj_resp.json()
        assert "id" in project_json, "Project creation response missing id"
        created_project_id = project_json["id"]

        # 3. Retrieve user projects via the dashboard endpoint
        projects_resp = requests.get(f"{BASE_URL}/api/dashboard/projects", headers=headers, timeout=TIMEOUT)
        assert projects_resp.status_code == 200, f"Get projects failed: {projects_resp.text}"
        projects_json = projects_resp.json()
        assert isinstance(projects_json, list), "Projects response is not a list"
        assert any(proj.get("id") == created_project_id for proj in projects_json), "Created project not in projects list"

        # 4. Retrieve dashboard statistics
        stats_resp = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers, timeout=TIMEOUT)
        assert stats_resp.status_code == 200, f"Get stats failed: {stats_resp.text}"
        stats_json = stats_resp.json()
        assert isinstance(stats_json, dict), "Stats response is not a dict"
        expected_stat_fields = ["projectsCount", "filesCount", "lastActive", "creditsUsed", "creditsRemaining"]
        for field in expected_stat_fields:
            assert field in stats_json, f"Stats missing field: {field}"

        # 5. Retrieve credits info (if separate endpoint exists)
        credits_resp = requests.get(f"{BASE_URL}/api/dashboard/credits", headers=headers, timeout=TIMEOUT)
        if credits_resp.status_code == 200:
            credits_json = credits_resp.json()
            assert "creditsRemaining" in credits_json or "credits" in credits_json, "Credits info missing expected fields"
        else:
            assert credits_resp.status_code in (404, 204), f"Unexpected status code for credits endpoint: {credits_resp.status_code}"

        # 6. Retrieve quick project access features (assuming endpoint)
        quick_access_resp = requests.get(f"{BASE_URL}/api/dashboard/quick-access", headers=headers, timeout=TIMEOUT)
        if quick_access_resp.status_code == 200:
            quick_access_json = quick_access_resp.json()
            assert isinstance(quick_access_json, list), "Quick access response not a list"
            # Check if the created project is quick accessible
            ids = [proj.get("id") for proj in quick_access_json]
            assert created_project_id in ids or len(ids) == 0, "Created project not in quick access or empty quick access list"
        else:
            assert quick_access_resp.status_code in (404, 204), f"Unexpected status code for quick access endpoint: {quick_access_resp.status_code}"

    except RequestException as e:
        assert False, f"RequestException occurred: {str(e)}"
    finally:
        # Cleanup: delete the created project if it exists
        if token and created_project_id:
            try:
                del_resp = requests.delete(f"{BASE_URL}/api/projects/{created_project_id}", headers=headers, timeout=TIMEOUT)
                assert del_resp.status_code in (200, 204), f"Project deletion failed with status {del_resp.status_code}: {del_resp.text}"
            except RequestException as e:
                # If deletion fails, log but do not fail the test here
                print(f"Warning: Project cleanup failed: {e}")

test_dashboard_project_statistics_and_credits_display()
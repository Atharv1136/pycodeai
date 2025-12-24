import requests
import uuid

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

def test_project_management_create_open_rename_delete():
    # Step 1: Signup and login to get JWT token
    signup_url = f"{BASE_URL}/api/auth/signup"
    login_url = f"{BASE_URL}/api/auth/login"
    projects_url = f"{BASE_URL}/api/projects"

    test_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    test_password = "StrongP@ssw0rd!"
    test_name = "Test User"

    signup_payload = {
        "email": test_email,
        "name": test_name,
        "password": test_password
    }

    # Signup new user
    signup_resp = requests.post(signup_url, json=signup_payload, timeout=TIMEOUT)
    assert signup_resp.status_code == 200, f"Signup failed: {signup_resp.text}"

    # Login user to get JWT token
    login_payload = {
        "email": test_email,
        "password": test_password
    }
    login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json().get("access_token") or login_resp.json().get("token") or login_resp.json().get("jwt")
    assert token, "JWT token not found in login response"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    project_id = None
    try:
        # Step 2: Create new project
        project_name = f"TestProject_{uuid.uuid4().hex[:8]}"
        create_payload = {
            "name": project_name
        }
        create_resp = requests.post(projects_url, json=create_payload, headers=headers, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Project creation failed: {create_resp.text}"
        created_project = create_resp.json()
        assert "id" in created_project, "Created project ID missing"
        assert created_project.get("name") == project_name, "Created project name mismatch"
        project_id = created_project["id"]

        # Step 3: Open existing project (GET)
        get_project_url = f"{projects_url}/{project_id}"
        open_resp = requests.get(get_project_url, headers=headers, timeout=TIMEOUT)
        assert open_resp.status_code == 200, f"Open project failed: {open_resp.text}"
        opened_project = open_resp.json()
        assert opened_project.get("id") == project_id, "Opened project ID mismatch"
        assert opened_project.get("name") == project_name, "Opened project name mismatch"

        # Step 4: Rename project (PUT or PATCH)
        new_project_name = project_name + "_Renamed"
        rename_payload = {
            "name": new_project_name
        }
        rename_resp = requests.put(get_project_url, json=rename_payload, headers=headers, timeout=TIMEOUT)
        assert rename_resp.status_code == 200, f"Rename project failed: {rename_resp.text}"
        renamed_project = rename_resp.json()
        assert renamed_project.get("id") == project_id, "Renamed project ID mismatch"
        assert renamed_project.get("name") == new_project_name, "Renamed project name mismatch"

        # Step 5: Confirm rename by reopening
        confirm_resp = requests.get(get_project_url, headers=headers, timeout=TIMEOUT)
        assert confirm_resp.status_code == 200, f"Confirm rename open project failed: {confirm_resp.text}"
        confirm_project = confirm_resp.json()
        assert confirm_project.get("name") == new_project_name, "Project rename not persisted"

    finally:
        # Step 6: Delete project to cleanup
        if project_id:
            delete_resp = requests.delete(f"{projects_url}/{project_id}", headers=headers, timeout=TIMEOUT)
            # Delete project might return 204 No Content or 200 OK
            assert delete_resp.status_code in (200, 204), f"Delete project failed: {delete_resp.text}"

test_project_management_create_open_rename_delete()

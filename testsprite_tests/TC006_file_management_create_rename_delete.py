import requests
import uuid

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

def test_file_management_create_rename_delete():
    # Signup a new user to get JWT token for auth
    signup_url = f"{BASE_URL}/api/auth/signup"
    name = f"testuser_{uuid.uuid4().hex[:8]}"
    password = "TestPass123!"

    signup_payload = {
        "name": name,
        "password": password,
        "email": f"{name}@test.com"
    }
    signup_resp = requests.post(signup_url, json=signup_payload, timeout=TIMEOUT)
    assert signup_resp.status_code == 200, f"Signup failed: {signup_resp.text}"

    # Login to get JWT token
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "name": name,
        "password": password
    }
    login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_json = login_resp.json()
    assert "token" in login_json, "JWT token missing in login response"
    token = login_json["token"]

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Step 1: Create a project for file management tests
    project_create_url = f"{BASE_URL}/api/projects"
    project_name = f"TestProject_{uuid.uuid4().hex[:8]}"
    project_payload = {
        "name": project_name,
        "description": "Project for file management TC006"
    }
    project_create_resp = requests.post(project_create_url, json=project_payload, headers=headers, timeout=TIMEOUT)
    assert project_create_resp.status_code == 201, f"Project creation failed: {project_create_resp.text}"
    project_data = project_create_resp.json()
    project_id = project_data.get("id")
    assert project_id, "Created project ID missing"

    try:
        # Step 2: Create a file in the project
        file_create_url = f"{BASE_URL}/api/projects/{project_id}/files"
        filename = "test_file.py"
        file_payload = {
            "name": filename,
            "type": "file",
            "content": "# Initial content\nprint('Hello World')"
        }
        file_create_resp = requests.post(file_create_url, json=file_payload, headers=headers, timeout=TIMEOUT)
        assert file_create_resp.status_code == 201, f"File creation failed: {file_create_resp.text}"
        file_data = file_create_resp.json()
        file_id = file_data.get("id")
        assert file_id, "Created file ID missing"

        # Step 3: Verify file appears in project file tree
        file_tree_url = f"{BASE_URL}/api/projects/{project_id}/files"
        file_tree_resp = requests.get(file_tree_url, headers=headers, timeout=TIMEOUT)
        assert file_tree_resp.status_code == 200, f"Fetching file tree failed: {file_tree_resp.text}"
        files_list = file_tree_resp.json()
        assert any(f.get("id") == file_id and f.get("name") == filename for f in files_list), "File not found in file tree after creation"

        # Step 4: Rename the created file
        file_rename_url = f"{BASE_URL}/api/projects/{project_id}/files/{file_id}"
        new_filename = "renamed_test_file.py"
        rename_payload = {
            "name": new_filename
        }
        file_rename_resp = requests.put(file_rename_url, json=rename_payload, headers=headers, timeout=TIMEOUT)
        assert file_rename_resp.status_code == 200, f"File rename failed: {file_rename_resp.text}"
        renamed_file_data = file_rename_resp.json()
        assert renamed_file_data.get("name") == new_filename, "File rename not reflected in response"

        # Step 5: Verify rename in project file tree
        file_tree_resp_after_rename = requests.get(file_tree_url, headers=headers, timeout=TIMEOUT)
        assert file_tree_resp_after_rename.status_code == 200, f"Fetching file tree failed: {file_tree_resp_after_rename.text}"
        files_list_after_rename = file_tree_resp_after_rename.json()
        assert any(f.get("id") == file_id and f.get("name") == new_filename for f in files_list_after_rename), "Renamed file not found in file tree"

        # Step 6: Create a folder in the project
        folder_create_payload = {
            "name": "test_folder",
            "type": "folder"
        }
        folder_create_resp = requests.post(file_create_url, json=folder_create_payload, headers=headers, timeout=TIMEOUT)
        assert folder_create_resp.status_code == 201, f"Folder creation failed: {folder_create_resp.text}"
        folder_data = folder_create_resp.json()
        folder_id = folder_data.get("id")
        assert folder_id, "Created folder ID missing"

        # Step 7: Rename the folder
        folder_rename_url = f"{BASE_URL}/api/projects/{project_id}/files/{folder_id}"
        folder_new_name = "renamed_test_folder"
        folder_rename_payload = {
            "name": folder_new_name
        }
        folder_rename_resp = requests.put(folder_rename_url, json=folder_rename_payload, headers=headers, timeout=TIMEOUT)
        assert folder_rename_resp.status_code == 200, f"Folder rename failed: {folder_rename_resp.text}"
        folder_rename_data = folder_rename_resp.json()
        assert folder_rename_data.get("name") == folder_new_name, "Folder rename not reflected in response"

        # Step 8: Verify folder rename in file tree
        file_tree_resp_after_folder_rename = requests.get(file_tree_url, headers=headers, timeout=TIMEOUT)
        assert file_tree_resp_after_folder_rename.status_code == 200, f"Fetching file tree failed: {file_tree_resp_after_folder_rename.text}"
        files_list_after_folder_rename = file_tree_resp_after_folder_rename.json()
        assert any(f.get("id") == folder_id and f.get("name") == folder_new_name for f in files_list_after_folder_rename), "Renamed folder not found in file tree"

        # Step 9: Delete the file
        file_delete_url = f"{BASE_URL}/api/projects/{project_id}/files/{file_id}"
        file_delete_resp = requests.delete(file_delete_url, headers=headers, timeout=TIMEOUT)
        assert file_delete_resp.status_code == 204, f"File deletion failed: {file_delete_resp.text}"

        # Step 10: Verify file removed from file tree
        file_tree_resp_after_file_delete = requests.get(file_tree_url, headers=headers, timeout=TIMEOUT)
        assert file_tree_resp_after_file_delete.status_code == 200, f"Fetching file tree failed: {file_tree_resp_after_file_delete.text}"
        files_list_after_file_delete = file_tree_resp_after_file_delete.json()
        assert all(f.get("id") != file_id for f in files_list_after_file_delete), "Deleted file still present in file tree"

        # Step 11: Delete the folder
        folder_delete_url = f"{BASE_URL}/api/projects/{project_id}/files/{folder_id}"
        folder_delete_resp = requests.delete(folder_delete_url, headers=headers, timeout=TIMEOUT)
        assert folder_delete_resp.status_code == 204, f"Folder deletion failed: {folder_delete_resp.text}"

        # Step 12: Verify folder removed from file tree
        file_tree_resp_after_folder_delete = requests.get(file_tree_url, headers=headers, timeout=TIMEOUT)
        assert file_tree_resp_after_folder_delete.status_code == 200, f"Fetching file tree failed: {file_tree_resp_after_folder_delete.text}"
        files_list_after_folder_delete = file_tree_resp_after_folder_delete.json()
        assert all(f.get("id") != folder_id for f in files_list_after_folder_delete), "Deleted folder still present in file tree"

    finally:
        # Cleanup: Delete the project to remove test data
        project_delete_url = f"{BASE_URL}/api/projects/{project_id}"
        requests.delete(project_delete_url, headers=headers, timeout=TIMEOUT)
        # Also attempt logout
        logout_url = f"{BASE_URL}/api/auth/logout"
        try:
            requests.post(logout_url, headers=headers, timeout=TIMEOUT)
        except Exception:
            pass

test_file_management_create_rename_delete()

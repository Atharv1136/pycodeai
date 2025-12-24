import requests
import time

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

def test_code_editor_autosave_and_multi_file_support():
    # Test user credentials for login
    login_payload = {
        "email": "testuser@example.com",
        "password": "TestPass123!"
    }

    session = requests.Session()

    try:
        # Login and get JWT token
        login_resp = session.post(f"{BASE_URL}/api/auth/login", json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, "Login failed"
        json_resp = login_resp.json()
        token = json_resp.get("token") or json_resp.get("access_token")
        assert token, "Token not returned on login"
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

        # Create a new project
        create_proj_payload = {"name": "Test Project Autosave"}
        proj_resp = session.post(f"{BASE_URL}/api/projects", json=create_proj_payload, headers=headers, timeout=TIMEOUT)
        assert proj_resp.status_code == 201, "Project creation failed"
        project = proj_resp.json()
        project_id = project.get("id")
        assert project_id, "Project ID missing"

        # Create two files with python code and simulate multiple tabs
        file_payloads = [
            {"filename": "main.py", "content": "print('Hello from main')", "language": "python"},
            {"filename": "utils.py", "content": "def add(a, b):\n    return a + b", "language": "python"}
        ]
        file_ids = []
        for file_payload in file_payloads:
            resp = session.post(f"{BASE_URL}/api/projects/{project_id}/files", json=file_payload, headers=headers, timeout=TIMEOUT)
            assert resp.status_code == 201, "File creation failed for " + file_payload["filename"]
            file_id = resp.json().get("id")
            assert file_id, "File ID missing for " + file_payload["filename"]
            file_ids.append(file_id)

        # Record last saved timestamps
        def get_file_metadata(file_id):
            r = session.get(f"{BASE_URL}/api/projects/{project_id}/files/{file_id}", headers=headers, timeout=TIMEOUT)
            assert r.status_code == 200, "Failed to get file metadata"
            return r.json()

        saved_timestamps_before = {}
        for fid in file_ids:
            metadata = get_file_metadata(fid)
            saved_timestamps_before[fid] = metadata.get("last_saved") or metadata.get("updated_at") or 0
            # Also verify language is python for syntax highlighting support
            assert metadata.get("language") == "python", f"File {fid} language not python"

        # Wait 30 seconds to simulate autosave interval
        time.sleep(30)

        # Simulate auto-save by updating files with small changes without blocking test execution
        start_time = time.time()
        for idx, fid in enumerate(file_ids):
            new_content = file_payloads[idx]["content"] + "\n# autosave test"
            update_payload = {"content": new_content}
            put_resp = session.put(f"{BASE_URL}/api/projects/{project_id}/files/{fid}", json=update_payload, headers=headers, timeout=TIMEOUT)
            assert put_resp.status_code == 200, f"Failed to update file {fid} during autosave"
        end_time = time.time()

        duration = end_time - start_time
        # Assert autosave does not block UI: total update calls should be quick (much less than 30 seconds)
        assert duration < 10, f"Autosave blocking too long: {duration:.2f}s"

        # Verify updated timestamps are greater than before
        saved_timestamps_after = {}
        for fid in file_ids:
            metadata = get_file_metadata(fid)
            saved_timestamps_after[fid] = metadata.get("last_saved") or metadata.get("updated_at") or 0
            assert saved_timestamps_after[fid] > saved_timestamps_before[fid], "Autosave timestamp not updated"

            # Verify content includes new autosave comment line
            content_resp = session.get(f"{BASE_URL}/api/projects/{project_id}/files/{fid}", headers=headers, timeout=TIMEOUT)
            assert content_resp.status_code == 200, "Failed to get file content after autosave"
            content = content_resp.json().get("content", "")
            assert "# autosave test" in content, "Autosave content not saved correctly"

    finally:
        # Clean up: delete project (which deletes all files)
        if 'project_id' in locals():
            del_resp = session.delete(f"{BASE_URL}/api/projects/{project_id}", headers=headers, timeout=TIMEOUT)
            # It's okay if delete fails in cleanup, no assertion here

test_code_editor_autosave_and_multi_file_support()

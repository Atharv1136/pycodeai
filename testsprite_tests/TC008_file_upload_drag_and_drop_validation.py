import requests
import json
import os

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

def test_file_upload_drag_and_drop_validation():
    session = requests.Session()
    try:
        # Step 1: Signup a new user
        signup_payload = {
            "name": "testuser_dragdrop",
            "email": "testuser_dragdrop@example.com",
            "password": "TestPassword123!"
        }
        signup_resp = session.post(
            f"{BASE_URL}/api/auth/signup",
            json=signup_payload,
            timeout=TIMEOUT
        )
        assert signup_resp.status_code == 201 or signup_resp.status_code == 200, f"Signup failed: {signup_resp.text}"

        # For demonstration, let's login explicitly to get JWT
        login_payload = {
            "email": signup_payload["email"],
            "password": signup_payload["password"]
        }
        login_resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json=login_payload,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        login_data = login_resp.json()
        token = login_data.get("token") or login_data.get("access_token")
        assert token, "JWT token not found in login response"

        session.headers.update({"Authorization": f"Bearer {token}"})

        # Step 2: Create a new project to upload files into
        project_payload = {"name": "dragdrop_test_project"}
        project_resp = session.post(
            f"{BASE_URL}/api/projects",
            json=project_payload,
            timeout=TIMEOUT
        )
        assert project_resp.status_code == 201 or project_resp.status_code == 200, f"Project creation failed: {project_resp.text}"
        project_data = project_resp.json()
        project_id = project_data.get("id")
        assert project_id, "Project ID not returned after creation"

        # Prepare paths for upload tests
        valid_filename = "test_file.py"
        invalid_filename = "test_file.exe"

        # Create dummy files for upload
        valid_file_content = b"print('Hello from valid file')"
        invalid_file_content = b"MZ\x90\x00\x03\x00\x00\x00"  # Beginning bytes of a PE executable

        # Write dummy files locally
        with open(valid_filename, "wb") as f:
            f.write(valid_file_content)
        with open(invalid_filename, "wb") as f:
            f.write(invalid_file_content)

        try:
            # Step 3: Upload valid file using drag and drop simulation
            with open(valid_filename, "rb") as f:
                files = {
                    "file": (valid_filename, f, "text/x-python-script")
                }
                upload_resp = session.post(
                    f"{BASE_URL}/api/upload?projectId={project_id}",
                    files=files,
                    timeout=TIMEOUT
                )
            assert upload_resp.status_code == 200, f"Valid file upload failed: {upload_resp.text}"
            upload_data = upload_resp.json()
            # Validate that file is integrated into project file tree endpoint
            # Fetch project files tree
            files_tree_resp = session.get(
                f"{BASE_URL}/api/files/project?projectId={project_id}",
                timeout=TIMEOUT
            )
            assert files_tree_resp.status_code == 200, f"Failed to fetch project file tree: {files_tree_resp.text}"
            files_tree = files_tree_resp.json()
            # Check the uploaded file is listed in the file tree
            def file_in_tree(file_tree, filename):
                for f in file_tree.get("files", []):
                    if f.get("name") == filename:
                        return True
                    if "children" in f:
                        if file_in_tree(f, filename):
                            return True
                return False

            assert file_in_tree(files_tree, valid_filename), "Uploaded valid file not found in project file tree"

            # Step 4: Upload invalid file type and expect rejection (e.g. .exe blocked)
            with open(invalid_filename, "rb") as f:
                files = {
                    "file": (invalid_filename, f, "application/x-msdownload")
                }
                upload_resp_invalid = session.post(
                    f"{BASE_URL}/api/upload?projectId={project_id}",
                    files=files,
                    timeout=TIMEOUT
                )
            # Assuming server returns 400 or 415 for invalid file types
            assert upload_resp_invalid.status_code in (400, 415), f"Invalid file type upload not rejected properly: {upload_resp_invalid.text}"

        finally:
            # Clean up dummy files
            if os.path.isfile(valid_filename):
                os.remove(valid_filename)
            if os.path.isfile(invalid_filename):
                os.remove(invalid_filename)

        # Step 5: Cleanup - delete project
        del_resp = session.delete(
            f"{BASE_URL}/api/projects/{project_id}",
            timeout=TIMEOUT
        )
        assert del_resp.status_code == 200 or del_resp.status_code == 204, f"Failed to delete project: {del_resp.text}"

    finally:
        # Optional: logout endpoint if exists
        session.post(f"{BASE_URL}/api/auth/logout", timeout=TIMEOUT)
        session.close()

test_file_upload_drag_and_drop_validation()

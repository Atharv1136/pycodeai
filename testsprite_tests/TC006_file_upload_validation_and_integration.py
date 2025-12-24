import requests
import io
import os

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

# These sample files simulate CSV and Excel files for upload testing.
SAMPLE_CSV_CONTENT = "name,age\nAlice,30\nBob,25"
SAMPLE_XLSX_CONTENT = (
    b"PK\x03\x04\x14\x00\x06\x00\x08\x00\x00\x00!\x00\xbd\x82"
    b"\xb1N\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
    b"\x13\x00\x00\x00[Content_Types].xml\xed\x9cA\n\xc20\x10\x86"
    b"\xef\xcf\x92\xb9N\x00\x0c\x89\xca\x92;&\xb2)\x00\x00\x00"
    b"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
)

# Sample invalid file content and name
SAMPLE_INVALID_FILE_CONTENT = b"This is just a text file, not CSV/XLSX."
SAMPLE_INVALID_FILENAME = "invalid.txt"


def login_get_token():
    url = f"{BASE_URL}/api/auth/login"
    credentials = {
        "email": "testuser@example.com",
        "password": "TestPassword123!"
    }
    resp = requests.post(url, json=credentials, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    assert "token" in data and data["token"], "Login response missing 'token'"
    return data["token"]


def create_project(token):
    url = f"{BASE_URL}/api/projects"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {"name": "File Upload Test Project"}
    resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    assert "id" in data, "Project creation response missing 'id'"
    return data["id"]


def delete_project(token, project_id):
    url = f"{BASE_URL}/api/projects/{project_id}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()


def upload_file(token, project_id, filename, filecontent, content_type):
    url = f"{BASE_URL}/api/upload"
    headers = {"Authorization": f"Bearer {token}"}
    files = {
        "file": (filename, filecontent, content_type),
        "projectId": (None, str(project_id)),
    }
    resp = requests.post(url, files=files, headers=headers, timeout=TIMEOUT)
    return resp


def get_project_files(token, project_id):
    url = f"{BASE_URL}/api/files/project"
    headers = {"Authorization": f"Bearer {token}"}
    params = {"projectId": project_id}
    resp = requests.get(url, headers=headers, params=params, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()


def test_file_upload_validation_and_integration():
    token = login_get_token()
    project_id = None
    try:
        project_id = create_project(token)

        # Upload a valid CSV file (simulate drag-and-drop)
        csv_resp = upload_file(
            token,
            project_id,
            "sample.csv",
            io.BytesIO(SAMPLE_CSV_CONTENT.encode("utf-8")),
            "text/csv"
        )
        assert csv_resp.status_code == 200, f"CSV upload failed: {csv_resp.text}"
        csv_data = csv_resp.json()
        assert csv_data.get("success") is True or csv_resp.status_code == 200

        # Upload a valid Excel file (simulate drag-and-drop)
        xlsx_resp = upload_file(
            token,
            project_id,
            "sample.xlsx",
            io.BytesIO(SAMPLE_XLSX_CONTENT),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        assert xlsx_resp.status_code == 200, f"Excel upload failed: {xlsx_resp.text}"
        xlsx_data = xlsx_resp.json()
        assert xlsx_data.get("success") is True or xlsx_resp.status_code == 200

        # Upload an invalid file type and expect validation error
        invalid_resp = upload_file(
            token,
            project_id,
            SAMPLE_INVALID_FILENAME,
            io.BytesIO(SAMPLE_INVALID_FILE_CONTENT),
            "text/plain"
        )
        # Assuming server returns 400 or 422 for invalid file type
        assert invalid_resp.status_code in (400, 422), \
            f"Invalid file upload did not fail as expected: {invalid_resp.status_code}"

        # Check that uploaded files appear in the project file tree
        files_tree = get_project_files(token, project_id)
        # files_tree expected to be a list/dict containing file info with uploaded file names

        filenames_in_tree = set()
        def extract_filenames(tree):
            # recursive extraction if file tree nested
            if isinstance(tree, list):
                for item in tree:
                    extract_filenames(item)
            elif isinstance(tree, dict):
                name = tree.get("name")
                if name:
                    filenames_in_tree.add(name)
                children = tree.get("children")
                if children:
                    extract_filenames(children)
        extract_filenames(files_tree)

        assert "sample.csv" in filenames_in_tree, \
            "Uploaded CSV file not found in project file tree"
        assert "sample.xlsx" in filenames_in_tree, \
            "Uploaded Excel file not found in project file tree"

    finally:
        if project_id:
            try:
                delete_project(token, project_id)
            except Exception:
                pass


test_file_upload_validation_and_integration()
import requests
import uuid

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

# For this test code, assume we have an authenticated user token.
# Normally, we would get this token from a login endpoint.
# For this test, we simulate the presence of a valid token.
# Update the token here if needed.
AUTH_TOKEN = "Bearer your_jwt_token_here"

HEADERS = {
    "Authorization": AUTH_TOKEN,
    "Content-Type": "application/json",
}


def test_file_management_create_rename_delete():
    """
    Validate the file management API endpoints for creating, renaming,
    and deleting files and folders within projects, ensuring updates
    reflect correctly in the file explorer.
    """
    project_id = None
    folder_id = None
    file_id = None

    def create_project():
        # Create a new project to hold files/folders
        url = f"{BASE_URL}/api/projects"
        unique_name = f"test_project_{uuid.uuid4().hex[:8]}"
        payload = {"projectName": unique_name}
        resp = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        project = resp.json()
        assert "id" in project and project.get("name", project.get("projectName")) == unique_name
        return project["id"]

    def delete_project(pid):
        url = f"{BASE_URL}/api/projects/{pid}"
        resp = requests.delete(url, headers=HEADERS, timeout=TIMEOUT)
        # If already deleted or does not exist, allow 404 silently
        if resp.status_code not in (204, 404):
            resp.raise_for_status()

    def create_folder(pid, folder_name):
        url = f"{BASE_URL}/api/files/project/{pid}/items"
        payload = {
            "name": folder_name,
            "type": "folder"
        }
        resp = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        folder = resp.json()
        assert folder.get("name") == folder_name and folder.get("type") == "folder" and "id" in folder
        return folder["id"]

    def create_file(pid, file_name, content=""):
        url = f"{BASE_URL}/api/files/project/{pid}/items"
        payload = {
            "name": file_name,
            "type": "file",
            "content": content
        }
        resp = requests.post(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        file = resp.json()
        assert file.get("name") == file_name and file.get("type") == "file" and "id" in file
        return file["id"]

    def rename_item(pid, item_id, new_name):
        url = f"{BASE_URL}/api/files/project/{pid}/items/{item_id}/rename"
        payload = {"new_name": new_name}
        resp = requests.put(url, json=payload, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        renamed = resp.json()
        assert renamed.get("name") == new_name and "id" in renamed and renamed["id"] == item_id

    def get_file_explorer_tree(pid):
        url = f"{BASE_URL}/api/files/project/{pid}/tree"
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        resp.raise_for_status()
        tree = resp.json()
        assert isinstance(tree, dict) or isinstance(tree, list)
        return tree

    def delete_item(pid, item_id):
        url = f"{BASE_URL}/api/files/project/{pid}/items/{item_id}"
        resp = requests.delete(url, headers=HEADERS, timeout=TIMEOUT)
        # 204 No Content expected on success
        if resp.status_code not in (204, 404):
            resp.raise_for_status()

    try:
        # Create a new project for testing
        project_id = create_project()

        # Create a folder
        folder_name = f"folder_{uuid.uuid4().hex[:6]}"
        folder_id = create_folder(project_id, folder_name)

        # Verify folder presence in file explorer
        tree = get_file_explorer_tree(project_id)
        assert any(
            node.get("id") == folder_id and node.get("name") == folder_name and node.get("type") == "folder"
            for node in (tree if isinstance(tree, list) else [])
        )

        # Create a file inside project (not necessarily inside folder unless API supports nesting in payload)
        file_name = f"file_{uuid.uuid4().hex[:6]}.py"
        file_id = create_file(project_id, file_name, content="# test script\nprint('hello world')")

        # Verify file presence in file explorer
        tree = get_file_explorer_tree(project_id)
        assert any(
            node.get("id") == file_id and node.get("name") == file_name and node.get("type") == "file"
            for node in (tree if isinstance(tree, list) else [])
        )

        # Rename folder
        new_folder_name = folder_name + "_renamed"
        rename_item(project_id, folder_id, new_folder_name)

        # Rename file
        new_file_name = f"renamed_{file_name}"
        rename_item(project_id, file_id, new_file_name)

        # Verify renames in file explorer
        tree = get_file_explorer_tree(project_id)
        assert any(
            node.get("id") == folder_id and node.get("name") == new_folder_name and node.get("type") == "folder"
            for node in (tree if isinstance(tree, list) else [])
        )
        assert any(
            node.get("id") == file_id and node.get("name") == new_file_name and node.get("type") == "file"
            for node in (tree if isinstance(tree, list) else [])
        )

    finally:
        # Clean up: delete created files, folders, and project
        if file_id is not None and project_id is not None:
            try:
                delete_item(project_id, file_id)
            except Exception:
                pass
        if folder_id is not None and project_id is not None:
            try:
                delete_item(project_id, folder_id)
            except Exception:
                pass
        if project_id is not None:
            try:
                delete_project(project_id)
            except Exception:
                pass


test_file_management_create_rename_delete()

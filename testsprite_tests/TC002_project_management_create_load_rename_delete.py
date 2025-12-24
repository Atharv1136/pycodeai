import requests
import uuid

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

# Placeholder token; replace with real JWT if available
auth_token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exampletoken"

headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": auth_token
}

def test_project_management_create_load_rename_search_delete():
    project_id = None

    def create_project(name):
        payload = {"name": name}
        resp = requests.post(f"{BASE_URL}/api/projects", json=payload, headers=headers, timeout=TIMEOUT)
        try:
            resp.raise_for_status()
        except requests.HTTPError:
            assert False, f"Failed to create project: {resp.status_code}, response: {resp.text}"
        data = resp.json()
        assert "id" in data and data["name"] == name, f"Invalid create response data: {data}"
        return data["id"]

    def get_project(pid):
        resp = requests.get(f"{BASE_URL}/api/projects/{pid}", headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    def rename_project(pid, new_name):
        payload = {"name": new_name}
        resp = requests.put(f"{BASE_URL}/api/projects/{pid}", json=payload, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    def search_projects(name):
        resp = requests.get(f"{BASE_URL}/api/projects?search={name}", headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.json()

    def delete_project(pid):
        resp = requests.delete(f"{BASE_URL}/api/projects/{pid}", headers=headers, timeout=TIMEOUT)
        # 204 No Content or 200 OK expected
        assert resp.status_code in (200, 204)

    # Generate a unique project name for testing
    original_name = f"TestProject-{uuid.uuid4()}"
    renamed_name = original_name + "-Renamed"

    try:
        # Create project
        project_id = create_project(original_name)

        # Load project and verify name matches
        loaded = get_project(project_id)
        assert loaded["id"] == project_id
        assert loaded["name"] == original_name

        # Rename project
        rename_resp = rename_project(project_id, renamed_name)
        assert rename_resp.get("id") == project_id
        assert rename_resp.get("name") == renamed_name

        # Load project again and verify rename persisted
        loaded_after_rename = get_project(project_id)
        assert loaded_after_rename["id"] == project_id
        assert loaded_after_rename["name"] == renamed_name

        # Search projects by renamed name substring and verify project in results
        search_results = search_projects(renamed_name)
        assert any(proj["id"] == project_id and proj["name"] == renamed_name for proj in search_results)

    finally:
        # Cleanup: delete project if it was created
        if project_id:
            try:
                delete_project(project_id)
            except Exception:
                pass

test_project_management_create_load_rename_search_delete()

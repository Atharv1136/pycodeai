import requests
import os
import time

BASE_URL = "http://localhost:9002"
TIMEOUT = 30

def test_csv_excel_file_upload_and_ai_data_analysis():
    session = requests.Session()

    # Step 1: Signup a new user to get JWT token
    signup_payload = {
        "name": f"testuser_{int(time.time())}",
        "email": f"testuser_{int(time.time())}@example.com",
        "password": "TestPassword123!"
    }
    signup_resp = session.post(
        f"{BASE_URL}/api/auth/signup",
        json=signup_payload,
        timeout=TIMEOUT
    )
    assert signup_resp.status_code == 201 or signup_resp.status_code == 200, f"Signup failed: {signup_resp.text}"

    # Login is fixed but if signup returns token, otherwise login needed
    # Assuming signup returns no token, do login

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
    assert "token" in login_data, "Login response missing token"
    token = login_data["token"]
    headers = {
        "Authorization": f"Bearer {token}"
    }

    # Step 2: Create a new project to upload files into
    project_name = f"testproject_{int(time.time())}"
    create_project_payload = {"name": project_name}
    project_resp = session.post(
        f"{BASE_URL}/api/projects/route",
        headers=headers,
        json=create_project_payload,
        timeout=TIMEOUT
    )
    assert project_resp.status_code == 201 or project_resp.status_code == 200, f"Project creation failed: {project_resp.text}"
    project_data = project_resp.json()
    assert "id" in project_data, "Project creation response missing project id"
    project_id = project_data["id"]

    try:
        # Prepare file paths (in-memory or example content)
        csv_content = (
            "Name,Age,Salary\n"
            "Alice,30,70000\n"
            "Bob,25,48000\n"
            "Charlie,35,120000\n"
        )
        excel_content_bytes = None
        try:
            import pandas as pd
            from io import BytesIO
            df = pd.DataFrame({
                "Name": ["David", "Eva", "Frank"],
                "Age": [40, 29, 50],
                "Salary": [90000, 60000, 110000]
            })
            excel_buffer = BytesIO()
            df.to_excel(excel_buffer, index=False)
            excel_content_bytes = excel_buffer.getvalue()
        except ImportError:
            # If pandas not available, fallback to a minimal XLSX byte content
            excel_content_bytes = b"PK\x03\x04"  # Minimal dummy XLSX content just for upload

        # Step 3: Upload CSV file
        files = {
            "file": ("testfile.csv", csv_content, "text/csv")
        }
        upload_resp_csv = session.post(
            f"{BASE_URL}/api/upload/route",
            headers=headers,
            files=files,
            data={"projectId": project_id},
            timeout=TIMEOUT
        )
        assert upload_resp_csv.status_code == 200, f"CSV file upload failed: {upload_resp_csv.text}"
        upload_csv_data = upload_resp_csv.json()
        assert "fileId" in upload_csv_data, "CSV upload response missing fileId"
        csv_file_id = upload_csv_data["fileId"]

        # Step 4: Upload Excel file
        files = {
            "file": ("testfile.xlsx", excel_content_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        }
        upload_resp_excel = session.post(
            f"{BASE_URL}/api/upload/route",
            headers=headers,
            files=files,
            data={"projectId": project_id},
            timeout=TIMEOUT
        )
        assert upload_resp_excel.status_code == 200, f"Excel file upload failed: {upload_resp_excel.text}"
        upload_excel_data = upload_resp_excel.json()
        assert "fileId" in upload_excel_data, "Excel upload response missing fileId"
        excel_file_id = upload_excel_data["fileId"]

        # Step 5: Send natural language prompt to AI assist endpoint for analysis/cleaning/visualization code
        # Use sample prompt about cleaning and visualizing the uploaded CSV file
        prompt = (
            "Please generate Python code to clean the uploaded dataset by removing rows where Age is under 30 "
            "and create a visualization of Salary by Name using matplotlib."
        )

        ai_assist_payload = {
            "projectId": project_id,
            "fileId": csv_file_id,
            "prompt": prompt
        }
        ai_resp = session.post(
            f"{BASE_URL}/api/ai/assist",
            headers=headers,
            json=ai_assist_payload,
            timeout=TIMEOUT
        )
        assert ai_resp.status_code == 200, f"AI assist request failed: {ai_resp.text}"
        ai_data = ai_resp.json()
        assert "generatedCode" in ai_data, "AI assist response missing generatedCode"
        generated_code = ai_data["generatedCode"]
        assert isinstance(generated_code, str) and len(generated_code) > 0, "Generated code is empty"

        # Step 6: Execute the generated Python code via code execute endpoint
        execute_payload = {
            "projectId": project_id,
            "code": generated_code
        }
        execute_resp = session.post(
            f"{BASE_URL}/api/code/execute",
            headers=headers,
            json=execute_payload,
            timeout=TIMEOUT
        )
        assert execute_resp.status_code == 200, f"Code execution request failed: {execute_resp.text}"
        execute_data = execute_resp.json()
        # Expect keys like stdout, stderr, executionTime
        assert "stdout" in execute_data, "Execution response missing stdout"
        assert "stderr" in execute_data, "Execution response missing stderr"
        assert "executionTime" in execute_data, "Execution response missing executionTime"
        # No stderr output expected ideally
        assert execute_data["stderr"] == "" or execute_data["stderr"] is None, f"Code execution stderr: {execute_data['stderr']}"
        # stdout should contain matplotlib plot info or indication of success
        assert len(execute_data["stdout"]) > 0, "Execution stdout empty"

    finally:
        # Cleanup: delete uploaded files and project
        # Delete uploaded CSV file
        try:
            session.delete(
                f"{BASE_URL}/api/files/project",
                headers=headers,
                params={"projectId": project_id, "fileId": csv_file_id},
                timeout=TIMEOUT
            )
        except Exception:
            pass
        # Delete uploaded Excel file
        try:
            session.delete(
                f"{BASE_URL}/api/files/project",
                headers=headers,
                params={"projectId": project_id, "fileId": excel_file_id},
                timeout=TIMEOUT
            )
        except Exception:
            pass
        # Delete project
        try:
            session.delete(
                f"{BASE_URL}/api/projects/route",
                headers=headers,
                params={"projectId": project_id},
                timeout=TIMEOUT
            )
        except Exception:
            pass

test_csv_excel_file_upload_and_ai_data_analysis()

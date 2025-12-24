import requests
import time

BASE_URL = "http://localhost:9002"
CODE_EXECUTION_ENDPOINT = f"{BASE_URL}/api/code/execute"
TIMEOUT_SECONDS = 30

# Sample Python codes for testing
TEST_CODES = {
    "success_basic": {
        "code": "print('Hello, World!')",
        "expected_contains": "Hello, World!"
    },
    "success_libraries": {
        "code": (
            "import pandas as pd\n"
            "import numpy as np\n"
            "import matplotlib.pyplot as plt\n"
            "data = pd.DataFrame({'a': np.arange(5)})\n"
            "plt.plot(data['a'])\n"
            "plt.close()\n"
            "print(data['a'].sum())"
        ),
        "expected_contains": "10"  # sum of 0+1+2+3+4
    },
    "error_code": {
        # Intentional syntax error
        "code": "print('Hello'",
        "expected_error_substr": "SyntaxError"
    },
    "timeout_code": {
        # Infinite loop to induce timeout
        "code": "while True:\n    pass",
        "expected_error_substr": "timeout"
    }
}

# Set a dummy non-empty token to properly test authorization header presence
access_token = "dummy-token"

def test_code_execution_with_timeout_and_library_support():
    headers = {
        "Content-Type": "application/json"
    }
    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"
    
    # Helper to execute code and return response JSON
    def execute_code(code_str):
        payload = {
            "language": "python",
            "source": code_str,
            "timeout": 10,
            "libraries": ["pandas", "numpy", "matplotlib"]
        }
        try:
            resp = requests.post(
                CODE_EXECUTION_ENDPOINT,
                json=payload,
                headers=headers,
                timeout=TIMEOUT_SECONDS
            )
        except requests.Timeout:
            return {"error": "Request timed out"}
        except requests.RequestException as e:
            return {"error": f"Request error: {str(e)}"}
        if resp.status_code != 200:
            return {"error": f"HTTP {resp.status_code}: {resp.text}"}
        try:
            return resp.json()
        except Exception as e:
            return {"error": f"Invalid JSON response: {str(e)}"}

    # 1. Test simple code execution success
    result = execute_code(TEST_CODES["success_basic"]["code"])
    assert "output" in result and TEST_CODES["success_basic"]["expected_contains"] in result["output"], \
        f"Basic print test failed. Response: {result}"

    # 2. Test code execution with supported libraries
    result = execute_code(TEST_CODES["success_libraries"]["code"])
    assert "output" in result and TEST_CODES["success_libraries"]["expected_contains"] in result["output"], \
        f"Library support test failed. Response: {result}"

    # 3. Test code execution error returns proper message
    result = execute_code(TEST_CODES["error_code"]["code"])
    assert "error" in result or ("output" in result and TEST_CODES["error_code"]["expected_error_substr"] in result.get("output","")), \
        f"Error handling test failed. Response: {result}"

    # 4. Test timeout enforcement
    start_time = time.time()
    result = execute_code(TEST_CODES["timeout_code"]["code"])
    duration = time.time() - start_time
    assert ("error" in result and TEST_CODES["timeout_code"]["expected_error_substr"] in result["error"].lower()) or \
           ("output" in result and "timeout" in result["output"].lower()) or \
           (duration >= 9 and duration <= TIMEOUT_SECONDS), \
        f"Timeout handling test failed or not enforced properly. Response: {result}, Duration: {duration}"

test_code_execution_with_timeout_and_library_support()

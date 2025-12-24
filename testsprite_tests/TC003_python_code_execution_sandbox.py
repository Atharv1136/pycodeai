import requests
import time

BASE_URL = "http://localhost:9002"
EXECUTE_ENDPOINT = f"{BASE_URL}/api/code/execute"
TIMEOUT_SECONDS = 30

def test_python_code_execution_sandbox():
    # A simple Python code snippet that prints to stdout and stderr and sleeps for 1 second
    # to test execution time and output capturing.
    python_code = """
import sys
import time
print("Hello stdout")
print("Hello stderr", file=sys.stderr)
time.sleep(1)
"""
    payload = {
        "language": "python",
        "code": python_code,
        "timeout": 5  # Setting a timeout less than TIMEOUT_SECONDS to trigger timeout behavior if needed
    }
    headers = {
        "Content-Type": "application/json",
    }

    try:
        start_time = time.time()
        response = requests.post(EXECUTE_ENDPOINT, json=payload, headers=headers, timeout=TIMEOUT_SECONDS)
        elapsed_time = time.time() - start_time
    except requests.exceptions.Timeout:
        # If the request itself times out at the HTTP client level (timeout param)
        assert False, "Request timed out unexpectedly"
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"
    
    assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}, response: {response.text}"

    try:
        result = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate presence and types of expected fields in the response JSON
    assert isinstance(result, dict), "Result should be a JSON object"
    assert "stdout" in result, "Response missing 'stdout'"
    assert "stderr" in result, "Response missing 'stderr'"
    assert "execution_time" in result, "Response missing 'execution_time'"
    assert "timeout" in result, "Response missing 'timeout' flag"

    # Validate stdout content
    stdout = result["stdout"]
    stderr = result["stderr"]
    exec_time = result["execution_time"]
    timed_out = result["timeout"]

    assert isinstance(stdout, str), "'stdout' should be a string"
    assert isinstance(stderr, str), "'stderr' should be a string"
    assert isinstance(exec_time, (int, float)), "'execution_time' should be numeric"
    assert isinstance(timed_out, bool), "'timeout' should be boolean"

    # Check stdout and stderr expected content
    assert "Hello stdout" in stdout, "'stdout' does not contain expected output"
    assert "Hello stderr" in stderr, "'stderr' does not contain expected output"

    # Execution time sanity checks
    # The execution_time reported by the API should be close to but not exceed the sleep time + overhead
    assert 0 <= exec_time <= 10, "'execution_time' is out of expected range (0-10 seconds)"
    # The elapsed HTTP request time should be close to the execution_time, allowing some network overhead
    assert exec_time <= elapsed_time <= exec_time + 5, "Elapsed time inconsistent with execution_time"

    # This test code snippet should not trigger timeout
    assert timed_out is False, "Code execution incorrectly marked as timeout"

    # Test handling of actual timeout: send code that sleeps longer than timeout and confirm timeout flag
    timeout_payload = {
        "language": "python",
        "code": "import time\ntime.sleep(10)",
        "timeout": 3
    }
    try:
        timeout_response = requests.post(EXECUTE_ENDPOINT, json=timeout_payload, headers=headers, timeout=TIMEOUT_SECONDS)
    except requests.exceptions.RequestException as e:
        assert False, f"Timeout test request failed: {e}"

    assert timeout_response.status_code == 200, f"Expected 200 OK for timeout test, got {timeout_response.status_code}"
    try:
        timeout_result = timeout_response.json()
    except ValueError:
        assert False, "Timeout test response is not valid JSON"

    assert "timeout" in timeout_result, "Timeout test response missing 'timeout' field"
    assert timeout_result["timeout"] is True, "Timeout test did not trigger timeout flag as expected"

    # stdout and stderr may be empty or partial in timeout case - ensure they exist and are strings
    assert isinstance(timeout_result.get("stdout", ""), str), "'stdout' in timeout test should be string"
    assert isinstance(timeout_result.get("stderr", ""), str), "'stderr' in timeout test should be string"
    assert isinstance(timeout_result.get("execution_time", 0), (int, float)), "'execution_time' in timeout test should be numeric"

test_python_code_execution_sandbox()
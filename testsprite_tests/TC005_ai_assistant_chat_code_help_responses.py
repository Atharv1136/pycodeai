import requests
import time

BASE_URL = "http://localhost:9002"
TIMEOUT = 30  # Default timeout for HTTP requests

def test_ai_assistant_chat_code_help_responses():
    url = f"{BASE_URL}/api/ai/chat"
    headers = {
        "Content-Type": "application/json",
        # If authentication needed, add: "Authorization": "Bearer <token>"
    }

    # Different user inputs to test relevance for explanation, error fix, optimization, generation
    test_prompts = [
        {
            "description": "Code explanation",
            "input": {
                "message": "Explain this code: def add(a, b): return a + b",
                "context": "def add(a, b): return a + b"
            }
        },
        {
            "description": "Error fix",
            "input": {
                "message": "Fix error in this code: def add(a, b): return a + c",
                "context": "def add(a, b): return a + c"
            }
        },
        {
            "description": "Code optimization",
            "input": {
                "message": "Optimize this function: def multiply_by_two(x): return x*2",
                "context": "def multiply_by_two(x): return x*2"
            }
        },
        {
            "description": "Code generation",
            "input": {
                "message": "Generate Python code to read a CSV file and print first 5 rows",
                "context": ""
            }
        }
    ]

    for test_case in test_prompts:
        payload = {
            "userInput": test_case["input"]["message"],
            "codeContext": test_case["input"].get("context", "")
        }
        start_time = time.time()
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=5)
        except requests.Timeout:
            assert False, f"AI assistant chat API timed out for test case: {test_case['description']}"
        except requests.RequestException as e:
            assert False, f"Request failed for test case: {test_case['description']}, error: {e}"
        duration = time.time() - start_time

        # Validate response status and timing
        assert response.status_code == 200, f"Unexpected status code for {test_case['description']}: {response.status_code}"
        assert duration <= 5, f"Response time exceeded 5 seconds for {test_case['description']}: {duration:.2f}s"

        data = response.json()
        # Validate response contains expected keys and non-empty answer
        assert "answer" in data, f"Response missing 'answer' key for {test_case['description']}"
        assert isinstance(data["answer"], str) and data["answer"].strip(), f"Empty or invalid 'answer' for {test_case['description']}"

        # Basic relevance checks on answer content depending on test case type
        answer_lower = data["answer"].lower()
        if test_case["description"] == "Code explanation":
            assert any(word in answer_lower for word in ["explain", "function", "code", "operation", "purpose"]), \
                "Answer does not contain code explanation keywords"
        elif test_case["description"] == "Error fix":
            assert any(word in answer_lower for word in ["fix", "error", "correct", "bug", "issue"]), \
                "Answer does not mention error fixes or corrections"
        elif test_case["description"] == "Code optimization":
            assert any(word in answer_lower for word in ["optimize", "performance", "efficient", "improve", "simplify"]), \
                "Answer does not mention optimization or performance improvements"
        elif test_case["description"] == "Code generation":
            # Expect some code block or references to pandas or csv
            assert ("import" in answer_lower or "read" in answer_lower or "csv" in answer_lower or "pandas" in answer_lower or "print" in answer_lower), \
                "Answer does not seem to include generated code for CSV reading"

test_ai_assistant_chat_code_help_responses()
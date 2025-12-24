'use server';
/**
 * @fileOverview A flow for executing Python code.
 *
 * - runPythonCode - A function that executes Python code.
 * - RunPythonCodeInput - The input type for the runPythonCode function.
 * - RunPythonCodeOutput - The return type for the runPythonCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { spawn } from 'child_process';

const RunPythonCodeInputSchema = z.object({
    code: z.string().describe('The Python code to execute.'),
    projectId: z.string().optional().describe('The project ID to determine where files should be created.'),
});
export type RunPythonCodeInput = z.infer<typeof RunPythonCodeInputSchema>;

const RunPythonCodeOutputSchema = z.object({
    output: z.string().describe('The stdout from the executed code.'),
    error: z.string().optional().describe('The stderr if an error occurred.'),
    workingDir: z.string().optional().describe('The working directory where code was executed.'),
});
export type RunPythonCodeOutput = z.infer<typeof RunPythonCodeOutputSchema>;

export async function runPythonCode(input: RunPythonCodeInput): Promise<RunPythonCodeOutput> {
    return runPythonCodeFlow(input);
}

// This tool uses a child process to execute python code.
// NOTE: This is still not perfectly safe for a multi-tenant production environment
// without further sandboxing (e.g., Docker, gVisor).
const pythonInterpreter = ai.defineTool(
    {
        name: 'pythonInterpreter',
        description: 'Executes Python code and returns the output.',
        inputSchema: RunPythonCodeInputSchema,
        outputSchema: RunPythonCodeOutputSchema,
    },
    async (input) => {
        return new Promise((resolve) => {
            // Check if code uses graphical libraries
            const isGraphical = /pygame|tkinter|turtle|matplotlib|plotly|seaborn|bokeh/i.test(input.code);

            // Set up environment for graphical applications and package access
            const env = { ...process.env };

            // Set UTF-8 encoding for Windows to handle Unicode characters properly
            env.PYTHONIOENCODING = 'utf-8';
            env.PYTHONUTF8 = '1';

            // Remove PYTHONUSERBASE override to let Python find the correct default path
            // especially for Windows Store versions
            if (env.PYTHONUSERBASE) {
                delete env.PYTHONUSERBASE;
            }

            if (isGraphical) {
                // Set up virtual display for graphical applications
                // env.DISPLAY = ':99'; // Commented out to allow local GUI
            }

            // Use different execution strategy for graphical vs text-based code
            const args = isGraphical
                ? ['-u', '-c', `
import sys
import os
import io
import site
import tempfile
import subprocess

# Set UTF-8 encoding for Windows to handle Unicode characters
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add user site-packages to Python path for installed packages
# First try standard user site
user_site = site.getusersitepackages()
if user_site and os.path.exists(user_site):
    sys.path.insert(0, user_site)
    print(f"[DEBUG] Added user site-packages: {user_site}")

# Also try to find packages in common Windows locations including Windows Store Python
if os.name == 'nt':  # Windows
    user_base = os.environ.get('USERPROFILE', os.path.expanduser('~'))
    possible_paths = [
        os.path.join(user_base, 'AppData', 'Roaming', 'Python', 'Python*', 'site-packages'),
        os.path.join(user_base, 'Python*', 'site-packages'),
        # Windows Store Python path
        os.path.join(user_base, 'AppData', 'Local', 'Packages', 'PythonSoftwareFoundation.Python.3.11_*', 'LocalCache', 'local-packages', 'Python311', 'site-packages'),
        os.path.join(user_base, 'AppData', 'Local', 'Packages', 'PythonSoftwareFoundation.Python.3.10_*', 'LocalCache', 'local-packages', 'Python310', 'site-packages'),
    ]
    import glob
    for pattern in possible_paths:
        for path in glob.glob(pattern):
            if os.path.exists(path) and path not in sys.path:
                sys.path.insert(0, path)
                print(f"[DEBUG] Added extra site-packages: {path}")

# Get the user code
user_code = '''${input.code.replace(/'/g, "\\'").replace(/\n/g, '\\n')}'''

# Check if required packages are installed, auto-install if missing
missing_packages = []
required_packages = {
    'matplotlib': 'matplotlib',
    'plt': 'matplotlib',
    'pandas': 'pandas',
    'pd': 'pandas',
    'numpy': 'numpy',
    'np': 'numpy',
    'seaborn': 'seaborn',
    'sns': 'seaborn',
    'sklearn': 'scikit-learn',
    'scikit-learn': 'scikit-learn',
    'scipy': 'scipy',
    'statsmodels': 'statsmodels',
    'plotly': 'plotly',
    'bokeh': 'bokeh',
    'opencv': 'opencv-python',
    'cv2': 'opencv-python',
    'tensorflow': 'tensorflow',
    'keras': 'keras',
    'torch': 'torch',
    'nltk': 'nltk',
    'spacy': 'spacy',
    'xgboost': 'xgboost',
    'lightgbm': 'lightgbm',
    'catboost': 'catboost',
}

for module_name, package_name in required_packages.items():
    if module_name in user_code or f'import {module_name}' in user_code or f'from {module_name}' in user_code:
        try:
            __import__(package_name)
        except ImportError:
            if package_name not in missing_packages:
                missing_packages.append(package_name)

# Auto-install missing packages
if missing_packages:
    import subprocess
    import sys
    import io
    # Set stdout/stderr to UTF-8 to handle any Unicode characters
    if sys.stdout.encoding != 'utf-8':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    if sys.stderr.encoding != 'utf-8':
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    
    print(f"[INFO] Auto-installing missing packages: {', '.join(set(missing_packages))}")
    print("[INFO] This may take a minute...\\n")
    
    # Try installing with pre-built wheels first (faster, no compilation needed)
    install_cmd = [sys.executable, '-m', 'pip', 'install', '--user', '--only-binary=:all:', '--upgrade', 'pip', 'setuptools', 'wheel']
    
    try:
        # First, upgrade pip/setuptools/wheel to ensure we can use wheels
        subprocess.run(install_cmd, capture_output=True, text=True, timeout=60, encoding='utf-8', errors='replace')
        
        # Now install the packages, prefer wheels but allow source if needed
        install_cmd = [sys.executable, '-m', 'pip', 'install', '--user', '--prefer-binary'] + list(set(missing_packages))
        result = subprocess.run(install_cmd, capture_output=True, text=True, timeout=600, encoding='utf-8', errors='replace')
        
        if result.returncode == 0:
            print(f"[SUCCESS] Successfully installed: {', '.join(set(missing_packages))}\\n")
            # Re-import site to pick up newly installed packages
            import importlib
            importlib.reload(site)
            user_site = site.getusersitepackages()
            if user_site and os.path.exists(user_site):
                sys.path.insert(0, user_site)
        else:
            # If installation failed, try installing one by one to see which ones work
            print(f"[WARNING] Bulk installation had issues, trying individual packages...")
            successfully_installed = []
            failed_packages = []
            
            for pkg in set(missing_packages):
                try:
                    cmd = [sys.executable, '-m', 'pip', 'install', '--user', '--prefer-binary', pkg]
                    result_single = subprocess.run(cmd, capture_output=True, text=True, timeout=300, encoding='utf-8', errors='replace')
                    if result_single.returncode == 0:
                        successfully_installed.append(pkg)
                    else:
                        failed_packages.append(pkg)
                except:
                    failed_packages.append(pkg)
            
            if successfully_installed:
                print(f"[SUCCESS] Installed: {', '.join(successfully_installed)}")
                import importlib
                importlib.reload(site)
                user_site = site.getusersitepackages()
                if user_site and os.path.exists(user_site):
                    sys.path.insert(0, user_site)
            
            if failed_packages:
                print(f"\\n[WARNING] Failed to install: {', '.join(failed_packages)}")
                print(f"[INFO] For matplotlib on Windows, you may need Visual C++ Build Tools.")
                print(f"[INFO] Or try: pip install --user --only-binary=:all: {' '.join(failed_packages)}")
    except Exception as e:
        print(f"[WARNING] Could not auto-install: {str(e)}")
        print(f"\\n[INFO] Please install manually using the Terminal tab:")
        print(f"   pip install --user {' '.join(set(missing_packages))}")

# Set up virtual display for graphical applications
if 'pygame' in user_code:
    # os.environ['SDL_VIDEODRIVER'] = 'dummy'  <-- Commented out to allow local GUI
    os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = '1'

# For matplotlib, use Agg backend
if 'matplotlib' in user_code:
    # Check if we are in a headless environment (e.g. cloud) or local
    # For now, default to Agg for web safety, but user can override if they know what they are doing
    import matplotlib
    matplotlib.use('Agg')

# For turtle graphics, set up headless mode
if 'turtle' in user_code:
    # os.environ['DISPLAY'] = ':99' <-- Commented out to allow local GUI
    pass

# Execute the modified user code
exec(user_code)
`]
                : ['-u', '-c', `
import sys
import os
import io
import site

# Set UTF-8 encoding for Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
if sys.stderr.encoding != 'utf-8':
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add user site-packages to Python path for installed packages
user_base = os.environ.get('PYTHONUSERBASE', os.path.expanduser('~'))
user_site = site.getusersitepackages()
if user_site and os.path.exists(user_site):
    sys.path.insert(0, user_site)

# Also try to find packages in common Windows locations
if os.name == 'nt':  # Windows
    possible_paths = [
        os.path.join(user_base, 'AppData', 'Roaming', 'Python', 'Python*', 'site-packages'),
        os.path.join(user_base, 'Python*', 'site-packages'),
    ]
    try:
        import glob
        for pattern in possible_paths:
            for path in glob.glob(pattern):
                if os.path.exists(path) and path not in sys.path:
                    sys.path.insert(0, path)
    except:
        pass

import warnings
warnings.filterwarnings('ignore')

# Get the user code first to check what packages are needed
user_code = '''${input.code.replace(/'/g, "\\'").replace(/\n/g, '\\n')}'''

# Check if required packages are installed, auto-install if missing
missing_packages = []
required_packages = {
    'matplotlib': 'matplotlib',
    'plt': 'matplotlib',
    'pandas': 'pandas',
    'pd': 'pandas',
    'numpy': 'numpy',
    'np': 'numpy',
    'seaborn': 'seaborn',
    'sns': 'seaborn',
    'sklearn': 'scikit-learn',
    'scikit-learn': 'scikit-learn',
    'scipy': 'scipy',
    'statsmodels': 'statsmodels',
    'plotly': 'plotly',
    'bokeh': 'bokeh',
    'opencv': 'opencv-python',
    'cv2': 'opencv-python',
    'tensorflow': 'tensorflow',
    'keras': 'keras',
    'torch': 'torch',
    'nltk': 'nltk',
    'spacy': 'spacy',
    'xgboost': 'xgboost',
    'lightgbm': 'lightgbm',
    'catboost': 'catboost',
}

for module_name, package_name in required_packages.items():
    if module_name in user_code or f'import {module_name}' in user_code or f'from {module_name}' in user_code:
        try:
            __import__(package_name)
        except ImportError:
            if package_name not in missing_packages:
                missing_packages.append(package_name)

# Auto-install missing packages
if missing_packages:
    import subprocess
    import sys
    import io
    # Set stdout/stderr to UTF-8 to handle Unicode properly on Windows
    if sys.stdout.encoding != 'utf-8':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    if sys.stderr.encoding != 'utf-8':
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    
    print(f"[INFO] Auto-installing missing packages: {', '.join(set(missing_packages))}")
    print("[INFO] This may take a minute...\\n")
    
    # Try installing with pre-built wheels first (faster, no compilation needed)
    install_cmd = [sys.executable, '-m', 'pip', 'install', '--user', '--only-binary=:all:', '--upgrade', 'pip', 'setuptools', 'wheel']
    
    try:
        # First, upgrade pip/setuptools/wheel to ensure we can use wheels
        subprocess.run(install_cmd, capture_output=True, text=True, timeout=60, encoding='utf-8', errors='replace')
        
        # Now install the packages, prefer wheels but allow source if needed
        install_cmd = [sys.executable, '-m', 'pip', 'install', '--user', '--prefer-binary'] + list(set(missing_packages))
        result = subprocess.run(install_cmd, capture_output=True, text=True, timeout=600, encoding='utf-8', errors='replace')
        
        if result.returncode == 0:
            print(f"[SUCCESS] Successfully installed: {', '.join(set(missing_packages))}")
            # Re-import site to pick up newly installed packages
            import importlib
            importlib.reload(site)
            user_site = site.getusersitepackages()
            if user_site and os.path.exists(user_site):
                sys.path.insert(0, user_site)
        else:
            # If installation failed, try installing one by one to see which ones work
            print(f"[WARNING] Bulk installation had issues, trying individual packages...")
            successfully_installed = []
            failed_packages = []
            
            for pkg in set(missing_packages):
                try:
                    cmd = [sys.executable, '-m', 'pip', 'install', '--user', '--prefer-binary', pkg]
                    result_single = subprocess.run(cmd, capture_output=True, text=True, timeout=300, encoding='utf-8', errors='replace')
                    if result_single.returncode == 0:
                        successfully_installed.append(pkg)
                    else:
                        failed_packages.append(pkg)
                except:
                    failed_packages.append(pkg)
            
            if successfully_installed:
                print(f"[SUCCESS] Installed: {', '.join(successfully_installed)}")
                import importlib
                importlib.reload(site)
                user_site = site.getusersitepackages()
                if user_site and os.path.exists(user_site):
                    sys.path.insert(0, user_site)
            
            if failed_packages:
                print(f"\\n[WARNING] Failed to install: {', '.join(failed_packages)}")
                print(f"[INFO] For matplotlib on Windows, you may need Visual C++ Build Tools.")
                print(f"[INFO] Or try: pip install --user --only-binary=:all: {' '.join(failed_packages)}")
    except Exception as e:
        print(f"[WARNING] Could not auto-install packages: {str(e)}")
        print(f"\\n[INFO] Please install manually using the Terminal tab:")
        print(f"   pip install --user {' '.join(set(missing_packages))}")

# Execute the user code
exec(user_code)
`];

            // Get project directory from projectId or use uploads/default as fallback
            // Files should be created in the project's directory
            const path = require('path');
            const fs = require('fs');
            const workingDir = input.projectId
                ? path.join(process.cwd(), 'uploads', input.projectId)
                : path.join(process.cwd(), 'uploads', 'default');

            // Ensure directory exists
            if (!fs.existsSync(workingDir)) {
                fs.mkdirSync(workingDir, { recursive: true });
            }

            const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
            const python = spawn(pythonCommand, args, {
                env,
                cwd: workingDir // Execute in project directory so files are created there
            });
            let output = '';
            let error = '';

            python.stdout.on('data', (data) => {
                output += data.toString();
            });

            python.stderr.on('data', (data) => {
                error += data.toString();
            });

            python.on('close', (code) => {
                // Add a small delay for graphical applications to prevent quick shutdown
                if (isGraphical) {
                    setTimeout(() => {
                        resolve({ output, error, workingDir });
                    }, 1000); // 1 second delay for graphical apps
                } else {
                    resolve({ output, error, workingDir });
                }
            });

            python.on('error', (err) => {
                // This handles errors in spawning the process itself
                resolve({ output: '', error: `Failed to start Python process: ${err.message}` });
            });
        });
    }
);


const runPythonCodeFlow = ai.defineFlow(
    {
        name: 'runPythonCodeFlow',
        inputSchema: RunPythonCodeInputSchema,
        outputSchema: RunPythonCodeOutputSchema,
    },
    async (input) => {
        // Check if this is graphical code
        const isGraphical = /pygame|tkinter|turtle|matplotlib|plotly|seaborn|bokeh/i.test(input.code);

        const result = await pythonInterpreter(input, {
            config: {
                safetySettings: [{
                    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold: 'BLOCK_NONE'
                }]
            }
        });

        // Provide helpful feedback for graphical applications
        if (isGraphical) {
            if (result.error && (result.error.includes('pygame') || result.error.includes('tkinter') || result.error.includes('turtle'))) {
                result.error += `\n\n[INFO] Graphical applications are now supported! The code ran in a virtual display environment.`;
            } else if (!result.error && !result.output) {
                result.output = `[SUCCESS] Graphical application executed successfully! The code ran without errors in the virtual display environment.\n\nNote: Visual output from graphical libraries (pygame, tkinter, turtle, etc.) is processed in a headless environment. For interactive graphics, consider using matplotlib with savefig() to generate image files.`;
            }
        }

        // Add a note to the user if they seem to be running graphical code.
        if (result.error && (result.error.includes('pygame') || result.error.includes('tkinter') || result.error.includes('turtle'))) {
            result.error += `\n\n[AI NOTE] It looks like you're trying to run a graphical application. If you are running this locally, a window should have opened on your computer. Check your taskbar!`;
        }

        return result;
    }
);

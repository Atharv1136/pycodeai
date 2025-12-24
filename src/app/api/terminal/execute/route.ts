import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { createClient } from '@/lib/supabase/server';

/**
 * Terminal Execute API endpoint
 * POST /api/terminal/execute
 * Executes shell commands (alias for /api/terminal)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command, projectId, userId } = body;

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      );
    }

    // Security: Only allow safe commands
    const trimmedCommand = command.trim();
    const commandLower = trimmedCommand.toLowerCase();

    // Allow pip commands (install, uninstall, list, show, freeze)
    const isPipCommand = /^pip\s+(install|uninstall|list|show|freeze)/.test(commandLower);
    // Allow python/python3 commands (but only safe ones)
    const isPythonCommand = /^python3?\s+(--version|--help|-m\s+)/.test(commandLower);
    // Allow basic commands
    const isBasicCommand = /^(ls|pwd|echo|cat|head|tail|wc)\s*/.test(commandLower);

    if (!isPipCommand && !isPythonCommand && !isBasicCommand) {
      return NextResponse.json(
        {
          error: 'Command not allowed. Only pip commands (install, uninstall, list, show, freeze), Python commands (--version, --help, -m), and basic shell commands (ls, pwd, echo, cat, head, tail, wc) are allowed.',
          allowed: ['pip install', 'pip uninstall', 'pip list', 'pip show', 'pip freeze', 'python --version', 'python --help', 'python -m', 'ls', 'pwd', 'echo', 'cat', 'head', 'tail', 'wc']
        },
        { status: 403 }
      );
    }

    // For pip install commands, track packages (if project/user context available)
    if (commandLower.startsWith('pip install')) {
      const packageMatch = trimmedCommand.match(/pip\s+install\s+(.+)/i);
      if (packageMatch && projectId && userId) {
        const packages = packageMatch[1]
          .split(/\s+/)
          .filter(pkg => pkg && !pkg.startsWith('-'));

        // Save installed packages to database
        try {
          const supabase = await createClient();
          for (const pkg of packages) {
            // Remove version specifiers if any
            const pkgName = pkg.split(/[=<>!]/)[0].trim();

            // Check if package exists for this project
            const { data: existing } = await supabase
              .from('installed_packages')
              .select('id')
              .eq('project_id', projectId)
              .eq('package_name', pkgName)
              .single();

            if (existing) {
              await supabase
                .from('installed_packages')
                .update({
                  package_spec: pkg,
                  installed_at: new Date().toISOString()
                })
                .eq('id', existing.id);
            } else {
              await supabase
                .from('installed_packages')
                .insert({
                  project_id: projectId,
                  user_id: userId,
                  package_name: pkgName,
                  package_spec: pkg,
                  installed_at: new Date().toISOString()
                });
            }
          }
        } catch (dbError) {
          console.error('Error tracking package installation:', dbError);
          // Continue execution even if tracking fails
        }
      }
    }

    // Execute the command
    return new Promise((resolve) => {
      let output = '';
      let errorOutput = '';

      // Parse command and arguments
      const parts = trimmedCommand.split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);

      // Check if this is a pip install command (for timeout and stderr handling)
      const isPipInstall = cmd === 'pip' && args[0] === 'install';

      // Use python3 -m pip instead of pip directly for better compatibility
      let actualCmd = cmd;
      let actualArgs = args;
      let useShell = false;

      // Handle Windows built-in commands (echo, dir, etc.)
      if (process.platform === 'win32') {
        const windowsBuiltIns = ['echo', 'dir', 'type', 'cd', 'cls'];
        if (windowsBuiltIns.includes(cmd.toLowerCase())) {
          actualCmd = 'cmd';
          actualArgs = ['/c', trimmedCommand];
          useShell = false;
        }
      }

      if (cmd === 'pip') {
        actualCmd = 'python3';
        // Use --user flag to install packages in user directory (safer)
        if (args[0] === 'install' && !args.includes('--user') && !args.includes('--system')) {
          actualArgs = ['-m', 'pip', 'install', '--user', ...args.slice(1)];
        } else {
          actualArgs = ['-m', 'pip', ...args];
        }
      }

      // Set PYTHONUSERBASE for package installation location
      const userBase = process.env.HOME || process.env.USERPROFILE || (process.platform === 'win32' ? process.env.APPDATA : '/tmp');

      const child = spawn(actualCmd, actualArgs, {
        env: {
          ...process.env,
          PYTHONUSERBASE: userBase,
          PATH: process.env.PATH || '',
        },
        shell: useShell,
      });

      child.stdout.on('data', (data) => {
        output += data.toString();
        // For pip install, show progress in real-time
        if (isPipInstall) {
          console.log('pip install progress:', data.toString().slice(0, 100));
        }
      });

      child.stderr.on('data', (data) => {
        const dataStr = data.toString();
        // pip often sends progress and notices to stderr
        // For pip commands (install, list, show, freeze), treat stderr as output unless it's a real error
        const isPipCommand = cmd === 'pip';
        if (isPipCommand && !dataStr.includes('ERROR') && !dataStr.includes('FATAL')) {
          // For pip list/show/freeze, notices are normal, include them in output
          output += dataStr;
        } else if (isPipInstall && !dataStr.includes('ERROR')) {
          output += dataStr;
        } else {
          errorOutput += dataStr;
        }
      });

      // Set a longer timeout for pip install commands (they can take a while)
      const timeoutDuration = isPipInstall ? 600000 : 60000; // 10 minutes for pip install, 1 minute for others

      const timeout = setTimeout(() => {
        child.kill();
        if (!child.killed) {
          resolve(NextResponse.json({
            success: false,
            output: '',
            error: `Command timed out after ${timeoutDuration / 1000} seconds`,
            exitCode: -1,
          }, { status: 408 }));
        }
      }, timeoutDuration);

      child.on('close', (code) => {
        clearTimeout(timeout);
        resolve(NextResponse.json({
          success: code === 0,
          output: output || errorOutput,
          error: code !== 0 ? errorOutput : undefined,
          exitCode: code,
        }));
      });

      child.on('error', (err) => {
        clearTimeout(timeout);
        resolve(NextResponse.json({
          success: false,
          output: '',
          error: `Failed to execute command: ${err.message}`,
          exitCode: -1,
        }, { status: 500 }));
      });
    });
  } catch (error: any) {
    console.error('[API] Terminal command error:', error);
    return NextResponse.json(
      { error: 'Failed to execute command', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


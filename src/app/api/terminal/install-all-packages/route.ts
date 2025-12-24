import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { pool } from '@/lib/database';

// List of all packages to install
const ALL_PACKAGES = [
  'numpy',
  'pandas',
  'matplotlib',
  'seaborn',
  'scipy',
  'statsmodels',
  'scikit-learn',
  'xgboost',
  'lightgbm',
  'catboost',
  'tensorflow',
  'keras',
  'torch',
  'torchvision',
  'torchaudio',
  'missingno',
  'category_encoders',
  'imbalanced-learn',
  'pyjanitor',
  'plotly',
  'bokeh',
  'altair',
  'dash',
  'dask',
  'pyspark',
  'vaex',
  'nltk',
  'spacy',
  'transformers',
  'textblob',
  'opencv-python',
  'mediapipe',
  'sqlalchemy'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, userId } = body;

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: 'Project ID and User ID are required' },
        { status: 400 }
      );
    }

    // Set PYTHONUSERBASE for package installation location
    const userBase = process.env.HOME || process.env.USERPROFILE || (process.platform === 'win32' ? process.env.APPDATA : '/tmp');
    
    // Install all packages
    const actualCmd = 'python3';
    const actualArgs = ['-m', 'pip', 'install', '--user', ...ALL_PACKAGES];

    return new Promise((resolve) => {
      let output = '';
      let errorOutput = '';
      
      const child = spawn(actualCmd, actualArgs, {
        env: {
          ...process.env,
          PYTHONUSERBASE: userBase,
          PATH: process.env.PATH || '',
        },
        shell: false,
      });

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        // pip often sends progress to stderr, treat it as output unless it's an error
        if (!data.toString().includes('ERROR')) {
          output += data.toString();
        } else {
          errorOutput += data.toString();
        }
      });

      // Track installed packages
      const installedPackages: string[] = [];

      child.on('close', async (code) => {
        // Extract successfully installed packages from output
        const installedMatches = output.match(/Successfully installed (.+)/g);
        if (installedMatches) {
          installedMatches.forEach(match => {
            const packages = match.replace('Successfully installed ', '').split(/\s+/);
            installedPackages.push(...packages);
          });
        }

        // Save installed packages to database
        if (installedPackages.length > 0) {
          try {
            for (const pkgName of installedPackages) {
              const pkgNameClean = pkgName.split(/[=<>!]/)[0].trim();
              await pool.execute(`
                INSERT INTO installed_packages (id, project_id, user_id, package_name, package_spec, installed_at)
                VALUES (?, ?, ?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE
                  package_spec = VALUES(package_spec),
                  installed_at = NOW()
              `, [
                `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                projectId,
                userId,
                pkgNameClean,
                pkgName
              ]);
            }
          } catch (dbError) {
            console.error('Error tracking package installation:', dbError);
          }
        }

        resolve(NextResponse.json({
          success: code === 0,
          output: output || errorOutput,
          error: code !== 0 ? errorOutput : undefined,
          exitCode: code,
          installedPackages: installedPackages.length > 0 ? installedPackages : ALL_PACKAGES,
        }));
      });

      child.on('error', (err) => {
        resolve(NextResponse.json({
          success: false,
          output: '',
          error: `Failed to start Python process: ${err.message}`,
          exitCode: -1,
        }, { status: 500 }));
      });

      // Extended timeout for large package installation (15 minutes)
      const timeout = setTimeout(() => {
        child.kill();
        resolve(NextResponse.json({
          success: false,
          output: output || 'Installation in progress...',
          error: 'Installation timed out after 15 minutes. Some packages may have been installed. Check with "pip list".',
          exitCode: -1,
        }, { status: 408 }));
      }, 900000); // 15 minutes

      child.on('close', () => {
        clearTimeout(timeout);
      });
    });
  } catch (error) {
    console.error('Package installation error:', error);
    return NextResponse.json(
      { error: 'Failed to install packages', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

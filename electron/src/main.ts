import { app, BrowserWindow } from 'electron';
import { spawn, fork } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let backendProcess: any = null;
let frontendProcess: any = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    // Load frontend (Next.js dev server for development)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    mainWindow.loadURL(frontendUrl);
    mainWindow.webContents.openDevTools();
  } else {
    // Load static frontend for production
    // In production, resources are in resources/app.asar/frontend/out or similar, 
    // but we will configure electron-builder to put them in a specific place.
    // Let's assume we copy frontend/out to resources/frontend
    const frontendPath = path.join(process.resourcesPath, 'frontend', 'index.html');
    mainWindow.loadFile(frontendPath);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  if (isDev) {
    const backendPath = path.join(__dirname, '..', '..', 'backend');
    console.log('Starting NestJS backend in dev mode...');
    backendProcess = spawn('npm', ['run', 'start:dev'], {
      cwd: backendPath,
      shell: true,
      stdio: 'inherit',
    });
  } else {
    // Production: Run the compiled main.js
    // We expect backend/dist to be copied to resources/backend/dist
    const backendEntry = path.join(process.resourcesPath, 'backend', 'dist', 'main.js');
    console.log('Starting NestJS backend in production mode...', backendEntry);
    
    // We need to set the working directory to where node_modules are (resources/backend)
    const backendCwd = path.join(process.resourcesPath, 'backend');

    backendProcess = fork(backendEntry, [], {
      cwd: backendCwd,
      env: {
        ...process.env,
        PORT: '3001', // Enforce port 3001
        NODE_ENV: 'production',
      },
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });

    backendProcess.stdout?.on('data', (data: any) => {
      console.log(`[Backend]: ${data}`);
    });

    backendProcess.stderr?.on('data', (data: any) => {
      console.error(`[Backend Error]: ${data}`);
    });
  }

  if (backendProcess) {
    backendProcess.on('error', (error: Error) => {
      console.error('Backend process error:', error);
    });
  }
}

function startFrontend() {
  if (isDev) {
    const frontendPath = path.join(__dirname, '..', '..', 'frontend');
    console.log('Starting Next.js frontend...');
    frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: frontendPath,
      shell: true,
      stdio: 'inherit',
    });

    frontendProcess.on('error', (error: Error) => {
      console.error('Frontend process error:', error);
    });
  }
  // In production, frontend is static, so no process needed.
}

app.on('ready', () => {
  // Start backend and frontend processes
  startBackend();
  startFrontend();

  // Wait for services to start, then create window
  // In production, backend might take a moment, but frontend is static so it loads instantly.
  // However, frontend needs backend to be ready.
  setTimeout(() => {
    createWindow();
  }, isDev ? 5000 : 3000); 
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Clean up child processes
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendProcess) {
    frontendProcess.kill();
  }
});

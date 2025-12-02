const { fork } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

let backendProcess = null;
const BACKEND_PORT = 3001;

// Check if running in packaged mode
const isPackaged = !fs.existsSync(path.join(__dirname, '..', 'backend'));
console.log('[NW.js] Is packaged:', isPackaged);
console.log('[NW.js] __dirname:', __dirname);

// Start backend server
function startBackend() {
  return new Promise((resolve, reject) => {
    if (!isPackaged) {
      // Development: run from source
      const backendPath = path.join(__dirname, '..', 'backend');
      console.log('[NW.js] Starting backend in dev mode:', backendPath);
      
      backendProcess = require('child_process').spawn('npm', ['run', 'start:dev'], {
        cwd: backendPath,
        shell: true,
        stdio: 'inherit'
      });
    } else {
      // Production: run compiled backend
      const backendEntry = path.join(__dirname, 'resources', 'backend', 'dist', 'main.js');
      const backendCwd = path.join(__dirname, 'resources', 'backend');
      
      console.log('[NW.js] Starting backend in production mode');
      console.log('[NW.js] Backend entry:', backendEntry);
      console.log('[NW.js] Backend CWD:', backendCwd);
      console.log('[NW.js] Entry exists:', fs.existsSync(backendEntry));
      
      if (!fs.existsSync(backendEntry)) {
        const error = new Error(`Backend entry not found: ${backendEntry}`);
        console.error('[NW.js] ERROR:', error.message);
        reject(error);
        return;
      }
      
      backendProcess = fork(backendEntry, [], {
        cwd: backendCwd,
        env: {
          ...process.env,
          PORT: BACKEND_PORT.toString(),
          NODE_ENV: 'production'
        },
        stdio: ['ignore', 'pipe', 'pipe', 'ipc']
      });
      
      backendProcess.stdout?.on('data', (data) => {
        console.log(`[Backend]: ${data}`);
      });
      
      backendProcess.stderr?.on('data', (data) => {
        console.error(`[Backend Error]: ${data}`);
      });
    }
    
    if (!backendProcess) {
      reject(new Error('Failed to start backend process'));
      return;
    }
    
    backendProcess.on('error', (error) => {
      console.error('[NW.js] Backend process error:', error);
      reject(error);
    });
    
    backendProcess.on('exit', (code) => {
      console.log(`[NW.js] Backend process exited with code ${code}`);
    });
    
    // Wait for backend to be ready
    console.log('[NW.js] Waiting for backend to start...');
    setTimeout(() => {
      checkBackendReady(resolve, reject, 0);
    }, 2000);
  });
}

function checkBackendReady(resolve, reject, attempts) {
  if (attempts > 30) {
    const error = new Error('Backend failed to start after 30 attempts');
    console.error('[NW.js] ERROR:', error.message);
    reject(error);
    return;
  }
  
  console.log(`[NW.js] Checking backend (attempt ${attempts + 1}/30)...`);
  
  http.get(`http://localhost:${BACKEND_PORT}`, (res) => {
    console.log('[NW.js] Backend is ready!');
    resolve();
  }).on('error', (err) => {
    console.log(`[NW.js] Backend not ready yet: ${err.message}`);
    setTimeout(() => checkBackendReady(resolve, reject, attempts + 1), 1000);
  });
}

// Load frontend
function loadFrontend() {
  const loading = document.getElementById('loading');
  const app = document.getElementById('app');
  
  console.log('[NW.js] Loading frontend...');
  
  if (!isPackaged) {
    // Development: load from dev server (assume it's running)
    console.log('[NW.js] Loading from dev server');
    app.src = `http://localhost:3000`;
  } else {
    // Production: load from static files
    const frontendPath = path.join(__dirname, 'resources', 'frontend', 'index.html');
    console.log('[NW.js] Loading from static files:', frontendPath);
    console.log('[NW.js] Frontend exists:', fs.existsSync(frontendPath));
    app.src = `file:///${frontendPath.replace(/\\/g, '/')}`;
  }
  
  app.onload = () => {
    console.log('[NW.js] Frontend loaded successfully');
    loading.classList.add('hidden');
    app.style.display = 'block';
  };
  
  app.onerror = (error) => {
    console.error('[NW.js] Frontend load error:', error);
  };
}

// Initialize
console.log('[NW.js] Initializing application...');

startBackend()
  .then(() => {
    console.log('[NW.js] Backend started, loading frontend...');
    loadFrontend();
  })
  .catch((error) => {
    console.error('[NW.js] Failed to start application:', error);
    alert(`Failed to start backend server:\n\n${error.message}\n\nCheck the console (F12) for details.`);
  });

// Cleanup on exit
process.on('exit', () => {
  console.log('[NW.js] Application exiting...');
  if (backendProcess) {
    backendProcess.kill();
  }
});

nw.Window.get().on('close', function() {
  console.log('[NW.js] Window closing...');
  if (backendProcess) {
    backendProcess.kill();
  }
  this.close(true);
});

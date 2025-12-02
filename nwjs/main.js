const { fork } = require('child_process');
const path = require('path');
const http = require('http');

let backendProcess = null;
const BACKEND_PORT = 3001;
const FRONTEND_PORT = 3000;

// Start backend server
function startBackend() {
  return new Promise((resolve, reject) => {
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // Development: run from source
      const backendPath = path.join(__dirname, '..', 'backend');
      console.log('Starting backend in dev mode:', backendPath);
      
      backendProcess = require('child_process').spawn('npm', ['run', 'start:dev'], {
        cwd: backendPath,
        shell: true,
        stdio: 'inherit'
      });
    } else {
      // Production: run compiled backend
      const backendEntry = path.join(__dirname, 'resources', 'backend', 'dist', 'main.js');
      const backendCwd = path.join(__dirname, 'resources', 'backend');
      
      console.log('Starting backend in production mode:', backendEntry);
      
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
    
    backendProcess.on('error', (error) => {
      console.error('Backend process error:', error);
      reject(error);
    });
    
    // Wait for backend to be ready
    setTimeout(() => {
      checkBackendReady(resolve, reject, 0);
    }, 2000);
  });
}

function checkBackendReady(resolve, reject, attempts) {
  if (attempts > 30) {
    reject(new Error('Backend failed to start'));
    return;
  }
  
  http.get(`http://localhost:${BACKEND_PORT}`, (res) => {
    console.log('Backend is ready');
    resolve();
  }).on('error', () => {
    setTimeout(() => checkBackendReady(resolve, reject, attempts + 1), 1000);
  });
}

// Load frontend
function loadFrontend() {
  const isDev = process.env.NODE_ENV === 'development';
  const loading = document.getElementById('loading');
  const app = document.getElementById('app');
  
  if (isDev) {
    // Development: load from dev server
    app.src = `http://localhost:${FRONTEND_PORT}`;
  } else {
    // Production: load from static files
    const frontendPath = path.join(__dirname, 'resources', 'frontend', 'index.html');
    app.src = `file://${frontendPath}`;
  }
  
  app.onload = () => {
    loading.classList.add('hidden');
    app.style.display = 'block';
  };
}

// Initialize
startBackend()
  .then(() => {
    loadFrontend();
  })
  .catch((error) => {
    console.error('Failed to start backend:', error);
    alert('Failed to start backend server. Please check the console for details.');
  });

// Cleanup on exit
process.on('exit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

nw.Window.get().on('close', function() {
  if (backendProcess) {
    backendProcess.kill();
  }
  this.close(true);
});

// NW.js browser context - define __dirname manually
const path = nw.require('path');
const fs = nw.require('fs');
const http = nw.require('http');
const { spawn } = nw.require('child_process');

// Get the directory where package.json is located
const __dirname = path.dirname(process.mainModule.filename);

let backendProcess = null;
let frontendServer = null;
const BACKEND_PORT = 3001;
const FRONTEND_PORT = 3002;

// Check if running in packaged mode - check if resources folder exists
const isPackaged = fs.existsSync(path.join(__dirname, 'resources', 'backend', 'dist'));
console.log('[NW.js] Is packaged:', isPackaged);
console.log('[NW.js] __dirname:', __dirname);

// Start backend server
function startBackend() {
  return new Promise((resolve, reject) => {
    if (!isPackaged) {
      // Development: run from source
      const backendPath = path.join(__dirname, '..', 'backend');
      console.log('[NW.js] Starting backend in dev mode:', backendPath);

      backendProcess = spawn('npm', ['run', 'start:dev'], {
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

      // Use spawn with node instead of fork for NW.js compatibility
      backendProcess = spawn('node', [backendEntry], {
        cwd: backendCwd,
        env: {
          ...process.env,
          PORT: BACKEND_PORT.toString(),
          NODE_ENV: 'production'
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
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

// Start a simple static file server for frontend
function startFrontendServer() {
  return new Promise((resolve, reject) => {
    if (!isPackaged) {
      resolve();
      return;
    }

    const frontendPath = path.join(__dirname, 'resources', 'frontend');
    console.log('[NW.js] Starting frontend server for:', frontendPath);

    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf'
    };

    frontendServer = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0]; // Remove query string
      let filePath = path.join(frontendPath, urlPath === '/' ? 'index.html' : urlPath);

      // Handle Next.js client-side routing
      if (!path.extname(filePath)) {
        if (fs.existsSync(filePath + '.html')) {
          filePath = filePath + '.html';
        } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
          filePath = path.join(filePath, 'index.html');
        }
      }

      const extname = path.extname(filePath);
      const contentType = mimeTypes[extname] || 'application/octet-stream';

      fs.readFile(filePath, (error, content) => {
        if (error) {
          if (error.code === 'ENOENT') {
            // Serve index.html for client-side routing
            fs.readFile(path.join(frontendPath, 'index.html'), (err, indexContent) => {
              if (err) {
                res.writeHead(404);
                res.end('File not found');
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(indexContent, 'utf-8');
              }
            });
          } else {
            res.writeHead(500);
            res.end(`Server Error: ${error.code}`);
          }
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });

    frontendServer.listen(FRONTEND_PORT, () => {
      console.log(`[NW.js] Frontend server running on http://localhost:${FRONTEND_PORT}`);
      resolve();
    });

    frontendServer.on('error', (err) => {
      console.error('[NW.js] Frontend server error:', err);
      reject(err);
    });
  });
}

// Load frontend
function loadFrontend() {
  const loading = document.getElementById('loading');
  const app = document.getElementById('app');

  console.log('[NW.js] Loading frontend...');

  if (!isPackaged) {
    console.log('[NW.js] Loading from dev server');
    app.src = `http://localhost:3000`;
  } else {
    console.log('[NW.js] Loading from local HTTP server');
    app.src = `http://localhost:${FRONTEND_PORT}`;
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

Promise.all([startBackend(), startFrontendServer()])
  .then(() => {
    console.log('[NW.js] All servers started, loading frontend...');
    loadFrontend();
  })
  .catch((error) => {
    console.error('[NW.js] Failed to start application:', error);
    alert(`Failed to start application:\n\n${error.message}\n\nCheck the console (F12) for details.`);
  });

// Cleanup on exit
process.on('exit', () => {
  console.log('[NW.js] Application exiting...');
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendServer) {
    frontendServer.close();
  }
});

nw.Window.get().on('close', function () {
  console.log('[NW.js] Window closing...');
  if (backendProcess) {
    backendProcess.kill();
  }
  if (frontendServer) {
    frontendServer.close();
  }
  this.close(true);
});

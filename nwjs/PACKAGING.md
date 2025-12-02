# Simple Manual NW.js Packaging

Since `nw-builder` API is complex, here's a manual packaging approach:

## Steps:

1. **Download NW.js SDK**:

   ```
   https://nwjs.io/downloads/
   ```

   Download Windows x64 normal build

2. **Copy application files**:

   - Copy `nwjs` folder contents to NW.js folder
   - Copy `backend/dist` and `backend/node_modules` to `nwjs/resources/backend/`
   - Copy `frontend/out` to `nwjs/resources/frontend/`

3. **Run NW.js**:

   ```
   nw.exe <path-to-nwjs-folder>
   ```

4. **Create distributable**:
   - Combine all files into a single package.nw
   - Or distribute NW.js runtime with your app folder

## Alternative: Use simple script

Create a PowerShell script to automate this.

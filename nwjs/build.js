const { nwbuild } = require('nw-builder');
const path = require('path');

async function build() {
  try {
    console.log('Building NW.js application...');
    
    await nwbuild({
      mode: 'build',
      version: 'latest',
      flavor: 'normal',
      platform: 'win',
      arch: 'x64',
      srcDir: __dirname,
      outDir: path.join(__dirname, '..', 'dist'),
      cacheDir: path.join(__dirname, '..', 'cache'),
      glob: false,
      app: {
        name: 'TagFlow',
        version: '1.0.0'
      }
    });
    
    console.log('Build completed successfully!');
    console.log('Executable location: dist/TagFlow/win-x64/');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();

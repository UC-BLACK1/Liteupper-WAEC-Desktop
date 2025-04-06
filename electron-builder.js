const { execSync } = require('child_process');
const fs = require('fs');

const config = {
  win: {
    target: ["nsis"],
    icon: "assets/icon.ico",
    signingHashAlgorithms: ["sha256"],
    extraResources: ["main.js", "assets/**/*"]
  }
};

if (process.env.CODE_SIGN_SCRIPT_PATH) {
  const version = execSync('node -p "require(\'./package.json\').version"').toString().trim();
  const appName = require('./package.json').build.productName || "LiteUpper";
  const versionedExe = `${appName} Setup ${version}.exe`;

  config.win.sign = (configuration) => {
    console.log("🖊️ Requested signing for:", configuration.path);
    console.log("🔍 Looking for:", versionedExe);

    if (!configuration.path.includes(versionedExe)) {
      console.log("⏭️ Skipping signing: not the target EXE.");
      return true;
    }

    if (!fs.existsSync(configuration.path)) {
      console.error(`❌ Cannot sign, file does not exist: ${configuration.path}`);
      return false;
    }

    const scriptPath = process.env.CODE_SIGN_SCRIPT_PATH;

    try {
      console.log(`🚀 Running sign script at: ${scriptPath}`);
      execSync(`node "${scriptPath}"`, {
        stdio: 'inherit',
        timeout: 5 * 60 * 1000 // 5 mins max
      });
      console.log("✅ Signing completed.");
    } catch (error) {
      console.error(`❌ Error executing signing script: ${error.message}`);
      return false;
    }

    return true;
  };
}

module.exports = config;

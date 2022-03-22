# Goblin Desktop Web

Serve and deploy the web portal for goblin-desktop.
This module work greats if you already have a goblin-desktop based app.

Your app config must use a profile configuration with a mandate key.
Your app must provide the configureNewDesktopSession quest.

## Usage:

Use the builder to configure your webapp service file.

The service file must be named according your appName, 
ex: if your appName is myapp, create a myapp-web.js service file:

```myapp-web.js
exports.xcraftCommands = function () {
  const builder = require(`goblin-desktop-web`);
  const config = {
    appName: 'myapp',
    themeContexts: ['default'],
    localPort: 9080,
  };
  return builder(config);
};
```

Boot the webapp when you init your app: 
```service.js
//init quest:
yield quest.cmd('myapp-web.boot');
```
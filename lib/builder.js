'use strict';
const Goblin = require('xcraft-core-goblin');
/*Example: {
    appName: 'epsitec-web',
    themeContexts: ['default'],
    localPort: 9080
}
*/
module.exports = (config) => {
  const goblinName = `${config.appName}-web`;
  const logicState = {
    id: goblinName,
    desktopId: null,
  };
  const logicHandlers = {};

  Goblin.registerQuest(goblinName, 'boot', function* (quest) {
    const appConfig = require('xcraft-core-etc')().load(
      `goblin-${config.appName}`
    );
    const configuration = appConfig.profile;
    quest.goblin.setX('configuration', configuration);
    const {mandate} = configuration;
    const webpackServerUrl = yield quest.me.initWebpack();
    const server = yield quest.me.initWebserver({mandate, webpackServerUrl});
    yield quest.me.initZeppelin({server, mandate});
    const {address, port} = server.address();
    console.log(
      '\x1b[32m%s\x1b[0m',
      `Goblin-Desktop-Web: http://${address}:${port} [RUNNING]`
    );
  });

  Goblin.registerQuest(goblinName, 'init-zeppelin', function* (
    quest,
    server,
    mandate
  ) {
    yield quest.cmd('zeppelin.init', {
      server,
      mandate,
      theme: 'default',
      themeContexts: config.themeContexts,
      onConnect: {
        goblin: goblinName,
        goblinId: quest.goblin.id,
        quest: 'openSession',
      },
      onBeginRender: {
        goblin: goblinName,
        goblinId: quest.goblin.id,
        quest: 'afterRender',
      },
      onDisconnect: {
        goblin: goblinName,
        goblinId: quest.goblin.id,
        quest: 'closeSession',
      },
      feeds: ['nabu', 'workshop'],
    });
  });

  Goblin.registerQuest(goblinName, 'init-webserver', function* (
    quest,
    mandate,
    webpackServerUrl
  ) {
    let wwwData = null;
    if (process.env.NODE_ENV === 'production') {
      wwwData = 'www-data';
    }
    const {host, port} = {port: config.localPort, host: 'localhost'};
    const webServerAPI = quest.getAPI('desktop-webserver');
    const desktopId = `system@${mandate}@desktop-webserver`;
    return yield webServerAPI.init({
      desktopId,
      host,
      port,
      wwwData,
      browserRendererOptions: {},
      useStaticPages:
        process.env.NODE_ENV !== 'development' || !webpackServerUrl,
      subServerUrl: webpackServerUrl,
    });
  });

  Goblin.registerQuest(goblinName, 'init-webpack', function* (quest) {
    if (process.env.NODE_ENV === 'production') {
      return null;
    }

    const webpackServerPort = 4001;
    const webpackServerUrl = `http://localhost:${webpackServerPort}/`;
    yield quest.cmd('webpack.server.start', {
      goblin: 'laboratory',
      mainGoblinModule: goblinName,
      jobId: quest.goblin.id,
      port: webpackServerPort,
      inspectPort: 13230,
      options: {
        indexFile: 'index-browsers.js',
        target: 'web',
        autoinc: true,
      },
    });

    quest.log.info(`Waiting for webpack goblin`);
    yield quest.sub.wait(`webpack.${quest.goblin.id}.done`);
    quest.log.info('Webpack done');

    return webpackServerUrl;
  });

  Goblin.registerQuest(goblinName, 'openSession', function* (
    quest,
    labId,
    desktopId,
    req,
    tokens,
    destination
  ) {
    let selectedLocale = null;

    const zeppelinSessionId = `zeppelin-session@${tokens.sessionToken}`;
    const zeppelinSession = quest.getAPI(zeppelinSessionId);
    yield zeppelinSession.setLocale({
      selectedLocale,
      acceptLanguage: req.headers['accept-language'],
    });

    const desktopRootId = desktopId;

    yield quest.createFor(labId, labId, desktopRootId, {
      id: desktopRootId,
      desktopId,
    });
    yield quest.cmd(`${config.appName}.configureNewDesktopSession`, {
      desktopId,
    });
    const labAPI = quest.getAPI(labId);
    yield labAPI.setRoot({widget: 'desktop-web-root', widgetId: desktopRootId});
    return {};
  });

  Goblin.registerQuest(goblinName, 'afterRender', function (
    quest,
    labId,
    desktopId,
    onConnectResult
  ) {});

  Goblin.registerQuest(goblinName, 'closeSession', function (
    quest,
    labId,
    desktopId
  ) {});

  const xcraftRC = Goblin.configure(goblinName, logicState, logicHandlers);
  // Singleton
  Goblin.createSingle(goblinName);
  return xcraftRC;
};

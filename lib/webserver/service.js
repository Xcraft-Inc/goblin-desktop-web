'use strict';

const path = require('path');
const goblinName = path.basename(module.parent.filename, '.js');
const Goblin = require('xcraft-core-goblin');
const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');

const {resourcesPath} = require('xcraft-core-host');

const logicState = {
  id: goblinName,
};

const logicHandlers = {};

const quests = {
  init: function* (
    quest,
    desktopId,
    host,
    port,
    wwwData,
    browserRendererOptions,
    useStaticPages,
    subServerUrl,
    next
  ) {
    quest.goblin.setX('desktopId', desktopId);

    const app = express();
    quest.goblin.setX('browserRendererOptions', browserRendererOptions);
    quest.goblin.setX('useStaticPages', useStaticPages);

    app.use(cookieParser());

    app.use(express.static(path.join(__dirname, 'www')));
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.use((req, res, next) => {
      if (subServerUrl) {
        const url = new URL(req.url, `${req.protocol}://${req.headers.host}`);
        const newUrl = new URL(url.pathname, subServerUrl);
        res.redirect(newUrl);
        return;
      }
      next();
    });

    if (wwwData) {
      app.use(express.static(path.join(resourcesPath, wwwData)));
    }

    const server = http.createServer(app);
    yield server.listen(port, host, next);
    return server;
  },

  delete: function (quest) {},
};

// Register all quests
for (const questName in quests) {
  Goblin.registerQuest(goblinName, questName, quests[questName]);
}

// Singleton
module.exports = Goblin.configure(goblinName, logicState, logicHandlers);
Goblin.createSingle(goblinName);

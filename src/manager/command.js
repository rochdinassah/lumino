// author: rochdi nassah

'use strict';

const EventEmitter = require('node:events');
const readline = require('node:readline');

const { stdin, stdout } = process;

class CommandManager extends EventEmitter {
  constructor(opts = {}) {
    super();

    const { logger } = opts;

    this.commands = new Map();
    this.logger = logger;
  }

  on(event_name, event_handler, description) {
    return (
      this.commands.set(event_name, { name_id: event_name, description }),
      super.on(event_name, event_handler)
    );
  }

  getCommandInfos(name_id) {
    const { commands } = this;

    if (Array.isArray(name_id))
      return name_id.map(name_id => commands.get(name_id));

    if (!name_id)
      return Array.from(commands.values());

    return commands.get(name_id);
  }
}

CommandManager.prototype.startListen = function () {
  this._interface = readline.createInterface({ input: stdin, output: stdout });
  this._interface.on('close', this.emit.bind(this, 'close'));
  this._interface.on('line', this.onLine.bind(this));
  return this;
};

CommandManager.prototype.stopListen = function () {
  this._interface.removeAllListeners('line');
  this._interface.removeAllListeners('close');
  this._interface.close();
  this._interface = null;
  return this;
};

CommandManager.prototype.onLine = function (line) {
  const [cmd, ...args] = line.trim().split(' ');
  this.emit(cmd, ...args);
};

CommandManager.prototype.close = function () {
  if (this._interface)
    this._interface.close();
};

module.exports = CommandManager;
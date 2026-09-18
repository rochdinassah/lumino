// author: rochdi nassah

'use strict';

window.stringify = JSON.stringify;
window.parse = JSON.parse;

window.keys = Object.keys;
window.values = Object.values;
window.entries = Object.entries;

window.sqrt = Math.sqrt;
window.abs = Math.abs;
window.min = Math.min;
window.max = Math.max;
window.round = Math.round;
window.floor = Math.floor;
window.ceil = Math.ceil;

window.isFloat = function (number) {
  return 0 !== number%1;
};

window.probabilityCallback = function (percentage, callback, ...args) {
  if (parseFloat(percentage) >= 0.0000000000000001+(100*Math.random()))
    callback(...args);
};

const TIMEOUT_MAX_VAL = 2**32/2-1;

window.asyncDelay = function (ms, max) {
  if (max)
    ms = rand(ms, max)
  if ('number' !== typeof ms || 1 > ms)
    return Promise.resolve();
  return new Promise(resolve => setTimeout(resolve, Math.min(ms, TIMEOUT_MAX_VAL)));
};

let fn = new Intl.NumberFormat().format;
window.formatNumber = function (number) {
  if (1e6 > number)
    return fn(number);
  if (1e9 <= number)
    return [Math.floor(number/1e9), Math.floor(number%1e9/1e6)].filter(n => n).join(',')+'B';
  if (1e6 <= number)
    return [Math.floor(number/1e6), Math.floor(number%1e6/1e5)].filter(n => n).join(',')+'M';
};

window.format = function (template, ...args) {
  return template.replace(/(%s|%d)/g, m => {
    const replace = args.shift();
    return void 0 !== replace ? replace : m;
  });
};


window.encrypt = function (plaintext, password = '') {
  if ('string' !== typeof password || !password.length)
    throw new Error('encrypt: expects a non-empty string password, "'+password+'"('+typeof password+') is given');
  if ('string' !== typeof plaintext)
    throw new Error('encrypt: plaintext must be of type "string", "'+typeof plaintext+'" is given');

  const key = createMd5(password);
  const iv = Buffer.alloc(16);
  const cipher = crypto.createCipheriv('aes256', key, iv);

  cipher.write(plaintext);

  return cipher.setEncoding('base64').end().read();
};

const timer_map = new Map();
window.startTimer = function (label) {
  if (!timer_map.has(label))
    timer_map.set(label, new Date());  
};

window.endTimer = function (label, format = true) {
  const timer = getTimer(label, format);
  timer_map.delete(label);
  return timer;
};

window.getTimer = function (label, format = true) {
  const timer = timer_map.get(label) ?? new Date();
  const diff = new Date()-timer;
  return format ? formatDuration(diff) : diff;
};

window.hasTimer = function (label) {
  return timer_map.has(label);
};

window.getTime = function (with_seconds = false) {
  const date = new Date();
  const units = [
    date.getHours(),
    date.getMinutes()
  ];
  if (with_seconds)
    units.push(date.getSeconds());
  return units.map(unit => 1 === String(unit).length ? '0' + String(unit) : String(unit)).join(':');
};

const LOWERCASE = 'abcdefghijklmopqrstvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTVXYZ';
const NUMBERS = '0123456789';
window.randomString = function (size, opts = {}) {
  const { use_numbers, extra } = opts;

  const characters = [...LOWERCASE, ...UPPERCASE];

  if (use_numbers ?? true)
    characters.push(...NUMBERS);
  if (extra)
    characters.push(...extra);

  for (var i = 0, out = ''; size > i; ++i)
    out += characters.rand();

  return out;
};

const DURATION_UNITS = [
  [864e5, ' day'],
  [36e5, ' hour'],
  [6e4, ' minute'],
  [1e3, ' second'],
  [1, 'ms']
];
window.formatDuration = function (milliseconds) {
  milliseconds = parseInt(milliseconds);

  if (!milliseconds)
    return '0ms';

  for (var result = [], divider, label, rem = milliseconds, val, i = 0; DURATION_UNITS.length > i && !Number.isNaN(rem); ++i) {
    [divider, label] = DURATION_UNITS[i];
    if (divider > rem)
      continue;
    val = Math.floor(rem/divider);
    rem %= divider;
    if (2 === result.push(val+label+(0 < val && 'ms' !== label ? 's' : '')))
      break;
  }
  
  if (result.length)
    return result.join(', ');
};

window.rand = function (min, max) {
  if (void 0 === min || void 0 === max)
    if (void 0 === max)
      if (Array.isArray(min))
        return rand(...min);
      else
        return min;
    else
      return;
  return Math.floor(min+((1+max-min)*Math.random()));
};
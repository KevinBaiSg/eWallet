/* @flow */

const _ = require('lodash');

const Utils = () => {};

Utils.COIN = {
  bch: {
    name: 'bch',
    toSatoshis: 100000000,
    maxDecimals: 8,
    minDecimals: 8,
  },
  btc: {
    name: 'btc',
    toSatoshis: 100000000,
    maxDecimals: 8,
    minDecimals: 8,
  },
  bit: {
    name: 'bit',
    toSatoshis: 100,
    maxDecimals: 2,
    minDecimals: 2,
  },
}

Utils.UNITS2 = {
  btc: 100000000,
  bit: 100,
  sat: 1,
}

export const renderAmount = (satoshis, coin, opts) => {
  function clipDecimals(number, decimals) {
    const x = number.toString().split('.');
    const d = (x[1] || '0').substring(0, decimals);
    return parseFloat(`${x[0]}.${d}`)
  }

  function addSeparators(nStr, thousands, decimal, minDecimals) {
    nStr = nStr.replace('.', decimal) // eslint-disable-line
    const x = nStr.split(decimal);
    let x0 = x[0];
    let x1 = x[1];

    x1 = _.dropRightWhile(x1, (n, i) => {
      return n === '0' && i >= minDecimals;
    }).join('');
    const x2 = x.length > 1 ? decimal + x1 : '';

    x0 = x0.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
    return x0 + x2;
  }

  opts = opts || {}; // eslint-disable-line

  coin = coin || 'btc';  // eslint-disable-line
  const u = Utils.COIN[coin] || Utils.COIN.btc;
  const amount = clipDecimals((satoshis / u.toSatoshis), u.maxDecimals).toFixed(u.maxDecimals)
  return `${addSeparators(
    amount,
    opts.thousandsSeparator || ',',
    opts.decimalSeparator || '.',
    u.minDecimals,
  )} ${u.name}`
};

export const parseAmount = (text) => {
  if (!_.isString(text)) {
    text = text.toString() // eslint-disable-line
  }

  const regex = `^(\\d*(\\.\\d{0,8})?)\\s*(${_.keys(Utils.UNITS2).join('|')})?$`
  const match = new RegExp(regex, 'i').exec(text.trim())

  if (!match || match.length === 0) throw new Error('Invalid amount')

  const amount = parseFloat(match[1])
  if (!_.isNumber(amount) || _.isNaN(amount)) throw new Error('Invalid amount')

  const unit = (match[3] || 'sat').toLowerCase()
  const rate = Utils.UNITS2[unit]
  if (!rate) throw new Error('Invalid unit')

  const amountSat = parseFloat((amount * rate).toPrecision(12))
  if (amountSat !== Math.round(amountSat)) throw new Error('Invalid amount')

  return amountSat
};


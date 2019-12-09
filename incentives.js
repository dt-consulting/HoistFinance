var balanceInput = document.getElementById('balance');
var disposableInput = document.getElementById('disposable');
var wePaySlider = document.getElementById('wePay');
var youPaySlider = document.getElementById('youPay');
var termSlider = document.getElementById('term');
var wePayMinus = document.getElementById('wePayMinus');
var wePayPlus = document.getElementById('wePayPlus');
var youPayMinus = document.getElementById('youPayMinus');
var youPayPlus = document.getElementById('youPayPlus');
var termMinus = document.getElementById('termMinus');
var termPlus = document.getElementById('termPlus');
var balance = Number(balanceInput.value);
var disposable = Number(disposableInput.value);
var minWePay = 0;
var minYouPay = 1;
var minTerm = 1;
var maxWePay = balance * 0.3;
var maxYouPay = balance * 0.7;
var maxTerm = balance / minYouPay;
var timeout = null;
var formatter = new Intl.NumberFormat('en-UK', {
  style: 'currency',
  currency: 'GBP',
});

document.addEventListener("DOMContentLoaded", function(event) { 
  // Input field event listeners
  window.addEventListener('load', showDisposable, false);
  disposableInput.addEventListener('keyup', showDisposable, false);
  disposableInput.addEventListener('mouseup', showDisposable, false);

  // Create We Pay slider
  noUiSlider.create(wePaySlider, {
    start: [minWePay],
    tooltips: { to: function (value) {
                   return formatter.format(value.toFixed(2))
              }
    },
    range: {
        'min': [minWePay],
        'max': [maxWePay]
    }
  });

  // Create you Pay slider
  noUiSlider.create(youPaySlider, {
    start: [minYouPay],
    tooltips: { to: function (value) {
                   return formatter.format(value.toFixed(2))
              }
    },
    connect: "lower",
    range: {
        'min': [minYouPay],
        'max': [maxYouPay]
    }
  });

  // Create Term slider
  noUiSlider.create(termSlider, {
    start: [balance],
    tooltips: { to: function (value) {
                   return value.toFixed(0)
              }
    },
    pips: {
        mode: 'count',
        values: 10,
        density: 2
    },
    range: {
        'min': [1],
        '51%': [10],
        '63%': [20],
        '72%': [30],
        '78%': [40],
        '81.05%': [50],
        '82.975%': [60],
        '84.625%': [70],
        '86%': [80],
        '87.1%': [90],
        '87.925%': [100],
        '88.475%': [110],
        '88.75%': [120],
        '91%': [218],
        '93%': [316],
        '94.75%': [413],
        '96.25%': [511],
        '97.5%': [609],
        '98.5%': [707],
        '99.25%': [804],
        '99.75%': [902],
        'max': [1000]
    }
  });

  // Calculate You Pay & Term slider positions
  wePaySlider.noUiSlider.on('slide', wePaySliderUpdated);

  // Remove tooltips from You Pay & Term sliders
  wePaySlider.noUiSlider.on('end', function () {
    youPaySlider.querySelector('.noUi-handle').classList.remove('noUi-active');
    termSlider.querySelector('.noUi-handle').classList.remove('noUi-active');
  });

  // Calculate We Pay & Term slider positions
  youPaySlider.noUiSlider.on('slide', youPaySliderUpdated);

  // Remove tooltips from We Pay & Term sliders
  youPaySlider.noUiSlider.on('end', function () {
    wePaySlider.querySelector('.noUi-handle').classList.remove('noUi-active');
    termSlider.querySelector('.noUi-handle').classList.remove('noUi-active');
  });

  // Calculate We Pay & You Pay slider positions
  termSlider.noUiSlider.on('slide', termSliderUpdated);

  // Remove tooltips from We Pay & you Pay sliders
  termSlider.noUiSlider.on('end', function () {
    wePaySlider.querySelector('.noUi-handle').classList.remove('noUi-active');
    youPaySlider.querySelector('.noUi-handle').classList.remove('noUi-active');
  });

  // Display disposable income on You Pay slider
  function showDisposable (e) {
    if(Number(disposableInput.value) < maxYouPay) {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        youPaySlider.noUiSlider.pips({
          mode: 'values',
          values: [Number(disposableInput.value)],
          density: -1,
          format: {
            from: Number,
            to: function (value) {
              return 'Disposable Income'
            }
          }
        });
      }, 500);
    }
  };

  // Change You Pay slider colour if greater than DI
  youPaySlider.noUiSlider.on('update', function () {
    var connect = youPaySlider.querySelector('.noUi-connect');
    if (Number(disposableInput.value) > 0 && Number(youPaySlider.noUiSlider.get()) > Number(disposableInput.value)) {
      if(!connect.classList.contains('noUi-warning')) connect.classList.add('noUi-warning');
    } else {
      if(connect.classList.contains('noUi-warning')) connect.classList.remove('noUi-warning');
    }
  });

  wePayMinus.onclick = function() {
    var wePay = Number(wePaySlider.noUiSlider.get()) - 1;
    clearTimeout(timeout);
    if(wePay > minWePay) wePaySlider.noUiSlider.setHandle(0, (wePay.toFixed(0)), true);
    wePaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    timeout = setTimeout(function () {
      wePaySlider.querySelector('.noUi-handle').classList.remove('noUi-active');
    }, 400);
    wePaySliderUpdated();
  };

  wePayPlus.onclick = function() {
    var wePay = Number(wePaySlider.noUiSlider.get()) + 1;
    clearTimeout(timeout);
    if(wePay < maxWePay) wePaySlider.noUiSlider.setHandle(0, (wePay.toFixed(0)), true);
    wePaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    timeout = setTimeout(function () {
      wePaySlider.querySelector('.noUi-handle').classList.remove('noUi-active');
    }, 400);
    wePaySliderUpdated();
  };

  youPayMinus.onclick = function() {
    var youPay = Number(youPaySlider.noUiSlider.get()) - 1;
    clearTimeout(timeout);
    if(youPay > minYouPay) youPaySlider.noUiSlider.setHandle(0, (youPay.toFixed(0)), true);
    youPaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    timeout = setTimeout(function () {
      youPaySlider.querySelector('.noUi-handle').classList.remove('noUi-active');
    }, 400);
    youPaySliderUpdated();
  };

  youPayPlus.onclick = function() {
    var youPay = Number(youPaySlider.noUiSlider.get()) + 1;
    clearTimeout(timeout);
    if(youPay < maxYouPay) youPaySlider.noUiSlider.setHandle(0, (youPay.toFixed(0)), true);
    youPaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    timeout = setTimeout(function () {
      youPaySlider.querySelector('.noUi-handle').classList.remove('noUi-active');
    }, 400);
    youPaySliderUpdated();
  };

  termMinus.onclick = function() {
    var term = Number(termSlider.noUiSlider.get()) - 1;
    clearTimeout(timeout);
    if(term > minTerm) termSlider.noUiSlider.setHandle(0, (term.toFixed(0)), true);
    termSlider.querySelector('.noUi-handle').classList.add('noUi-active');
    timeout = setTimeout(function () {
      termSlider.querySelector('.noUi-handle').classList.remove('noUi-active');
    }, 400);
    termSliderUpdated();
  };

  termPlus.onclick = function() {
    var term = Number(termSlider.noUiSlider.get()) + 1;
    clearTimeout(timeout);
    if(term < maxTerm) termSlider.noUiSlider.setHandle(0, (term.toFixed(0)), true);
    termSlider.querySelector('.noUi-handle').classList.add('noUi-active');
    timeout = setTimeout(function () {
      termSlider.querySelector('.noUi-handle').classList.remove('noUi-active');
    }, 400);
    termSliderUpdated();
  };

  function youPaySliderUpdated() {
    var currentValue = Number(youPaySlider.noUiSlider.get());
    var youPct = (currentValue / maxYouPay) * 100;
    var wePct = youPct - (10 - (youPct / 10));
    if (wePct < 0) wePct = 0;

    // Set We Pay & Term sliders
    wePay = maxWePay * (wePct / 100);
    term = balance / (wePay + parseFloat(currentValue));
    wePaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    termSlider.querySelector('.noUi-handle').classList.add('noUi-active');
    wePaySlider.noUiSlider.setHandle(0, wePay, true);
    termSlider.noUiSlider.setHandle(0, term, true);
  };

  function wePaySliderUpdated() {
    var currentValue = Number(wePaySlider.noUiSlider.get());
    var wePct = (currentValue / maxWePay) * 100;
    var youPct = wePct + (10 - (wePct / 10));
    if (youPct < 1) youPct = 1;

    // Set You Pay & Term sliders
    youPay = maxYouPay * (youPct / 100);
    term = balance / (youPay + parseFloat(currentValue));
    youPaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    termSlider.querySelector('.noUi-handle').classList.add('noUi-active');
    youPaySlider.noUiSlider.setHandle(0, youPay, true);
    termSlider.noUiSlider.setHandle(0, term, true);
  };

  function termSliderUpdated() {
    var currentValue = termSlider.noUiSlider.get();
    var termPct = (currentValue / balance) * 100;
    var youPct = ((balance / currentValue) / maxYouPay) * 100;
    var wePct = youPct - (10 - (youPct / 10));
    if (wePct < 0) wePct = 0;

    // Set We Pay & You Pay sliders
    wePay = maxWePay * (wePct / 100);
    youPay = maxYouPay * (youPct / 100);
    wePaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    youPaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    wePaySlider.noUiSlider.setHandle(0, wePay, true);
    youPaySlider.noUiSlider.setHandle(0, youPay, true);
  };
});
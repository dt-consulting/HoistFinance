const csv = "https://dl.dropboxusercontent.com/s/59oenav1gsd5szp/npv_v3.csv";
var originalBalanceInput = document.getElementById('original-balance');
var balanceInput = document.getElementById('balance');
var npvInput = document.getElementById('npv');
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
var originalBalance = Number(originalBalanceInput.value);
var balance = Number(balanceInput.value);
var npv = Number(npvInput.value);
var disposable = Number(disposableInput.value);
var minWePay = 0;
var minYouPay = 1;
var minTerm = 1;
var minDisposable = 0.35;
var maxWePay = 0;
var maxYouPay = 0;
var maxTerm = balance / minYouPay;
var maxDisposable = 0.75;
var timeout = null;
var formatter = new Intl.NumberFormat('en-UK', {
  style: 'currency',
  currency: 'GBP',
});
var discountRow = [];
var discountValue = [];

var screenWidth = document.documentElement.clientWidth;

// Import discount matrix & find row
Papa.parse(csv, {
  header: true,
  download: true,
  complete: response => {
    initialise(response.data);
  }
});



  function findDiscountRowByNPV(matrix, npv) {
    return matrix.reverse().filter(data => data.Current_NPV >= npv)[0];
  }
  function findDiscountValues(balance, discountRow) {
    result = [];
    wePay = {};
    youPay = {};
    for (var key in discountRow) {
      wePay[key] = balance * (discountRow[key] / 100) / key;
      youPay[key] = (balance - (balance * (discountRow[key] / 100))) / key;
    }
    result['wePay'] = wePay;
    result['youPay'] = youPay;
    return result;
  }

//document.addEventListener('DOMContentLoaded', function () {
function initialise(data) {
  discountRow = findDiscountRowByNPV(data, npv + '%');
  discountValue = findDiscountValues(originalBalance, discountRow);
  //console.log(discountValue);
  wePayValues = discountValue['wePay'];
  youPayValues = discountValue['youPay'];
  maxWePay = balance * (discountRow[1] / 100);
  maxYouPay = balance - maxWePay;

  // Input field event listeners
  disposableInput.addEventListener('keyup', showDisposable, false);
  disposableInput.addEventListener('mouseup', showDisposable, false);

  // Create We Pay slider
  noUiSlider.create(wePaySlider, {
    start: [minWePay],
    tooltips: {
      from: Number,
      to: function (value) {
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
    tooltips: {
      from: Number,
      to: function (value) {
            return formatter.format(value.toFixed(2))
          }
    },
    pips: {
          mode: 'values',
          values: [Number(disposableInput.value)],
          filter : function(value, type) {
            result = value == Number(disposableInput.value) ? 1 : -1;
            return result;
          },
          format: {
            from: Number,
            to: function (value) {
                  return 'Disposable Income'
                }
          }
    },
    connect: "lower",
    range: youPayScale()
  });
  disposableClick();
  disposableWarning();

  // Create Term slider
  noUiSlider.create(termSlider, {
    start: [balance],
    tooltips: { 
      from: Number,
      to: function (value) {
            //return value.toFixed(0);
            return Math.ceil(value);
          }
    },
    pips: {
      mode: 'count',
      values: screenWidth > 1000 ? 10 : 7,
      density: 2
    },
    range: termScale()
  });

  // Calculate You Pay & Term slider positions
  wePaySlider.noUiSlider.on('slide', wePaySliderUpdated);

  // Remove tooltips from You Pay & Term sliders
  wePaySlider.noUiSlider.on('end', function () {
    clearTooltips(0);
  });

  // Calculate We Pay & Term slider positions
  youPaySlider.noUiSlider.on('slide', youPaySliderUpdated);

  // Remove tooltips from We Pay & Term sliders
  youPaySlider.noUiSlider.on('end', function () {
    clearTooltips(0);
  });

  // Calculate We Pay & You Pay slider positions
  termSlider.noUiSlider.on('slide', termSliderUpdated);

  // Remove tooltips from We Pay & you Pay sliders
  termSlider.noUiSlider.on('end', function () {
    clearTooltips(0);
  });

  // Change You Pay slider colour if greater than DI
  youPaySlider.noUiSlider.on('update', disposableWarning);

  wePayMinus.onclick = function() {
    var wePay = Number(wePaySlider.noUiSlider.get()) - 1;
    if(wePay >= minWePay) wePaySlider.noUiSlider.setHandle(0, Math.floor(wePay), true);
    wePaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    wePaySliderUpdated();
    clearTooltips();
  };

  wePayPlus.onclick = function() {
    var wePay = Number(wePaySlider.noUiSlider.get()) + 1;
    if(wePay <= maxWePay) wePaySlider.noUiSlider.setHandle(0, Math.floor(wePay), true);
    wePaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    wePaySliderUpdated();
    clearTooltips();
  };

  youPayMinus.onclick = function() {
    var youPay = Number(youPaySlider.noUiSlider.get()) - 1;
    if(youPay >= minYouPay) youPaySlider.noUiSlider.setHandle(0, Math.floor(youPay), true);
    youPaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    youPaySliderUpdated();
    clearTooltips();
  };

  youPayPlus.onclick = function() {
    var youPay = Number(youPaySlider.noUiSlider.get()) + 1;
    if(youPay <= maxYouPay) youPaySlider.noUiSlider.setHandle(0, Math.floor(youPay), true);
    youPaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    youPaySliderUpdated();
    clearTooltips();
  };

  termMinus.onclick = function() {
    var term = Number(termSlider.noUiSlider.get()) - 1;
    if(term >= minTerm) termSlider.noUiSlider.setHandle(0, term, true);
    termSlider.querySelector('.noUi-handle').classList.add('noUi-active');
    termSliderUpdated();
    clearTooltips();
  };

  termPlus.onclick = function() {
    var term = Number(termSlider.noUiSlider.get()) + 1;
    if(term <= maxTerm) termSlider.noUiSlider.setHandle(0, term, true);
    termSlider.querySelector('.noUi-handle').classList.add('noUi-active');
    termSliderUpdated();
    clearTooltips();
  };

  function wePaySliderUpdated() {
    var currentValue = Number(wePaySlider.noUiSlider.get());
    var youPay = minYouPay;
    var term = minTerm;

    // Calculate You Pay & Term positions
    if (currentValue > 0) {
      for (var key in wePayValues) {
       if (wePayValues[key] <= currentValue) {
         var pct = (currentValue / wePayValues[key]);
         youPay = youPayValues[key] * pct;
         break; //leave commented out to find lowest term
       }
      }
    }
    term = balance / (currentValue + youPay);

    // Set You Pay & Term sliders
    youPaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    termSlider.querySelector('.noUi-handle').classList.add('noUi-active');
    youPaySlider.noUiSlider.setHandle(0, youPay, true);
    termSlider.noUiSlider.setHandle(0, term, true);
  };

  function youPaySliderUpdated() {
    var currentValue = Number(youPaySlider.noUiSlider.get());
    var wePay = minWePay;
    var term = minTerm;
    
    // Calculate We Pay & Term positions
    if (currentValue > 0) {
      for (var key in youPayValues) {
       if (youPayValues[key] <= currentValue) {
         var pct = (currentValue / youPayValues[key]);
         wePay = wePayValues[key] * pct;
         break; //leave commented out to find lowest term
       }
      }
    }
    term = balance / (currentValue + wePay);
    
    // Set We Pay & Term sliders
    wePaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    termSlider.querySelector('.noUi-handle').classList.add('noUi-active');
    wePaySlider.noUiSlider.setHandle(0, wePay, true);
    termSlider.noUiSlider.setHandle(0, term, true);
  };

  function termSliderUpdated() {
    var currentValue = termSlider.noUiSlider.get();
    var wePay = 0;
    var youPay = 0;
    
    // Calculate We Pay & You Pay positions
    var pct = (Math.ceil(currentValue) / currentValue);
    wePay = wePayValues[Math.ceil(currentValue)];
    if (wePay === undefined) wePay = 0;
    else wePay = wePay * pct;
    if (wePay !== 0) youPay = youPayValues[Math.ceil(currentValue)] * pct;
    else youPay = balance / Math.ceil(currentValue);
    
    // Set We Pay & You Pay sliders
    wePaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    youPaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
    wePaySlider.noUiSlider.setHandle(0, wePay, true);
    youPaySlider.noUiSlider.setHandle(0, youPay, true);
  };

  // Display disposable income on You Pay slider
  function showDisposable(e) {
    clearTimeout(timeout);
    if(Number(disposableInput.value) < maxYouPay) {
      timeout = setTimeout(function () {
        youPaySlider.noUiSlider.updateOptions({
          pips: {
            mode: 'values',
            values: [Number(disposableInput.value)],
            filter : function(value, type) {
              result = value == Number(disposableInput.value) ? 1 : -1;
              return result;
            },
            format: {
              from: Number,
              to: function (value) {
                    return 'Disposable Income'
                  }
            }
          },
          range: youPayScale()
        });
        disposableClick();
        disposableWarning();
      }, 500);
    }
  };
 
  function disposableClick(e) {
    var pip = youPaySlider.querySelector('.noUi-value');
        if(Number(disposableInput.value) < maxYouPay) {
          pip.addEventListener('click', function () {
            clearTimeout(timeout);
            youPaySlider.noUiSlider.setHandle(0, Number(disposableInput.value), true);
            youPaySlider.querySelector('.noUi-handle').classList.add('noUi-active');
            timeout = setTimeout(function () {
            youPaySlider.querySelector('.noUi-handle').classList.remove('noUi-active');
          }, 400);
          youPaySliderUpdated();
        });
        }
    };
  
  function disposableWarning(e) {
    var connect = youPaySlider.querySelector('.noUi-connect');
    if (Number(disposableInput.value) > 0 && Number(youPaySlider.noUiSlider.get()) > Number(disposableInput.value)) {
      if(!connect.classList.contains('noUi-warning')) connect.classList.add('noUi-warning');
    } else {
      if(connect.classList.contains('noUi-warning')) connect.classList.remove('noUi-warning');
    }
  };

  function clearTooltips(interval) {
    interval = (interval === undefined ? 400 : interval);
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      wePaySlider.querySelector('.noUi-handle').classList.remove('noUi-active');
      youPaySlider.querySelector('.noUi-handle').classList.remove('noUi-active');
      termSlider.querySelector('.noUi-handle').classList.remove('noUi-active');
    }, interval);
  };

  // Ensure disposable income section of slider is at least 30% of available width
  function youPayScale() {
    var obj = {};
    obj['min'] = minYouPay;
    obj['max'] = maxYouPay;
    if(maxYouPay * 0.3 > Number(disposableInput.value)) obj['30%'] = Number(disposableInput.value);

    return obj;
  };
 
  function findDiscountByNPV(matrix, npv, term) {
    var x = matrix.reverse().filter(data => data.Current_NPV >= npv)[0][term];
    if(term < 120 && (!x || x === undefined || x < 0)) console.log('x'+term);
    return x;
  }


 
  function termScale() {
    return {
'max': [10000],
'95.875%': [3102.59],
'91.75%': [2219.40],
'87.625%': [1587.62],
'83.5%': [1135.69],
'79.375%': [812.40],
'75.25%': [581.14],
'71.125%': [415.71],
'67%': [297.38],
'62.875%': [212.72],
'58.75%': [152.17],
'54.625%': [108.85],
'50.5%': [77.87],
'46.375%': [55.70],
'42.25%': [39.85],
'38.125%': [28.50],
'34%': [20.39],
'29.875%': [14.59],
'25.75%': [10.43],
'21.625%': [7.46],
'17.5%': [5.34],
'13.375%': [3.82],
'9.25%': [2.73],
'5.125%': [1.95],
'min': [1]
}
  }
  
  /*
  function termScale() {
    var obj = {};
    var x;
    var temp;
    var array = new Array();
    var start = 100;
    var runningBalance = balance;

    obj['min'] = minTerm;
    obj['max'] = maxTerm;
    x = 0;
    step = 0;
    do {
      if (x == 0) temp = start;
      else temp = array[x-1];
      if(Number(temp - step) < 100 && Number(temp - step) > 1) obj[Number(temp - step).toFixed(3) + '%'] = Number(runningBalance.toFixed(0));
      array[x] = Number(temp - step).toFixed(3);
      x++;
  
      // 100,000+ range
      if(runningBalance.toFixed(0) > 100000) {
        runningBalance = runningBalance - 10000;
        step += 0.225;
      // 10,000 - 99,999 range
      } else if(runningBalance.toFixed(0) > 10000) {
        runningBalance = runningBalance - 1000;
        if(runningBalance.toFixed(0) == 9000) step = 0.5;
        else step += 0.5;
      // 5,000 - 9,999 range
      } else if(runningBalance.toFixed(0) > 5000) {
        runningBalance = runningBalance - 1000;
        //if(runningBalance.toFixed(0) == 9000) step = 0.45;
        //else step += 0.45;
        step += 0.45;
      // 1,000 - 4,999 range
      } else if(runningBalance.toFixed(0) > 1000) {
        runningBalance = runningBalance - 1000;
        //if(runningBalance.toFixed(0) == 4000) step = 0.35;
        //else step += 0.35;
        step += 0.4;
      // 500 - 999 range
      } else if(runningBalance.toFixed(0) > 500) {
        runningBalance = runningBalance - 100;
        //if(runningBalance.toFixed(0) == 900) step = 0.325;
        //else step += 0.325;
        step += 0.65;
      // 100 - 499 range
      } else if(runningBalance.toFixed(0) > 100) {
        runningBalance = runningBalance - 100;
        //if(runningBalance.toFixed(0) == 400) step = 0.3;
        //else step += 0.3;
        step += 1;
      // 50 - 99 range
      } else if(runningBalance.toFixed(0) > 50) {
        runningBalance = runningBalance - 10;
        if(runningBalance.toFixed(0) == 90) step = 0.35;
        else step += 0.35;
      // 1 - 49 range
      } else {
        runningBalance = runningBalance - 10;
        if(runningBalance.toFixed(0) == 40) step = 0.5;
        else step += 0.5;
      }
    } while (runningBalance >= 10);

    return obj;
  };
*/
};

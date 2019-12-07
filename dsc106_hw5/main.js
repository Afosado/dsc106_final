//Linechart def
let line = {
    chart: {
        borderColor:'#999999',
        borderWidth:10,
    },
    title: {
        text: 'Is Cryptocurrency\'s Value Dependant on Popularity?'
    },

    subtitle: {
        text: 'Combined Market Cap of Top 5 Cryptocurrenies and Google Searches for Cyptocurrency, '
    },

    yAxis: {
        max:100,
        title: {
            text: 'Percent of Peak Value'
        }
    },
    xAxis: {
        tickInterval: 365*24*60*60*1000,
        crosshair: {
            color: 'red'
        },
        type: 'datetime',
        labels: {
            format: '{value:%Y}'
        },
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },

    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            pointStart: 2010
        }
    },

    series: [],

    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }

};

// Create bar chart

let bar = {
    chart: {
        type: 'bar',
        height: '30%',
        borderColor:'#999999',
        borderWidth:10
    },
    title:{
        text:'Gains vs Loss'
    },
    xAxis: {
        categories: ['Profit', 'Loss'],
    },
    yAxis: {
        title: {
            text: '$'
        }
    },
    legend: {
        enabled: false,
    },
    plotOptions: {
        bar: {
            colorByPoint: true,
            animation: false,
            dataLabels: {
                enabled: true,
                format: '${point.y}'
            }
        }
    },
    colors: ['#0B6623', '#C21807'],
    series: [{
        name:'net',
        data:[0,0]
    }]
};

// Create second chart

let barBit = {
    chart: {
        type: 'bar',
        height: '30%',
        borderColor:'#999999',
        borderWidth:10
    },
    title:{
        text:'Gains vs Loss'
    },
    xAxis: {
        categories: ['Your Money', 'Your Money on Crypto'],
    },
    yAxis: {
        max:14000,
        title: {
            text: 'Dollars ($)'
        }
    },
    legend: {
        enabled: false,
    },
    plotOptions: {
        bar: {
            colorByPoint: true,
            animation: false,
            dataLabels: {
                enabled: true,
                format: '${point.y}'
            }
        }
    },
    colors: ['#0B6623', '#C21807'],
    series: [{
        name:'net',
        data:[10000,10000]
    }]
};

//Global variables
let num_coins;
let investmentData;
let net = 0;
let profits = 0;
let losses = 0;
var barChangeData;
var barChart;
var startMoney = 10000;
var counter = 0;

// Utility function to fetch any file from the server
function fetchJSONFile(filePath, callbackFunc) {
    console.debug("Fetching file:", filePath);
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200 || httpRequest.status === 0) {
                console.info("Loaded file:", filePath);
                var data = JSON.parse(httpRequest.responseText);
                console.debug("Data parsed into valid JSON!");
                console.debug(data);
                if (callbackFunc) callbackFunc(data);
            } else {
                console.error("Error while fetching file", filePath, 
                    "with error:", httpRequest.statusText);
            }
        }
    };
    httpRequest.open('GET', filePath);
    httpRequest.send();
}

// Form Submission Function
function submission (e) {
    let elem = document.getElementById('investAmount');
    let amount = elem['amount'].value;
    let result;
    let index = Math.floor(Math.random() * num_coins);
    let profit = investmentData[index][0]/1000*amount;
    net += profit;
    if (profit > 0) {
        result = 'gained';
        profits += profit;
    } else {
        result = 'lost';
        profit = profit*-1;
        losses += profit;
    }
    //update bar chart
    let barData = {
        name:'net',
        data:[Math.round(profits), Math.round(losses)]
    }
    bar.series[0].remove(true);
    bar.addSeries(barData, false);
    bar.redraw();
    profit = profit.toFixed(0);
    elem = document.getElementById('output');
    elem.innerText = 'You invested $' + amount + ' in ' + names[index] 
    + '\nYou ' + result + ' $' + profit
    elem = document.getElementById('profit');
    let sign = '';
    if (net < 0) {
        sign = '-';
    } 
    elem.innerText =  'Net Profit: ' + sign + '$' + Math.abs(net).toFixed(0);
    e.preventDefault();
}

// Set up investment simulation
function onSuccessProf(jsonData) {
    investmentData = jsonData['data'];
    names = jsonData['index'];
    num_coins = investmentData.length;
    document.getElementById('investAmount').addEventListener(
        'submit', submission);
    Math.floor(Math.random() * num_coins);
    bar = Highcharts.chart('bar', bar);
}

// Set up interest chart
function onSuccessInt (jsonData) {
    line = Highcharts.chart('fad', line);
    let lineData = jsonData['data'];
    let marketCap = [];
    let interest = [];
    for (d in lineData) {
        marketCap.push([lineData[d][0], lineData[d][2]]);
        interest.push([lineData[d][0], lineData[d][1]]);
    }
    marketSer = []
    marketSer.push({
        name:'Market Capitalization',
        data:marketCap
    });
    marketSer.push({
        name:'Google Search Frequency',
        data:interest
    });
    for (s in marketSer) {
        line.addSeries(marketSer[s], false);
    }
    line.redraw();
}

// Function to animate bar chart
function myLoop() {
    let barData;
    let temp;
    setTimeout(function (){
        temp = barChangeData[counter][1];
        startMoney = startMoney*temp;
        barData = {
            name:'money',
            data:[10000, Math.round(startMoney)]
        }
        barChart.series[0].remove(true);
        barChart.addSeries(barData, false);
        barChart.redraw()
        // Dynamically change title
        var d = new Date(barChangeData[counter][0]);
        var months = ['January','February','March','April','May',
        'June','July','August','September','October','November','December'];
        var year = d.getFullYear();
        var month = months[d.getMonth()];
        var date = d.getDate();
        barChart.setTitle({
            text: '' + month + ' ' + date + ', ' + year});
        counter++;
        

        if (counter < barChangeData.length) {
            myLoop();
        } else {
            startMoney = 10000;
            counter = 0;
        }   
    }, 100);
}

// Set up fluctuation diagram
function onSuccessBit (jsonData) {
    barChart = Highcharts.chart('flux', barBit);
    barChangeData = jsonData['data'];
    document.getElementById('button').addEventListener('click', myLoop);  
}



fetchJSONFile('assets/profits.json', onSuccessProf);
fetchJSONFile('assets/interest.json', onSuccessInt);
fetchJSONFile('assets/bit_flux.json', onSuccessBit)
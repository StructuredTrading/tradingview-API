// Pseudo code
// Step 1: Define chart properties.
// Step 2: Create the chart with defined properties and bind it to the DOM element.
// Step 3: Add the candlestick series.
// Step 4: Set the data and render.


// Code
const log = console.log;

const chartProperties = {
    width:1500,
    height:600,
    timeScale:{
        timeVisable:true,
        secondsVisable:false
    }
}

const domElement = document.getElementById('tvchart');
const chart = LightweightCharts.createChart(domElement,chartProperties);
const candleSeries = chart.addCandlestickSeries();


fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1000')
    .then(res => res.json())
    .then(data => {
        const cdata = data.map(d => {
            return {time:d[0]/1000,open:parseFloat(d[1]),high:parseFloat(d[2]),low:parseFloat(d[3]),close:parseFloat(d[4])}
        });
        candleSeries.setData(cdata);
    })
    .catch(err => log(err))
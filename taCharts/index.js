// Pseudo code
// Step 1: Define chart properties.
// Step 2: Create the chart with defined properties and bind it to the DOM element.
// Step 3: Add the candlestick series.
// Step 4: Set the data and render.
// Step 5: Plug the socket to the chart

// Code
const log = console.log;

log("first log")
function loadSymInfo() {
    log("loading symInfo")
    fetch('https://api.binance.com/api/v1/exchangeInfo')
    .then(response => response.json())
    .then(data => {
        let symbols = [];
        data.symbols.forEach(d => {
            if (d.quoteAsset == "USDT") {
                symbols.push(`<option value="${d.symbol}">${d.symbol}</option>`);
            }
        });
        log(symbols)
        document.getElementById('pairs').innerHTML = symbols;
        
        // Set default selected trading pair and time-frame
        document.getElementById('pairs').selectedIndex = 0;
        document.dispatchEvent(new CustomEvent('symbolsLoaded'));

    })
};


        
class ChartManager {
            constructor() {
        this.chart = null;
        this.klines = null;
        this.candleSeries = null;
        this.xspan = 60;
        this.lastCrosshairPosition = null;
        this.domElement = document.getElementById('tvchart');
        
        this.lineSeries = null;
        this.startPoint = null;
        this.isupdatingLine = null;
        
        this.isHovered = false;
        this.selectedPoint = null; // null/0/1
        this.hoverThreshold = 0.01;
        
        this.initializeChart();
        this.loadData();
        // this.subscribeToEvents();
    }
    
    initializeChart() {
        log("initializing Chart")
        const chartProperties = {
            timeScale: {
                timeVisable: true,
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
        };
        this.chart = LightweightCharts.createChart(
            this.domElement,
            chartProperties
            );
            this.candleSeries = this.chart.addCandlestickSeries();
            this.lineSeries = this.chart.addLineSeries();
        }
        
        

        async loadData() {
            log("Loading chart")
            let symbol = document.getElementById("pairs").value || 'BTCUSDT';
            let timeFrame = document.getElementById("timeFrame").value;
            try{
                // Load past candles (static chart)
                await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeFrame}&limit=1000`)
                .then(response => response.json())
                .then(data => {
                    this.klines = data.map(d => {
                        return {
                            time:d[0]/1000,
                            open:parseFloat(d[1]),
                            high:parseFloat(d[2]),
                            low:parseFloat(d[3]),
                            close:parseFloat(d[4])
                        }
                    });
                    this.candleSeries.setData(this.klines);
                })
                
                // Load future candles (Dynamic Chart)
                let socket = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@kline_${timeFrame}`);
                
                socket.onmessage = (event) => {
                    const jsonData = JSON.parse(event.data)
                    const cdata = {
                        time: jsonData.k.t/1000,
                        open: parseFloat(jsonData.k.o),
                        high: parseFloat(jsonData.k.h),
                        low: parseFloat(jsonData.k.l),
                        close: parseFloat(jsonData.k.c)
                    }
                    this.candleSeries.update(cdata);
                };
                
                // Catch errors
            } catch (error) {
                log("Error fetching or parsing data:", error);
            }
        }
        
        // subscribeToEvents() {
            //     this.chart.subscribeCrosshairMove(this.handleCrosshairMove.bind(this));    
            //     this.chart.subscribeToClick(this.handleChartClick.bind(this));    
            // }
            
    // handleCrosshairMove(param) {
    //     if (this.isupdatingLine) return;
    //     const xTs = param.time
    //         ? param.time
    //         : this.klines[0]["time"] + param.logical * this.xspan;
    //     const yPrice = this.candleSeries.coordinateToPrice(param.point.y);
    //     this.lastCrosshairPosition = { x: xTs, y: yPrice };

    //     if (this.startPoint) this.updateLine(xTs, yPrice);
    // }

    // handleChartClick(param) {
    //     log("handleChartClick triggered");
    //     if (this.isupdatingLine) return;
    //     const xTs = param.time
    //         ? param.time
    //         : this.klines[0]["time"] + param.logical * this.xspan;
    //     const yPrice = this.candleSeries.coordinateToPrice(param.point.y);
    //     this.handleLineDrawing(xTs, yPrice);
    // }

    // handleLineDrawing(xTs, yPrice) {
    //     log("handleLineDrawing triggered");

    //     if (!this.startPoint) {
    //         this.startpoint = { time: xTs, price: yPrice };
    //     } else {
    //         this.lineSeries.setData([
    //             { time: this.startPoint.time, value: this.startPoint.price },
    //             { time: xTs, value: yPrice },
    //         ]);
    //         this.startPoint = null;
    //     }
    // }

    // updateLine(xTs, yPrice) {
    //     log("updateLine triggered");

    //     this.isUpdatingLine = true;
    //     this.lineSeries.setData([
    //         { time: this.startPoint.time, value: this.startPoint.price },
    //         { time: xTs, value: yPrice },
    //     ]);
    //     this.isUpdatingLine = false;
    // }
}

loadSymInfo();
log("initializing tvchart to new ChartManager")
const tvchart = new ChartManager();

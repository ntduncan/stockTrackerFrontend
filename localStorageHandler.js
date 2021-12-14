export function addTickerToList(ticker) {
    let tickers = JSON.parse(localStorage.getItem("tickers"));
    if(tickers === null){
        tickers = [];
    } 
    tickers.push(ticker);
    tickers.sort()
    localStorage.setItem("tickers", JSON.stringify(tickers));
}

export function removeTickerFromList(ticker) {
    let tickers = JSON.parse(localStorage.getItem("tickers"));
    let replacementList = []

    if(tickers.indexOf(ticker) !== -1){
        tickers.forEach(item => {
            if (item !== ticker) replacementList.push(item);
        })
        
        localStorage.setItem("tickers", JSON.stringify(replacementList));
    } else {
        alert("Ticker Not Found")
    }
}

export function getTickers(){
    return JSON.parse(localStorage.getItem("tickers")).sort();
}




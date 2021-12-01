const tickerCardContainer = document.querySelector(".ticker-card-container");
const tickerListView = document.querySelector(".ticker-list-view")
const tickerSearchInput = document.querySelector(".search");
const tickerSearchView = document.querySelector(".ticker-search-view");
const tickerSearchButton = document.querySelector(".search-btn")
const tickerSearchResult = document.querySelector(".search-result")

import {Tickers} from "./Tickers.js"
import {getTickers, addTickerToList, removeTickerFromList} from "./localStorageHandler.js";

const baseUrl = "http://127.0.0.1:5000";
const tickers = new Tickers();

//If LocalStorage is not initialized for the browser, initialize it.
if(!localStorage.getItem("tickers")){
    const initArray = []; //TODO: Erase Init Later
    const myJSON = JSON.stringify(initArray);
    localStorage.setItem("tickers", myJSON)
}

/*
* function searchStock
* Description: sends a call to the stock api.
* returns: Promise
*/
function searchStock(ticker) {
    return fetch(baseUrl + "/getOne", {
        method: "POST", 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ticker: ticker}),
    })
}

function initalizeWatchList(){
    tickerListView.innerHTML = "";
    const tickerList = getTickers();
    if(tickerList.length > 0){
        tickerCardContainer.innerHTML = "";
        tickerList.forEach(ticker => {
            addListViewItem(ticker);
        })
    }
}

function initalizeCards(){
    //Load Page With User Tickers
    const tickerList = getTickers();
    if(tickerList.length > 0){
        tickerCardContainer.innerHTML = "";
        tickerList.forEach(ticker => {
            searchStock(ticker)
            .then(response => response.json())
            .then(stockData => {
                addTickerCard(stockData, ticker);
            });
        })
    } else {
        const noCardsMessage = document.createElement("h2");
        noCardsMessage.innerHTML = "hmm... It doesn't look like you're watching any stocks yet..."
        tickerCardContainer.appendChild(noCardsMessage);
    }
}

function addTickerCard(stockData, ticker) {
    //Create TickerCard
    const tickerCard = document.createElement("div");
    tickerCard.classList = "ticker-card block";
    
    //Add Class for card color
    stockData.currentPrice < stockData.previousClosePrice ? tickerCard.classList.add("low"):tickerCard.classList.add("high");
    
    //initalize text inside the card
    tickerCard.innerHTML = `
    <h2>${tickers.getCompanyName(ticker)}</h2>
    <p>$${stockData.currentPrice} | ( ${(stockData.currentPrice - stockData.previousClosePrice).toFixed(2)} )</p>
    `
    // Append TickerCard
    tickerCardContainer.appendChild(tickerCard);
}

function addListViewItem(ticker) {
    const listItemContainer = document.createElement("div");
    listItemContainer.classList.add("watch-list-item");

    const listItemTitle = document.createElement("div");
    listItemTitle.classList.add("watch-list-item__title")
    listItemTitle.textContent = `${tickers.getCompanyName(ticker)} (${ticker})`;

    const listItemButton = document.createElement("button");
    listItemButton.classList.add("btn");
    listItemButton.classList.add("watch-list-item__button");
    listItemButton.textContent = "X";
    listItemButton.addEventListener("click", () => {
        removeTickerFromList(ticker)
        initalizeWatchList()
    })
    listItemContainer.appendChild(listItemTitle);
    listItemContainer.appendChild(listItemButton);
    tickerListView.appendChild(listItemContainer);
}

tickerSearchButton.addEventListener("click", () => {
    const ticker = tickerSearchInput.value.toUpperCase();

    searchStock(ticker)
    .then(response => response.json())
    .then(stockData => {
        // Create Title
        const title = document.createElement("h3");
        title.innerHTML = `${tickers.getCompanyName(ticker)}: $${stockData.currentPrice}`;

        //Create Add Button
        const addButton = document.createElement("button");
        addButton.textContent = "Add";
        addButton.classList.add("btn")
        addButton.addEventListener("click", () => {
            addTickerToList(ticker);
            addTickerCard(stockData, ticker)
            addListViewItem(ticker);
            tickerSearchResult.innerHTML = "";
        })

        //Populate Search Result Info
        tickerSearchResult.innerHTML = "";
        tickerSearchResult.appendChild(title);
        tickerSearchResult.appendChild(addButton);
    });
})

//Add all cards that the user has
initalizeCards();
initalizeWatchList();
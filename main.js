const tickerCardContainer = document.querySelector(".ticker-card-container");
const tickerListView = document.querySelector(".ticker-list-view")
const tickerSearchInput = document.querySelector(".search");
const tickerSearchView = document.querySelector(".ticker-search-view");
const tickerSearchButton = document.querySelector(".search-btn")
const tickerSearchResult = document.querySelector(".search-result")

import {Tickers} from "./Tickers.js"
import {getTickers, addTickerToList, removeTickerFromList} from "./localStorageHandler.js";

const baseUrl = "https://stock-watcher-tool.herokuapp.com";
// const baseUrl = "http://127.0.0.1:5000"; //For Testing Locally
const tickers = new Tickers();

//If LocalStorage is not initialized for the browser, initialize it.
if(!localStorage.getItem("tickers")){
    const initArray = []; //TODO: Erase Init Later
    const myJSON = JSON.stringify(initArray);
    localStorage.setItem("tickers", myJSON)
}

/**
 * @description Sends a request to server to retrieve stock information
 * of a given company that is specified by the provided ticker.
 * @param {*} ticker 
 */
function searchStock(ticker) {
    return fetch(baseUrl + "/getOne", {
        method: "POST", 
        headers: {
            'Content-Type': 'application/json',
            'Content-Security-Policy': 'upgrade-insecure-requests'
        },
        body: JSON.stringify({ticker: ticker}),
    })
}

/**
 * @description Initializes all the list view items for the watch list on load
 */
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

/**
 * @description Initializes all the cards for the ticker card container on load
 */
function initalizeCards(){
    //Load Page With User Tickers
    const tickerList = getTickers();
    tickerCardContainer.textContent = "";
    
    if(tickerCardContainer.children[0] == "h2") console.log("meh")
    tickerList.forEach(ticker => {
        searchStock(ticker)
        .then(response => response.json())
        .then(stockData => {
            addTickerCard(stockData, ticker);
        });
    })
    
}

/**
 * @description Adds a new ticker card to the ticker body
 * @param {*} stockData 
 * @param {*} ticker 
 */
function addTickerCard(stockData, ticker) {

    //Create TickerCard
    const tickerCard = document.createElement("div");
    const tickerNews = document.createElement("div");
    const newsTitle = document.createElement("h3");
    const newsList = document.createElement("ul");

    tickerCard.classList = "ticker-card block";
    
    //Add Class for card color
    stockData.currentPrice < stockData.previousClosePrice ? tickerCard.classList.add("low"):tickerCard.classList.add("high");
    
    //initalize text inside the card
    tickerCard.innerHTML = `
    <h2>${tickers.getCompanyName(ticker)}</h2>
    <p>$${stockData.currentPrice.toFixed(2)} | ( ${(stockData.currentPrice - stockData.previousClosePrice).toFixed(2)} )</p>`

    tickerNews.classList.add("ticker-news-window");
    newsTitle.innerHTML = "News";
    newsList.classList.add("ticker-news-list")
    tickerNews.hidden = true;

    stockData.companyNews.forEach(story => {
        newsList.innerHTML += `<li><a href='${story.url}' target="_window">${story.headline}</a></li>`
    })

    tickerCard.addEventListener("click", () => {
        if(tickerNews.hidden == true){
            tickerNews.hidden = false; 
        } else {
            tickerNews.hidden = true;
        }
    })

    // Append TickerCard
    tickerNews.appendChild(newsTitle);
    tickerNews.appendChild(newsList);
    tickerCard.appendChild(tickerNews);
    tickerCardContainer.appendChild(tickerCard);

    //Just in case this is the first card
}

/**
 * @description Adds a list item to the list view when given a ticker
 * @param {*} ticker 
 */
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
        initalizeCards()
        initalizeWatchList()
    })
    listItemContainer.appendChild(listItemTitle);
    listItemContainer.appendChild(listItemButton);
    tickerListView.appendChild(listItemContainer);
}

tickerSearchButton.addEventListener("click", () => {
    const ticker = tickerSearchInput.value.toUpperCase();

    if(getTickers().includes(ticker)) {
        alert(`It looks like you are already tracking ${ticker}`)
        return;
    }

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
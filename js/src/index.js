import axios from 'axios';
import { image } from 'faker';
import './styles.scss';

let i = 0;
let currGameId = 0;

const evaluateForWin = (playerHand) => {
  // player wins if he clears his entire hand
  if (playerHand.length === 0) {
    console.log('you won!');
  }
  // player wins if the drawPile is empty, and both players pass their turns, and he has lesser cards than opponent
};
const endPlayerTurn = () => {
  axios.put('/endplayerTurn', { currGameId })
    .then(updateCardElsWContent)
    .catch((err) => { console.log(err); });
};

const buildBoardEls = () => {
  console.log('creating the board elements');
  // unhide html container
  const container = document.querySelector('.container');
  container.classList.remove('hideable');

  // create:
  // containers
  // const container = document.createElement('div');
  // // added extra r to container for testing
  // container.setAttribute('class', 'containerr');

  // ==playing area (Row)
  // const playingArea = document.createElement('div');
  // playingArea.setAttribute('class', 'playingArea row');

  // == ==playing area (col) (3 of them)
  // for (let n = 0; n < 3; n += 1) {
  //   const playingAreaCol = document.createElement('div');
  //   playingAreaCol.setAttribute('class', `playingAreaCol${n} col-2`);
  //   playingAreaCol.innerHTML = `hllo ${n}`;
  //   playingArea.appendChild(playingAreaCol);
  // }
  // == == ==deck
  // const drawPileSubheader = document.createElement('h2');
  // drawPileSubheader.setAttribute('class', 'playingAreaSubheader');

  // const deck = document.createElement('div');
  // deck.setAttribute('class', 'drawPile');

  // == == ==reference pile
  // const referenceCardPileSubheader = document.createElement('div');
  // referenceCardPileSubheader.setAttribute('class', 'playingAreaSubheader');
  // referenceCardPileSubheader.innerHTML = 'Reference card:';

  // const referenceCardPile = document.createElement('div');
  // referenceCardPile.setAttribute('class', 'referenceCardPile');

  // == == ==discard pile
  // const discardPileSubheader = document.createElement('div');
  // discardPileSubheader.setAttribute('class', 'playingAreaSubheader');
  // discardPileSubheader.innerHTML = 'Discard Pile:';

  // const discardPile = document.createElement('div');
  // discardPile.setAttribute('class', 'discardPile');

  // create info bar that provides info and playing btns(row)
  // const infoRow = document.createElement('div');
  // infoRow.setAttribute('class', 'row infoBar');

  // ==display whose turn it is (col)
  // const turnDisplay = document.createElement('div');
  // turnDisplay.setAttribute('class', 'col-2');

  // ==button to end turn (col)
  // const endTurnBtnHoldingCol = document.createElement('div');
  // endTurnBtnHoldingCol.setAttribute('class', 'col-2');
  // ====end turn button
  const endTurnBtn = document.querySelector('.endTurnBtn');
  endTurnBtn.addEventListener('click', endPlayerTurn);

  // ==button to end turn (col)
  // const endCurrGameBtnHoldingCol = document.createElement('div');
  // endCurrGameBtnHoldingCol.setAttribute('class', 'col-2');
  // ====end current game
  const endCurrentGameBtn = document.querySelector('.endGameBtn');

  endCurrentGameBtn.addEventListener('click', () => {
    // make an axios put to end the current game (i.e. change liveStatus to false)
    axios.put('/endCurrGame', { currGameId })
      .then(() => {
        document.querySelector('.modal').style.display = 'block';
      })
      .catch((error) => {
        console.log(error);
        console.log('redirect to external website');
        window.location = 'http://localhost:3004';
      });
  });
  // endCurrentGameBtn.innerHTML = 'End Current Game';
  // endCurrGameBtnHoldingCol.appendChild(endCurrentGameBtn);

  // create a row to hold cards in current player's hand
  // const currPlayerHand = document.createElement('div');
  // currPlayerHand.setAttribute('class', 'currPlayerHand row');

  // create the modal to display when someone wins
  const modal = document.createElement('div');
  modal.setAttribute('class', 'modal');

  // ==create the html element that closes the modal
  const closeModal = document.createElement('span');
  closeModal.setAttribute('class', 'close');
  closeModal.innerHTML = 'x';
  closeModal.addEventListener('click', () => {
    document.querySelector('.modal').style.display = 'none';
  });
  // ==create modal's container
  const modalContainer = document.createElement('div');
  modalContainer.setAttribute('class', 'modal-content');

  // set the para element that has text inside the modal container
  const modalTextContent = document.createElement('p');
  modalTextContent.setAttribute('class', 'modalTextContent');

  // ==create the button that brings user to new game
  const newGameBtn = document.createElement('button');
  newGameBtn.innerHTML = 'New Game';
  newGameBtn.setAttribute('class', 'btn btn-primary');
  newGameBtn.addEventListener('click', () => {
    window.location = 'http://localhost:3004';
    // axios.post('/createGame')
    //   .then((res) => {
    //     console.log(res);
    //   })
    //   .catch((error) => { console.log(error); });
  });

  // append to:

  // infobar
  // infoRow.appendChild(turnDisplay);
  // infoRow.appendChild(endTurnBtnHoldingCol);
  // infoRow.appendChild(endCurrGameBtnHoldingCol);
  // container
  // container.appendChild(playingArea);
  // container.appendChild(infoRow);
  // container.appendChild(currPlayerHand);

  // modal container
  modalContainer.appendChild(closeModal);
  modalContainer.appendChild(modalTextContent);
  modalContainer.appendChild(newGameBtn);

  // modal
  modal.appendChild(modalContainer);

  // document
  document.body.appendChild(modal);

  // remove start button
  const startGameBtn = document.querySelector('.startGameBtn');
  document.body.removeChild(startGameBtn);
};

const displayCardsInPlayerHand = (arrayOfCards, referenceCardPileTopCard, discardPile) => {
  // empty the entire col (to rebuild the els)
  document.querySelector('.currPlayerHandCol').innerHTML = '';

  arrayOfCards.forEach((element, index) => {
    // create the card
    const cardEls = document.createElement('div');
    cardEls.setAttribute('class', 'cardEls');

    // create the number at the top of the card
    const cardDisplayTop = document.createElement('div');
    cardDisplayTop.setAttribute('class', 'cardDisplayTop');
    cardDisplayTop.innerHTML = element.display;

    // create the suit symbol in the centre of card
    const cardDisplaySuit = document.createElement('div');
    cardDisplaySuit.setAttribute('class', 'cardDisplaySuit');
    cardDisplaySuit.innerHTML = element.suitSymbol;

    // create the number at the top of the card
    const cardDisplayBottom = document.createElement('div');
    cardDisplayBottom.setAttribute('class', 'cardDisplayBottom');
    cardDisplayBottom.innerHTML = element.display;

    // cardEls.innerHTML = `${element.display} of ${element.suitSymbol}`;
    cardEls.appendChild(cardDisplayTop);
    cardEls.appendChild(cardDisplaySuit);
    cardEls.appendChild(cardDisplayBottom);

    // change the card's font color to reflect color the suit
    cardEls.style.color = `${element.color}`;
    // add an event listener to each of the cards
    cardEls.addEventListener('click', (e) => {
      // go to server to validate if user is authorised to discard card,then update gameState if nec
      axios.post('/validateDiscardingOfCard', {
        element, referenceCardPileTopCard, index, currGameId,
      })
        .then(updateCardElsWContent)
        .catch((err) => {
          console.log(err);
        });

      // user cannot discard card becos it is opponent's turn
    });
    document.querySelector('.currPlayerHandCol').appendChild(cardEls);
  });
};

const handleWin = (winnerDetails) => {
// do an axios.put to update statusLive to false
  console.log('triggering axios to update db liveStatus');
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  axios.put('/endCurrGame', { currGameId })
    .then(() => {
      const cookieString = document.cookie;
      const positionOfUserId = cookieString.indexOf('userId=');
      // eslint-disable-next-line
      const userIdViaCookieString = Number(cookieString.substring(positionOfUserId + 7, positionOfUserId + 8));

      console.log('userIdViaCookieString');
      console.log(userIdViaCookieString);
      console.log('winnerDetails.id');
      console.log(winnerDetails.id);

      // tailor the modal message depending on who won
      if (userIdViaCookieString === Number(winnerDetails.id)) {
        document.querySelector('.modalTextContent').innerHTML = 'You won!';
        document.querySelector('.modal').style.display = 'block';
      }

      document.querySelector('.modalTextContent').innerHTML = 'You lost!';
      document.querySelector('.modal').style.display = 'block';
    })
    .catch((error) => {
      console.log(error);
    });
};
const updateCardElsWContent = ({ data }) => {
  console.log('starting to update card Els W content');
  console.log(' line 107 data is:');
  console.log(data);

  const {
    gameId, playerHand, referenceCardPile, discardPile, drawPile, won, winnerDetails,
  } = data;
  if (gameId !== undefined) {
  // update the global variable w. the gameId
    currGameId = gameId;
  }
  // trigger win modal if there is a winner
  if (won === true) {
    handleWin(winnerDetails);
  }
  console.log('drawPile.length is:');
  console.log(drawPile.length);
  // update the cards left banner
  document.querySelector('.cardsLeftBanner').innerHTML = `${drawPile.length} cards left`;
  // display the draw pile if there are cards in it
  if (drawPile.length <= 0) {
    document.querySelector('.drawPileCardContainer').style.background = 'none';
  }

  // identify the top card in the referenceCardPile (i.e. taken from drawPile in server-side logic)
  const referenceCardPileTopCard = referenceCardPile[referenceCardPile.length - 1];

  // display the above card in draw pile
  const referenceCardPileCardContainer = document.querySelector('.referenceCardPileCardContainer');
  // referenceCardPileCardContainer.innerHTML = `${referenceCardPileTopCard.display} of ${referenceCardPileTopCard.suitSymbol}`;
  // add the number at top of the card
  referenceCardPileCardContainer.querySelector('.cardDisplayTop').innerHTML = `${referenceCardPileTopCard.display}`;
  // add the symbol in the middle of the card
  referenceCardPileCardContainer.querySelector('.cardDisplaySuit').innerHTML = `${referenceCardPileTopCard.suitSymbol}`;

  // add the number at bottom of the card
  referenceCardPileCardContainer.querySelector('.cardDisplayBottom').innerHTML = `${referenceCardPileTopCard.display}`;

  // change the card's font color to reflect color the suit
  referenceCardPileCardContainer.style.color = `${referenceCardPileTopCard.color}`;

  // get the html element for the discardPile
  // const discardPileCardContainer = document.querySelector('.discardPileCardContainer');
  const discardPileCardContainer = document.querySelector('.discardPileCardContainer');

  // show the discard pile
  // empty the container
  discardPileCardContainer.querySelector('.cardDisplayTop').innerHTML = '';
  discardPileCardContainer.querySelector('.cardDisplaySuit').innerHTML = '';
  discardPileCardContainer.querySelector('.cardDisplayBottom').innerHTML = '';

  // display the top card in discardPile (if it has any cards)
  if (discardPile.length > 0) {
    // identify the top card
    const discardPileTopCard = discardPile[discardPile.length - 1];

    // add the number at top of the card
    discardPileCardContainer.querySelector('.cardDisplayTop').innerHTML = `${discardPileTopCard.display}`;
    // add the symbol in the middle of the card
    discardPileCardContainer.querySelector('.cardDisplaySuit').innerHTML = `${discardPileTopCard.suitSymbol}`;

    // add the number at bottom of the card
    discardPileCardContainer.querySelector('.cardDisplayBottom').innerHTML = `${discardPileTopCard.display}`;

    // change the card's font color to reflect color the suit
    discardPileCardContainer.style.color = `${discardPileTopCard.color}`; }

  // display the cards in player's hand
  displayCardsInPlayerHand(playerHand, referenceCardPileTopCard, discardPile);
  i += 1;
  console.log(`iteration:${i}`);
};

const startGameBtnLogic = () => {
// build the board elements
  // document.body.appendChild(buildBoardEls());
  buildBoardEls();
  console.log('done creating board Els');

  // create the game
  axios.post('/createGame')
  // .then(function)
    .then(updateCardElsWContent).catch((error) => {
      // handle error
      console.log(error);
    });
};

const initPage = () => {
  // create start game button elements
  const startGameBtn = document.createElement('button');
  startGameBtn.setAttribute('class', 'startGameBtn btn btn-primary');
  startGameBtn.innerHTML = 'Start';
  startGameBtn.addEventListener('click', startGameBtnLogic);
  document.body.appendChild(startGameBtn);
};
initPage();

import axios from 'axios';
import './styles.scss';

let i = 0;
let currGameId = 0;

const test = document.createElement('div');
test.innerHTML = 'wowwww';
document.body.appendChild(test);

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
  // create:

  // containers
  const container = document.createElement('div');
  container.setAttribute('class', 'container');

  // ==playing area (Row)
  const playingArea = document.createElement('div');
  playingArea.setAttribute('class', 'playingArea row');

  // == ==playing area (col) (3 of them)
  for (let n = 0; n < 3; n += 1) {
    const playingAreaCol = document.createElement('div');
    playingAreaCol.setAttribute('class', `playingAreaCol${n} col-2`);
    playingAreaCol.innerHTML = `hllo ${n}`;
    playingArea.appendChild(playingAreaCol);
  }
  // == == ==deck
  const drawPileSubheader = document.createElement('h2');
  drawPileSubheader.setAttribute('class', 'playingAreaSubheader');

  const deck = document.createElement('div');
  deck.setAttribute('class', 'drawPile');

  // == == ==reference pile
  const referenceCardPileSubheader = document.createElement('div');
  referenceCardPileSubheader.setAttribute('class', 'playingAreaSubheader');
  referenceCardPileSubheader.innerHTML = 'Reference card:';

  const referenceCardPile = document.createElement('div');
  referenceCardPile.setAttribute('class', 'referenceCardPile');

  // == == ==discard pile
  const discardPileSubheader = document.createElement('div');
  discardPileSubheader.setAttribute('class', 'playingAreaSubheader');
  discardPileSubheader.innerHTML = 'Discard Pile:';

  const discardPile = document.createElement('div');
  discardPile.setAttribute('class', 'discardPile');

  // create info bar that provides info and playing btns(row)
  const infoRow = document.createElement('div');
  infoRow.setAttribute('class', 'row infoBar');

  // ==display whose turn it is (col)
  const turnDisplay = document.createElement('div');
  turnDisplay.setAttribute('class', 'col-2');

  // ==button to end turn (col)
  const endTurnBtnHoldingCol = document.createElement('div');
  endTurnBtnHoldingCol.setAttribute('class', 'col-2');
  // ====end turn button
  const endTurnBtn = document.createElement('button');
  endTurnBtn.innerHTML = 'End Current Turn';
  endTurnBtn.setAttribute('class', 'endTurnBtn');
  endTurnBtnHoldingCol.appendChild(endTurnBtn);
  endTurnBtnHoldingCol.addEventListener('click', endPlayerTurn);

  // ==button to end turn (col)
  const endCurrGameBtnHoldingCol = document.createElement('div');
  endCurrGameBtnHoldingCol.setAttribute('class', 'col-2');
  // ====end current game
  const endCurrentGameBtn = document.createElement('button');
  endCurrentGameBtn.setAttribute('class', 'endCurrentGameBtn');
  endCurrentGameBtn.addEventListener('click', () => {
    // make an axios put to end the current game (i.e. change liveStatus to false)
    axios.put('/endCurrGameWoWinner', { currGameId })
      .then(() => {
        console.log('this should end the current game');
        document.querySelector('.modal').style.display = 'block';
      })
      .catch((error) => {
        console.log(error);
        console.log('redirect to external website');
        window.location.href = 'https://www.google.com';
      });
  });
  endCurrentGameBtn.innerHTML = 'End Current Game';
  endCurrGameBtnHoldingCol.appendChild(endCurrentGameBtn);

  // create a row to hold cards in current player's hand
  const currPlayerHand = document.createElement('div');
  currPlayerHand.setAttribute('class', 'currPlayerHand row');

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
  newGameBtn.setAttribute('class', 'btn btn-primary');
  newGameBtn.addEventListener('click', () => {
    axios.post('/')
      .then((res) => {
        console.log(res);
      })
      .catch((error) => { console.log(error); });
  });

  // append to:
  // playingAreaCol0

  //! !!!!!!!!!!!!!!!!!

  // query selector belwo will not work becos the row it has not been appended to the document as of yet! (it was appended to the container but the container is not appended to the body until this funciton is complete )
  //! !!!!!!!!!!!!!!!!!

  document.querySelector('.playingAreaCol0').appendChild(deck);
  // playingAreaCol1
  document.querySelector('.playingAreaCol1').appendChild(referenceCardPileSubheader);
  document.querySelector('.playingAreaCol1').appendChild(referenceCardPile);
  // playingAreaCol2
  document.querySelector('.playingAreaCol2').appendChild(discardPileSubheader);
  document.querySelector('.playingAreaCol2').appendChild(discardPile);

  // infobar
  infoRow.appendChild(turnDisplay);
  infoRow.appendChild(endTurnBtnHoldingCol);
  infoRow.appendChild(endCurrGameBtnHoldingCol);
  // container
  container.appendChild(playingArea);
  container.appendChild(infoRow);
  container.appendChild(currPlayerHand);

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

  return container;
};

const displayCardsInPlayerHand = (arrayOfCards, referenceCardPileTopCard, discardPile) => {
  document.querySelector('.currPlayerHand').innerHTML = '';

  arrayOfCards.forEach((element, index) => {
    const cardEls = document.createElement('div');
    cardEls.setAttribute('class', 'cardEls col-2');
    cardEls.innerHTML = `${element.name} of ${element.suit}`;
    cardEls.addEventListener('click', (e) => {
      console.log('element is:');
      console.log(element);
      console.log('e.currentTarget is:');
      console.log(e.currentTarget);

      console.log('index is:');
      console.log(index);
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
    document.querySelector('.currPlayerHand').appendChild(cardEls);
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
    // do an axios.put to update statusLive to false

    // unhhide modal
    document.querySelector('.modal').style.display = 'block';

    document.querySelector('.modal-content').innerHTML = 'Hi there!';
  }

  // display the draw pile(which is just the back of a card)
  document.querySelector('.drawPile').innerHTML = `drawPile
  ====
  cardsLeft= ${drawPile.length}`;

  // identify the top card in the referenceCardPile (i.e. taken from drawPile in server-side logic)
  const referenceCardPileTopCard = referenceCardPile[referenceCardPile.length - 1];

  // display the above card in draw pile
  document.querySelector('.referenceCardPile').innerHTML = `${referenceCardPileTopCard.name} of ${referenceCardPileTopCard.suit}`;

  document.querySelector('.discardPile').innerHTML = '';
  // display the top card in discardPile (if it has any cards)
  if (discardPile.length > 0) {
    document.querySelector('.discardPile').innerHTML = `${discardPile[discardPile.length - 1].name} of ${discardPile[discardPile.length - 1].suit}`;
  }

  // display the cards in player's hand
  displayCardsInPlayerHand(playerHand, referenceCardPileTopCard, discardPile);
  i += 1;
  console.log(`iteration:${i}`);
};

const startGameBtnLogic = () => {
// build the board elements
  document.body.appendChild(buildBoardEls());
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

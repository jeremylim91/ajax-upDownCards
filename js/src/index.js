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
    .then(/* updateCardElsWContent */)
    .catch((err) => { console.log(err); });
};

const buildBoardEls = () => {
  console.log('creating the board elements');
  // create:

  // containers
  const container = document.createElement('div');
  container.setAttribute('class', 'container');

  // playing area (Row)
  const playingArea = document.createElement('div');
  playingArea.setAttribute('class', 'playingArea row');

  // deck (col)
  const deck = document.createElement('div');
  deck.setAttribute('class', 'drawPile col');
  // reference pile (col)
  const referenceCardPile = document.createElement('div');
  referenceCardPile.setAttribute('class', 'referenceCardPile col');
  // discard pile (col)
  const discardPile = document.createElement('div');
  discardPile.setAttribute('class', 'discardPile col');

  // create info bar that provides info and playing btns(row)
  const infoRow = document.createElement('div');
  infoRow.setAttribute('class', 'row infoBar');

  // display whose turn it is (col)
  const turnDisplay = document.createElement('div');
  turnDisplay.setAttribute('class', 'col-2');

  // button to end turn (col)
  const endTurnBtnHoldingCol = document.createElement('div');
  endTurnBtnHoldingCol.setAttribute('class', 'col-2');
  // end turn button
  const endTurnBtn = document.createElement('button');
  endTurnBtn.innerHTML = 'End Current Turn';
  endTurnBtn.setAttribute('class', 'endTurnBtn');
  endTurnBtnHoldingCol.appendChild(endTurnBtn);
  endTurnBtnHoldingCol.addEventListener('click', endPlayerTurn);

  // create a row to hold cards in current player's hand
  const currPlayerHand = document.createElement('div');
  currPlayerHand.setAttribute('class', 'currPlayerHand row');

  // append to:
  // playing area
  playingArea.appendChild(deck);
  playingArea.appendChild(referenceCardPile);
  playingArea.appendChild(discardPile);

  // infobar
  infoRow.appendChild(turnDisplay);
  infoRow.appendChild(endTurnBtnHoldingCol);
  // container
  container.appendChild(playingArea);
  container.appendChild(infoRow);
  container.appendChild(currPlayerHand);

  // remove start button
  const startGameBtn = document.querySelector('.startGameBtn');
  document.body.removeChild(startGameBtn);

  return container;
};

const displayCardsInPlayerHand = (arrayOfCards, referenceCardPileTopCard, discardPile, gameId) => {
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
        element, referenceCardPileTopCard, index, gameId,
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
    gameId, playerHand, referenceCardPile, discardPile, drawPile,
  } = data;
  // update the global variable w. the gameId
  currGameId = gameId;

  console.log('playerHand is:');
  console.log(playerHand);

  console.log('drawPile is:');
  console.log(drawPile);

  // display the draw pile(which is just the back of a card)
  document.querySelector('.drawPile').innerHTML = `drawPile
  ====
  cardsLeft= ${drawPile.length}`;

  // identify the top card in the referenceCardPile (i.e. taken from drawPile in server-side logic)
  const referenceCardPileTopCard = referenceCardPile[referenceCardPile.length - 1];

  // display the above card in draw pile
  document.querySelector('.referenceCardPile').innerHTML = `${referenceCardPileTopCard.name} of ${referenceCardPileTopCard.suit}`;

  // display the top card in discardPile (if it has any cards)
  if (discardPile.length > 0) {
    document.querySelector('.discardPile').innerHTML = `${discardPile[discardPile.length - 1].name} of ${discardPile[discardPile.length - 1].suit}`;
  }

  // display the cards in player's hand
  displayCardsInPlayerHand(playerHand, referenceCardPileTopCard, discardPile, gameId);
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
  startGameBtn.setAttribute('class', 'startGameBtn');
  startGameBtn.innerHTML = 'Start';
  startGameBtn.addEventListener('click', startGameBtnLogic);
  document.body.appendChild(startGameBtn);
};
initPage();

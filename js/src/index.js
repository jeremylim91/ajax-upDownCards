import axios from 'axios';
import './styles.scss';

console.log('hello');

const test = document.createElement('div');
test.innerHTML = 'wowwww';
document.body.appendChild(test);

const buildBoardEls = () => {
  console.log('creating the board elements');
  // create:
  // containers
  const container = document.createElement('div');
  container.setAttribute('class', 'container');

  // playing area
  const playingArea = document.createElement('div');
  playingArea.setAttribute('class', 'playingArea');

  // deck
  const deck = document.createElement('div');
  deck.setAttribute('class', 'deck');
  // discard pile
  const discardPile = document.createElement('div');
  discardPile.setAttribute('class', 'discardPile');
  // current player's hand
  const currPlayerHand = document.createElement('div');
  currPlayerHand.setAttribute('class', 'currPlayerHand');

  // make a db query to get the number of card's in players hand (e.g.5)
  const cardsInPlayerHand = [1, 2, 3, 4, 5];

  cardsInPlayerHand.forEach((element, index) => {
    const cardEls = document.createElement('div');
    cardEls.setAttribute('class', 'cardEls');

    // append to the currPlayerHand as each carEl is created
    currPlayerHand.appendChild(cardEls);
  });

  // append to:
  // playing area
  playingArea.appendChild(deck);
  playingArea.appendChild(discardPile);
  // container
  container.appendChild(playingArea);
  container.appendChild(currPlayerHand);

  // remove start button
  const startGameBtn = document.querySelector('.startGameBtn');
  document.body.removeChild(startGameBtn);

  return container;
};

const gameStart = () => {
// build the board elements
  document.body.appendChild(buildBoardEls());
};

const initGame = () => {
  // bring user to a login page, then back here after login--how?
  axios.get('/loginPage');

  // create start game button
  const startGameBtn = document.createElement('button');
  startGameBtn.setAttribute('class', 'startGameBtn');
  startGameBtn.innerHTML = 'Start';
  startGameBtn.addEventListener('click', gameStart);
  document.body.appendChild(startGameBtn);
};
initGame();

import pkg from 'sequelize';
import cardDeckFns from './helperFns/cardDeckFns.mjs';

const { Op } = pkg;

const { makeDeck, shuffleCards } = cardDeckFns;

const checkWin = (playerHandArr, drawPile) => {
  let winnerDetails = null;

  console.log('evaluating win');
  /* two possible criteria for win (either or):
  1. user clears all cards in hand
  2. draw pile runs out cards; then the player with the least points wins
*/
  // win condiiton 1:clear all cards
  playerHandArr.forEach((element) => {
    if (element.cards.length === 0) {
      console.log(`winner is ${element.id}`);
      winnerDetails = element.id;

      return {
        outcome: true,
        winnerDetails,
      };
    }
  });
  // win condition 2:
  // determine when draw pile runs out of cards:
  let playerWithLowestPoints = null;
  let lowestPoints = 100;
  if (drawPile.length === 0) {
    // count who has the lowest number of points
    playerHandArr.forEach((player, playerIndex) => {
      let totalPoints = 0;
      // count the sum of points in each player's hand
      player.cards.forEach((card) => {
        totalPoints += card.rank;
      });
      // create a new key/value pair that stores that player's points
      playerHandArr[playerIndex].points = totalPoints;

      // determine which player has the most points
      if (player.points <= lowestPoints) {
        lowestPoints = player.points;
        playerWithLowestPoints = player;
        console.log('playerWithLargestPoints.id is:');
        console.log(playerWithLowestPoints.id);
      }
    });
    winnerDetails = playerWithLowestPoints;
    return {
      outcome: true,
      winnerDetails,
    };
  }
  return {
    outcome: false,
    winnerDetails,
  };
};

export default function games(db) {
  const create = async (req, res) => {
    try {
      const userInstance = await db.User.findByPk(req.cookies.userId);
      // console.log('playerInstance is:');
      // console.log(userInstance);

      const existingGameInstance = (await userInstance.getGames({
        where: {
          liveStatus: true,
        },
      }))[0];

      /* manage 2 scenarios:
      1. player is alr in-game W someone else,
      so just render the board using info from existing game

      2. Player is not in an existing game, so create a board and make another player join */

      // scenario 1: alr in-game

      if (existingGameInstance !== undefined) {
        console.log('user has an existing game');

        // send the board elements of his exsiting game so that the client renders it
        existingGameInstance.gameState.playerHandArr.forEach((element, index) => {
          if (element.id === Number(req.cookies.userId)) {
            res.send({
              gameId: existingGameInstance.id,
              drawPile: existingGameInstance.gameState.drawPile,
              referenceCardPile: existingGameInstance.gameState.referenceCardPile,
              discardPile: existingGameInstance.gameState.discardPile,
              playerHand: existingGameInstance.gameState.playerHandArr[index].cards,
              turn: index,
              won: false,
              winnerDetails: null,
            });
          }
        });
        return;
      }
      // scenario2: not in-game:
      // get the instance of the first user based on his cookies
      const player1Instance = await db.User.findByPk(req.cookies.userId);

      // select a random second player from the user database to be the opponent
      const player2Instance = await db.User.findOne({
        order: db.sequelize.random(),
        where: {
          [Op.not]: [
            {
              id: req.cookies.userId,
            },
          ],
        },
      });
      // set a an array that will hold the players' mapping (i.e. determine whose turn it is)
      const playerMapping = [player1Instance.id, player2Instance.id];

      // set a deck of shuffled cards
      const deck = shuffleCards(makeDeck());

      // set the drawPile array
      const drawPile = [];

      // remove 10 cards from the deck and place them  in drawPile
      // commented out for testing with only 1 card in draw pile
      // for (let i = 0; i < 10; i += 1) {
      //   drawPile.push(deck.pop());
      // }
      for (let i = 0; i < 10; i += 1) {
        drawPile.push(deck.pop());
      }
      // set the reference & move drawPile's top card into  discardPile; this is the starting card
      const referenceCardPile = [drawPile.pop()];

      // set the discardPile
      const discardPile = [];

      // set an array that will be each of the (2) players' hand
      const player1Hand = [];
      const player2Hand = [];

      // deal remaining cards from deck into each of of the players' hand.
      while (deck.length > 0) {
        if (deck.length % 2 === 1) {
          player2Hand.push(deck.pop());
        } else {
          player1Hand.push(deck.pop());
        }
      }
      const hands = [player1Hand, player2Hand];
      // create a map of the player hand
      // const playerHandMap = new Map();
      // playerHandMap.set(player1Instance.id, player1Hand);
      // playerHandMap.set(player2Instance.id, player2Hand);
      //= ===============================

      const playerHandArr = [];
      playerMapping.forEach((element, index) => {
        playerHandArr.push({
          name: `player${index}`,
          id: element,
          cards: hands[index],
        });
      });
      //= ===============================

      // save gameData to the games table
      const gameInstance = await db.Game.create({
        gameState: {
          drawPile,
          referenceCardPile,
          discardPile,
          playerMapping,
          playerHandArr,
          whoseTurn: 0,
          player1Hand,
          player2Hand,
          passedTurnWoPlayingCards: 0,
        },
        liveStatus: true,
      });

      // update the join table that currPlayer and randomOpponentInstance are both in the same game
      await gameInstance.addUser(player1Instance);
      await gameInstance.addUser(player2Instance);

      // send the game info back to the client browser, depending on his userId
      gameInstance.gameState.playerHandArr.forEach((element, index) => {
        console.log('element.id is:');
        console.log(element.id);
        console.log('req.cookies.userId is:');
        console.log(req.cookies.userId);
        if (element.id === Number(req.cookies.userId)) {
          console.log('id and cookies match');
          res.send({
            gameId: gameInstance.id,
            drawPile: gameInstance.gameState.drawPile,
            referenceCardPile: gameInstance.gameState.referenceCardPile,
            discardPile: gameInstance.gameState.discardPile,
            playerHand: gameInstance.gameState.playerHandArr[index].cards,
            turn: index,
            won: false,
            winnerDetails: null,
          });
        }
      });
    } catch (error) {
      res.status(500).send(error);
      console.error(error);
    }
  };

  const validateDiscardingOfCard = async (req, res) => {
    let won = false;
    // const winnerDetails = null;

    /* Two levels of validation required here:
      1. (pending): is it user's turn to make a move?
      2. (finished): Is user's card +/-1 of the card in the discard pile
     */
    // get nec variables from req.body
    const {
      element: clickedCard, referenceCardPileTopCard, index: indexOfClickedCard, currGameId: gameId,
    } = req.body;

    // query the db to get the instance of the current game
    try {
      const currGameInstance = await db.Game.findByPk(gameId);

      // obj destructuring to get all elements of the instance
      const {
        // eslint-disable-next-line
        drawPile, referenceCardPile, discardPile, playerMapping, whoseTurn, playerHandArr, player1Hand, player2Hand, passedTurnWoPlayingCards,
      } = currGameInstance.gameState;

      // start level 1 validation: is it curr player's turn to make a move?
      // lvl_1_validation_FAIL:

      if (playerHandArr[whoseTurn].id !== Number(req.cookies.userId)) {
        console.log('lvl1 validation fail');
        // sending a non-200 status would trigger catch in client side
        res.send('is not user\'s turn');
        return;
      }
      // lvl_1_validation_PASS

      // Start Lvl 2 validation: did currPlayer select a valid card to discard

      // lvl_2_validation_PASS:
      // eslint-disable-next-line
      else if ((clickedCard.rank === referenceCardPileTopCard.rank) || (clickedCard.rank + 1 === referenceCardPileTopCard.rank) || (clickedCard.rank - 1 === referenceCardPileTopCard.rank)) {
        console.log('lvl 2 validation passed');

        // take the matching card out of the player's hand and put it into the discardPile
        // find the current player's hand based on cookies
        let currPlayer = '';
        playerHandArr.forEach((element, index) => {
          if (element.id === Number(req.cookies.userId)) {
            currPlayer = { ...playerHandArr[index] };
          }
        });
        // console.log('currPlayer is:');
        // console.log(currPlayer);

        // do a deep copy of player1Hand
        const newPlayer1Hand = [...player1Hand];

        // matching card is
        const matchingCard = currPlayer.cards.splice(indexOfClickedCard, 1);

        // const matchingCard = newPlayer1Hand.splice(index, 1);

        // place matching card in discard pile
        const newDiscardPile = [...discardPile];

        newDiscardPile.push(matchingCard[0]);

        // update playerHandArr
        playerHandArr.forEach((element, index) => {
          if (element.id === Number(req.cookies.userId)) {
            playerHandArr[index] = currPlayer;
          }
        });

        // const newPlayerHandArr.splice()
        // update the model that with the new gameState

        currGameInstance.gameState = {
          drawPile,
          referenceCardPile,
          discardPile: newDiscardPile,
          playerMapping,
          playerHandArr,
          whoseTurn,
          player1Hand: newPlayer1Hand,
          player2Hand,
          passedTurnWoPlayingCards,
        };
        await currGameInstance.save();

        // this doesn't work:
        // await currGameInstance.update({ id: gameId, gameState: newGameState });
        // check if anyone has won
        const { outcome, winnerDetails } = checkWin(playerHandArr, drawPile);
        if (outcome === true) {
          console.log('sending back winner details');
          won = true;
        }

        // send the game info back to the client browser, depending on his userId
        currGameInstance.gameState.playerHandArr.forEach((element, index) => {
          console.log(element.id);
          if (element.id === Number(req.cookies.userId)) {
            res.send({
              gameId: currGameInstance.id,
              drawPile: currGameInstance.gameState.drawPile,
              referenceCardPile: currGameInstance.gameState.referenceCardPile,
              discardPile: currGameInstance.gameState.discardPile,
              playerHand: currGameInstance.gameState.playerHandArr[index].cards,
              turn: index,
              won,
              winnerDetails,
            });
          }
        });
      }
      // lvl_2_validation_FAIL:
      else {
        // manage outcome where it's not valid
        console.log('not a matching card');
        // res.status(100).send({object})
        res.send('not a matching card');
      }
      // catch errors (esp database query errors)
    } catch (error) {
      res.status(500).send(error);
      console.error(error);
    }
  };

  const endPlayerTurn = async (req, res) => {
    const { currGameId: gameId } = req.body;
    try {
      const currGameInstance = await db.Game.findByPk(gameId);
      let {
      // eslint-disable-next-line
        drawPile, referenceCardPile, discardPile, playerMapping, whoseTurn, playerHandArr, player1Hand, player2Hand,passedTurnWoPlayingCards,
      } = currGameInstance.gameState;

      // increase whoseTurn by 1
      let newWhoseTurn = whoseTurn + 1;
      console.log('newWhoseTurn-1');
      console.log(newWhoseTurn);
      // if whoseTurn exceeds the length of playerHandArr, reset to 1
      if (newWhoseTurn > playerHandArr.length - 1) {
        newWhoseTurn = 0;
      }
      console.log('newWhoseTurn-2');
      console.log(newWhoseTurn);

      /* set conditions that tell you when players pass turns consecutively w/o playing cards.
      1. if the players passed their turn w/o playing cards,
      then take a draw pile and put it on top of the newReferenceCardPile
      2. else if they did draw a card in that turn, then empty discard pile into refereceCardPile,
      and  proceed to next players' turn */

      let newPassedTurnWoPlayingCards = 0;
      let drawPileTopCard = null;
      let newReferenceCardPile = null;

      // If discard pile is empty, it shows that player ended his turn without playing any cards
      if (discardPile.length === 0) {
        // set new variable to show num of turns passed without drawing cards
        newPassedTurnWoPlayingCards = passedTurnWoPlayingCards + 1;
      }

      // take the discardPile and place it into the referenceCardPile
      newReferenceCardPile = [...referenceCardPile, ...discardPile];

      // But if discard pile hits 2 , it means 2 players hv passed their turn without playing cards
      if (newPassedTurnWoPlayingCards > 1) {
        // take a card from the draw pile
        drawPileTopCard = drawPile.pop();
        // add the card to the reference pile
        newReferenceCardPile = [...referenceCardPile, drawPileTopCard];
      }

      console.log('newReferenceCardPile is:');
      console.log(newReferenceCardPile);

      // update db with newReferenceCardPile, empty the discardPile, and newWHoseTurn,
      currGameInstance.gameState = {
        drawPile,
        referenceCardPile: newReferenceCardPile,
        discardPile: [],
        playerMapping,
        playerHandArr,
        whoseTurn: newWhoseTurn,
        player1Hand,
        player2Hand,
        passedTurnWoPlayingCards: newPassedTurnWoPlayingCards,
      };
      currGameInstance.save();

      console.log('currGameInstance is:');
      console.log(currGameInstance);

      currGameInstance.gameState.playerHandArr.forEach((element, index) => {
        if (element.id === Number(req.cookies.userId)) {
          res.send({
            gameId: currGameInstance.id,
            drawPile: currGameInstance.gameState.drawPile,
            referenceCardPile: currGameInstance.gameState.referenceCardPile,
            discardPile: currGameInstance.gameState.discardPile,
            playerHand: currGameInstance.gameState.playerHandArr[index].cards,
            turn: index,
            won: false,
            winnerDetails: null,
          });
          console.log('currGameInstance.gameState.discardPile is: ');
          console.log(currGameInstance.gameState.discardPile);
        }
      });

      //= ==========================
    } catch (error) {
      res.status(500).send(error);
      console.error(error);
    }
  };

  const endCurrGame = async (req, res) => {
    console.log('ending current game');
    const { currGameId: gameId } = req.body;
    try {
      const currGameInstance = await db.Game.findByPk(gameId);
      console.log('end CurrGem currGameInstance:');
      console.log(currGameInstance);
      currGameInstance.liveStatus = false;
      currGameInstance.save();
      res.send();
    } catch (error) {
      res.status(500).send(error);
      console.error(error);
    }
  };

  return {
    create, validateDiscardingOfCard, endPlayerTurn, endCurrGame,
  };
}

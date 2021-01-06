import pkg from 'sequelize';
import cardDeckFns from './helperFns/cardDeckFns.mjs';
import objToMap from './helperFns/convertToMap.mjs';

const { Op } = pkg;

const { makeDeck, shuffleCards } = cardDeckFns;
const { convertToMap } = objToMap;

export default function games(db) {
  const create = async (req, res) => {
    try {
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
          whoseTurn: playerMapping[0],
          playerHandArr,
          player1Hand,
          player2Hand,
        },
      });

      // update the join table that currPlayer and randomOpponentInstance are both in the same game
      await gameInstance.addUser(player1Instance);
      await gameInstance.addUser(player2Instance);

      // send the game info back to the client browser, depending on his userId
      gameInstance.gameState.playerHandArr.forEach((element, index) => {
        console.log(element.id);
        if (element.id === Number(req.cookies.userId)) {
          console.log('id and cookies match');
          res.send({
            gameId: gameInstance.id,
            drawPile: gameInstance.gameState.drawPile,
            referenceCardPile: gameInstance.gameState.referenceCardPile,
            discardPile: gameInstance.gameState.discardPile,
            playerHand: gameInstance.gameState.playerHandArr[index].cards,
            turn: index,
          });
        }
      });

      // playerMapping.forEach((element, index) => {
      //   if (element === Number(req.cookies.userId)) {
      //     // player at index 0 is always player 1
      //     if (index === 0) {
      //       res.send({
      //         id: gameInstance.id,
      //         drawPile: gameInstance.gameState.drawPile,
      //         referenceCardPile: gameInstance.gameState.referenceCardPile,
      //         discardPile: gameInstance.gameState.discardPile,
      //         playerHand: gameInstance.gameState.player1Hand,
      //       });
      //       // playerHand: gameInstance.gameState.playerHandMap.get(req.cookies.userId),
      //       console.log('sent player1Hand back to client');
      //       // player at index 1 is always player 2
      //     } if (index === 1) {
      //       res.send({
      //         id: gameInstance.id,
      //         drawPile: gameInstance.gameState.drawPile,
      //         discardPile: gameInstance.gameState.discardPile,
      //         playerHand: gameInstance.gameState.player2Hand,
      //       });
      //       console.log('sent player2 hand back to client');
      //     }
      //   }
      // });
    } catch (error) {
      res.status(500).send(error);
      console.error(error);
    }
  };

  const validateDiscardingOfCard = async (req, res) => {
    /* Two levels of validation required here:
      1. (pending): is it user's turn to make a move?
      2. (finished): Is user's card +/-1 of the card in the discard pile
     */
    // get nec variables from req.body
    const {
      element: clickedCard, referenceCardPileTopCard, index: indexOfClickedCard, gameId,
    } = req.body;

    // query the db to get the instance of the current game
    try {
      const currGameInstance = await db.Game.findByPk(gameId);
      // destructure variables from currGameInstance
      console.log('currGameInstance is:');
      console.log(currGameInstance.gameState.playerHandArr[0].cards.length);

      // obj destructuring to get all elements of the instance
      const {
        // eslint-disable-next-line
        drawPile, referenceCardPile, discardPile, playerMapping, whoseTurn, playerHandArr, player1Hand, player2Hand,
      } = currGameInstance.gameState;

      // start level 1 validation: is it curr player's turn to make a move?
      // lvl_1_validation_FAIL:
      if (Number(whoseTurn) !== Number(req.cookies.userId)) {
        res.send('is not user\'s turn');
        return;
      }
      // lvl_1_validation_PASS

      // Start Lvl 2 validation: did currPlayer select a valid card to discard

      // lvl_2_validation_PASS:
      // eslint-disable-next-line
      if ((clickedCard.rank === referenceCardPileTopCard.rank) || (clickedCard.rank + 1 === referenceCardPileTopCard.rank) || (clickedCard.rank - 1 === referenceCardPileTopCard.rank)) {
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
          whoseTurn,
          playerHandArr,
          player1Hand: newPlayer1Hand,
          player2Hand,
        };
        await currGameInstance.save();

        // this doesn't work:
        // await currGameInstance.update({ id: gameId, gameState: newGameState });
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
            });
          }
        });
      }
      // lvl_2_validation_FAIL:
      else {
        // manage outcome where it's not valid
        console.log('not a matching card');
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
        drawPile, referenceCardPile, discardPile, playerMapping, whoseTurn, player1Hand, player2Hand,
      } = currGameInstance.gameState;

      // identify which where the current player stands in the playerMapping array

      const nextPlayerId = playerMapping[playerMapping.indexOf(Number(req.cookies.userId)) + 1];

      whoseTurn = nextPlayerId;

      currGameInstance.gameState = {
        drawPile,
        referenceCardPile,
        discardPile,
        playerMapping,
        whoseTurn,
        player1Hand,
        player2Hand,
      };
      currGameInstance.save();

      // send back the data to the player
      res.send({
        id: currGameInstance.id,
        // need to change eventually becos it hardcodes player 1's hand regardless of player's id
        drawPile: currGameInstance.gameState.drawPile,
        referenceCardPile: currGameInstance.gameState.referenceCardPile,
        discardPile: currGameInstance.gameState.discardPile,
        playerHand: currGameInstance.gameState.player1Hand,
      });
    } catch (error) {
      res.status(500).send(error);
      console.error(error);
    }
  };

  return { create, validateDiscardingOfCard, endPlayerTurn };
}

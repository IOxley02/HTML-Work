//I like adding my own comments, so I deleted all of them and made my own

/**CREATES A CARD** creates a card that will be utilized in later stages of the project */
function createNewCard() {
  //Create the element
  let cardElement = document.createElement("div")
  //adding the 'card' class
	cardElement.classList.add('card');
  //adding the other classes to 'card'
  cardElement.innerHTML = '<div class = card-down></div> <div class = card-up></div>';
  return cardElement;

}

//**ATTACH CARD** attaches the created card to the parentElement of the ccard
function appendNewCard(parentElement) {
  //create the card using the createNewCard function
	let card = createNewCard();
  //append the child of the card using the parameter
	parentElement.appendChild(card);
  return card;
}

//**SHUFFLE** this simply takes an array of strings and shuffles them
function shuffleCardImageClasses() {
  //creates an array of 12 elements, one for each card
  let cardNames = ["image-1", "image-1", "image-2", "image-2","image-3", "image-3", "image-4", "image-4","image-5", "image-5", "image-6", "image-6"]
  //shuffle the cardNames array and return
  return _.shuffle(cardNames);
}
//shuffleCardImageClassesTest()

/*CREATE BOARD** creates the entire board presented utilizing the previous three functions created*/
function createCards(parentElement, shuffledImageClasses) {
  //Empty array to hold values later
  let cardNames = [];
  //loops through for all 12 values (0 - 11)
  for(let i = 0; i < 12; i++) {
    //uses the appendNewCard to create a new card utilizes the shuffled list to give it an image
    let newCard = appendNewCard(parentElement);
    newCard.classList.add(shuffledImageClasses[i]);
    //card object definition
    let card = {
      index: i,
      element: newCard,
      imageClass: shuffledImageClasses[i],
    }
    //adds it to cardNames array
    cardNames.push(card);
  }
  return cardNames;
}

/**MATCH** checks if the cards match eachother utilizing the imageClass method*/
function doCardsMatch(cardObject1, cardObject2) {
	//**FIRST CASE** if they do match
if(cardObject1.imageClass == cardObject2.imageClass) {
  return true;
}
  //**SECOND CASE** if they dont match
	return false;
}

//**COUNTER** creates the counter which will keep track of how many flips have been made
let counters = {};
function incrementCounter(counterName, parentElement) {
  /*If the 'counterName' property is not defined in the 'counters' object, initialize it with a value of 0*/
	if(counters[counterName] == undefined) {
    counters[counterName] = 0;
  }
  //incriment the counter
	counters[counterName]++;
  //use innerHTML to display the counter's changes
	parentElement.innerHTML = counters[counterName];
}

/**FLIPPED** called whenever the user flips a card, contains multiple created above*/
let lastCardFlipped = null;
function onCardFlipped(newlyFlippedCard) {
  //get the card container and store it
	incrementCounter("Flips", document.querySelector("#flip-count"));
  //if its the first card flipped
  if(lastCardFlipped == null) {
    lastCardFlipped = newlyFlippedCard;
    return;
  }
  //**CASE 1** if they don't match, flip them back over and reset
	if(doCardsMatch(lastCardFlipped, newlyFlippedCard) == false) {
    lastCardFlipped.element.classList.remove("flipped");
    newlyFlippedCard.element.classList.remove("flipped");
    lastCardFlipped = null;
    return;
  }
  //**CASE 2** if they do match, glow the boarder and play audo
	incrementCounter('matches', document.querySelector("#match-count"));
  lastCardFlipped.element.classList.add("border-glow");
  lastCardFlipped.element.classList.add("border-glow");
  //determines which audio will play
  if (counters.matches == 6) {
    winAudio.play();
  } else {
    matchAudio.play();
  }
  //sets the lastcard back to null
	lastCardFlipped = null;
}

//**RESET** resets the game after the reset button has been clicked
function resetGame() {
  let cards = document.getElementById("card-container");
  //removes the child of all the cards (these will be replaced and randomized on the game setup)
	while(cards.firstChild) {
    cards.removeChild(cards.firstChild);
  }
  //Resets counter and match-count elements back to 0
  document.getElementById("flip-count").innerText = 0;
  document.getElementById("match-count").innerText = 0;
  //Reset counter[] back to the base case
  counters = {};
  //set up the game as if we were playing again
  setUpGame();
}

// ⛔️ Set up the game. Do not edit below this line! ⛔️
setUpGame();
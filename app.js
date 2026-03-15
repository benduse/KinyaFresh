// words loaded from words.json; currentIndex tracks which card is showing
let words = [];
let currentIndex = 0;

const wordContainer = document.getElementById('word-container');

// Fetch vocabulary data then render the first card
fetch('words.json')
  .then(response => response.json())
  .then(vocabularyData => { words = vocabularyData; showLearn(); });

// Returns a new array with the same items in a random order (Fisher-Yates shuffle)
function shuffle(inputArray) {
  const shuffledCopy = [...inputArray];
  for (let currentPos = shuffledCopy.length - 1; currentPos > 0; currentPos--) {
    const randomPos = Math.floor(Math.random() * (currentPos + 1));
    [shuffledCopy[currentPos], shuffledCopy[randomPos]] = [shuffledCopy[randomPos], shuffledCopy[currentPos]];
  }
  return shuffledCopy;
}

// Shorthand for creating a DOM element with an optional CSS class
function createElement(tagName, cssClass) {
  const element = document.createElement(tagName);
  if (cssClass) element.className = cssClass;
  return element;
}

// Builds and renders the full flip-card for the current word (front + back)
function showLearn() {
  const currentWord = words[currentIndex];
  wordContainer.replaceChildren();

  // ── Flip wrapper ─────────────────────────────────────────────
  // .flip-card holds perspective; toggling .is-flipped on it rotates .flip-inner 180°
  const flipCard  = createElement('div', 'flip-card');
  const flipInner = createElement('div', 'flip-inner');

  // ── FRONT: learn card ────────────────────────────────────────
  const cardFront = createElement('div', 'flip-face flip-front word-card');

  const wordImage = createElement('img', 'word-image');
  wordImage.src = currentWord.image;
  wordImage.alt = currentWord.word;

  // Card body: Kinyarwanda word, English meaning, and example sentence
  const cardBody    = createElement('div', 'card-body');
  const wordTitle   = createElement('div', 'word-title');   wordTitle.textContent   = currentWord.word;
  const wordMeaning = createElement('div', 'word-meaning'); wordMeaning.textContent = currentWord.meaning;
  const wordExample = createElement('div', 'word-example'); wordExample.textContent = currentWord.example;
  cardBody.append(wordTitle, wordMeaning, wordExample);

  // Footer: progress counter, optional audio controls, optional Practice button, Next button
  const cardFooter      = createElement('div', 'card-footer');
  const progressCounter = createElement('span', 'card-progress');
  progressCounter.textContent = `${currentIndex + 1} / ${words.length}`;
  cardFooter.appendChild(progressCounter);

  // Attach audio controls only if the word has an audio file and the module is loaded
  if (currentWord.audio && window.createAudioControls) {
    const audioControls = createAudioControls(currentWord);
    if (audioControls) cardFooter.appendChild(audioControls);
  }

  // Practice button flips the card to reveal the puzzle on the back
  if (currentWord.puzzle) {
    const practiceBtn = createElement('button', 'btn-practice');
    practiceBtn.textContent = 'Practice →';
    practiceBtn.addEventListener('click', () => flipCard.classList.add('is-flipped'));
    cardFooter.appendChild(practiceBtn);
  }

  // Next button advances to the next word, or loops back to the start
  const nextBtn = createElement('button', 'btn-next');
  nextBtn.textContent = currentIndex < words.length - 1 ? 'Next →' : 'Start Over';
  nextBtn.addEventListener('click', () => {
    currentIndex = currentIndex < words.length - 1 ? currentIndex + 1 : 0;
    showLearn();
  });
  cardFooter.appendChild(nextBtn);

  cardFront.append(wordImage, cardBody, cardFooter);

  // ── BACK: puzzle ─────────────────────────────────────────────
  // The back face is pre-rotated 180° in CSS; buildPuzzle populates it
  const cardBack = createElement('div', 'flip-face flip-back');
  if (currentWord.puzzle) buildPuzzle(currentWord.puzzle, cardBack, () => flipCard.classList.remove('is-flipped'));

  flipInner.append(cardFront, cardBack);
  flipCard.appendChild(flipInner);
  wordContainer.appendChild(flipCard);
}

// Populates the puzzle back-face inside `puzzleContainer`.
// `onBack` is called when the user taps ← Back to flip the card back to the front.
function buildPuzzle(puzzleData, puzzleContainer, onBack) {
  puzzleContainer.className = 'flip-face flip-back puzzle-card';

  // placedChipIndices stores the indices (into shuffledTokens) of chips the user has moved to the answer zone, in order
  let placedChipIndices = [];
  // shuffledTokens is a randomised copy of the correct token array so the chips never appear in the right order
  const shuffledTokens = shuffle(puzzleData.kiny);

  // Prompt area: label + English sentence the user needs to translate
  const promptArea       = createElement('div', 'puzzle-prompt');
  const instructionLabel = createElement('span', 'puzzle-label'); instructionLabel.textContent = 'Translate into Kinyarwanda';
  const englishSentence  = createElement('div', 'puzzle-en');     englishSentence.textContent  = puzzleData.en;
  promptArea.append(instructionLabel, englishSentence);

  // answerZone: where placed chips appear; chipPool: the remaining unplaced chips
  const answerZone = createElement('div', 'puzzle-answer-zone');
  const chipPool   = createElement('div', 'puzzle-chips');

  // Puzzle card header: mirrors the front card's image area with word title + progress for consistency
  const puzzleHeader    = createElement('div', 'puzzle-header');
  const puzzleWordTitle = createElement('div', 'puzzle-word-title'); puzzleWordTitle.textContent = puzzleData.word;
  const puzzleProgress  = createElement('span', 'card-progress');   puzzleProgress.textContent  = `${currentIndex + 1} / ${words.length}`;
  puzzleHeader.append(puzzleWordTitle, puzzleProgress);

  // Footer buttons: Back (flip to front), Reset (clear answer), Check (validate order), Next (advance word)
  const puzzleFooter = createElement('div', 'puzzle-footer');
  const backBtn      = createElement('button', 'btn-back');     backBtn.textContent  = '← Back';
  const resetBtn     = createElement('button', 'puzzle-reset'); resetBtn.textContent = 'Reset';
  const checkBtn     = createElement('button', 'puzzle-check'); checkBtn.textContent = 'Check ✓';
  const nextBtn      = createElement('button', 'btn-next');
  nextBtn.textContent = currentIndex < words.length - 1 ? 'Next →' : 'Start Over';
  nextBtn.addEventListener('click', () => {
    currentIndex = currentIndex < words.length - 1 ? currentIndex + 1 : 0;
    showLearn();
  });
  puzzleFooter.append(backBtn, resetBtn, checkBtn, nextBtn);

  // feedbackMessage announces the result of Check to the user (and to screen readers via aria-live)
  const feedbackMessage = createElement('div', 'puzzle-feedback');
  feedbackMessage.setAttribute('aria-live', 'polite');

  puzzleContainer.append(puzzleHeader, promptArea, answerZone, chipPool, puzzleFooter, feedbackMessage);

  // Renders only the chips that have NOT yet been placed into the answer zone
  function renderChipPool() {
    chipPool.replaceChildren();
    shuffledTokens.forEach((token, tokenIndex) => {
      if (placedChipIndices.includes(tokenIndex)) return; // skip chips already moved to the answer zone
      const chip = createElement('button', 'chip');
      chip.textContent = token;
      // Tapping a chip moves it to the answer zone by recording its index in placedChipIndices[]
      chip.addEventListener('click', () => {
        placedChipIndices.push(tokenIndex);
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'puzzle-feedback';
        render();
      });
      chipPool.appendChild(chip);
    });
  }

  // Renders the chips currently in the answer zone, in the order the user placed them
  function renderAnswerZone() {
    answerZone.replaceChildren();
    if (placedChipIndices.length === 0) {
      const emptyPrompt = createElement('span', 'answer-placeholder');
      emptyPrompt.textContent = 'Tap words below to build the sentence';
      answerZone.appendChild(emptyPrompt);
      return;
    }
    placedChipIndices.forEach((chipIndex, placedPosition) => {
      const placedChip = createElement('button', 'chip chip--placed');
      placedChip.textContent = shuffledTokens[chipIndex];
      // Tapping a placed chip removes it from the answer zone and returns it to the chip pool
      placedChip.addEventListener('click', () => {
        placedChipIndices.splice(placedPosition, 1);
        feedbackMessage.textContent = '';
        feedbackMessage.className = 'puzzle-feedback';
        render();
      });
      answerZone.appendChild(placedChip);
    });
  }

  // Re-renders both zones together to keep them in sync
  function render() { renderAnswerZone(); renderChipPool(); }

  // Validates the user's answer against the correct token order from words.json
  checkBtn.addEventListener('click', () => {
    if (placedChipIndices.length !== puzzleData.kiny.length) {
      feedbackMessage.textContent = 'Place all words first!';
      feedbackMessage.className = 'puzzle-feedback puzzle-feedback--warn';
      return;
    }
    const userAnswer = placedChipIndices.map(chipIndex => shuffledTokens[chipIndex]);
    const isCorrect  = userAnswer.every((token, position) => token === puzzleData.kiny[position]);
    if (isCorrect) {
      feedbackMessage.textContent = '✅ Correct!';
      feedbackMessage.className = 'puzzle-feedback puzzle-feedback--correct';
      answerZone.querySelectorAll('.chip').forEach(chip => chip.classList.add('chip--correct'));
    } else {
      feedbackMessage.textContent = '❌ Not quite — try again!';
      feedbackMessage.className = 'puzzle-feedback puzzle-feedback--wrong';
      answerZone.querySelectorAll('.chip').forEach(chip => chip.classList.add('chip--wrong'));
    }
  });

  // Clears the answer zone and restores all chips to the pool
  resetBtn.addEventListener('click', () => {
    placedChipIndices = [];
    feedbackMessage.textContent = '';
    feedbackMessage.className = 'puzzle-feedback';
    render();
  });

  // Resets puzzle state then calls onBack() to flip the card back to the learn side
  backBtn.addEventListener('click', () => {
    placedChipIndices = [];
    feedbackMessage.textContent = '';
    feedbackMessage.className = 'puzzle-feedback';
    render();
    onBack();
  });

  render();
}

let words = [];
let currentAudio = null;

const container = document.getElementById('word-container');

fetch('words.json')
  .then(response => response.json())
  .then(data => {
    words = data;
    showLearn();
  });

function showLearn() {
  container.innerHTML = '';

  words.forEach(item => {

    const card = document.createElement('div');
    card.className = 'word-card';

    card.innerHTML = `
      <img src="${item.image}" class="word-image" alt="${item.word}">
      <div class="word-title">${item.word}</div>
      <div class="word-meaning">${item.meaning}</div>
      <div class="word-example">${item.example}</div>
      ${item.audio ? `
        <div class="audio-indicator">
          🔊 <span>Listen</span>
        </div>
      ` : ''}
    `;

    if (item.audio) {
      const audioButton = card.querySelector('.audio-indicator');

      audioButton.addEventListener('click', (e) => {
        e.stopPropagation();

        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }

        currentAudio = new Audio(item.audio);
        currentAudio.play();
      });
    }

    container.appendChild(card);
  });
}

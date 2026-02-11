// Standalone audio controls module — usage: const controls = createAudioControls(item); card.appendChild(controls);
(() => {
	// module-scoped shared state so only one audio plays at a time
	let _currentAudio = null;
	let _currentControls = null;

	function _resetCurrent() {
		if (_currentAudio) {
			_currentAudio.pause();
			_currentAudio.currentTime = 0;
		}
		if (_currentControls) {
			const prevPlay = _currentControls.querySelector(".btn-play");
			const prevRate = _currentControls.querySelector(".rate-display");
			if (prevPlay) prevPlay.textContent = "▶️";
			if (prevRate) prevRate.textContent = "1.00x";
		}
		_currentAudio = null;
		_currentControls = null;
	}

	function _ensureAudio(item, controls) {
		if (!_currentAudio || _currentControls !== controls) {
			_resetCurrent();
			_currentAudio = new Audio(item.audio);
			_currentAudio.preload = "auto";
			_currentAudio.playbackRate = 1.0;
			_currentControls = controls;
			_currentAudio.addEventListener("ended", () => {
				if (_currentControls) {
					const p = _currentControls.querySelector(".btn-play");
					if (p) p.textContent = "▶️";
				}
			});
		}
		return _currentAudio;
	}

	// create and return a DOM element containing audio controls for a given item
	function createAudioControls(item) {
		if (!item || !item.audio) return null;

		const controls = document.createElement("div");
		controls.className = "audio-controls";
		controls.innerHTML = `
      <button class="btn-play" title="Play">▶️</button>
      <button class="btn-stop" title="Stop">⏹️</button>
      <button class="btn-slower" title="Slower">🐢</button>
      <button class="btn-faster" title="Faster">🐇</button>
      <span class="rate-display">1.00x</span>
    `;

		const btnPlay = controls.querySelector(".btn-play");
		const btnStop = controls.querySelector(".btn-stop");
		const btnSlower = controls.querySelector(".btn-slower");
		const btnFaster = controls.querySelector(".btn-faster");
		const rateDisplay = controls.querySelector(".rate-display");

		btnPlay.addEventListener("click", () => {
			const audio = _ensureAudio(item, controls);
			if (audio.paused) {
				audio.play().catch((err) => console.error("Playback failed", err));
				btnPlay.textContent = "⏸️";
			} else {
				audio.pause();
				btnPlay.textContent = "▶️";
			}
		});

		btnStop.addEventListener("click", () => {
			if (_currentControls !== controls) _resetCurrent();
			const audio = _ensureAudio(item, controls);
			audio.pause();
			audio.currentTime = 0;
			btnPlay.textContent = "▶️";
			rateDisplay.textContent = `${audio.playbackRate.toFixed(2)}x`;
		});

		btnSlower.addEventListener("click", () => {
			const audio = _ensureAudio(item, controls);
			audio.playbackRate = Math.max(
				0.5,
				+(audio.playbackRate - 0.1).toFixed(2),
			);
			rateDisplay.textContent = `${audio.playbackRate.toFixed(2)}x`;
		});

		btnFaster.addEventListener("click", () => {
			const audio = _ensureAudio(item, controls);
			audio.playbackRate = Math.min(
				2.0,
				+(audio.playbackRate + 0.1).toFixed(2),
			);
			rateDisplay.textContent = `${audio.playbackRate.toFixed(2)}x`;
		});

		return controls;
	}

	// expose the factory on window for easy use in a plain script app
	window.createAudioControls = createAudioControls;
})();

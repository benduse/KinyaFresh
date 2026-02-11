// Lightweight gallery: single-view (default) + gallery (View All)
(() => {
	const TOTAL = 24; // adjust to number of files
	const gallery = document.getElementById("gallery");
	const singleImg = document.getElementById("single-img");
	const prevBtn = document.getElementById("prev");
	const nextBtn = document.getElementById("next");
	const toggleBtn = document.getElementById("toggle-view");
	const caption = document.getElementById("caption");
	const singleView = document.getElementById("single-view");

	let current = 0;
	const imgs = [];
	for (let i = 1; i <= TOTAL; i++) imgs.push(`${i}.png`); // images are in same folder as this file

	function renderSingle() {
		const src = imgs[current];
		singleImg.src = src;
		singleImg.alt = `ABC ${current + 1}`;
		caption.textContent = `Image ${current + 1} of ${imgs.length}`;
		// ensure single view visible, gallery hidden
		gallery.classList.add("hidden");
		singleView.classList.remove("hidden");
		toggleBtn.textContent = "View All";
	}

	function renderGallery() {
		gallery.innerHTML = "";
		imgs.forEach((src, i) => {
			const btn = document.createElement("button");
			btn.className = "abc-card";
			btn.type = "button";
			const img = document.createElement("img");
			img.src = src;
			img.alt = `ABC ${i + 1}`;
			btn.appendChild(img);
			btn.addEventListener("click", () => {
				current = i;
				renderSingle();
				window.scrollTo({ top: 0, behavior: "smooth" });
			});
			gallery.appendChild(btn);
		});
		gallery.classList.remove("hidden");
		singleView.classList.add("hidden");
		toggleBtn.textContent = "View One";
	}

	// navigation
	prevBtn.addEventListener("click", () => {
		current = (current - 1 + imgs.length) % imgs.length;
		renderSingle();
	});
	nextBtn.addEventListener("click", () => {
		current = (current + 1) % imgs.length;
		renderSingle();
	});

	// toggle between single and gallery
	toggleBtn.addEventListener("click", () => {
		if (gallery.classList.contains("hidden")) renderGallery();
		else renderSingle();
	});

	// keyboard support for single view
	document.addEventListener("keydown", (e) => {
		if (!gallery.classList.contains("hidden")) return; // only when in single view
		if (e.key === "ArrowLeft") prevBtn.click();
		if (e.key === "ArrowRight") nextBtn.click();
	});

	// initial render
	renderSingle();
	// build gallery in background (so toggle is instant)
	renderGallery();
	// then switch back to single
	renderSingle();
})();

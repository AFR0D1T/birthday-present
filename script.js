const $ = (sel, ctx = document) => ctx.querySelector(sel);

const confettiCanvas = $("#confetti-canvas");
const themeToggle = $("#themeToggle");
const musicToggle = $("#musicToggle");
const confettiBtn = $("#confettiBtn");
const bgMusic = $("#bgMusic");
const lightbox = $("#lightbox");
const lightboxContent = lightbox ? lightbox.querySelector(".lightbox-content") : null;
const lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
const openMessageCard = $("#openMessageCard");

function updateMusicIcon() {
	musicToggle.textContent = bgMusic.paused ? "🔈" : "🔊";
}

function toggleTheme() {
	document.body.classList.toggle("light");
}
themeToggle.addEventListener("click", toggleTheme);

function toggleMusic() {
	if (bgMusic.paused) {
		bgMusic.volume = 0.6;
		bgMusic.play().catch(() => {});
	} else {
		bgMusic.pause();
	}
	updateMusicIcon();
}
musicToggle.addEventListener("click", toggleMusic);

function animateEntrance() {
	gsap.from(".headline", { y: 20, opacity: 0, duration: 0.9, ease: "power3.out" });
	gsap.from(".subtitle", { y: 20, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.1 });
	gsap.from(".cta .button", { y: 16, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.06, delay: 0.15 });
}

function createBalloons(count = 10) {
	const container = document.querySelector(".balloons");
	if (!container) return;
	container.innerHTML = "";
	const colors = ["#ff7ad9", "#8ae6ff", "#ffd166", "#9fffcb", "#d4bfff"];
	for (let i = 0; i < count; i++) {
		const b = document.createElement("div");
		b.className = "balloon";
		const size = 40 + Math.random() * 40;
		b.style.width = `${size}px`;
		b.style.height = `${size * 1.2}px`;
		b.style.left = `${Math.random() * 100}%`;
		b.style.bottom = `-${60 + Math.random() * 100}px`;
		b.style.position = "absolute";
		b.style.background = colors[i % colors.length];
		b.style.borderRadius = "50% 50% 45% 55% / 55% 60% 40% 45%";
		b.style.filter = "blur(0.2px)";
		b.style.opacity = "0.8";
		container.appendChild(b);

		gsap.to(b, {
			y: -window.innerHeight - 200,
			x: Math.sin(i) * 40 + (Math.random() * 60 - 30),
			duration: 10 + Math.random() * 8,
			repeat: -1,
			delay: Math.random() * 6,
			ease: "sine.inOut"
		});
	}
}

// Single animator to run multiple effects together
let effectsAnimatorId = 0;
const activeEffects = [];
function runEffectsAnimator() {
	if (effectsAnimatorId) return;
	const ctx = confettiCanvas.getContext("2d");
	if (!ctx) return;
	function step() {
		const w = (confettiCanvas.width = window.innerWidth);
		const h = (confettiCanvas.height = window.innerHeight);
		ctx.clearRect(0, 0, w, h);
		for (let i = activeEffects.length - 1; i >= 0; i--) {
			const alive = activeEffects[i](ctx, w, h);
			if (!alive) activeEffects.splice(i, 1);
		}
		if (activeEffects.length) {
			effectsAnimatorId = requestAnimationFrame(step);
		} else {
			cancelAnimationFrame(effectsAnimatorId);
			effectsAnimatorId = 0;
			ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
		}
	}
	effectsAnimatorId = requestAnimationFrame(step);
}

function fireConfetti(bursts = 160) {
	const colors = ["#ff7ad9", "#8ae6ff", "#ffd166", "#9fffcb", "#ffffff"];
	let particles = null;
	// effect updater
	const updater = (ctx, w, h) => {
		if (!particles) {
			particles = [];
			for (let i = 0; i < bursts; i++) {
				particles.push({
					x: Math.random() * w,
					y: -10,
					vx: (Math.random() - 0.5) * 6,
					vy: Math.random() * 3 + 2,
					size: Math.random() * 6 + 3,
					rot: Math.random() * Math.PI,
					vr: (Math.random() - 0.5) * 0.2,
					color: colors[i % colors.length],
					life: 0,
					maxLife: 260 + Math.random() * 120
				});
			}
		}
		particles.forEach(p => {
			p.vy += 0.05;
			p.x += p.vx;
			p.y += p.vy;
			p.rot += p.vr;
			p.life++;
			ctx.save();
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rot);
			ctx.fillStyle = p.color;
			ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
			ctx.restore();
		});
		for (let i = particles.length - 1; i >= 0; i--) {
			const p = particles[i];
			if (p.y > h + 50 || p.life > p.maxLife) particles.splice(i, 1);
		}
		return particles.length > 0;
	};
	activeEffects.push(updater);
	runEffectsAnimator();
}

// Fireworks effect (radial bursts)
function fireFireworks(bursts = 6) {
	const colors = ["#ff4d4d", "#ffd166", "#8ae6ff", "#9fffcb", "#ffffff"];
	let particles = [];
	let frame = 0;
	function spawnBurst(w, h, count = 40) {
		const cx = Math.random() * (w * 0.8) + w * 0.1;
		const cy = Math.random() * (h * 0.5) + h * 0.15;
		for (let i = 0; i < count; i++) {
			const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
			const speed = 2 + Math.random() * 3.5;
			particles.push({
				x: cx,
				y: cy,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				drag: 0.99 - Math.random() * 0.02,
				gravity: 0.03,
				size: 2 + Math.random() * 2,
				color: colors[i % colors.length],
				alpha: 1,
				decay: 0.008 + Math.random() * 0.01
			});
		}
	}
	const schedule = [];
	for (let i = 0; i < bursts; i++) schedule.push(220 * i);
	const startTime = performance.now();
	const updater = (ctx, w, h) => {
		// schedule bursts
		const elapsed = performance.now() - startTime;
		while (schedule.length && elapsed >= schedule[0]) {
			schedule.shift();
			spawnBurst(w, h, 48);
		}
		particles.forEach(p => {
			p.vx *= p.drag;
			p.vy = p.vy * p.drag + p.gravity;
			p.x += p.vx;
			p.y += p.vy;
			p.alpha -= p.decay;
			ctx.save();
			ctx.globalAlpha = Math.max(p.alpha, 0.9);
			ctx.fillStyle = p.color;
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		});
		for (let i = particles.length - 1; i >= 0; i--) {
			if (particles[i].alpha <= 0) particles.splice(i, 1);
		}
		frame++;
		return particles.length > 0 || schedule.length > 0 || frame < 120;
	};
	activeEffects.push(updater);
	runEffectsAnimator();
}

// Side fireworks for modal: avoid drawing over modal, run for durationMs
function fireSideFireworks(durationMs = 25000, intervalMs = 280) {
	const colors = ["#ff4d4d", "#ffd166", "#8ae6ff", "#9fffcb", "#ffffff"];
	let particles = [];
	const start = performance.now();
	let nextSpawnAt = start;

	function getForbiddenXRange(w) {
		if (!lightbox || !lightbox.classList.contains("show") || !lightboxContent) return null;
		const rect = lightboxContent.getBoundingClientRect();
		// clamp within viewport
		const left = Math.max(0, rect.left);
		const right = Math.min(w, rect.right);
		return [left, right];
	}

	function spawnSideBurst(w, h, count = 46) {
		const forbid = getForbiddenXRange(w);
		let side = Math.random() < 0.5 ? "left" : "right";
		let minX = 20, maxX = w - 20;
		if (forbid) {
			const [L, R] = forbid;
			if (side === "left") {
				maxX = Math.max(20, L - 40);
			} else {
				minX = Math.min(w - 20, R + 40);
			}
		}
		if (maxX - minX < 60) {
			// if not enough space on chosen side, pick the other
			side = side === "left" ? "right" : "left";
			if (forbid) {
				const [L, R] = forbid;
				if (side === "left") {
					minX = 20; maxX = Math.max(20, L - 40);
				} else {
					minX = Math.min(w - 20, R + 40); maxX = w - 20;
				}
			}
		}
		const cx = Math.random() * (maxX - minX) + minX;
		const cy = Math.random() * (h * 0.45) + h * 0.1;
		for (let i = 0; i < count; i++) {
			const angle = (Math.PI * 2 * i) / count + Math.random() * 0.25;
			const speed = 2 + Math.random() * 3.8;
			particles.push({
				x: cx,
				y: cy,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				drag: 0.99 - Math.random() * 0.02,
				gravity: 0.03,
				size: 2 + Math.random() * 2.2,
				color: colors[i % colors.length],
				alpha: 1,
				decay: 0.008 + Math.random() * 0.01
			});
		}
	}

	const updater = (ctx, w, h) => {
		const now = performance.now();
		// schedule spawns
		while (now >= nextSpawnAt && now - start <= durationMs) {
			spawnSideBurst(w, h, 50);
			nextSpawnAt += intervalMs;
		}
		// simulate and draw, skipping particles over modal area
		const forbid = getForbiddenXRange(w);
		particles.forEach(p => {
			p.vx *= p.drag;
			p.vy = p.vy * p.drag + p.gravity;
			p.x += p.vx;
			p.y += p.vy;
			p.alpha -= p.decay;
			let skip = false;
			if (forbid) {
				const [L, R] = forbid;
				if (p.x >= L && p.x <= R) skip = true;
			}
			if (!skip) {
				ctx.save();
				ctx.globalAlpha = Math.max(p.alpha, 0);
				ctx.fillStyle = p.color;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			}
		});
		for (let i = particles.length - 1; i >= 0; i--) {
			if (particles[i].alpha <= 0) particles.splice(i, 1);
		}
		return (performance.now() - start) <= durationMs || particles.length > 0;
	};
	activeEffects.push(updater);
	runEffectsAnimator();
}
confettiBtn.addEventListener("click", () => {
	fireConfetti(180);
	fireFireworks(6);
});

function onResize() {
	confettiCanvas.width = window.innerWidth;
	confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", onResize);
onResize();

document.addEventListener("DOMContentLoaded", () => {
	animateEntrance();
	createBalloons(12);

	// Try to autoplay; if blocked, start on first interaction
	bgMusic.muted = false;
	bgMusic.volume = 0.6;
	bgMusic.loop = true;
	
	const attemptPlay = () => {
		if (bgMusic.paused) {
			return bgMusic.play().then(() => {
				updateMusicIcon();
				return true;
			}).catch(() => false);
		}
		return Promise.resolve(true);
	};

	// Multiple initial attempts (helps on some mobile browsers)
	setTimeout(() => attemptPlay(), 100);
	setTimeout(() => attemptPlay(), 500);
	setTimeout(() => attemptPlay(), 1000);

	// Aggressive unlock on ANY first interaction (mobile-friendly)
	let musicStarted = false;
	const startMusicOnce = (e) => {
		if (musicStarted) return;
		musicStarted = true;
		bgMusic.muted = false;
		bgMusic.volume = 0.6;
		attemptPlay().finally(updateMusicIcon);
		// Remove all listeners after first success
		removeAllMusicStartListeners();
	};

	function removeAllMusicStartListeners() {
		document.removeEventListener("touchstart", startMusicOnce);
		document.removeEventListener("touchend", startMusicOnce);
		document.removeEventListener("touchmove", startMusicOnce);
		document.removeEventListener("click", startMusicOnce);
		document.removeEventListener("pointerdown", startMusicOnce);
		document.removeEventListener("pointerup", startMusicOnce);
		window.removeEventListener("touchstart", startMusicOnce);
		window.removeEventListener("click", startMusicOnce);
		window.removeEventListener("scroll", startMusicOnce, { passive: true });
		document.body.removeEventListener("touchstart", startMusicOnce);
		document.body.removeEventListener("click", startMusicOnce);
	}

	// Add listeners to document, window, and body for maximum coverage
	document.addEventListener("touchstart", startMusicOnce, { once: true, passive: true });
	document.addEventListener("touchend", startMusicOnce, { once: true, passive: true });
	document.addEventListener("touchmove", startMusicOnce, { once: true, passive: true });
	document.addEventListener("click", startMusicOnce, { once: true });
	document.addEventListener("pointerdown", startMusicOnce, { once: true });
	document.addEventListener("pointerup", startMusicOnce, { once: true });
	window.addEventListener("touchstart", startMusicOnce, { once: true, passive: true });
	window.addEventListener("click", startMusicOnce, { once: true });
	window.addEventListener("scroll", startMusicOnce, { once: true, passive: true });
	document.body.addEventListener("touchstart", startMusicOnce, { once: true, passive: true });
	document.body.addEventListener("click", startMusicOnce, { once: true });

	// also try when tab becomes visible
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible" && bgMusic.paused && !musicStarted) {
			attemptPlay().then(success => {
				if (success) {
					musicStarted = true;
					removeAllMusicStartListeners();
				}
			});
		}
	});

	// sync icon on native events
	bgMusic.addEventListener("play", updateMusicIcon);
	bgMusic.addEventListener("pause", updateMusicIcon);
	// fallback repeat
	bgMusic.addEventListener("ended", () => {
		try {
			bgMusic.currentTime = 0;
			attemptPlay();
		} catch {}
	});

	// Bind placeholders to open lightbox
	document.querySelectorAll(".placeholder").forEach(el => {
		el.addEventListener("click", () => {
			const kind = el.getAttribute("data-kind") || "photo";
			const src = el.getAttribute("data-src") || "";
			openMediaLightbox(kind, src);
		});
	});

	// Message card open
	openMessageCard?.addEventListener("click", () => {
		openTextLightbox();
		fireConfetti(220);
		// Side fireworks for ~25s when card modal opens
		fireSideFireworks(20000, 300);
	});
});

function clearLightboxContent() {
	if (!lightboxContent) return;
	[...lightboxContent.children].forEach(node => {
		if (!(node instanceof HTMLButtonElement)) {
			node.remove();
		}
	});
}

function openMediaLightbox(kind, src) {
	if (!lightbox || !lightboxContent) return;
	clearLightboxContent();
	if (kind === "video") {
		const video = document.createElement("video");
		video.src = src;
		video.controls = true;
		video.autoplay = true;
		video.playsInline = true;
		video.loop = true;
		video.style.background = "#000";
		lightboxContent.appendChild(video);
	} else {
		const img = document.createElement("img");
		img.src = src;
		img.alt = "Фото";
		lightboxContent.appendChild(img);
	}
	showLightbox();
}

function openTextLightbox() {
	if (!lightbox || !lightboxContent) return;
	clearLightboxContent();
	const wrapper = document.createElement("div");
	wrapper.className = "lightbox-text";

	// Priority: block #cardMessage (can contain HTML) -> button data-message -> fallback
	const cardScript = document.querySelector("#cardMessage");
	const rawScript = cardScript ? (cardScript.innerHTML || cardScript.textContent || "") : "";
	const scriptText = rawScript.trim();
	const msgBtn = document.querySelector("#openMessageCard");
	const btnText = msgBtn ? (msgBtn.getAttribute("data-message") || "").trim() : "";
	const fallback = "С Днём Рождения! Пусть исполняются мечты и улыбается сердце.";

	if (scriptText) {
		wrapper.innerHTML = `<h3>Дорогая Анжела!</h3>${scriptText}`;
	} else {
		const title = document.createElement("h3");
		title.textContent = "Дорогая Анжела!";
		const paragraph = document.createElement("p");
		paragraph.textContent = btnText || fallback;
		wrapper.appendChild(title);
		wrapper.appendChild(paragraph);
	}

	lightboxContent.appendChild(wrapper);
	showLightbox();
}

function showLightbox() {
	if (!lightbox) return;
	lightbox.classList.add("show");
	document.body.style.overflow = "hidden";
}

function hideLightbox() {
	if (!lightbox) return;
	lightbox.classList.remove("show");
	document.body.style.overflow = "";
	// stop any playing video
	const v = lightbox.querySelector("video");
	if (v) {
		v.pause();
		v.currentTime = 0;
	}
}

// Close behaviors
lightboxClose?.addEventListener("click", hideLightbox);
lightbox?.addEventListener("click", e => {
	// Close on clicking the dark area (desktop behavior)
	if (e.target === lightbox) {
		hideLightbox();
	}
});
document.addEventListener("keydown", e => {
	if (e.key === "Escape" && lightbox?.classList.contains("show")) {
		hideLightbox();
	}
});


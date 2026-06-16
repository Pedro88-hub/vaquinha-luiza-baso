(function () {
  "use strict";

  const GOAL = 142;
  const STORAGE_KEY = "vaquinha-apoio-moral";

  const EMOJIS = ["❤️", "🤝", "💪", "🫶", "✨", "🎉", "😂", "🐮", "💚", "🌟"];

  const LIKE_HINTS = [
    "Cada clique = +1 curtida. Sem cobrança, sem culpa.",
    "O banco não devolveu, mas a gente devolve carinho.",
    "R$ 0,00 cobrados. R$ ∞ de amor.",
    "Clique e mande um abraço virtual pra Luiza!",
    "PIX? Aqui só tem emoji.",
  ];

  const COW_EMOJIS = ["🐮", "🐄", "🤠", "💚", "🫶"];

  const BATTLE_HITS = ["POW! 💥", "BAM! 🤝", "CRÍTICO! ❤️", "ABRAÇO! 🫶", "TOME! ✨", "BOOM! 💪"];

  const BADGES = [
    {
      id: "detector",
      emoji: "🕵️",
      name: "Detector de Golpes Iniciante",
      desc: "Visitou a campanha",
      check: (s) => s.visited,
    },
    {
      id: "pix",
      emoji: "💸",
      name: "Recuperador de PIX",
      desc: "Deu 10 ou mais apoios",
      check: (s) => s.totalLikes >= 10,
    },
    {
      id: "sobrevivente",
      emoji: "🏆",
      name: "Sobrevivente dos R$ 142",
      desc: "Meta de 142 apoios alcançada",
      check: (s) => s.totalLikes >= GOAL,
    },
    {
      id: "mestre",
      emoji: "❤️",
      name: "Mestre do Apoio Moral",
      desc: "Publicou um comentário",
      check: (s) => s.comments.length > 0,
    },
  ];

  const FUN_STATS = [
    (s) => ["Abraços virtuais emitidos", s.totalLikes],
    (s) => ["Cafés imaginários servidos", s.comments.length],
    (s) => ["Reais arrecadados", "R$ 0,00"],
    (s) => ["Nível de arrependimento do golpista", s.totalLikes > 50 ? "Alto" : "Indetectável"],
    (s) => ["Chance do banco devolver", "0,0001%"],
    (s) => ["Sorrisos gerados", s.totalLikes + s.comments.length * 2],
  ];

  let state = loadState();
  let audioCtx = null;
  let confettiRunning = false;

  const els = {
    likesCount: document.getElementById("likes-count"),
    progressBar: document.getElementById("progress-bar"),
    progressFill: document.getElementById("progress-fill"),
    progressPercent: document.getElementById("progress-percent"),
    likeBtn: document.getElementById("like-btn"),
    visitorCount: document.getElementById("visitor-count"),
    statsList: document.getElementById("stats-list"),
    goalSection: document.getElementById("goal-section"),
    goalCelebration: document.getElementById("goal-celebration"),
    commentForm: document.getElementById("comment-form"),
    commentName: document.getElementById("comment-name"),
    commentText: document.getElementById("comment-text"),
    commentsList: document.getElementById("comments-list"),
    commentsEmpty: document.getElementById("comments-empty"),
    badgesList: document.getElementById("badges-list"),
    rankingList: document.getElementById("ranking-list"),
    rankingEmpty: document.getElementById("ranking-empty"),
    soundToggle: document.getElementById("sound-toggle"),
    emojiLayer: document.getElementById("emoji-layer"),
    confettiCanvas: document.getElementById("confetti-canvas"),
    campaignCard: document.getElementById("campaign-card"),
    heroPhoto: document.getElementById("hero-photo"),
    likeHint: document.getElementById("like-hint"),
    fighterLuiza: document.getElementById("fighter-luiza"),
    fighterScammer: document.getElementById("fighter-scammer"),
    luizaHpFill: document.getElementById("luiza-hp-fill"),
    luizaHpText: document.getElementById("luiza-hp-text"),
    scammerHpFill: document.getElementById("scammer-hp-fill"),
    scammerHpText: document.getElementById("scammer-hp-text"),
    luizaCarinho: document.getElementById("luiza-carinho"),
    luizaShield: document.getElementById("luiza-shield"),
    scammerFlee: document.getElementById("scammer-flee"),
    battleFx: document.getElementById("battle-fx"),
    battleHint: document.getElementById("battle-hint"),
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {
      totalLikes: 0,
      visitors: 0,
      visited: false,
      goalReached: false,
      comments: [],
      supporters: {},
      currentUser: "",
    };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function init() {
    if (!state.visited) {
      state.visited = true;
      state.visitors += 1;
    } else {
      state.visitors += 1;
    }
    saveState();

    renderAll();
    bindEvents();
    initScrollReveal();
    initCardTilt();
    animateCounterOnLoad();

    if (state.goalReached) {
      showGoalCelebration(false);
    }
  }

  function bindEvents() {
    els.likeBtn.addEventListener("click", (e) => {
      createRipple(e, els.likeBtn);
      onLike();
    });

    if (els.heroPhoto) {
      els.heroPhoto.addEventListener("click", () => {
        els.heroPhoto.style.animation = "none";
        void els.heroPhoto.offsetWidth;
        els.heroPhoto.style.animation = "";
        els.heroPhoto.style.transform = "scale(1.12) rotate(3deg)";
        setTimeout(() => { els.heroPhoto.style.transform = ""; }, 300);
        spawnFloatingEmoji();
      });
    }

    els.commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      onCommentSubmit();
    });

    document.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        els.commentText.value = chip.dataset.msg;
        els.commentText.focus();
      });
    });

    els.soundToggle.addEventListener("change", () => {
      if (els.soundToggle.checked) initAudio();
    });
  }

  function onLike() {
    state.totalLikes += 1;

    if (state.currentUser) {
      ensureSupporter(state.currentUser);
      state.supporters[state.currentUser].likes += 1;
    }

    if (state.totalLikes >= GOAL && !state.goalReached) {
      state.goalReached = true;
      showGoalCelebration(true);
      launchConfetti();
      playSound("celebration");
    } else {
      playSound("like");
    }

    saveState();
    renderProgress();
    renderStats();
    renderBadges();
    renderRanking();
    bumpCounter();
    spawnFloatingEmoji();
    rotateLikeHint();
    shakeHeroPhoto();
    triggerBattleAttack();
  }

  function onCommentSubmit() {
    const name = els.commentName.value.trim();
    const text = els.commentText.value.trim();
    if (!name || !text) return;

    const comment = {
      id: Date.now(),
      name,
      text,
      time: new Date().toISOString(),
    };

    state.comments.unshift(comment);
    state.currentUser = name;

    ensureSupporter(name);
    state.supporters[name].comments += 1;

    saveState();
    renderComments();
    renderBadges();
    renderRanking();
    playSound("comment");

    els.commentText.value = "";
    els.commentText.focus();
  }

  function ensureSupporter(name) {
    if (!state.supporters[name]) {
      state.supporters[name] = { likes: 0, comments: 0 };
    }
  }

  function renderAll() {
    renderProgress();
    renderStats();
    renderBattle();
    renderComments();
    renderBadges();
    renderRanking();
    els.visitorCount.textContent = `👀 ${state.visitors.toLocaleString("pt-BR")} visitante${state.visitors !== 1 ? "s" : ""}`;
  }

  function renderBattle() {
    const likes = state.totalLikes;
    const progress = Math.min(1, likes / GOAL);
    const luizaHp = Math.round(10 + progress * 90);
    const scammerHp = Math.round(100 - progress * 100);

    if (els.luizaHpFill) els.luizaHpFill.style.width = `${luizaHp}%`;
    if (els.luizaHpText) els.luizaHpText.textContent = `${luizaHp}%`;
    if (els.scammerHpFill) els.scammerHpFill.style.width = `${scammerHp}%`;
    if (els.scammerHpText) els.scammerHpText.textContent = `${scammerHp}%`;
    if (els.luizaCarinho) els.luizaCarinho.textContent = likes.toLocaleString("pt-BR");

    if (els.luizaShield) {
      els.luizaShield.textContent = likes >= 100 ? "Impenetrável" : likes >= 40 ? "Firme" : "Frágil";
    }

    if (els.scammerFlee) {
      if (scammerHp <= 0) els.scammerFlee.textContent = "Derrotado";
      else if (scammerHp < 30) els.scammerFlee.textContent = "Baixa";
      else if (scammerHp < 70) els.scammerFlee.textContent = "Média";
      else els.scammerFlee.textContent = "Alta";
    }

    if (els.fighterScammer) {
      els.fighterScammer.classList.toggle("is-defeated", scammerHp <= 0);
      const mask = els.fighterScammer.querySelector(".fighter-card__mask");
      if (mask) mask.textContent = scammerHp <= 0 ? "😵" : "🦹";
    }

    if (els.battleHint) {
      if (scammerHp <= 0) {
        els.battleHint.textContent = "🏆 Vitória da Luiza! O golpista foi derrotado pelo poder do apoio moral.";
      } else if (likes === 0) {
        els.battleHint.textContent = 'Clique em "Contribuir com Apoio" para a Luiza atacar o golpista! 🥊';
      } else {
        const msgs = [
          `O golpista está com ${scammerHp}% de HP. Continue atacando!`,
          `Luiza já deu ${likes} golpe${likes !== 1 ? "s" : ""} de carinho!`,
          `Faltam ${GOAL - likes} apoios pra vitória total!`,
        ];
        els.battleHint.textContent = msgs[likes % msgs.length];
      }
    }
  }

  function triggerBattleAttack() {
    if (!els.fighterLuiza || !els.fighterScammer) return;

    els.fighterLuiza.classList.remove("is-attacking");
    els.fighterScammer.classList.remove("is-hit");
    void els.fighterLuiza.offsetWidth;
    els.fighterLuiza.classList.add("is-attacking");
    els.fighterScammer.classList.add("is-hit");

    if (els.battleFx) {
      const hit = BATTLE_HITS[Math.floor(Math.random() * BATTLE_HITS.length)];
      els.battleFx.innerHTML = `<span class="battle-fx__hit">${hit}</span>`;
      setTimeout(() => { els.battleFx.innerHTML = ""; }, 800);
    }

    setTimeout(() => {
      els.fighterLuiza.classList.remove("is-attacking");
      els.fighterScammer.classList.remove("is-hit");
    }, 500);

    renderBattle();
  }

  function renderProgress() {
    const likes = state.totalLikes;
    const percent = Math.min(100, Math.round((likes / GOAL) * 100));

    els.likesCount.textContent = likes.toLocaleString("pt-BR");
    els.progressFill.style.width = `${percent}%`;
    els.progressBar.setAttribute("aria-valuenow", likes);
    els.progressPercent.textContent = `${percent}% da meta de apoio moral`;

    if (likes >= GOAL) {
      const label = els.likeBtn.querySelector(".btn__label");
      if (label) label.textContent = "Meta alcançada!";
      els.likeBtn.querySelector(".btn__icon").textContent = "🎉";
      els.likeBtn.classList.remove("btn--pulse");
    }
  }

  function bumpCounter() {
    els.likesCount.classList.remove("bump");
    void els.likesCount.offsetWidth;
    els.likesCount.classList.add("bump");
  }

  function renderStats() {
    els.statsList.innerHTML = FUN_STATS.map((fn) => {
      const [label, value] = fn(state);
      const display = typeof value === "number" ? value.toLocaleString("pt-BR") : value;
      return `<li><span>${label}</span><strong>${display}</strong></li>`;
    }).join("");
  }

  function renderComments() {
    if (state.comments.length === 0) {
      els.commentsList.innerHTML = "";
      els.commentsEmpty.hidden = false;
      return;
    }

    els.commentsEmpty.hidden = true;
    els.commentsList.innerHTML = state.comments
      .map(
        (c) => `
      <li>
        <div class="comment__header">
          <span class="comment__name">${escapeHtml(c.name)}</span>
          <time class="comment__time" datetime="${c.time}">${formatTime(c.time)}</time>
        </div>
        <p class="comment__text">${escapeHtml(c.text)}</p>
      </li>`
      )
      .join("");
  }

  function renderBadges() {
    els.badgesList.innerHTML = BADGES.map((badge) => {
      const unlocked = badge.check(state);
      return `
        <li class="badge-item ${unlocked ? "badge-item--unlocked" : "badge-item--locked"}">
          <span class="badge-item__emoji">${badge.emoji}</span>
          <div class="badge-item__info">
            <strong>${badge.name}</strong>
            <span>${badge.desc}</span>
          </div>
        </li>`;
    }).join("");
  }

  function renderRanking() {
    const entries = Object.entries(state.supporters)
      .map(([name, data]) => ({
        name,
        score: data.likes * 2 + data.comments * 5,
        likes: data.likes,
        comments: data.comments,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    if (entries.length === 0) {
      els.rankingList.innerHTML = "";
      els.rankingEmpty.hidden = false;
      return;
    }

    els.rankingEmpty.hidden = true;
    els.rankingList.innerHTML = entries
      .map(
        (e) => `
      <li>
        <span class="ranking-item__name">${escapeHtml(e.name)}</span>
        <span class="ranking-item__score">${e.likes} 🤝 · ${e.comments} 💬</span>
      </li>`
      )
      .join("");
  }

  function showGoalCelebration(animate) {
    els.goalSection.hidden = false;
    if (animate) {
      els.goalCelebration.classList.add("is-new");
      els.goalCelebration.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function initScrollReveal() {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  function initCardTilt() {
    const card = els.campaignCard;
    if (!card || window.matchMedia("(max-width: 900px)").matches) return;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-2px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  }

  function createRipple(e, btn) {
    const ripple = btn.querySelector(".btn__ripple");
    if (!ripple) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    ripple.classList.remove("is-active");
    void ripple.offsetWidth;
    ripple.classList.add("is-active");
  }

  function rotateLikeHint() {
    if (!els.likeHint) return;
    const hint = LIKE_HINTS[Math.floor(Math.random() * LIKE_HINTS.length)];
    els.likeHint.style.opacity = "0";
    setTimeout(() => {
      els.likeHint.textContent = hint;
      els.likeHint.style.opacity = "1";
    }, 200);
  }

  function shakeHeroPhoto() {
    if (!els.heroPhoto) return;
    els.heroPhoto.style.transform = "scale(1.1) rotate(-4deg)";
    setTimeout(() => { els.heroPhoto.style.transform = ""; }, 300);
  }

  function animateCounterOnLoad() {
    const target = state.totalLikes;
    if (target === 0) return;

    const duration = 800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      const percent = Math.min(100, Math.round((current / GOAL) * 100));
      els.likesCount.textContent = current.toLocaleString("pt-BR");
      els.progressFill.style.width = `${percent}%`;
      els.progressPercent.textContent = `${percent}% da meta de apoio moral`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        renderProgress();
        renderBattle();
      }
    }

    els.likesCount.textContent = "0";
    els.progressFill.style.width = "0%";
    requestAnimationFrame(tick);
  }

  function spawnFloatingEmoji() {
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        const el = document.createElement("span");
        el.className = "floating-emoji";
        el.textContent = emoji;
        el.style.left = `${15 + Math.random() * 70}%`;
        el.style.top = `${35 + Math.random() * 35}%`;
        el.style.fontSize = `${1.2 + Math.random() * 1.2}rem`;
        els.emojiLayer.appendChild(el);
        setTimeout(() => el.remove(), 1400);
      }, i * 80);
    }
  }

  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function playSound(type) {
    if (!els.soundToggle.checked) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "like") {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "comment") {
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "celebration") {
      [0, 0.1, 0.2, 0.3].forEach((delay, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        const freq = [523, 659, 784, 1047][i];
        o.frequency.setValueAtTime(freq, now + delay);
        g.gain.setValueAtTime(0.1, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);
        o.start(now + delay);
        o.stop(now + delay + 0.2);
      });
    }
  }

  function launchConfetti() {
    if (confettiRunning) return;
    confettiRunning = true;

    const canvas = els.confettiCanvas;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#0d9488", "#f59e0b", "#ec4899", "#8b5cf6", "#2dd4bf", "#fbbf24"];
    const pieces = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      w: 6 + Math.random() * 8,
      h: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 10,
    }));

    let frame = 0;
    const maxFrames = 200;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rot += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      frame++;
      if (frame < maxFrames) {
        requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiRunning = false;
      }
    }

    draw();
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function formatTime(iso) {
    const date = new Date(iso);
    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff < 60) return "agora";
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }

  window.addEventListener("resize", () => {
    if (confettiRunning) {
      els.confettiCanvas.width = window.innerWidth;
      els.confettiCanvas.height = window.innerHeight;
    }
  });

  init();
})();

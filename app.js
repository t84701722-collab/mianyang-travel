(() => {
  const root = document.documentElement;
  const hero = document.querySelector("#hero");
  const trigger = document.querySelector("#heroTrigger");
  const ticket = document.querySelector("#ticketPaper");
  const invitation = document.querySelector("#invitationMotion");
  const music = document.querySelector("#bgm");
  const musicToggle = document.querySelector("#musicToggle");
  const musicPassLimit = 3;
  let started = false;
  let invitationDrawn = false;
  let invitationTriggerEnabled = false;
  let musicPasses = 0;

  music.volume = 0.34;

  function updateMusicUi(state) {
    const isPlaying = state === "playing";
    musicToggle.classList.toggle("is-playing", isPlaying);
    musicToggle.classList.toggle("has-ended", state === "ended");
    musicToggle.setAttribute("aria-pressed", String(isPlaying));
    musicToggle.setAttribute(
      "aria-label",
      isPlaying
        ? "暂停《青睐绵阳 请来绵阳》录音版配乐"
        : state === "ended"
          ? "重新播放《青睐绵阳 请来绵阳》录音版配乐"
          : "播放《青睐绵阳 请来绵阳》录音版配乐",
    );
  }

  async function playMusic({ restart = false } = {}) {
    if (restart || music.ended) {
      musicPasses = 0;
      music.currentTime = 0;
    }
    try {
      await music.play();
    } catch (error) {
      updateMusicUi("paused");
    }
  }

  function maybeDrawInvitation() {
    if (!invitation || invitationDrawn || !invitationTriggerEnabled || !hero.classList.contains("is-ready")) return;
    const rect = invitation.getBoundingClientRect();
    const visibleHeight = Math.max(0, Math.min(window.innerHeight, rect.bottom) - Math.max(0, rect.top));
    if (visibleHeight < rect.height * 0.25) return;
    invitationDrawn = true;
    invitation.classList.add("is-drawn");
    window.removeEventListener("scroll", maybeDrawInvitation);
    window.removeEventListener("resize", maybeDrawInvitation);
  }

  function enableInvitationTrigger(event) {
    if (!hero.classList.contains("is-ready")) return;
    if (event?.type === "keydown" && !["ArrowDown", "PageDown", "End", " "].includes(event.key)) return;
    invitationTriggerEnabled = true;
    maybeDrawInvitation();
  }

  function finishIntro() {
    if (hero.classList.contains("is-ready")) return;
    hero.classList.remove("is-printing");
    hero.classList.add("is-ready");
    root.classList.remove("is-locked");
    document.body.classList.add("is-ready");
    if (invitation) {
      invitation.classList.add("is-armed");
      invitation.classList.remove("is-drawn");
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }
  }

  function startIntro() {
    if (started) return;
    started = true;
    playMusic({ restart: true });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    hero.classList.add("is-printing");
    window.setTimeout(finishIntro, 6150);
  }

  trigger.addEventListener("click", startIntro);
  ticket.addEventListener("animationend", (event) => {
    if (event.animationName === "ticketCardSequence") finishIntro();
  });

  window.addEventListener("scroll", maybeDrawInvitation, { passive: true });
  window.addEventListener("resize", maybeDrawInvitation);
  window.addEventListener("touchstart", enableInvitationTrigger, { passive: true });
  window.addEventListener("wheel", enableInvitationTrigger, { passive: true });
  window.addEventListener("keydown", enableInvitationTrigger);

  music.addEventListener("play", () => updateMusicUi("playing"));
  music.addEventListener("pause", () => {
    if (!music.ended) updateMusicUi("paused");
  });
  music.addEventListener("ended", async () => {
    musicPasses += 1;
    if (musicPasses >= musicPassLimit) {
      updateMusicUi("ended");
      return;
    }
    music.currentTime = 0;
    try {
      await music.play();
    } catch (error) {
      updateMusicUi("paused");
    }
  });
  musicToggle.addEventListener("click", () => {
    if (music.paused) {
      playMusic();
    } else {
      music.pause();
    }
  });

  document.querySelectorAll(".flip-card").forEach((card) => {
    const setFlipped = (next) => {
      card.classList.toggle("is-flipped", next);
      card.setAttribute("aria-pressed", String(next));
      if (next) card.querySelector(".back-scroll").scrollTop = 0;
    };
    card.addEventListener("click", (event) => {
      if (event.target.closest(".back-return")) {
        setFlipped(false);
        return;
      }
      if (event.target.closest(".flip-back")) {
        return;
      }
      setFlipped(!card.classList.contains("is-flipped"));
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      setFlipped(!card.classList.contains("is-flipped"));
    });
  });

  document.querySelector("#replay").addEventListener("click", () => window.location.reload());
})();

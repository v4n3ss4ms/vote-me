// === CONFIG ===
const FORM_ACTION = "https://docs.google.com/forms/d/e/FORM_ACTION/formResponse";
const ENTRY_FIELD = "entry.2011507017";
const OPTION_BY_VIDEO = {
  "1": "v1", // same than form
  "2": "v2"
};

const HAS_VOTED_KEY = "gf_vote_once_v1";
// === END CONFIG ===

function setMessage(text, type = "ok") {
  const el = document.getElementById("message");
  if (!el) return;
  el.textContent = text;
  el.className = type === "error" ? "msg error" : "msg ok";
}

function disableAllButtons() {
  document.querySelectorAll(".vote-btn").forEach((b) => {
    b.disabled = true;
    b.classList.add("disabled");
    if (!b.dataset.originalText) b.dataset.originalText = b.textContent;
    b.textContent = "Vote registered";
  });
}

async function submitVote(videoId) {
  const option = OPTION_BY_VIDEO[String(videoId)];
  if (!option) {
    setMessage("Incorrect configuration: option not found.", "error");
    return;
  }

  const data = new FormData();
  data.append(ENTRY_FIELD, option);

  try {
    // Google Forms does not allow CORS
    await fetch(FORM_ACTION, {
      method: "POST",
      mode: "no-cors",
      body: data,
    });

    localStorage.setItem(HAS_VOTED_KEY, String(videoId));
    disableAllButtons();
    setMessage("Thank you for voting! Your vote has been submitted successfully.");
  } catch (e) {
    console.error(e);
    setMessage("Could not register your vote.", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem(HAS_VOTED_KEY)) {
    disableAllButtons();
    setMessage("You have already voted.");
  }

  document.querySelectorAll(".vote-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (localStorage.getItem(HAS_VOTED_KEY)) return;
      const videoId = btn.getAttribute("data-video");
      submitVote(videoId);
    });
  });
});

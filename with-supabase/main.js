const supabaseUrl = 'https://SUPABASEURL.supabase.co'
const supabaseKey = 'SUPABASEKEY'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

const HAS_VOTED_KEY = 'hasVoted';

// ----------- VOTE -----------
async function vote(videoId) {
  const messageEl = document.getElementById('message');

  if (localStorage.getItem(HAS_VOTED_KEY)) {
    messageEl.textContent = 'Ya has votado desde este navegador ✅';
    return;
  }

  const { error } = await supabase.from('votes').insert({ video_id: videoId });

  if (error) {
    console.error(error);
    messageEl.textContent = '⚠️ Hubo un error al registrar tu voto.';
  } else {
    localStorage.setItem(HAS_VOTED_KEY, videoId);
    messageEl.textContent = '¡Gracias por votar! 🎉';
    disableButtons();
    loadResults();
  }
}

// ----------- RESULTS -----------
async function loadResults() {
  const { data, error } = await supabase.from('votes').select('video_id');

  if (error) {
    console.error(error);
    return;
  }

  const counts = {};
  data.forEach(v => {
    counts[v.video_id] = (counts[v.video_id] || 0) + 1;
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  Object.entries(counts).forEach(([videoId, votes]) => {
    const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
    const el = document.getElementById(`percent-${videoId}`);
    if (el) el.textContent = `${pct}%`;
  });
}

function disableButtons() {
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.disabled = true;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', () => vote(btn.dataset.video));
  });

  if (localStorage.getItem(HAS_VOTED_KEY)) {
    disableButtons();
    document.getElementById('message').textContent =
      'Ya has votado desde este navegador ✅';
  }

  loadResults();
});

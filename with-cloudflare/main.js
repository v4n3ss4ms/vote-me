// main.js

const API_URL = 'https://API_URL.workers.dev';

function getVoted() {
  return localStorage.getItem('votedVideo');
}

function setVoted(videoId) {
  localStorage.setItem('votedVideo', videoId);
}

function updatePercentages(votes) {
  const total = votes.reduce((a, b) => a + b, 0);
  votes.forEach((count, idx) => {
    const percent = total > 0 ? Math.round((count / total) * 100) : 0;
    document.getElementById(`percent-${idx+1}`).textContent = percent + '%';
  });
}

function disableVoting() {
  document.querySelectorAll('.vote-btn').forEach(btn => btn.disabled = true);
}

function showMessage(msg, color = '#38a169') {
  const el = document.getElementById('message');
  el.textContent = msg;
  el.style.color = color;
}

async function fetchVotes() {
  try {
    const res = await fetch(`${API_URL}/votes`);
    if (!res.ok) throw new Error('Error fetching votes');
    const data = await res.json();
    updatePercentages(data.votes);
  } catch (e) {
    showMessage('Could not load votes.', '#e53e3e');
  }
}

function getToken() {
  let token = localStorage.getItem('voteToken');
  if (!token) {
    token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 16);
    localStorage.setItem('voteToken', token);
  }
  return token;
}

async function vote(videoId) {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video: videoId, token })
    });
    if (!res.ok) throw new Error('Vote failed');
    setVoted(videoId);
    disableVoting();
    showMessage('Thank you for voting!');
    fetchVotes();
  } catch (e) {
    showMessage('Could not register your vote.', '#e53e3e');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchVotes();
  const voted = getVoted();
  if (voted) {
    disableVoting();
    showMessage('You have already voted.');
  }
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!getVoted()) {
        vote(Number(btn.dataset.video));
      }
    });
  });
});

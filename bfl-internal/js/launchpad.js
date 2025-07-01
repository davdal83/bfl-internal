// ==========================
// 🚀 Fetch and Display Launchpad Posts
// ==========================

const today = new Date().toISOString().split('T')[0];

// Log current user (for debugging/auth check)
supabase.auth.getUser().then(({ data, error }) => {
  console.log('Current user:', data?.user || 'No user');
  if (error) console.error('Auth error:', error.message);
});


// Main load function
async function loadLaunchpadPosts() {
  const { data: posts, error } = await supabase
    .from('launchpad_posts')
    .select('*')
    .gte('end_date', today)
    .eq('is_active', true)
    .order('pinned', { ascending: false })
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching Launchpad posts:', error);
    return;
  }

  console.log('Launchpad posts:', posts); // Debugging output

  const grid = document.getElementById('launchpad-posts');
  grid.innerHTML = '';

  posts.forEach(post => {
    const card = document.createElement('div');
    card.classList.add('launchpad-card');

    card.innerHTML = `
      <h3>${post.title}</h3>
        <p class="launchpad-date">${formatDate(post.event_date)}</p>
      <p>${post.summary}</p>
    `;

    card.addEventListener('click', () => openLaunchpadModal(post));
    grid.appendChild(card);
  });
}

// ==========================
// 🪩 Modal Logic
// ==========================

function openLaunchpadModal(post) {
  document.getElementById('modal-title').textContent = post.title || '';
  document.getElementById('modal-date').textContent = formatDate(post.event_date);
  document.getElementById('modal-author').textContent = post.author || '';

  const modalImg = document.getElementById('modal-image');
  if (post.image_url) {
    modalImg.src = post.image_url;
    modalImg.style.display = 'block';
  } else {
    modalImg.style.display = 'none';
  }

  document.getElementById('modal-content').innerHTML = post.content || '';
  document.getElementById('launchpad-modal').classList.add('visible');
}

function closeLaunchpadModal() {
  document.getElementById('launchpad-modal').classList.remove('visible');
}

document.querySelector('.modal-close').addEventListener('click', closeLaunchpadModal);
window.addEventListener('click', e => {
  if (e.target.id === 'launchpad-modal') closeLaunchpadModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLaunchpadModal();
});

// ==========================
// 🗓 Date Formatting Helper
// ==========================
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// ==========================
// 🚀 Init
// ==========================
loadLaunchpadPosts();



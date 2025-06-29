// dashboard-user.js

const supabase = window.supabaseClient;

// Build public image URL from storage path
function getPublicImageUrl(path) {
  return `https://ngqsmsdxulgpiywlczcx.supabase.co/storage/v1/object/public/${path}`;
}

// Fetch user profile and load store dashboard
async function loadUserProfile() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    console.error('No user session found:', error);
    document.getElementById('welcome-message').textContent = 'Please log in.';
    return;
  }

  const user = data.user;

  // Pull first_name and store_number from your users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('first_name, store_number')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching user profile:', profileError);
    return;
  }

  const firstName = profile.first_name || 'Team Member';
  const storeNumber = profile.store_number;

  document.getElementById('welcome-message').textContent = `Welcome back, ${firstName}. Let’s get to work.`;
  document.getElementById('store-number').textContent = storeNumber || '—';

  loadStorePhotos(storeNumber);
}

// Load store photos for the authenticated user's store
async function loadStorePhotos(storeNumber) {
  const { data: photos, error } = await supabase
    .from('store_photos')
    .select('image_path, comment, uploaded_at')
    .eq('store_number', storeNumber)
    .eq('visible', true)
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error loading photos:', error.message);
    return;
  }

  renderGallery(photos);
}

// Render photo gallery cards
function renderGallery(photos) {
  const gallery = document.getElementById('store-gallery');
  if (!gallery) return;

  gallery.innerHTML = '';

  photos.forEach(({ image_path, comment, uploaded_at }) => {
    const imageUrl = getPublicImageUrl(image_path);
    const formattedDate = new Date(uploaded_at).toLocaleDateString();

    const card = document.createElement('div');
    card.classList.add('photo-card');
    card.innerHTML = `
      <img src="${imageUrl}" alt="Store Photo" />
      <p>${comment || 'No comment'}</p>
      <small>Uploaded on ${formattedDate}</small>
    `;

    gallery.appendChild(card);
  });
}

// Handle sidebar open/close on mobile
function setupSidebar() {
  const toggle = document.getElementById('menu-toggle');
  const close = document.getElementById('close-sidebar');
  const sidebar = document.getElementById('sidebar');

  toggle?.addEventListener('click', () => sidebar?.classList.add('show'));
  close?.addEventListener('click', () => sidebar?.classList.remove('show'));
}

// Initialize dashboard logic
document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  loadUserProfile();
});

// dashboard-user.js

const supabase = window.supabaseClient;

// Build public image URL from storage path
function getPublicImageUrl(path) {
  return `https://ngqsmsdxulgpiywlczcx.supabase.co/storage/v1/object/public/${path}`;
}

// Fetch user's profile and load their store dashboard
async function loadUserProfile() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    console.error('No user session found:', error);
    document.getElementById('welcome-message').textContent = 'Please log in.';
    return;
  }

  const user = data.user;

  // Pull store_number and full_name from users table
  const { data: profile, error: profileError } = await supabase
    .from('users') // 🔁 Change this table name if needed
    .select('store_number, full_name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching user profile:', profileError);
    return;
  }

  const storeNumber = profile.store_number;
  const firstName = profile.full_name?.split(' ')[0] || 'Team Member';

  // Update DOM with name and store number
  document.getElementById('welcome-message').textContent = `Welcome back, ${firstName}. Let’s get to work.`;
  document.getElementById('store-number').textContent = storeNumber || '—';

  loadStorePhotos(storeNumber);
}

// Load photos for a specific store
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

// Render gallery cards from photo list
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

// Enable sidebar toggle for mobile view
function setupSidebar() {
  const toggle = document.getElementById('menu-toggle');
  const close = document.getElementById('close-sidebar');
  const sidebar = document.getElementById('sidebar');

  toggle?.addEventListener('click', () => sidebar?.classList.add('show'));
  close?.addEventListener('click', () => sidebar?.classList.remove('show'));
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  loadUserProfile();
});

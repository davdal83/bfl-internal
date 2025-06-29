// dashboard-user.js

const supabase = window.supabaseClient;

// Build a public image URL from a storage path
function getPublicImageUrl(path) {
  return `https://ngqsmsdxulgpiywlczcx.supabase.co/storage/v1/object/public/${path}`;
}

// Fetch profile and render dashboard
async function loadUserProfile() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    console.error('No user session found:', error);
    document.getElementById('welcome-message').textContent = 'Please log in.';
    return;
  }

  const user = data.user;

  // Get store profile
  const { data: profile, error: profileError } = await supabase
    .from('stores')
    .select('store_number, name')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching store profile:', profileError);
    return;
  }

  // Populate DOM with user/store info
  document.getElementById('user-name').textContent = profile.display_name || 'Team Member';
  document.getElementById('store-number').textContent = profile.store_number || '—';
  document.getElementById('user-role').textContent = profile.role || '—';

  loadStorePhotos(profile.store_number);
}

// Fetch photos and pass them to renderer
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

// Render gallery items
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

// Toggle sidebar for mobile
function setupSidebar() {
  const toggle = document.getElementById('menu-toggle');
  const close = document.getElementById('close-sidebar');
  const sidebar = document.getElementById('sidebar');

  toggle?.addEventListener('click', () => sidebar?.classList.add('show'));
  close?.addEventListener('click', () => sidebar?.classList.remove('show'));
}

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  loadUserProfile();
});

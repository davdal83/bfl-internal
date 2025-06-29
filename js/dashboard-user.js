// Use the client from supabase.js
const supabase = window.supabase;

// Build a public image URL from a storage path
function getPublicImageUrl(path) {
  return `https://ngqsmsdxulgpiywlczcx.supabase.co/storage/v1/object/public/${path}`;
}

// Load the user's info from Supabase
async function loadUserProfile() {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    console.error('User not authenticated:', authError);
    document.getElementById('welcome-message').textContent = 'Unable to load user.';
    return;
  }

  const user = authData.user;

  // Fetch store info based on user ID
  const { data: profile, error: profileError } = await supabase
    .from('stores')
    .select('store_number, role, display_name')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching store profile:', profileError);
    return;
  }

  // Inject user and store info into the DOM
  document.getElementById('user-name').textContent = profile.display_name || 'Team Member';
  document.getElementById('store-number').textContent = profile.store_number || '—';
  document.getElementById('user-role').textContent = profile.role || '—';

  // Now load store photos
  loadStorePhotos(profile.store_number);
}

// Load photos for a given store number
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

// Render gallery cards into the DOM
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

// Handle mobile sidebar toggle
function setupSidebar() {
  const menuToggle = document.getElementById('menu-toggle');
  const closeSidebar = document.getElementById('close-sidebar');
  const sidebar = document.getElementById('sidebar');

  menuToggle?.addEventListener('click', () => sidebar?.classList.add('show'));
  closeSidebar?.addEventListener('click', () => sidebar?.classList.remove('show'));
}

// Initialize dashboard on load
document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  loadUserProfile();
});

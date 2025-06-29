// 1. Set up your Supabase client
const supabase = createClient(
  'https://ngqsmsdxulgpiywlczcx.supabase.co',
  'YOUR_PUBLIC_ANON_KEY' // 🔐 Replace with your actual anon key
);

// 2. Helper function to build public image URL
const getPublicImageUrl = (path) =>
  `https://ngqsmsdxulgpiywlczcx.supabase.co/storage/v1/object/public/${path}`;

// 3. Fetch the current user's store number (you may already have this)
async function getUserStoreNumber() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('Failed to get user:', error?.message);
    return null;
  }

  const { data: profile } = await supabase
    .from('stores')
    .select('store_number')
    .eq('user_id', user.id)
    .single();

  return profile?.store_number || null;
}

// 4. Fetch photos for that store
async function loadStorePhotos() {
  const storeNumber = await getUserStoreNumber();
  if (!storeNumber) return;

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

// 5. Render gallery to DOM
function renderGallery(photos) {
  const gallery = document.getElementById('store-gallery');
  if (!gallery) return;

  gallery.innerHTML = ''; // Clear existing

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

// 6. Kick it off
document.addEventListener('DOMContentLoaded', loadStorePhotos);

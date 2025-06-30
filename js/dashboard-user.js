const supabase = window.supabaseClient;

// ==========================
// 🚩 Load and display the user's assigned store
// ==========================
async function loadMyStore() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    console.error('Auth session missing or failed.');
    window.location.href = 'index.html';
    return;
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('preferred_name, store_number')
    .eq('user_id', userData.user.id)
    .single();

  if (profileError || !profile) {
    console.error('User profile error:', profileError);
    return;
  }

  const firstName = profile.preferred_name || 'Team Member';
  document.getElementById('welcome-message').textContent = `Welcome back, ${firstName}. Let’s get to work.`;

  renderStoreWebsite(profile.store_number, 'my-store');
}

// ==========================
// 🏬 Render store data and photos
// ==========================
async function renderStoreWebsite(storeNumber, targetContainerId) {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  container.innerHTML = '';

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('store_number, name, store_photo_url, gm_name')
    .eq('store_number', storeNumber)
    .single();

  if (storeError || !store) {
    container.innerHTML = '<p>Error loading store info.</p>';
    console.error(storeError);
    return;
  }

  const banner = document.createElement('div');
  banner.innerHTML = `
    <div class="store-hero">
      <img src="${store.store_photo_url}" alt="Store Banner" />
    </div>
    <div class="store-header">
      <h2>${store.name}</h2>
      <p>Store: ${store.store_number} • General Manager: ${store.gm_name}</p>
    </div>
    <hr class="divider" />
  `;
  container.appendChild(banner);

  const { data: photos, error: photoError } = await supabase
    .from('store_photos')
    .select('image_path, comment, uploaded_at')
    .eq('store_number', storeNumber)
    .eq('visible', true)
    .order('uploaded_at', { ascending: false });

  if (photoError) {
    container.innerHTML += '<p>Error loading photos.</p>';
    console.error(photoError);
    return;
  }

  const gallery = document.createElement('div');
  gallery.classList.add('photo-gallery');

  if (!photos.length) {
    gallery.innerHTML = '<p>No photos uploaded yet for this store.</p>';
  } else {
    photos.forEach(({ image_path, comment, uploaded_at }) => {
      const card = document.createElement('div');
      card.classList.add('photo-card');

      const imageWrapper = document.createElement('div');
      imageWrapper.classList.add('photo-image-wrapper');

      const image = document.createElement('img');
      image.src = image_path;
      image.alt = 'Store Photo';
      image.style.cursor = 'pointer';
      image.addEventListener('click', () => {
        showImageModal(image.src);
      });

      imageWrapper.appendChild(image);

      const meta = document.createElement('div');
      meta.classList.add('photo-meta');

      const commentEl = document.createElement('p');
      commentEl.textContent = comment || '';

      const dateEl = document.createElement('small');
      dateEl.textContent = `Uploaded on ${new Date(uploaded_at).toLocaleDateString()}`;

      meta.appendChild(commentEl);
      meta.appendChild(dateEl);

      card.appendChild(imageWrapper);
      card.appendChild(meta);
      gallery.appendChild(card);
    });
  }

  container.appendChild(gallery);
}

// ==========================
// 🗂 Load and display all store cards
// ==========================
async function loadOtherStoresDirectory() {
  const container = document.getElementById('other-stores');
  if (!container) return;

  container.innerHTML = '<h2>All Stores</h2>';

  const { data: stores, error } = await supabase
    .from('stores')
    .select('store_number, name, city, state, gm_name, store_photo_url')
    .order('store_number');

  if (error || !stores) {
    container.innerHTML += '<p>Error loading store list.</p>';
    console.error(error);
    return;
  }

  const grid = document.createElement('div');
  grid.classList.add('store-card-grid');

  stores.forEach((store) => {
    const card = document.createElement('div');
    card.classList.add('store-card');
    card.style.backgroundImage = `url('${store.store_photo_url}')`;

    card.innerHTML = `
      <div class="overlay">
        <h3>${store.name}</h3>
        <p>Store: ${store.store_number} • GM: ${store.gm_name || ''}</p>
        <button onclick="handleViewStore('${store.store_number}')">View Store</button>
      </div>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

// ==========================
// 👁 Preview a specific store
// ==========================
function handleViewStore(storeNumber) {
  showSection('other-store-view');
  renderStoreWebsite(storeNumber, 'other-store-view');
}

// ==========================
// 📱 Sidebar setup (mobile)
// ==========================
function setupSidebar() {
  const toggle = document.getElementById('menu-toggle');
  const close = document.getElementById('close-sidebar');
  const sidebar = document.getElementById('sidebar');

  toggle?.addEventListener('click', () => sidebar?.classList.add('show'));
  close?.addEventListener('click', () => sidebar?.classList.remove('show'));
}

// ==========================
// 🔁 Show/hide dashboard sections
// ==========================
function showSection(id) {
  document.querySelectorAll('.dashboard-section').forEach((sec) => {
    sec.style.display = 'none';
  });

  const target = document.getElementById(id);
  if (target) {
    target.style.display = 'block';
  }
}

// ==========================
// 🖼 Image modal (photos)
// ==========================
function showImageModal(src) {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-image');
  modalImg.src = src;
  modal.classList.add('show');
}

function setupImageModal() {
  const modal = document.getElementById('image-modal');
  const modalClose = document.querySelector('.modal-close');

  modalClose?.addEventListener('click', () => modal.classList.remove('show'));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('show');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('show');
  });
}

// ==========================
// 📁 Load documents from Supabase (download-only)
// ==========================
async function loadDocumentsSection() {
  const container = document.getElementById('documents-container');
  if (!container) return;

  container.innerHTML = '';

  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .eq('visible', true)
    .order('uploaded_at', { ascending: false });

  if (error || !documents) {
    container.innerHTML = '<p>Error loading documents.</p>';
    console.error(error);
    return;
  }

  if (documents.length === 0) {
    container.innerHTML = '<p>No documents available at the moment.</p>';
    return;
  }

  documents.forEach((doc) => {
    const card = document.createElement('div');
    card.classList.add('document-card');

    card.innerHTML = `
      <div class="doc-title">${doc.title}</div>
      <div class="doc-meta">
        ${doc.category ? `<span class="doc-badge">${doc.category}</span>` : ''}
        ${doc.uploaded_at ? `<span class="doc-date"><strong>Updated:</strong> ${new Date(doc.uploaded_at).toLocaleDateString()}</span>` : ''}
      </div>
      ${doc.description ? `<div class="doc-description">${doc.description}</div>` : ''}
      <div class="doc-actions">
        <a class="btn-download" href="${doc.file_url}" download target="_blank" rel="noopener">Download</a>
      </div>
    `;

    container.appendChild(card);
  });
}

// ==========================
// 🚀 Initial app load
// ==========================
document.addEventListener('DOMContentLoaded', async () => {
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData?.session) {
    window.location.href = 'index.html';
    return;
  }

  document.body.style.visibility = 'visible';
  setupSidebar();
  setupImageModal();
  await loadMyStore();
  await loadOtherStoresDirectory();
  await loadDocumentsSection();
  showSection('my-store');
});

// 🔐 Handle logout when the sidebar button is clicked
document.getElementById('logout-button')?.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout failed:', error);
    alert('Something went wrong. Please try again.');
  } else {
    // ✅ Successfully logged out – redirect to login screen
    window.location.href = '/bfl-internal/login.html';
  }
});


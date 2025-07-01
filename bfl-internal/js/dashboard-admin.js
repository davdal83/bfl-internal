/*************** SECTION: Supabase Setup ***************/
const supabase = window.supabase.createClient(
  'https://ngqsmsdxulgpiywlczcx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ncXNtc2R4dWxncGl5d2xjemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNTgxNjYsImV4cCI6MjA2NjYzNDE2Nn0.8F_tH-xhmW2Cne2Mh3lWZmHjWD8sDSZd8ZMcYV7tWnM'
);

/*************** SECTION: Init ***************/
document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

/*************** SECTION: Dashboard Boot ***************/
async function initAdminDashboard() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = '/login.html'; // redirect if not signed in
    return;
  }

  const currentUserId = user.id;


  document.body.style.visibility = 'visible';

  bindSidebarLinks();
  bindSidebarToggle();
  loadModule('Welcome'); // default module
}

/*************** SECTION: Sidebar Link Handling ***************/
function bindSidebarLinks() {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const module = link.dataset.module;
      loadModule(module);
    });
  });
}

/*************** SECTION: Sidebar Mobile Toggle ***************/
function bindSidebarToggle() {
  const sidebar = document.getElementById('admin-sidebar');
  const openBtn = document.getElementById('open-sidebar');
  const closeBtn = document.getElementById('close-sidebar');

  openBtn.addEventListener('click', () => sidebar.classList.add('show'));
  closeBtn.addEventListener('click', () => sidebar.classList.remove('show'));
}

/*************** SECTION: Module Loader ***************/
function loadModule(name) {
  const container = document.getElementById('admin-main');
  container.innerHTML = ''; // clear content

  const method = window[`load${name}`];
  if (typeof method === 'function') {
    method();
  } else {
    container.innerHTML = `<section class="dashboard-section"><p>Module <strong>${name}</strong> not yet implemented.</p></section>`;
  }
}

/*************** SECTION: Welcome ***************/
function loadWelcome() {
  const container = document.getElementById('admin-main');
  container.innerHTML = `
    <section class="dashboard-section">
      <h1>Welcome, Admin</h1>
      <p><em>Another day, another opportunity to make it better.</em></p>
    </section>
  `;
}

/*************** SECTION: Sign Out ***************/
async function handleSignOut() {
  await supabase.auth.signOut();
  window.location.href = '/login.html';
}

/*************** SECTION: The Jax Network (Admin View) ***************/
async function loadNetwork() {
  const container = document.getElementById('admin-main');
  container.innerHTML = `
    <section class="dashboard-section">
      <h2>The Jax Network</h2>
      <div id="store-list" class="launchpad-grid"></div>
    </section>
  `;

  function formatPhoneNumber(number) {
  const digits = number.replace(/\D/g, ''); // Strip non-digits
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return number; // Fallback: return original if not 10 digits
}


  const { data: stores, error } = await supabase
    .from('stores')
    .select('*')
    .order('store_number', { ascending: true });

  const listEl = document.getElementById('store-list');

  if (error) {
    listEl.innerHTML = `<p>Error loading stores: ${error.message}</p>`;
    return;
  }

  if (!stores || stores.length === 0) {
    listEl.innerHTML = `<p>No stores found in the network.</p>`;
    return;
  }

  stores.forEach(store => {
    const card = document.createElement('div');
    card.className = 'launchpad-card';
    card.innerHTML = `
      <h3><strong>Store #:</strong> ${store.store_number}</h3>
      <p><strong>${store.name}</strong></p>
      <p><strong>Address:</strong> ${store.address.trim()}, ${store.city.trim()}</p>
      <p><strong>Phone:</strong> ${formatPhoneNumber(store.phone_number)}</p>      
      <p><strong>GM:</strong> ${store.gm_name || 'N/A'}</p>
    `;

    // ✅ Proper click binding inside the loop
    card.addEventListener('click', () => {
      loadStoreDetail(store);
    });

    listEl.appendChild(card);
  });
}

/*************** SECTION: Store Detail View ***************/
function formatPhoneNumber(number) {
  const digits = number.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return number;
}

async function loadStoreDetail(store) {
  const container = document.getElementById('admin-main');

  // Inject the hero banner and store info
  container.innerHTML = `
    <section class="store-hero-banner">
      ${store.store_photo_url ? `<img src="${store.store_photo_url}" alt="Store Hero Image">` : ''}
    </section>

    <section class="store-detail-wrapper">
      <button onclick="loadNetwork()" class="back-button">← Back to Network</button>
      <div class="store-detail-card">
        <h1>${store.name}</h1>
        <p><strong>Store #:</strong> ${store.store_number}</p>
        <p><strong>Address:</strong> ${store.address.trim()}, ${store.city.trim()}</p>
        <p><strong>Phone:</strong> ${formatPhoneNumber(store.phone_number)}</p>
        <p><strong>GM:</strong> ${store.gm_name || 'N/A'}</p>
      </div>
    </section>
  `;

  // Fetch associated store photos from Supabase
  const { data: photos, error } = await supabase
    .from('store_photos')
    .select('*')
    .eq('store_number', store.store_number)
    .eq('visible', true) // only show visible images
    .order('uploaded_at', { ascending: false });

  if (error) {
    console.error('Error loading store photos:', error.message);
    return;
  }

  const galleryHTML = photos.length
    ? `
      <section class="store-photo-gallery">
        <h2>Recent Store Photos</h2>
        <div class="photo-grid">
          ${photos.map(photo => `
            <div class="photo-item">
              <div class="photo-admin-wrapper">
                <img src="${photo.image_path}" alt="${photo.comment || 'Store photo'}">
                </div>
              <p>${photo.comment || 'No description'}</p>

            </div>
          `).join('')}
        </div>
      </section>
    `
    : `
      <section class="store-photo-gallery">
        <p>No photos uploaded yet for this store.</p>
      </section>
    `;

  container.innerHTML += galleryHTML;
}

/*************** SECTION: Store Photo Admin Actions ***************/
function editPhoto(photoId) {
  alert(`Edit logic for photo ID ${photoId} will go here.`);
}

async function deletePhoto(photoId) {
  const confirmed = confirm('Are you sure you want to delete this photo?');
  if (!confirmed) return;

  const { error } = await supabase
    .from('store_photos')
    .delete()
    .eq('id', photoId);

  if (error) {
    console.error('Delete failed:', error.message);
    alert('Failed to delete photo.');
  } else {
    alert('Photo deleted.');
    // Optionally re-fetch or remove from DOM
    loadNetwork(); // or refresh the detail view
  }
}

/*************** SECTION: Manage Stores UI Layout ***************/
async function loadStores() {
  const container = document.getElementById('admin-main');
  container.innerHTML = `
    <section class="dashboard-section">
      <div class="store-header">
        <h2>Manage Stores</h2>
        <div class="store-controls">
          <input type="text" placeholder="Search by name or store #" disabled />
          <button id="add-store-btn">+ Add Store</button>
        </div>
      </div>

      <div id="store-grid" class="store-grid">
        <p>Loading stores...</p>
      </div>
    </section>
  `;

  const grid = document.getElementById('store-grid');

  const { data: stores, error } = await supabase
    .from('stores')
    .select('*')
    .order('store_number', { ascending: true });

  if (error) {
    grid.innerHTML = `<p style="color: red;">⚠️ Failed to load stores: ${error.message}</p>`;
    return;
  }

  if (!stores || stores.length === 0) {
    grid.innerHTML = `<p>No stores found in the network.</p>`;
    return;
  }

  // Generate cards dynamically
  grid.innerHTML = stores.map(store => `
    <div class="store-card">
      <h3>Store #${store.store_number}</h3>
      <p><strong>${store.name}</strong></p>
      <p>${store.city}, ${store.state}</p>
      <div class="card-actions">
        <button onclick="openStoreEditor(${store.id})">Edit</button>
        <button disabled>Photos</button>
      </div>
    </div>
  `).join('');
}


/*************** SECTION: Manage Stores UI Layout ***************/
async function loadStores() {
  const container = document.getElementById('admin-main');
  container.innerHTML = `
    <section class="dashboard-section">
      <div class="store-header">
        <h2>Manage Stores</h2>
        <div class="store-controls">
          <input type="text" placeholder="Search by name or store #" disabled />
          <button id="add-store-btn">+ Add Store</button>
        </div>
      </div>

      <div id="store-grid" class="store-grid">
        <p>Loading stores...</p>
      </div>
    </section>
  `;

  const grid = document.getElementById('store-grid');

  const { data: stores, error } = await supabase
    .from('stores')
    .select('*')
    .order('store_number', { ascending: true });

  if (error) {
    grid.innerHTML = `<p style="color: red;">⚠️ Failed to load stores: ${error.message}</p>`;
    return;
  }

  if (!stores || stores.length === 0) {
    grid.innerHTML = `<p>No stores found in the network.</p>`;
    return;
  }

  grid.innerHTML = stores.map(store => `
    <div class="store-card">
      <h3>Store #${store.store_number}</h3>
      <p><strong>${store.name}</strong></p>
      <p>${store.city}, ${store.state}</p>
      <div class="card-actions">
        <button onclick="openStoreEditor(${store.id})">Edit</button>
       <button onclick="openPhotoGallery(${store.id})">Photos</button>
      </div>
    </div>
  `).join('');

  // ✅ Wire up Add Store button AFTER rendering
  const addBtn = document.getElementById('add-store-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openStoreEditor(null); // opens modal in "Add" mode
    });
  }
}

/*************** SECTION: Store Modal Editor + Photo Viewer ***************/
function closeStoreEditor() {
  const modal = document.getElementById('store-edit-modal');
  if (modal && modal.parentNode) {
    modal.parentNode.removeChild(modal);
  }
}

function closePhotoGallery() {
  const modal = document.getElementById('photo-gallery-modal');
  if (modal) modal.remove();
}

function buildStoreEditModal(store, isNew = false) {
  const oldModal = document.getElementById('store-edit-modal');
  if (oldModal) oldModal.remove();

  const modal = document.createElement('div');
  modal.id = 'store-edit-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>${isNew ? 'Add Store' : 'Edit Store'}</h3>
      <form id="store-edit-form">
        <label>Store Number</label>
        <input type="text" id="edit-store-number" value="${store.store_number || ''}" required />

        <label>Store Name</label>
        <input type="text" id="edit-store-name" value="${store.name || ''}" required />

        <label>Address</label>
        <input type="text" id="edit-store-address" value="${store.address || ''}" />

        <label>City</label>
        <input type="text" id="edit-store-city" value="${store.city || ''}" />

        <label>State</label>
        <input type="text" id="edit-store-state" value="${store.state || ''}" />

        <label>Zip Code</label>
        <input type="text" id="edit-store-zip" value="${store.zip_code || ''}" />

        <label>Phone</label>
        <input type="tel" id="edit-store-phone" value="${store.phone_number || ''}" />

        <label>General Manager</label>
        <input type="text" id="edit-store-gm" value="${store.gm_name || ''}" />

        <label>Upload Store Image</label>
        <label for="edit-store-photo" class="file-label">Choose File</label>
        <input type="file" id="edit-store-photo" accept="image/*" class="file-input" />
        <span id="file-name-preview" class="file-name-preview">No file selected</span>

        <div class="modal-actions">
          ${!isNew ? '<button type="button" class="delete-btn" id="delete-store-btn">Delete</button>' : ''}
          <div class="action-right">
            <button type="submit">${isNew ? 'Add Store' : 'Save'}</button>
            <button type="button" id="cancel-store-btn">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Cancel button
  document.getElementById('cancel-store-btn').addEventListener('click', closeStoreEditor);

  // File preview
  const fileInput = document.getElementById('edit-store-photo');
  const fileNamePreview = document.getElementById('file-name-preview');
  fileInput.addEventListener('change', () => {
    const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : 'No file selected';
    fileNamePreview.textContent = fileName;
  });

  // Save/Submit handler
  const form = document.getElementById('store-edit-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updates = {
      store_number: document.getElementById('edit-store-number').value.trim(),
      name: document.getElementById('edit-store-name').value.trim(),
      address: document.getElementById('edit-store-address').value.trim(),
      city: document.getElementById('edit-store-city').value.trim(),
      state: document.getElementById('edit-store-state').value.trim(),
      zip_code: document.getElementById('edit-store-zip').value.trim(),
      phone_number: document.getElementById('edit-store-phone').value.trim(),
      gm_name: document.getElementById('edit-store-gm').value.trim()
    };

    const file = fileInput.files[0];
    if (file) {
      const slug = `store-${isNew ? 'new' : store.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('store-photos')
        .upload(slug, file, { upsert: true });

      if (uploadError) {
        alert('❌ Failed to upload image: ' + uploadError.message);
        return;
      }

      const { data: publicData } = supabase
        .storage
        .from('store-photos')
        .getPublicUrl(slug);

      updates.store_photo_url = publicData.publicUrl;
    }

    const { error } = isNew
      ? await supabase.from('stores').insert(updates)
      : await supabase.from('stores').update(updates).eq('id', store.id);

    if (error) {
      alert(`❌ ${isNew ? 'Add' : 'Update'} failed: ${error.message}`);
    } else {
      alert(`✅ Store ${isNew ? 'added' : 'updated'}!`);
      closeStoreEditor();
      loadStores();
    }
  });

  // Delete handler
  if (!isNew) {
    const deleteBtn = document.getElementById('delete-store-btn');
    deleteBtn.addEventListener('click', async () => {
      const confirmDelete = confirm(`This action cannot be undone.\n\nAre you sure you want to permanently delete Store #${store.store_number}?`);
      if (!confirmDelete) return;

      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', store.id);

      if (error) {
        alert('❌ Failed to delete store: ' + error.message);
      } else {
        alert(`🗑️ Store #${store.store_number} deleted.`);
        closeStoreEditor();
        loadStores();
      }
    });
  }
}

window.openStoreEditor = async function(storeId) {
  if (!storeId) {
    const blank = {
      store_number: '',
      name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      phone_number: '',
      gm_name: '',
      store_photo_url: ''
    };
    buildStoreEditModal(blank, true);
    return;
  }

  const { data: store, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', storeId)
    .single();

  if (error) {
    alert('⚠️ Failed to load store info.');
    return;
  }

  buildStoreEditModal(store, false);
};

/*************** OPEN PHOTO GALLERY MODAL ***************/
async function openPhotoGallery(storeId, userId) {
  // ─── Get Store Info ─────────────────────────────────────
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('store_number, name')
    .eq('id', storeId)
    .single();

  if (storeError) {
    alert('⚠️ Failed to load store info.');
    return;
  }

  // ─── Fetch Photos from store_photos Table ───────────────
  const { data: photos, error: photoError } = await supabase
    .from('store_photos')
    .select('*')
    .eq('store_number', store.store_number)
    .order('uploaded_at', { ascending: false });

  if (photoError) {
    alert('⚠️ Failed to load photos: ' + photoError.message);
    return;
  }

  // ─── Build Modal DOM ────────────────────────────────────
  const modal = document.createElement('div');
  modal.id = 'photo-gallery-modal';
  modal.className = 'modal wide-photo-modal'; // <- Scoped class for wide layout
  modal.innerHTML = `
    <div class="modal-content">
      <!-- Modal Header -->
      <div class="modal-header">
        <h3>📷 Store #${store.store_number} – ${store.name}</h3>
        <button class="close-btn" onclick="closePhotoGallery()">✕</button>
      </div>

      <!-- Upload Controls -->
      <div class="add-photo-controls">
        <label for="add-store-photo">Choose File</label>
        <input type="file" id="add-store-photo" accept="image/*" />
        <button id="upload-store-photo-btn">Upload Photo</button>
        <div class="spacer"></div>
        <button id="bulk-upload-btn">Bulk Upload</button>
      </div>

      <!-- Tabular Photo Layout -->
      <div class="photo-table">
        <div class="photo-row header">
          <div>Image</div>
          <div>Uploaded</div>
          <div>Comment</div>
          <div>Actions</div>
        </div>

      </div>


        ${
          photos.length === 0
            ? '<p>No photos uploaded yet.</p>'
            : photos.map(photo => `
              <div class="photo-row">
                <div><img src="${photo.image_path}" class="thumb" alt="Store Photo" /></div>
                <div>${new Date(photo.uploaded_at).toLocaleDateString()}</div>
                <div><textarea class="comment-input" data-id="${photo.id}">${photo.comment || ''}</textarea></div>
                <div>
                  <button class="save-comment-btn" data-id="${photo.id}">Save</button>
                  <button class="delete-photo-btn" data-id="${photo.id}">Delete</button>
                </div>
              </div>
            `).join('')
        }
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Inject bulk upload modal into the DOM (once)
if (!document.getElementById('bulk-upload-modal')) {
  const bulkModal = document.createElement('div');
  bulkModal.id = 'bulk-upload-modal';
  bulkModal.className = 'modal wide-photo-modal';
  bulkModal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>🗂️ Bulk Upload Photos</h3>
        <button class="close-btn" onclick="closeBulkUpload()">✕</button>
      </div>

      <div id="dropzone" class="dropzone">
        <p>Drag & drop images here, or click to select</p>
        <input type="file" id="bulk-file-input" accept="image/*" multiple hidden />
      </div>

      <div id="preview-list" class="preview-list"></div>

      <button id="confirm-upload-btn" class="upload-all-btn">Upload All</button>
    </div>
  `;
  document.body.appendChild(bulkModal);
}


  // ─── Upload Handler ─────────────────────────────────────
  document.getElementById('upload-store-photo-btn').addEventListener('click', async () => {
    const input = document.getElementById('add-store-photo');
    const file = input.files[0];
    if (!file) return alert('📁 Select a photo to upload.');

    const slug = `store-${store.store_number}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
      .from('store-photos')
      .upload(slug, file, { upsert: true });

    if (uploadError) {
      alert('❌ Upload failed: ' + uploadError.message);
      return;
    }

    const { data: publicData } = supabase.storage
      .from('store-photos')
      .getPublicUrl(slug);

    const { error: insertError } = await supabase
      .from('store_photos')
      .insert({
        store_number: store.store_number,
        image_path: publicData.publicUrl,
        uploaded_at: new Date().toISOString(),
        comment: '',
        visible: true,
        uploaded_by: userId
      });

    if (insertError) {
      alert('❌ Failed to save metadata: ' + insertError.message);
    } else {
      alert('✅ Photo uploaded!');
      closePhotoGallery();
      openPhotoGallery(storeId);
    }
  });

  // ─── Save Comment Handlers ──────────────────────────────
  document.querySelectorAll('.save-comment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const comment = document.querySelector(`.comment-input[data-id="${id}"]`).value;

      const { error } = await supabase
        .from('store_photos')
        .update({ comment })
        .eq('id', id);

      if (error) {
        alert('❌ Failed to save: ' + error.message);
      } else {
        alert('✅ Comment updated!');
      }
    });
  });

  // ─── Delete Photo Handlers ──────────────────────────────
  document.querySelectorAll('.delete-photo-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const confirmDelete = confirm('Are you sure you want to delete this photo?');
      if (!confirmDelete) return;

      const { error } = await supabase
        .from('store_photos')
        .delete()
        .eq('id', id);

      if (error) {
        alert('❌ Delete failed: ' + error.message);
      } else {
        alert('🗑️ Photo deleted.');
        closePhotoGallery();
        openPhotoGallery(storeId);
      }
    });
  });
}

/*************** CLOSE PHOTO GALLERY MODAL ***************/
function closePhotoGallery() {
  const modal = document.getElementById('photo-gallery-modal');
  if (modal) modal.remove();
}
/*************** END PHOTO GALLERY MODAL ***************/


/*************** SECTION: Load Stores UI ***************/
async function loadStores() {
  const container = document.getElementById('admin-main');
  container.innerHTML = `
    <section class="dashboard-section">
      <div class="store-header">
        <h2>Manage Stores</h2>
        <div class="store-controls">
        <input type="text" placeholder="Search by name or store #" disabled />
        <button id="add-store-btn">+ Add Store</button>
      </div>
    </div>

    <div id="store-grid" class="store-grid">
      <p>Loading stores...</p>
    </div>
  </section>
  `;

  const grid = document.getElementById('store-grid');

  const { data: stores, error } = await supabase
    .from('stores')
    .select('*')
    .order('store_number', { ascending: true });

  if (error) {
    grid.innerHTML = `<p style="color: red;">⚠️ Failed to load stores: ${error.message}</p>`;
    return;
  }

  if (!stores || stores.length === 0) {
    grid.innerHTML = `<p>No stores found in the network.</p>`;
    return;
  }

  grid.innerHTML = stores.map(store => `
    <div class="store-card">
      <h3>Store #${store.store_number}</h3>
      <p><strong>${store.name}</strong></p>
      <p>${store.city}, ${store.state}</p>
      <div class="card-actions">
        <button onclick="openStoreEditor(${store.id})">Edit</button>
        <button onclick="openPhotoGallery(${store.id})">Photos</button>
      </div>
    </div>
  `).join('');

  const addBtn = document.getElementById('add-store-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openStoreEditor(null);
    });
  }
}

/*************** OPEN BULK UPLOAD MODAL ***************/
function openBulkUpload(storeId, userId) {
  const modal = document.getElementById('bulk-upload-modal');
  const dropzone = document.getElementById('dropzone');
  const input = document.getElementById('bulk-file-input');
  const previewList = document.getElementById('preview-list');
  const confirmBtn = document.getElementById('confirm-upload-btn');

  modal.style.display = 'block';
  let selectedFiles = [];

  dropzone.addEventListener('click', () => input.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  input.addEventListener('change', () => {
    handleFiles(input.files);
  });

  function handleFiles(files) {
    selectedFiles = Array.from(files);
    previewList.innerHTML = '';
    selectedFiles.forEach(file => {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      previewList.appendChild(img);
    });
  }

  confirmBtn.addEventListener('click', async () => {
    if (!selectedFiles.length) return alert('No files selected.');

    for (const file of selectedFiles) {
      const slug = `store-${storeId}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('store-photos')
        .upload(slug, file, { upsert: true });

      if (uploadError) {
        alert(`❌ Failed to upload ${file.name}`);
        continue;
      }

      const { data: publicData } = supabase.storage
        .from('store-photos')
        .getPublicUrl(slug);

      const { error: insertError } = await supabase
        .from('store_photos')
        .insert({
          store_number: storeId,
          image_path: publicData.publicUrl,
          uploaded_at: new Date().toISOString(),
          comment: '',
          visible: true,
          uploaded_by: userId
        });

      if (insertError) {
        alert(`❌ Failed to save metadata for ${file.name}`);
      }
    }

    alert('✅ Bulk upload complete!');
    closeBulkUpload();
    openPhotoGallery(storeId, userId);
  });
}

function closeBulkUpload() {
  const modal = document.getElementById('bulk-upload-modal');
  if (modal) modal.style.display = 'none';
}
/*************** END BULK UPLOAD MODAL ***************/


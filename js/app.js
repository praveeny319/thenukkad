// ═══════════════════════════════════
// APP VERSION — increment this by 1
// every time you deploy to Netlify
// ═══════════════════════════════════
const APP_VERSION = '1.0';

// ═══════════════════════════════════
// ADMIN CONFIG
// Only this email sees the admin panel
// ═══════════════════════════════════
const ADMIN_EMAIL = 'y319praveen@gmail.com';

function isAdmin() {
  return currentAuthUser?.email === ADMIN_EMAIL;
}

// Admin edit mode — lets admin view any store
// as the owner for testing purposes
let _adminEditHandle = null;

function adminIsOwner(handle) {
  return isAdmin() && _adminEditHandle === handle;
}

(function() {
  const storedVersion = localStorage.getItem('nukkad_app_version');
  if (storedVersion !== APP_VERSION) {
    // New version detected — clear URL state and go home
    localStorage.setItem('nukkad_app_version', APP_VERSION);
    localStorage.removeItem('nukkad_last_page');
    const url = new URL(window.location.href);
    const hasStateParams = url.searchParams.has('page') ||
                           url.searchParams.has('store') ||
                           url.searchParams.has('product') ||
                           url.searchParams.has('customer');
    if (hasStateParams) {
      window.history.replaceState({page:'home'}, '',
        window.location.pathname);
    }
  }
})();

// ═══════════════════════════════════
// SUPABASE
// ═══════════════════════════════════
const { createClient } = supabase;
const sb = createClient(
  'https://pgrmaugomtcccplbphke.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBncm1hdWdvbXRjY2NwbGJwaGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjgxODEsImV4cCI6MjA5MDM0NDE4MX0.nHyA2fFl2DtheJ1CpTaW2QIQPFNQZ1p9RcLuMyDZ43Y'
);

// ═══════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════
const BG = [
  ['#3d6b4a','#5a9968','#c8902a','#4a7c59'],
  ['#6b3a1f','#a05c30','#4a7c59','#7c4a2d'],
  ['#3a6b8a','#5a9ab0','#c8902a','#4a7a9b'],
  ['#1a0f0a','#3a1f0f','#6b3a1f','#4a2f1e'],
  ['#a04040','#c4784a','#6aaf7a','#c05a5a'],
  ['#3a1f0f','#6b3a1f','#3a6b8a','#4a2f1e'],
];

const SEEDS = [
  {handle:'naturesglow',brand_name:"Nature's Glow",emoji:'🌿',category:'💆 Hair & Skincare',tagline:'Natural hair & skincare — safe, effective, herbal',city:'Mumbai',whatsapp:'9876543210',bg_idx:0,
    products:[
      {name:'Hair Growth Oil',price:'299',description:'Bhringraj & Amla blend that nourishes roots and reduces hair fall naturally.',image_url:null},
      {name:'Anti-Fungal Oil',price:'329',description:'Tea tree & neem infused oil for dandruff, scalp infections, and itchiness.',image_url:null},
      {name:'Neem Purifying Soap',price:'149',description:'Deep cleansing neem bar for acne-prone skin. Kills bacteria, clears breakouts.',image_url:null},
      {name:'Detan Glow Soap',price:'159',description:'Removes tan and restores natural skin tone with kojic acid and turmeric.',image_url:null},
      {name:'Coffee Detox Soap',price:'169',description:'Exfoliating coffee bar that lifts dead skin cells and boosts circulation.',image_url:null},
      {name:'Multani Mitti Powder',price:'149',description:"Fuller's earth that deep cleanses pores and controls oil naturally.",image_url:null},
    ]
  },
  {handle:'ridaskitchen',brand_name:"Rida's Kitchen",emoji:'🍳',category:'🍳 Home-cooked Food',tagline:'Homemade tiffins & weekend specials — fresh, no preservatives',city:'Pune',whatsapp:'9123456780',bg_idx:1,
    products:[
      {name:'Dal Makhani',price:'180',description:'Slow-cooked overnight dal with home-ground masalas. Rich, creamy, deeply flavourful.',image_url:null},
      {name:'Paneer Butter Masala',price:'200',description:'Rich tomato-cream gravy with fresh cottage cheese. Restaurant taste, home made.',image_url:null},
      {name:'Wheat Roti (10 pcs)',price:'80',description:'Soft whole wheat rotis pressed fresh. Perfect with any sabzi or dal.',image_url:null},
      {name:'Shahi Kheer',price:'120',description:'Creamy milk pudding with saffron, cardamom, and dry fruits. Slow-simmered.',image_url:null},
    ]
  },
  {handle:'sweetsbysana',brand_name:'Sweets by Sana',emoji:'🧁',category:'🧁 Baked Goods',tagline:'Custom cakes & cupcakes baked fresh to order 🎂',city:'Bangalore',whatsapp:'9988776655',bg_idx:2,
    products:[
      {name:'Chocolate Truffle Cake',price:'650',description:'Rich dark chocolate layers with ganache frosting. Moist and decadent. Half kg.',image_url:null},
      {name:'Red Velvet Cupcakes',price:'280',description:'Moist red velvet with cream cheese frosting. Box of 6. Perfect for gifting.',image_url:null},
      {name:'Mango Cheesecake',price:'550',description:'No-bake cheesecake with fresh Alphonso mango pulp. Chilled and served cold.',image_url:null},
    ]
  }
];

/*
  SUPABASE TABLE REQUIRED — run this in Supabase SQL editor:

  create table orders (
    id uuid default gen_random_uuid() primary key,
    store_id uuid references stores(id) on delete cascade,
    store_handle text not null,
    store_name text not null,
    buyer_id uuid references seller_profiles(id),
    buyer_name text not null,
    buyer_phone text not null,
    buyer_area text,
    buyer_city text,
    product_name text not null,
    product_price text not null,
    status text default 'pending',
    created_at timestamptz default now()
  );

  alter table orders enable row level security;
  create policy "Anyone can insert orders" on orders for insert with check (true);
  create policy "Store owner can view orders" on orders for select using (true);
  create policy "Store owner can update orders" on orders for update using (true);
*/

/*
  Run this in Supabase SQL editor to support logo uploads:
  ALTER TABLE stores ADD COLUMN IF NOT EXISTS logo_url TEXT;

  Run to support Our Story editing:
  ALTER TABLE stores ADD COLUMN IF NOT EXISTS story TEXT;

  Run to support order pause/resume:
  ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_accepting_orders BOOLEAN DEFAULT true;

  Run to support profile photo upload:
  ALTER TABLE seller_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
*/

/*
  Run in Supabase SQL editor:
  ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
*/

/*
  Run in Supabase SQL editor:
  ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_hidden
  BOOLEAN DEFAULT false;
*/

// Always format Indian numbers for wa.me (+91)
function waPhone(raw) {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 12 && digits.startsWith('91'))
    return digits;
  if (digits.length === 10)
    return '91' + digits;
  return digits;
}

// ═══════════════════════════════════
// STATE
// ═══════════════════════════════════
let USER = {name:'',email:'',phone:'',area:'',city:''};
let NS = {brand_name:'',emoji:'🌿',category:'',tagline:'',city:'',whatsapp:'',handle:'',bg_idx:0};
let NSProducts = [];
let pc = 0;
let curStore = null;
let allStores = [];
let filteredStores = [];
let productImageFiles = {}; // { prodId: File }

// ═══════════════════════════════════
// INIT
// ═══════════════════════════════════
window.addEventListener('load', async () => {
  buildEmojiPicker();
  await loadStores();
  await initAuth();

  // URL routing
  const params = new URLSearchParams(window.location.search);
  const customerParam = params.get('customer');
  const storeParam = params.get('store');
  const productParam = params.get('product');

  if (customerParam) {
    // Shared customer profile link — always open it
    await loadCustomerProfile(customerParam);

  } else if (storeParam && !params.get('page')) {
    // Direct shared store link — ALWAYS fetch
    // directly from Supabase, never rely on cache
    try {
      const { data: freshStore, error: linkErr } =
        await sb
          .from('stores')
          .select('*, products(*)')
          .eq('handle', storeParam)
          .single();

      if (linkErr || !freshStore) {
        showToast('Store not found');
        showPg('home');
      } else {
        freshStore.products = freshStore.products || [];
        const ei = allStores.findIndex(
          s => s.handle === storeParam);
        if (ei > -1) allStores[ei] = freshStore;
        else allStores.push(freshStore);
        await openStore(storeParam);
        if (productParam) {
          openProductDetail(storeParam, productParam);
        }
      }
    } catch(e) {
      console.error('Store link error:', e);
      const s = allStores.find(
        x => x.handle === storeParam);
      if (s) {
        await openStore(storeParam);
      } else {
        showToast('Check your connection and try again');
        showPg('home');
      }
    }

  } else {
    // All other cases — restore from localStorage
    // This covers: normal refresh, back/forward,
    // internal navigation refresh
    const lastRaw = localStorage.getItem('nukkad_last_page');
    const last = lastRaw ? JSON.parse(lastRaw) : null;

    if (last && last.page === 'store' && last.store) {
      // Was on a store page
      const s = allStores.find(x => x.handle === last.store);
      if (s) {
        await openStore(last.store);
      } else {
        showPg('market');
      }
    } else if (last && last.page && last.page !== 'create' && last.page !== 'market') {
      // Was on home, market, profile, customer etc
      showPg(last.page);
    } else {
      // No saved position or was on create — go home
      showPg('home');
    }

    // Clean up URL if it has stale page= params
    if (window.location.search) {
      history.replaceState(
        { page: last?.page || 'home' },
        '',
        window.location.pathname
      );
    }
  }

});

window.addEventListener('popstate', (e) => {
  const state = e.state || {};
  const page = state.page || 'home';

  // Going back from product detail → restore store
  if (page === 'product' && state.store) {
    document.getElementById('product-detail').classList.remove('open');
    document.getElementById('chat-fab').classList.add('visible');
    window.scrollTo(0,0);
    return;
  }

  // Going back to store page
  if (page === 'store' && state.store) {
    document.getElementById('product-detail').classList.remove('open');
    openStore(state.store);
    window.scrollTo(0,0);
    return;
  }

  // All other pages
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
  document.getElementById('pg-' + page)?.classList.add('on');
  document.getElementById('bottom-nav').style.display = page === 'create' ? 'none' : 'flex';
  document.querySelectorAll('.bn').forEach(b => b.classList.remove('on'));
  const bn = document.getElementById('bn-' + page);
  if (bn) bn.classList.add('on');
  document.getElementById('product-detail').classList.remove('open');
  document.getElementById('chat-fab').classList.remove('visible');
  closeChatWidget();
  window.scrollTo(0, 0);
});

async function loadCustomerProfile(profileId) {
  showPg('customer');
  try {
    const { data, error } = await sb.from('seller_profiles').select('*').eq('id', profileId).single();
    if (error || !data) {
      document.getElementById('cp-name').textContent = 'Profile not found';
      return;
    }
    const initial = data.name ? data.name.charAt(0).toUpperCase() : '?';
    document.getElementById('cp-avatar').textContent = initial;
    document.getElementById('cp-name').textContent = data.name || 'Customer';
    document.getElementById('cp-phone').textContent = data.phone || '—';
    const loc = [data.area, data.city].filter(Boolean).join(', ');
    document.getElementById('cp-location').textContent = loc || '—';
    document.title = (data.name || 'Customer') + ' — Nukkad';

    // Load order history for this customer profile
    try {
      const { data: orders } = await sb
        .from('orders')
        .select('*')
        .eq('buyer_id', profileId)
        .order('created_at', { ascending: false });

      const section = document.getElementById('cp-orders-section');
      const list = document.getElementById('cp-orders-list');

      if (orders && orders.length > 0) {
        section.style.display = 'block';
        list.innerHTML = orders.map(o => {
          const date = new Date(o.created_at).toLocaleDateString('en-IN', {
            day:'numeric', month:'short', year:'numeric'
          });
          return `<div class="oh-card">
            <div class="oh-left">
              <div class="oh-product">${o.product_name}</div>
              <div class="oh-store">from ${o.store_name}</div>
              <div class="oh-price">₹${o.product_price}</div>
              <div class="oh-date">${date}</div>
            </div>
            <span class="oh-status ${o.status}">${
              o.status === 'accepted' ? '✓ Confirmed' :
              o.status === 'declined' ? 'Declined' : 'Pending'
            }</span>
          </div>`;
        }).join('');
      } else {
        section.style.display = 'block';
        list.innerHTML = '<div class="oh-empty">No orders yet 🛍️</div>';
      }
    } catch(err) {
      console.error('Customer orders error:', err);
    }
  } catch(e) {
    console.error('loadCustomerProfile error:', e);
  }
}

async function loadMyOrders() {
  const saved = JSON.parse(localStorage.getItem('nukkad_user') || '{}');
  const profileId = saved.profileId;
  const list = document.getElementById('my-orders-list');
  if (!list) return;

  if (!profileId) {
    list.innerHTML = '<div class="oh-empty">Log in to see your orders</div>';
    return;
  }

  try {
    const { data: orders, error } = await sb
      .from('orders')
      .select('*')
      .eq('buyer_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (orders && orders.length > 0) {
      list.innerHTML = orders.map(o => {
        const date = new Date(o.created_at).toLocaleDateString('en-IN', {
          day:'numeric', month:'short', year:'numeric'
        });
        return `<div class="oh-card">
          <div class="oh-left">
            <div class="oh-product">${o.product_name}</div>
            <div class="oh-store">from ${o.store_name}</div>
            <div class="oh-price">₹${o.product_price}</div>
            <div class="oh-date">${date}</div>
          </div>
          <span class="oh-status ${o.status}">${
            o.status === 'accepted' ? '✓ Confirmed' :
            o.status === 'declined' ? 'Declined' : 'Pending'
          }</span>
        </div>`;
      }).join('');
    } else {
      list.innerHTML = '<div class="oh-empty">No orders yet — start shopping! 🛍️</div>';
    }
  } catch(err) {
    console.error('My orders error:', err);
    list.innerHTML = '<div class="oh-empty">Could not load orders</div>';
  }
}

async function loadStores() {
  try {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(
        new Error('timeout')), 8000));
    const fetchReq = sb
      .from('stores')
      .select('*, products(*)')
      .order('created_at', { ascending: false });
    const { data: storesData, error } =
      await Promise.race([fetchReq, timeout]);
    if (error) throw error;
    const dbHandles = (storesData || [])
      .map(s => s.handle);
    const seedsToShow = SEEDS.filter(
      s => !dbHandles.includes(s.handle));
    allStores = [
      ...(storesData || []),
      ...seedsToShow
    ];
  } catch(e) {
    console.error('Supabase load error:', e);
    allStores = [...SEEDS];
  }
  filteredStores = [...allStores];
  renderMarket(filteredStores);
}

// ═══════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════
function showPg(name) {
  // Remember position for refresh
  if (name === 'create' || name === 'admin') {
    localStorage.removeItem('nukkad_last_page');
  } else {
    localStorage.setItem('nukkad_last_page',
      JSON.stringify({ page: name }));
  }
  history.pushState({page: name}, '', '?page=' + name);  // ← ADDED THIS
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
  document.getElementById('pg-' + name).classList.add('on');
  document.getElementById('bottom-nav').style.display = name === 'create' ? 'none' : 'flex';
  document.querySelectorAll('.bn').forEach(b => b.classList.remove('on'));
  const bn = document.getElementById('bn-' + name);
  if (bn) bn.classList.add('on');
  closePanel();
  document.getElementById('product-detail').classList.remove('open');
  // Hide Ask FAB on all pages except store profile
  const fab = document.getElementById('chat-fab');
  if (fab) fab.classList.remove('visible');
  const footer = document.getElementById('site-footer');
  if (footer) footer.style.display = (name === 'home' || name === 'market') ? 'block' : 'none';
  window.scrollTo(0, 0);
}

function openPanel() {
  const fab = document.getElementById('chat-fab');
  if (fab) fab.classList.remove('visible');
  const saved = JSON.parse(localStorage.getItem('nukkad_user') || '{}');

  if (!currentAuthUser) {
    // NOT logged in — show login prompt panel
    document.getElementById('pp-av').textContent = '👤';
    document.getElementById('nav-av-btn') && (document.getElementById('nav-av-btn').textContent = '👤');
    document.getElementById('pp-name').textContent = 'Not logged in';
    document.getElementById('pp-email').textContent = '';
    document.getElementById('pp-phone').textContent = '—';
    document.getElementById('pp-area').textContent = '—';
    document.getElementById('pp-city').textContent = '—';
    document.getElementById('pp-store-wrap').innerHTML = `
      <div class="pp-no-store" style="text-align:center;padding:1.5rem 1rem;">
        <div style="font-size:2.5rem;margin-bottom:0.8rem">🔒</div>
        <div style="font-weight:700;color:var(--ink);margin-bottom:0.4rem">Please log in first</div>
        <div style="font-size:0.8rem;color:var(--ink-light);margin-bottom:1.2rem">Log in to manage your store</div>
        <button class="btn-primary" style="font-size:0.85rem;padding:0.7rem 1.5rem;margin:0 auto" onclick="closePanel();openAuthModal('login')">Log In</button>
        <div style="margin-top:0.8rem;font-size:0.78rem;color:var(--ink-light)">New here? <span style="color:var(--earth);font-weight:600;cursor:pointer" onclick="closePanel();openAuthModal('signup')">Sign up free</span></div>
      </div>`;
    document.getElementById('profile-panel').classList.add('open');
    document.getElementById('panel-overlay').classList.add('open');
    return;
  }

  // LOGGED IN
  const initial = saved.name ? saved.name.charAt(0).toUpperCase() : currentAuthUser.email.charAt(0).toUpperCase();
  document.getElementById('pp-av').textContent = initial;
  const ppAv = document.getElementById('pp-av');
  if (saved.avatar_url) {
    ppAv.innerHTML = `<img src="${saved.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  }
  const ppUploadBtn = document.getElementById('pp-avatar-upload-btn');
  if (ppUploadBtn) ppUploadBtn.style.display = 'flex';
  document.getElementById('nav-av-btn') && (document.getElementById('nav-av-btn').textContent = initial);
  document.getElementById('pp-name').textContent = saved.name || currentAuthUser.email;
  document.getElementById('pp-email').textContent = saved.email || currentAuthUser.email;
  document.getElementById('pp-phone').textContent = saved.phone || '—';
  document.getElementById('pp-area').textContent = saved.area || '—';
  document.getElementById('pp-city').textContent = saved.city || '—';

  const storeWrap = document.getElementById('pp-store-wrap');
  storeWrap.innerHTML = '<div style="font-size:0.8rem;color:var(--ink-light);padding:0.5rem 0">Loading your stores...</div>';
  loadMyStores(storeWrap);

  document.getElementById('profile-panel').classList.add('open');
  document.getElementById('panel-overlay').classList.add('open');
}

function closePanel() {
  document.getElementById('profile-panel').classList.remove('open');
  document.getElementById('panel-overlay').classList.remove('open');
}

function goMyStore() {
  if (!currentAuthUser) {
    showToast('Please log in to access your store 🔒');
    setTimeout(() => openAuthModal('login'), 600);
    return;
  }
  const slug = localStorage.getItem('nukkad_store_slug');
  if (slug) {
    openStore(slug);
  } else {
    openPanel();
  }
  document.querySelectorAll('.bn').forEach(b => b.classList.remove('on'));
  document.getElementById('bn-mystore').classList.add('on');
}

function showProfile() {
  const saved = JSON.parse(localStorage.getItem('nukkad_user') || '{}');
  document.getElementById('pf-name').textContent = saved.name || '—';
  document.getElementById('pf-email').textContent = saved.email || '—';
  document.getElementById('pf-phone').textContent = saved.phone || '—';
  const addr = [saved.area, saved.city].filter(Boolean).join(', ');
  document.getElementById('pf-address').textContent = addr || '—';
  loadMyOrders();
  openPanel();
}
function goHome() { showPg('home'); }

// ═══════════════════════════════════
// MARKETPLACE
// ═══════════════════════════════════
function renderMarket(stores) {
  const grid = document.getElementById('stores-grid');
  document.getElementById('mkt-count').textContent = stores.length + ' stores';
  if (!stores.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🏪</div><div class="empty-title serif">No stores yet</div><p class="empty-sub">Be the first to create a store on Nukkad!</p><button class="btn-primary" onclick="startCreate()">Create My Store →</button></div>`;
    return;
  }
  grid.innerHTML = stores.map(s => {
    const bgColors = BG[s.bg_idx ?? 0];
    const bg = `linear-gradient(145deg, ${bgColors[0]}, ${bgColors[1]}, ${bgColors[2]}, ${bgColors[3]})`;
    const n = (s.products || []).length;
    return `<div class="store-card" onclick="openStore('${s.handle}')">
      <div class="sc-cover" style="background:${bg}"><div class="sc-avatar">${s.emoji}</div></div>
      <div class="sc-body">
        <div class="sc-name">${s.brand_name}</div>
        <div class="sc-tagline">${s.tagline}</div>
        <div class="sc-tags">
          <span class="sc-tag">${s.category}</span>
          ${s.city ? `<span class="sc-tag">📍 ${s.city}</span>` : ''}
        </div>
        <div class="sc-prods">🛍️ ${n} product${n !== 1 ? 's' : ''}</div>
        <div class="sc-wa-badge">💬 Orders via WhatsApp</div>
      </div>
    </div>`;
  }).join('');
}

function doFilter(cat, el) {
  document.querySelectorAll('.fchip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  if (cat === 'all') { filteredStores = [...allStores]; renderMarket(filteredStores); return; }
  const map = {hair:'hair',food:'food',baked:'baked',clothing:'clothing',decor:'decor',jewellery:'jewellery',herbal:'herbal'};
  filteredStores = allStores.filter(s => s.category.toLowerCase().includes(map[cat]||cat));
  renderMarket(filteredStores);
}

function doSearch() {
  const q = document.getElementById('search-inp').value.trim().toLowerCase();
  if (!q) { filteredStores = [...allStores]; renderMarket(filteredStores); return; }
  filteredStores = allStores.filter(s =>
    s.brand_name.toLowerCase().includes(q) ||
    s.tagline.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q) ||
    (s.products||[]).some(p => p.name.toLowerCase().includes(q))
  );
  renderMarket(filteredStores);
}

// ═══════════════════════════════════
// STORE VIEW
// ═══════════════════════════════════
// Seller story snippets by category — gives stores a human voice on day 1
const STORE_STORIES = {
  'Hair & Skincare': 'Started mixing oils in my kitchen after struggling with hair fall for years. Every product is something I made for myself first — tested, trusted, then shared.',
  'Home-cooked Food': 'Cooking has been my love language since childhood. During the pandemic I started packing tiffins for neighbours, and the response was overwhelming. This is that kitchen, now open to you.',
  'Baked Goods': 'Every order is baked fresh, the morning it ships. No freezer stock, no shortcuts — just real ingredients and a very warm oven.',
  'Handmade Clothing': 'I learnt to stitch watching my grandmother. Every piece takes 2–4 days to make. When you wear it, you carry a little of that patience with you.',
  'Home Decor': 'I make things I would want in my own home — things with texture, warmth, and a story. Nothing mass-produced, nothing disposable.',
  'Jewellery': 'Each piece starts as a sketch at 6am, before the house wakes up. I work in small batches so every order gets the attention it deserves.',
  'Herbal Products': 'My grandmother had a remedy for everything. I spent years learning those recipes — and now I make them available to anyone who wants to go back to basics.',
};

async function openStore(handle) {
  const s = allStores.find(x => x.handle === handle);
  if (!s) return;
  curStore = s;

  // Remember store position for refresh
  localStorage.setItem('nukkad_last_page',
    JSON.stringify({ page: 'store', store: handle }));

  // Fetch live status from Supabase (real-time toggle)
  try {
    const { data: freshStore, error: fetchErr } = await sb
      .from('stores')
      .select('is_accepting_orders, logo_url, story, cover_photos')
      .eq('handle', handle)
      .single();
    if (fetchErr) {
      console.warn('Store fetch error:', fetchErr.message);
    }
    if (freshStore) {
      // Explicitly handle null — treat null as true (open)
      s.is_accepting_orders =
        freshStore.is_accepting_orders === null
          ? true
          : freshStore.is_accepting_orders;
      if (freshStore.logo_url) s.logo_url = freshStore.logo_url;
      if (freshStore.story) s.story = freshStore.story;
      if (freshStore.cover_photos) s.cover_photos = freshStore.cover_photos;
      curStore = s;
    }
  } catch(e) {
    console.warn('Could not fetch live store data:', e);
  }

  // Cover
  const bgColors = BG[s.bg_idx ?? 0];
  const gradientStr = `linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1]}, ${bgColors[2]}, ${bgColors[3]}, ${bgColors[0]})`;
  document.getElementById('sv-cover').style.background = gradientStr;
  document.getElementById('sv-cover').style.backgroundSize = '300% 300%';

  // Render cover wall
  // (bubbles or photos depending on store)
  renderCoverWall(s);

  // Avatar + name + location
  const avEl = document.getElementById('sv-av');
  if (s.logo_url) {
    avEl.innerHTML = `<img src="${s.logo_url}" alt="${s.brand_name}">`;
  } else {
    avEl.textContent = s.emoji;
  }
  document.getElementById('sv-name').textContent = s.brand_name;
  const locParts = [s.area, s.city].filter(Boolean);
  document.getElementById('sv-location').textContent = locParts.length ? '📍 ' + locParts.join(', ') : '';

  // Tagline
  document.getElementById('sv-tagline').textContent = '';

  // Badges
  document.getElementById('sv-badges').innerHTML = '';

  // Story section — use store's own story or fallback by category
  const rawCat = (s.category || '').replace(/^[\p{Emoji}\s]+/u,'').trim();
  const storyText = s.story || STORE_STORIES[rawCat] || 'Every product here is made with care, in small batches, by hand. Thank you for supporting a home-based business.';
  document.getElementById('sv-story-text').textContent = storyText;
  document.getElementById('sv-story').style.display = 'flex';

  // Products — photo-first
  const allProds = s.products || [];
  const _ownerEmail = currentAuthUser ? currentAuthUser.email : null;
  const _isOwner = _ownerEmail && s.owner_email && _ownerEmail === s.owner_email;

  // ── Owner detection ──────────────────────────
  // Use email match (_isOwner) as primary check.
  // Fall back to slug/my_stores array for cases
  // where owner_email is missing from old stores.
  const mySlug = localStorage.getItem('nukkad_store_slug');
  const myStores = JSON.parse(localStorage.getItem('nukkad_my_stores') || '[]');
  const finalOwner = _isOwner ||
    mySlug === handle ||
    myStores.includes(handle) ||
    adminIsOwner(handle);

  // Show all products to owner, hide is_hidden products from buyers
  const prods = finalOwner
    ? allProds
    : allProds.filter(p => !p.is_hidden);

  const hiddenCount = finalOwner
    ? allProds.filter(p => p.is_hidden).length
    : 0;
  document.getElementById('sv-prod-title').textContent = hiddenCount > 0
    ? `Products (${prods.length} · ${hiddenCount} hidden)`
    : `Products (${prods.length})`;

  document.getElementById('sv-prod-grid').innerHTML = prods.map((p,i) => {
    const pId = p.id || `seed_${i}`;
    const safeName = p.name.replace(/'/g,"\\'");
    const imgHtml = p.image_url
      ? `<div class="sv-prod-img"><div class="img-blur-bg" style="background-image:url('${p.image_url}')"></div><img src="${p.image_url}" alt="${p.name}" loading="lazy"></div>`
      : `<div class="sv-prod-img" style="font-size:3rem;">${s.emoji}</div>`;
    return `<div class="sv-prod-card" onclick="openProductDetail('${handle}','${pId}')" style="${p.is_hidden && finalOwner ? 'opacity:0.45;' : ''}">
      ${imgHtml}
      <div class="sv-prod-body">
        <div class="sv-prod-name">${p.name}</div>
        <div class="sv-prod-desc">${p.description || ''}</div>
        <div class="sv-prod-footer">
          <span class="sv-prod-price">₹${p.price}</span>
          ${finalOwner
            ? `<button class="sv-edit-btn" onclick="openEditProduct(event,'${handle}','${pId}')">✏️ Edit</button>`
            : `<button class="sv-wa-btn" onclick="orderWA(event,'${safeName}','${p.price}')">Order</button>`
          }
        </div>
      </div>
    </div>`;
  }).join('');

  if (finalOwner) {
    document.getElementById('sv-prod-grid').innerHTML += `<div class="sv-prod-card" onclick="showAddProductModal()" style="display:flex;align-items:center;justify-content:center;min-height:240px;border:2px dashed var(--border);background:transparent;cursor:pointer;"><div style="text-align:center;color:var(--ink-light);"><div style="font-size:2rem;margin-bottom:0.4rem">+</div><div style="font-size:0.82rem;font-weight:600;">Add product</div></div></div>`;
  }

  if (prods.length === 0 && !finalOwner) {
    document.getElementById('sv-prod-grid').innerHTML =
      `<div style="grid-column:1/-1;text-align:center;
                   padding:2.5rem 1rem;color:var(--ink-faint);">
        <div style="font-size:2.5rem;margin-bottom:0.6rem">🌿</div>
        <div style="font-size:0.9rem;font-weight:600;
                    color:var(--ink-light);margin-bottom:0.3rem">
          Setting up catalog
        </div>
        <div style="font-size:0.8rem;">
          This seller is adding their products — check back soon!
        </div>
      </div>`;
  }

  // Render order status UI
  renderOrderStatus(s.is_accepting_orders, finalOwner);

  // Add product button
  document.getElementById('sv-add-prod-btn').style.display = finalOwner ? 'block' : 'none';

  // Cover edit button
  const coverEditBtn = document.getElementById('cover-edit-btn');
  if (coverEditBtn) {
    coverEditBtn.style.display = finalOwner ? 'block' : 'none';
  }

  // Logo upload button
  const uploadBtn = document.getElementById('sv-avatar-upload-btn');
  if (uploadBtn) {
    uploadBtn.style.display = finalOwner ? 'flex' : 'none';
  }

  // Dashboard is now in slide panel —
  // no inline dashboard on store page
  // Just pre-load the data silently for owners
  if (finalOwner) {
    loadSellerDashboard(handle);
  }

  // Dashboard button (opens slide panel)
  const dashBtn = document.getElementById('sv-dash-btn');
  if (dashBtn) {
    dashBtn.style.display = finalOwner ? 'inline-flex' : 'none';
  }

  // Story edit button
  const storyEditBtn = document.getElementById('sv-story-edit-btn');
  if (storyEditBtn) {
    storyEditBtn.style.display = finalOwner ? 'inline-block' : 'none';
  }

  // Reset enquiry form
  document.getElementById('enq-sheet-form').style.display = 'block';
  document.getElementById('enq-success').style.display = 'none';
  // Pre-fill enquiry form from buyer localStorage
  const _buyer = getBuyer();
  const _eqName = document.getElementById('eq-name');
  const _eqPhone = document.getElementById('eq-phone');
  const _eqProd = document.getElementById('eq-prod');
  const _eqNote = document.getElementById('eq-note');
  if (_eqName) _eqName.value = _buyer?.name || '';
  if (_eqPhone) _eqPhone.value = _buyer?.phone || '';
  if (_eqProd) _eqProd.value = '';
  if (_eqNote) _eqNote.value = '';

  history.pushState({page:'store', store: handle}, '', `?page=store&store=${handle}`);
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));
  document.getElementById('pg-store').classList.add('on');
  document.getElementById('bottom-nav').style.display = 'flex';
  document.getElementById('product-detail').classList.remove('open');
  document.getElementById('chat-fab').classList.add('visible');
  window.scrollTo(0,0);
}

// ═══════════════════════════════════
// AVATAR UPLOAD
// ═══════════════════════════════════

function triggerAvatarUpload() {
  document.getElementById('sv-avatar-file-input').click();
}

async function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file || !curStore) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image must be under 5MB');
    return;
  }
  showToast('Processing logo…');
  let logoFile = file;
  try {
    logoFile = await processProductImage(file, 400, 0.90);
  } catch(err) {
    console.warn('Logo processing failed:', err);
  }
  showToast('Uploading logo…');
  try {
    const fileName = `logos/${curStore.handle}_logo_${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await sb.storage
      .from('product-images')
      .upload(fileName, logoFile, { upsert: true });
    if (uploadError) throw uploadError;
    const { data: urlData } = sb.storage
      .from('product-images')
      .getPublicUrl(fileName);
    const logoUrl = urlData.publicUrl;
    const { error: updateError } = await sb
      .from('stores')
      .update({ logo_url: logoUrl })
      .eq('handle', curStore.handle);
    if (updateError) throw updateError;
    curStore.logo_url = logoUrl;
    const avEl = document.getElementById('sv-av');
    avEl.innerHTML = `<img src="${logoUrl}"
          alt="${curStore.brand_name}"
          style="width:100%;height:100%;
                 object-fit:cover;
                 border-radius:50%;">`;
    const storeIdx = allStores.findIndex(s => s.handle === curStore.handle);
    if (storeIdx > -1) allStores[storeIdx].logo_url = logoUrl;
    showToast('Logo updated! 🎉');
  } catch(err) {
    console.error('Avatar upload error:', err);
    showToast('Upload failed — please try again');
  }
  event.target.value = '';
}

// ═══════════════════════════════════
// COVER WALL SYSTEM
// ═══════════════════════════════════

let _coverPhotos    = []; // current store cover URLs
let _coverSlotIdx   = -1; // which slot is being replaced
let _coverAnimFrame = null;

// ── RENDER COVER ──────────────────
function renderCoverWall(store) {
  const wall = document.getElementById('sv-cover-wall');
  if (!wall) return;
  wall.innerHTML = '';

  // Cancel any running animation
  if (_coverAnimFrame) {
    cancelAnimationFrame(_coverAnimFrame);
    _coverAnimFrame = null;
  }

  const photos = store.cover_photos || [];

  if (photos.length > 0) {
    renderPhotoCover(wall, photos);
  } else {
    renderBubbleCover(wall, store.emoji || '🌿', store);
  }
}

// ── BUBBLE ANIMATION (default) ────
function renderBubbleCover(wall, emoji) {
  // Create 12 bubbles with random properties
  const bubbleCount = 12;
  for (let i = 0; i < bubbleCount; i++) {
    const size = 28 + Math.random() * 64; // 28-92px
    const left = 4 + Math.random() * 88;  // 4-92%
    const delay = Math.random() * -18;    // stagger
    const duration = 9 + Math.random() * 14; // 9-23s
    const opacityStart = 0.12 + Math.random() * 0.32;
    const opacityMid   = 0.2  + Math.random() * 0.35;

    const bub = document.createElement('div');
    bub.className = 'cover-bubble';
    // Calculate travel distance:
    // cover height (260px) + bubble size + buffer
    // Use negative px value to go upward
    const coverH = wall.offsetHeight || 260;
    const travel = -(coverH + size + 20);

    bub.style.cssText = `
      width:${size}px;
      height:${size}px;
      left:${left}%;
      bottom:${-size}px;
      font-size:${size * 0.55}px;
      background:rgba(255,255,255,${0.04 + Math.random() * 0.08});
      border:1px solid rgba(255,255,255,${0.1 + Math.random() * 0.15});
      animation-duration:${duration}s;
      animation-delay:${delay}s;
      --bub-opacity-start:${opacityStart};
      --bub-opacity-mid:${opacityMid};
      --bub-travel:${travel}px;
    `;
    if (curStore?.logo_url) {
      const img = document.createElement('img');
      img.src = curStore.logo_url;
      img.style.cssText = `
        width:100%;
        height:100%;
        object-fit:cover;
        border-radius:50%;
        opacity:0.85;
      `;
      bub.textContent = '';
      bub.appendChild(img);
    } else {
      bub.textContent = emoji;
    }
    wall.appendChild(bub);
  }
}

// ── PHOTO DRIFT ANIMATION ─────────
function renderPhotoCover(wall, photos) {
  if (!photos || photos.length === 0) return;

  const coverH = wall.offsetHeight || 260;
  // Each photo is square, height = cover height
  const photoSize = coverH;
  const gap = 12;

  // Create a film strip track
  // We duplicate the photos so the scroll
  // loops seamlessly — original + clone
  const track = document.createElement('div');
  track.style.cssText = `
    position:absolute;
    top:0;left:0;
    display:flex;
    align-items:stretch;
    height:100%;
    animation:filmScroll linear infinite;
    animation-duration:${photos.length * 4}s;
    will-change:transform;
  `;

  // Build the photo set twice for seamless loop
  const allPhotos = [...photos, ...photos];

  allPhotos.forEach((url, i) => {
    const img = document.createElement('img');
    img.src = url;
    img.style.cssText = `
      width:${photoSize}px;
      height:${photoSize}px;
      object-fit:cover;
      flex-shrink:0;
      margin-right:${gap}px;
      border-radius:0;
      display:block;
    `;
    track.appendChild(img);
  });

  wall.appendChild(track);

  // Set track width to exactly 2x content
  // so loop is seamless
  const totalW = allPhotos.length *
    (photoSize + gap);
  track.style.width = totalW + 'px';
}

// ── COVER EDITOR ──────────────────
function openCoverEditor() {
  _coverPhotos = [...(curStore?.cover_photos || [])];
  renderCoverPhotoGrid();
  document.getElementById('cover-editor-overlay').style.display = 'flex';
}

function closeCoverEditor() {
  document.getElementById('cover-editor-overlay').style.display = 'none';
}

function renderCoverPhotoGrid() {
  const grid = document.getElementById('cover-photo-grid');
  grid.innerHTML = '';
  const maxSlots = 8;

  for (let i = 0; i < maxSlots; i++) {
    const slot = document.createElement('div');
    slot.className = 'cover-photo-slot';
    const url = _coverPhotos[i];

    if (url) {
      slot.innerHTML = `
        <img src="${url}" alt="Cover photo">
        <div class="cover-slot-actions">
          <button class="cover-slot-rep"
                  onclick="replaceCoverSlot(${i})"
                  title="Replace">✏️</button>
          <button class="cover-slot-del"
                  onclick="deleteCoverSlot(${i})"
                  title="Remove">✕</button>
        </div>`;
    } else {
      slot.innerHTML = `
        <div class="slot-add">
          <span style="font-size:1.6rem">+</span>
          <span>Add photo</span>
        </div>`;
      slot.onclick = () => triggerCoverUpload(i);
    }
    grid.appendChild(slot);
  }
}

function triggerCoverUpload(slotIdx) {
  _coverSlotIdx = slotIdx;
  document.getElementById('cover-file-input').click();
}

function replaceCoverSlot(slotIdx) {
  _coverSlotIdx = slotIdx;
  document.getElementById('cover-file-input').click();
}

function deleteCoverSlot(slotIdx) {
  _coverPhotos.splice(slotIdx, 1);
  renderCoverPhotoGrid();
}

async function handleCoverPhotoUpload(event) {
  const file = event.target.files[0];
  if (!file || !curStore) return;
  event.target.value = '';
  showToast('Processing photo…');
  try {
    const processed = await processProductImage(file, 600, 0.88);
    const fileName = `covers/${curStore.handle}_${Date.now()}_${_coverSlotIdx}.jpg`;
    const { error: upErr } = await sb.storage
      .from('product-images')
      .upload(fileName, processed, { upsert: true });
    if (upErr) throw upErr;
    const { data: urlData } = sb.storage
      .from('product-images')
      .getPublicUrl(fileName);
    if (_coverSlotIdx >= 0) {
      _coverPhotos[_coverSlotIdx] = urlData.publicUrl;
    } else {
      _coverPhotos.push(urlData.publicUrl);
    }
    renderCoverPhotoGrid();
    showToast('Photo added ✓');
  } catch(err) {
    console.error('Cover upload error:', err);
    showToast('Upload failed — try again');
  }
}

async function saveCoverPhotos() {
  if (!curStore) return;
  const btn = document.getElementById('cover-save-btn');
  btn.textContent = 'Saving…';
  btn.disabled = true;

  // Filter out empty slots
  const photos = _coverPhotos.filter(Boolean);

  const { error } = await sb
    .from('stores')
    .update({ cover_photos: photos })
    .eq('handle', curStore.handle);

  if (error) {
    showToast('Save failed: ' + error.message);
    btn.textContent = 'Save cover';
    btn.disabled = false;
    return;
  }

  // Update local cache
  curStore.cover_photos = photos;
  const idx = allStores.findIndex(s => s.handle === curStore.handle);
  if (idx > -1) allStores[idx].cover_photos = photos;

  // Re-render cover wall
  renderCoverWall(curStore);

  btn.textContent = 'Save cover';
  btn.disabled = false;
  closeCoverEditor();
  showToast('Cover saved! 🎉');
}

async function resetCoverPhotos() {
  if (!confirm('Remove all cover photos? Default bubble animation will show instead.')) return;

  _coverPhotos = [];
  renderCoverPhotoGrid();
}

// ═══════════════════════════════════
// OWNER PRODUCT EDIT
// ═══════════════════════════════════

function openEditProduct(e, handle, productId) {
  e.stopPropagation();
  const store = allStores.find(s => s.handle === handle);
  if (!store) return;
  const product = (store.products || []).find(p => String(p.id) === String(productId));
  if (!product) return;
  document.getElementById('epm-prod-id').value = productId;
  document.getElementById('epm-handle').value = handle;
  document.getElementById('epm-name').value = product.name || '';
  document.getElementById('epm-price').value = product.price || '';
  document.getElementById('epm-desc').value = product.description || '';

  const curImgEl = document.getElementById('ep-current-img');
  curImgEl.innerHTML = product.image_url
    ? `<img src="${product.image_url}"
            style="width:100%;max-height:140px;
                   object-fit:cover;">`
    : '';
  _editExtraFiles = [];
  renderExtraPhotosGrid(product.images || []);

  // Set hide button label
  const hideBtn = document.getElementById('epm-hide-btn');
  if (hideBtn) {
    const isHidden = product.is_hidden === true;
    hideBtn.textContent = isHidden
      ? '👁 Show product'
      : '👁 Hide product';
    hideBtn.style.borderColor = isHidden
      ? 'var(--leaf)' : 'var(--border)';
    hideBtn.style.color = isHidden
      ? 'var(--leaf)' : 'var(--ink-mid)';
  }

  document.getElementById('edit-prod-modal').classList.add('open');
}

let _editExtraPhotos = [];   // saved URLs
let _editExtraFiles  = [];   // pending File objects
let _editExtraSlot   = -1;

function renderExtraPhotosGrid(images) {
  _editExtraPhotos = [...(images || [])];
  const grid = document.getElementById(
    'ep-extra-photos');
  if (!grid) return;
  const maxExtra = 5;
  grid.innerHTML = '';

  for (let i = 0; i < maxExtra; i++) {
    const slot = document.createElement('div');
    slot.style.cssText = `
      aspect-ratio:1;border-radius:8px;
      overflow:hidden;position:relative;
      background:var(--paper-deep);
      border:1.5px dashed var(--border);
      cursor:pointer;display:flex;
      align-items:center;justify-content:center;
      font-size:1.2rem;color:var(--ink-faint);
    `;
    const url = _editExtraPhotos[i];
    if (url) {
      slot.innerHTML = `
        <img src="${url}"
             style="width:100%;height:100%;
                    object-fit:cover;">
        <button onclick="removeExtraPhoto(${i})"
                style="position:absolute;top:2px;
                       right:2px;background:rgba(
                       220,50,50,0.85);color:white;
                       border:none;border-radius:50%;
                       width:18px;height:18px;
                       font-size:0.6rem;cursor:pointer;
                       display:flex;align-items:center;
                       justify-content:center;
                       font-weight:700;">✕</button>
      `;
    } else {
      slot.textContent = '+';
      slot.onclick = () => {
        _editExtraSlot = i;
        document.getElementById('ep-extra-file')
          .click();
      };
    }
    grid.appendChild(slot);
  }
}

function removeExtraPhoto(idx) {
  _editExtraPhotos.splice(idx, 1);
  renderExtraPhotosGrid(_editExtraPhotos);
}

function handleExtraPhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  event.target.value = '';
  const reader = new FileReader();
  reader.onload = (e) => {
    if (_editExtraSlot >= 0 &&
        _editExtraSlot < 5) {
      _editExtraFiles[_editExtraSlot] = file;
      _editExtraPhotos[_editExtraSlot] =
        e.target.result;
    } else {
      _editExtraFiles.push(file);
      _editExtraPhotos.push(e.target.result);
    }
    renderExtraPhotosGrid(_editExtraPhotos);
  };
  reader.readAsDataURL(file);
}

function closeEditProduct() {
  document.getElementById('edit-prod-modal').classList.remove('open');
}

async function saveEditProduct() {
  const productId = document.getElementById('epm-prod-id').value;
  const handle = document.getElementById('epm-handle').value;
  const name = document.getElementById('epm-name').value.trim();
  const price = document.getElementById('epm-price').value.trim();
  const desc = document.getElementById('epm-desc').value.trim();

  if (!name || !price) {
    showToast('Name and price are required');
    return;
  }

  const btn = document.getElementById('epm-save-btn');
  btn.textContent = 'Saving…'; btn.disabled = true;

  try {
    let image_url = null;

    // Check if a new (cropped) image was selected
    const modal2 = document.getElementById('edit-prod-modal');
    const imageFile = modal2._pendingMainPhoto || null;

    if (imageFile) {
      // Validate file
      if (!imageFile.type.startsWith('image/')) {
        showToast('Please select an image file');
        btn.textContent = 'Save'; btn.disabled = false;
        return;
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5MB');
        btn.textContent = 'Save'; btn.disabled = false;
        return;
      }

      showToast('Processing image…');
      let fileToUpload = imageFile;
      try {
        fileToUpload = await processProductImage(imageFile, 800, 0.85);
      } catch (err) {
        console.warn('Image processing failed, using original:', err);
        // Use original if processing fails
      }

      showToast('Uploading image…');

      const fileName = `products/${handle}_${productId}_${Date.now()}.jpg`;

      const { error: upErr } = await sb.storage
        .from('product-images')
        .upload(fileName, fileToUpload, { upsert: true });

      if (upErr) {
        console.error('Image upload error:', upErr);
        showToast('Image upload failed: ' + upErr.message);
        btn.textContent = 'Save'; btn.disabled = false;
        return;
      }

      const { data: urlData } = sb.storage
        .from('product-images')
        .getPublicUrl(fileName);

      image_url = urlData.publicUrl;
    }

    // Upload any pending extra photo files now
    const finalExtraUrls = [];
    for (let i = 0; i < _editExtraPhotos.length; i++) {
      const url = _editExtraPhotos[i];
      const file = _editExtraFiles[i];

      if (file) {
        // This is a new local file — upload now
        try {
          showToast(`Uploading photo ${i+1}…`);
          const processed = await processProductImage(
            file, 800, 0.85);
          const fileName =
            `products/${handle}_extra_` +
            `${productId}_${i}_${Date.now()}.jpg`;
          const { error: upErr } = await sb.storage
            .from('product-images')
            .upload(fileName, processed,
              { upsert: true });
          if (upErr) throw upErr;
          const { data: urlData } = sb.storage
            .from('product-images')
            .getPublicUrl(fileName);
          finalExtraUrls.push(urlData.publicUrl);
        } catch(err) {
          console.error('Extra photo upload err:', err);
          // Skip failed photo, continue saving
        }
      } else if (url && !url.startsWith('data:')) {
        // Already saved Supabase URL — keep it
        finalExtraUrls.push(url);
      }
      // Skip data: URLs without a file (shouldn't happen)
    }

    // Build update object
    const updates = {
      name, price, description: desc,
      images: finalExtraUrls
    };
    if (image_url) updates.image_url = image_url;

    // Save to Supabase
    const { error } = await sb
      .from('products')
      .update(updates)
      .eq('id', productId);

    if (error) {
      console.error('Product update error:', error);
      showToast('Save failed: ' + error.message);
      btn.textContent = 'Save'; btn.disabled = false;
      return;
    }

    // Update local allStores cache
    const store = allStores.find(s => s.handle === handle);
    if (store) {
      const prod = (store.products || []).find(p => String(p.id) === String(productId));
      if (prod) {
        prod.name = name; prod.price = price; prod.description = desc;
        prod.images = _editExtraPhotos.filter(Boolean);
        if (image_url) prod.image_url = image_url;
      }
    }

    // Reset pending photo + file input
    modal2._pendingMainPhoto = null;
    const epImgInput = document.getElementById('ep-image-file');
    if (epImgInput) epImgInput.value = '';

    closeEditProduct();
    openStore(handle);
    showToast('Product updated! ✓');

  } catch (err) {
    console.error('saveEditProduct error:', err);
    showToast('Something went wrong — try again');
    btn.textContent = 'Save'; btn.disabled = false;
  }
}

async function toggleHideProduct() {
  const productId = document.getElementById('epm-prod-id').value;
  const handle = document.getElementById('epm-handle').value;
  if (!productId || !handle) return;

  const store = allStores.find(s => s.handle === handle);
  const product = (store?.products || [])
    .find(p => String(p.id) === String(productId));
  if (!product) return;

  const newHidden = !product.is_hidden;

  const { error } = await sb
    .from('products')
    .update({ is_hidden: newHidden })
    .eq('id', productId);

  if (error) {
    showToast('Could not update — try again');
    return;
  }

  // Update local cache
  product.is_hidden = newHidden;

  // Update button label
  const hideBtn = document.getElementById('epm-hide-btn');
  if (hideBtn) {
    hideBtn.textContent = newHidden
      ? '👁 Show product'
      : '👁 Hide product';
    hideBtn.style.borderColor = newHidden
      ? 'var(--leaf)' : 'var(--border)';
    hideBtn.style.color = newHidden
      ? 'var(--leaf)' : 'var(--ink-mid)';
  }

  showToast(newHidden
    ? 'Product hidden from store'
    : 'Product visible again ✓');

  // Re-render store to reflect change
  closeEditProduct();
  openStore(handle);
}

async function deleteProduct() {
  const productId = document.getElementById('epm-prod-id').value;
  const handle = document.getElementById('epm-handle').value;
  if (!productId || !handle) return;

  const store = allStores.find(s => s.handle === handle);
  const product = (store?.products || [])
    .find(p => String(p.id) === String(productId));
  const productName = product?.name || 'this product';

  // Confirm before deleting
  if (!confirm(
    `Delete "${productName}"? This cannot be undone.`
  )) return;

  const { error } = await sb
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) {
    showToast('Could not delete — try again');
    console.error('Delete error:', error);
    return;
  }

  // Remove from local cache
  if (store) {
    store.products = (store.products || [])
      .filter(p => String(p.id) !== String(productId));
  }

  showToast('Product deleted ✓');
  closeEditProduct();
  openStore(handle);
}

function previewEditImage(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('ep-current-img').innerHTML =
      `<img src="${e.target.result}"
            style="width:100%;max-height:140px;
                   object-fit:contain;border-radius:10px;
                   background:var(--paper-deep);">`;
    // Store file for saveEditProduct
    const modal = document.getElementById('edit-prod-modal');
    modal._pendingMainPhoto = file;
  };
  reader.readAsDataURL(file);
}

// ═══════════════════════════════════
// OWNER STORY EDIT
// ═══════════════════════════════════

function toggleStoryEdit() {
  const textEl    = document.getElementById('sv-story-text');
  const inputEl   = document.getElementById('sv-story-input');
  const actionsEl = document.getElementById('sv-story-actions');
  const btn       = document.getElementById('sv-story-edit-btn');
  inputEl.value = textEl.textContent;
  textEl.style.display    = 'none';
  inputEl.style.display   = 'block';
  actionsEl.style.display = 'flex';
  btn.style.display       = 'none';
}

function cancelStoryEdit() {
  document.getElementById('sv-story-text').style.display    = 'block';
  document.getElementById('sv-story-input').style.display   = 'none';
  document.getElementById('sv-story-actions').style.display = 'none';
  document.getElementById('sv-story-edit-btn').style.display = 'inline-block';
}

async function saveStory() {
  if (!curStore || !curStore.handle) return;
  const story = document.getElementById(
    'sv-story-input').value.trim();
  if (!story) { showToast('Story cannot be empty'); return; }

  const { error } = await sb
    .from('stores')
    .update({ story })
    .eq('handle', curStore.handle);

  if (error) { showToast('Save failed — try again'); return; }

  curStore.story = story;
  const idx = allStores.findIndex(s =>
    s.handle === curStore.handle);
  if (idx > -1) allStores[idx].story = story;

  document.getElementById('sv-story-text').textContent = story;
  cancelStoryEdit();
  showToast('Story saved! ✓');
}

// ═══════════════════════════════════
// ORDER STATUS — REBUILT FROM SCRATCH
// ═══════════════════════════════════

function renderOrderStatus(isAccepting, isOwner) {
  // Treat null/undefined as true (open)
  const open = isAccepting !== false;

  const badge = document.getElementById('sv-status-badge');
  const dot = document.getElementById('sv-status-dot');
  const text = document.getElementById('sv-status-text');
  const toggleBtn = document.getElementById('sv-toggle-btn');

  if (!badge) return;

  // Badge: show to everyone if open, show to owner even if closed so they can reopen
  badge.style.display = (open || isOwner) ? 'inline-flex' : 'none';
  badge.className = open ? 'is-open' : 'is-closed';
  dot.className = open ? 'is-open' : 'is-closed';
  text.textContent = open ? 'Taking orders' : 'Not taking orders';

  // Toggle button: owner only
  if (toggleBtn) {
    toggleBtn.style.display = isOwner ? 'block' : 'none';
    toggleBtn.textContent = open ? '⏸ Pause orders' : '▶ Accept orders';
  }
}

async function toggleOrderStatus() {
  if (!curStore || !curStore.handle) {
    showToast('No store loaded');
    return;
  }

  const btn = document.getElementById('sv-toggle-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Saving...';
  }

  // Read current value fresh from Supabase
  const { data: fresh, error: readErr } = await sb
    .from('stores')
    .select('is_accepting_orders')
    .eq('handle', curStore.handle)
    .single();

  if (readErr) {
    showToast('Error reading status');
    console.error('Read error:', readErr);
    if (btn) btn.disabled = false;
    return;
  }

  // Compute new value — null/true → false, false → true
  const currentlyOpen = fresh.is_accepting_orders !== false;
  const newVal = !currentlyOpen;

  // Write new value to Supabase
  const { error: writeErr } = await sb
    .from('stores')
    .update({ is_accepting_orders: newVal })
    .eq('handle', curStore.handle);

  if (writeErr) {
    showToast('Save failed: ' + writeErr.message);
    console.error('Write error:', writeErr);
    if (btn) btn.disabled = false;
    return;
  }

  // Update local cache
  curStore.is_accepting_orders = newVal;
  const idx = allStores.findIndex(x => x.handle === curStore.handle);
  if (idx > -1) allStores[idx].is_accepting_orders = newVal;

  // Re-render status UI
  renderOrderStatus(newVal, true);

  if (btn) btn.disabled = false;
  showToast(newVal ? '✓ Now accepting orders' : 'Orders paused');
}

// ═══════════════════════════════════
// ADMIN PANEL
// ═══════════════════════════════════

function switchAdminTab(tab, el) {
  document.querySelectorAll('.admin-tab')
    .forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  ['stores','orders','users'].forEach(p => {
    const panel = document.getElementById('adm-panel-' + p);
    if (panel) panel.style.display = p === tab ? 'block' : 'none';
  });
}

async function loadAdminData() {
  if (!isAdmin()) return;
  showToast('Loading admin data…');

  try {
    // Fetch all stores
    const { data: stores } = await sb
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch all orders
    const { data: orders } = await sb
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch all users
    const { data: users } = await sb
      .from('seller_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    // ── Overview stats ──
    const storeList = stores || [];
    const orderList = orders || [];
    const userList  = users  || [];

    const activeStores = storeList.filter(
      s => s.is_accepting_orders !== false).length;

    const weekAgo = new Date(Date.now() - 7*24*60*60*1000);
    const weekOrders = orderList.filter(
      o => new Date(o.created_at) > weekAgo).length;

    const gmv = orderList
      .filter(o => o.status === 'accepted')
      .reduce((sum, o) => sum + (parseFloat(o.product_price) || 0), 0);

    document.getElementById('adm-total-stores').textContent = storeList.length;
    document.getElementById('adm-active-stores').textContent = activeStores;
    document.getElementById('adm-total-orders').textContent = orderList.length;
    document.getElementById('adm-week-orders').textContent = weekOrders;
    document.getElementById('adm-gmv').textContent =
      gmv > 0 ? '₹' + gmv.toLocaleString('en-IN') : '₹0';
    document.getElementById('adm-total-users').textContent = userList.length;

    // ── Render stores ──
    const storesEl = document.getElementById('adm-stores-list');
    if (storeList.length === 0) {
      storesEl.innerHTML = '<div class="adm-empty">No stores yet</div>';
    } else {
      storesEl.innerHTML = storeList.map(s => {
        const storeOrders = orderList.filter(o => o.store_handle === s.handle);
        const isOpen = s.is_accepting_orders !== false;
        return `<div class="adm-store-row">
          <div class="adm-store-emoji">${s.emoji || '🏪'}</div>
          <div class="adm-store-info">
            <div class="adm-store-name">${s.brand_name}</div>
            <div class="adm-store-meta">
              <span>@${s.handle}</span>
              <span>·</span>
              <span>${s.category || '—'}</span>
              <span>·</span>
              <span>${s.city || '—'}</span>
              <span>·</span>
              <span>${storeOrders.length} orders</span>
            </div>
          </div>
          <div class="adm-store-actions">
            <button class="adm-view-btn"
                    onclick="adminOpenStore('${s.handle}')">
              View
            </button>
            <button class="adm-view-btn"
                    style="background:var(--earth);"
                    onclick="adminEditStore('${s.handle}')">
              Edit
            </button>
            <button class="adm-toggle-btn ${isOpen ? 'active' : ''}"
                    id="adm-toggle-${s.handle}"
                    onclick="adminToggleStore('${s.handle}',${isOpen})">
              ${isOpen ? '✓ Open' : 'Paused'}
            </button>
          </div>
        </div>`;
      }).join('');
    }

    // ── Render orders ──
    const ordersEl = document.getElementById('adm-orders-list');
    if (orderList.length === 0) {
      ordersEl.innerHTML = '<div class="adm-empty">No orders yet</div>';
    } else {
      ordersEl.innerHTML = orderList
        .slice(0, 50)
        .map(o => {
          const date = new Date(o.created_at).toLocaleDateString('en-IN', {
            day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'
          });
          return `<div class="adm-order-row">
            <div class="adm-order-info">
              <div class="adm-order-product">${o.product_name}</div>
              <div class="adm-order-meta">
                Store: ${o.store_name} ·
                Buyer: ${o.buyer_name} ·
                📞 ${o.buyer_phone}<br>
                ₹${o.product_price} · ${date}
              </div>
            </div>
            <span class="adm-order-status ${o.status}">
              ${o.status}
            </span>
          </div>`;
        }).join('');
    }

    // ── Render users ──
    const usersEl = document.getElementById('adm-users-list');
    if (userList.length === 0) {
      usersEl.innerHTML = '<div class="adm-empty">No users yet</div>';
    } else {
      usersEl.innerHTML = userList.map(u => {
        const initial = u.name ? u.name.charAt(0).toUpperCase() : '?';
        return `<div class="adm-user-row">
          <div class="adm-user-av">${initial}</div>
          <div class="adm-user-info">
            <div class="adm-user-name">${u.name || 'Unknown'}</div>
            <div class="adm-user-meta">
              ${u.email || '—'} ·
              ${u.phone || '—'} ·
              ${[u.area,u.city].filter(Boolean).join(', ') || '—'}
            </div>
          </div>
        </div>`;
      }).join('');
    }

    showToast('Admin data loaded ✓');

  } catch(err) {
    console.error('Admin load error:', err);
    showToast('Failed to load admin data');
  }
}

function adminOpenStore(handle) {
  // View as customer — no owner controls
  _adminEditHandle = null;
  openStore(handle);
}

function adminEditStore(handle) {
  // View as owner — full owner controls
  _adminEditHandle = handle;
  openStore(handle);
  showToast('👑 Admin edit mode — owner controls active');
}

async function adminToggleStore(handle, currentlyOpen) {
  const newVal = !currentlyOpen;
  const { error } = await sb
    .from('stores')
    .update({ is_accepting_orders: newVal })
    .eq('handle', handle);

  if (error) {
    showToast('Toggle failed: ' + error.message);
    return;
  }

  // Update button
  const btn = document.getElementById('adm-toggle-' + handle);
  if (btn) {
    btn.textContent = newVal ? '✓ Open' : 'Paused';
    btn.className = 'adm-toggle-btn' + (newVal ? ' active' : '');
    btn.onclick = () => adminToggleStore(handle, newVal);
  }
  showToast(newVal ? `${handle} is now open` : `${handle} paused`);
}

// ═══════════════════════════════════
// PROFILE PHOTO UPLOAD
// ═══════════════════════════════════

function triggerProfilePhotoUpload() {
  document.getElementById('pp-avatar-file-input').click();
}

async function handleProfilePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file || !currentAuthUser) return;
  if (file.size > 3 * 1024 * 1024) { showToast('Image must be under 3 MB'); return; }

  const ext  = file.name.split('.').pop();
  const path = `avatars/${currentAuthUser.id}.${ext}`;

  const { error: upErr } = await sb.storage
    .from('product-images')
    .upload(path, file, { upsert: true });

  if (upErr) { showToast('Upload failed — please try again'); return; }

  const { data } = sb.storage.from('product-images').getPublicUrl(path);
  const url = data.publicUrl;

  await sb
    .from('seller_profiles')
    .upsert({ user_id: currentAuthUser.id, avatar_url: url }, { onConflict: 'user_id' });

  const saved = JSON.parse(localStorage.getItem('nukkad_user') || '{}');
  saved.avatar_url = url;
  localStorage.setItem('nukkad_user', JSON.stringify(saved));

  const ppAv = document.getElementById('pp-av');
  if (ppAv) ppAv.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;

  showToast('Profile photo updated!');
  event.target.value = '';
}

// ═══════════════════════════════════
// SELLER DASHBOARD
// ═══════════════════════════════════

function switchDashTab(tab, el) {
  document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('dash-pending').style.display = tab === 'pending' ? 'block' : 'none';
  document.getElementById('dash-accepted').style.display = tab === 'accepted' ? 'block' : 'none';
  document.getElementById('dash-analytics').style.display = tab === 'analytics' ? 'block' : 'none';
}

async function loadSellerDashboard(storeHandle) {
  try {
    const { data: orders, error } = await sb
      .from('orders')
      .select('*')
      .eq('store_handle', storeHandle)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const pending = (orders || []).filter(o => o.status === 'pending');
    const accepted = (orders || []).filter(o => o.status === 'accepted');

    // Pending count badge
    document.getElementById('dash-pending-count').textContent = pending.length;
    document.getElementById('dash-pending-count').style.display = pending.length ? 'inline' : 'none';

    // Render pending
    document.getElementById('dash-pending-list').innerHTML = pending.length
      ? pending.map(o => renderOrderCard(o, true)).join('')
      : '<div class="dash-empty">No pending orders yet 🌿</div>';

    // Render accepted
    document.getElementById('dash-accepted-list').innerHTML = accepted.length
      ? accepted.map(o => renderOrderCard(o, false)).join('')
      : '<div class="dash-empty">No accepted orders yet</div>';

    // Analytics
    const totalRevenue = accepted.reduce((sum, o) => sum + (parseFloat(o.product_price) || 0), 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = accepted.filter(o => new Date(o.created_at) > weekAgo).length;

    // Top product
    const productCounts = {};
    accepted.forEach(o => { productCounts[o.product_name] = (productCounts[o.product_name] || 0) + 1; });
    const topProduct = Object.entries(productCounts).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';

    document.getElementById('an-total-orders').textContent = accepted.length;
    document.getElementById('an-revenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');
    document.getElementById('an-this-week').textContent = thisWeek;
    document.getElementById('an-top-product').textContent = topProduct.length > 12 ? topProduct.slice(0,12)+'…' : topProduct;

  } catch(err) {
    console.error('Dashboard load error:', err);
  }
}

function renderOrderCard(order, showActions) {
  const time = new Date(order.created_at).toLocaleString('en-IN', {
    day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'
  });
  const location = [order.buyer_area, order.buyer_city].filter(Boolean).join(', ');

  return `<div class="dash-order-card" id="order-${order.id}">
    <div class="dash-order-info">
      <div class="dash-order-product">${order.product_name}</div>
      <div class="dash-order-price">₹${order.product_price}</div>
      <div class="dash-order-buyer">
        👤 ${order.buyer_name}<br>
        📞 ${order.buyer_phone}
        ${location ? `<br>📍 ${location}` : ''}
      </div>
      <div class="dash-order-time">${time}</div>
    </div>
    <div class="dash-order-actions">
      ${showActions
        ? `<button class="dash-accept-btn" onclick="updateOrder('${order.id}','accepted')">✓ Accept</button>
           <button class="dash-decline-btn" onclick="updateOrder('${order.id}','declined')">Decline</button>`
        : `<span class="dash-status-badge accepted">✓ Accepted</span>`
      }
    </div>
  </div>`;
}

async function updateOrder(orderId, status) {
  try {
    const { error } = await sb
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    if (error) throw error;
    showToast(status === 'accepted' ? '✓ Order accepted!' : 'Order declined');
    await loadSellerDashboard(curStore.handle);
  } catch(err) {
    showToast('Error updating order');
    console.error(err);
  }
}

// ═══════════════════════════════════
// STORY CARD SYSTEM — REBUILT
// Two types: store card + product card
// With QR code + download
// ═══════════════════════════════════

let _storyCardType = 'store';
let _storyCardProduct = null;
const CARD_W = 1080;
const CARD_H = 1920;

function openShareCard() {
  if (!curStore) return;

  // Reset to store card type
  _storyCardType = 'store';
  _storyCardProduct = null;

  // Populate product selector
  const select = document.getElementById('sct-product-select');
  select.innerHTML = '';
  const prods = curStore.products || [];
  prods.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = p.name + ' — ₹' + p.price;
    select.appendChild(opt);
  });

  // Show store tab active
  switchStoryCardType('store');

  // Open modal
  document.getElementById('share-card-modal').style.display = 'flex';
}

function closeShareCard() {
  document.getElementById('share-card-modal').style.display = 'none';
}

function switchStoryCardType(type) {
  _storyCardType = type;

  const storeBtn = document.getElementById('sct-store-btn');
  const productBtn = document.getElementById('sct-product-btn');
  const productSel = document.getElementById('sct-product-selector');

  if (type === 'store') {
    storeBtn.style.background = 'var(--ink)';
    storeBtn.style.color = 'white';
    storeBtn.style.borderColor = 'var(--ink)';
    productBtn.style.background = 'white';
    productBtn.style.color = 'var(--ink-mid)';
    productBtn.style.borderColor = 'var(--border)';
    productSel.style.display = 'none';
    generateStoryCard();
  } else {
    productBtn.style.background = 'var(--ink)';
    productBtn.style.color = 'white';
    productBtn.style.borderColor = 'var(--ink)';
    storeBtn.style.background = 'white';
    storeBtn.style.color = 'var(--ink-mid)';
    storeBtn.style.borderColor = 'var(--border)';
    productSel.style.display = 'block';
    updateProductStoryCard();
  }
}

function updateProductStoryCard() {
  const select = document.getElementById('sct-product-select');
  const idx = parseInt(select.value);
  const prods = curStore?.products || [];
  _storyCardProduct = prods[idx] || null;
  generateStoryCard();
}

async function generateStoryCard() {
  const loading = document.getElementById('story-card-loading');
  loading.style.display = 'flex';

  const canvas = document.getElementById('story-card-canvas');
  canvas.width  = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');

  // Generate QR first
  const storeUrl = window.location.origin +
    window.location.pathname +
    '?store=' + (curStore?.handle || '');

  const productUrl = _storyCardProduct?.id
    ? storeUrl + '&product=' + _storyCardProduct.id
    : storeUrl;

  const qrUrl = _storyCardType === 'product'
    ? productUrl : storeUrl;

  const qrDataUrl = await generateQRDataUrl(qrUrl);

  if (_storyCardType === 'store') {
    await drawStoreCard(ctx, qrDataUrl);
  } else {
    await drawProductCard(ctx, qrDataUrl);
  }

  loading.style.display = 'none';
}

function generateQRDataUrl(url) {
  return new Promise((resolve) => {
    const div = document.getElementById('qr-gen-div');
    div.innerHTML = '';
    try {
      const qr = new QRCode(div, {
        text: url,
        width: 200,
        height: 200,
        colorDark: '#1A0F0A',
        colorLight: '#FFFFFF',
        correctLevel: QRCode.CorrectLevel.H
      });
      // Wait for QR to render
      setTimeout(() => {
        const img = div.querySelector('img') ||
          div.querySelector('canvas');
        if (img) {
          if (img.tagName === 'IMG') {
            resolve(img.src);
          } else {
            resolve(img.toDataURL());
          }
        } else {
          resolve(null);
        }
      }, 300);
    } catch(e) {
      console.error('QR error:', e);
      resolve(null);
    }
  });
}

// Get gradient colors from BG array
function getStoreGradient(ctx) {
  const bgColors = BG[curStore?.bg_idx ?? 0];
  const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  if (Array.isArray(bgColors)) {
    grad.addColorStop(0,    bgColors[0]);
    grad.addColorStop(0.33, bgColors[1]);
    grad.addColorStop(0.66, bgColors[2]);
    grad.addColorStop(1,    bgColors[3] || bgColors[0]);
  } else {
    grad.addColorStop(0, '#3d6b4a');
    grad.addColorStop(1, '#c8902a');
  }
  return grad;
}

async function drawStoreCard(ctx, qrDataUrl) {
  // Background gradient
  ctx.fillStyle = getStoreGradient(ctx);
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Dark overlay for text readability
  const overlay = ctx.createLinearGradient(0, CARD_H * 0.4, 0, CARD_H);
  overlay.addColorStop(0, 'rgba(0,0,0,0)');
  overlay.addColorStop(1, 'rgba(0,0,0,0.65)');
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Nukkad branding top
  ctx.font = '500 52px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.letterSpacing = '4px';
  ctx.fillText('NUKKAD ·', 80, 120);

  // Store emoji or logo — large center
  if (curStore?.logo_url) {
    // Draw circular logo image
    try {
      const logoImg = await loadImage(curStore.logo_url);
      const logoSize = 420;
      const logoX = (CARD_W - logoSize) / 2;
      const logoY = CARD_H * 0.22;
      // White circle background
      ctx.save();
      ctx.beginPath();
      ctx.arc(CARD_W/2, logoY + logoSize/2,
        logoSize/2 + 24, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fill();
      // Clip to circle
      ctx.beginPath();
      ctx.arc(CARD_W/2, logoY + logoSize/2,
        logoSize/2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImg,
        logoX, logoY, logoSize, logoSize);
      ctx.restore();
    } catch(e) {
      // Fallback to emoji if image fails
      ctx.font = '320px serif';
      ctx.textAlign = 'center';
      ctx.fillText(curStore?.emoji || '🌿',
        CARD_W/2, CARD_H * 0.42);
    }
  } else {
    ctx.font = '320px serif';
    ctx.textAlign = 'center';
    ctx.fillText(curStore?.emoji || '🌿',
      CARD_W/2, CARD_H * 0.42);
  }

  // Store name
  ctx.font = 'bold 140px Georgia, serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 20;
  wrapText(ctx, curStore?.brand_name || 'My Store',
    CARD_W/2, CARD_H * 0.60, CARD_W - 160, 158);
  ctx.shadowBlur = 0;

  // Tagline
  ctx.font = '400 60px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.textAlign = 'center';
  const tagline = curStore?.tagline || curStore?.category || '';
  if (tagline) {
    ctx.fillText(tagline.slice(0, 45), CARD_W/2, CARD_H * 0.69);
  }

  // Shop now pill
  ctx.shadowBlur = 0;
  const pillW = 380; const pillH = 100;
  const pillX = (CARD_W - pillW) / 2;
  const pillY = CARD_H * 0.76;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundRect(ctx, pillX, pillY, pillW, pillH, 50);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  roundRect(ctx, pillX, pillY, pillW, pillH, 50);
  ctx.stroke();
  ctx.font = 'bold 52px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText('🛍️  Shop now', CARD_W/2, pillY + 66);

  // QR code bottom left
  if (qrDataUrl) {
    await drawQR(ctx, qrDataUrl);
  }

  // Store URL bottom
  ctx.font = '400 44px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.textAlign = 'right';
  ctx.fillText('nukkad.in/' + (curStore?.handle || ''), CARD_W - 80, CARD_H - 80);
}

async function drawProductCard(ctx, qrDataUrl) {
  const p = _storyCardProduct;

  // Dark background base
  ctx.fillStyle = '#0d0905';
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Product image — top 58% of card
  if (p?.image_url) {
    try {
      const img = await loadImage(p.image_url);
      // Fill top portion maintaining aspect
      const imgH = Math.round(CARD_H * 0.55);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, CARD_W, imgH);
      ctx.clip();

      // Draw blurred background first
      const bgScale = Math.max(
        CARD_W / img.width, imgH / img.height) * 1.1;
      const bgW = img.width * bgScale;
      const bgH = img.height * bgScale;
      const bgX = (CARD_W - bgW) / 2;
      const bgY = (imgH - bgH) / 2;
      ctx.save();
      ctx.filter = 'blur(20px) brightness(0.6)';
      ctx.drawImage(img, bgX, bgY, bgW, bgH);
      ctx.filter = 'none';
      ctx.restore();

      // Draw full image contained (never cropped)
      const containScale = Math.min(
        CARD_W / img.width, imgH / img.height);
      const dw = img.width * containScale;
      const dh = img.height * containScale;
      const dx = (CARD_W - dw) / 2;
      const dy = (imgH - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);

      ctx.restore();

      // Deeper gradient fade for cleaner transition
      const fade = ctx.createLinearGradient(0, imgH * 0.6, 0, imgH + 40);
      fade.addColorStop(0, 'rgba(13,9,5,0)');
      fade.addColorStop(1, 'rgba(13,9,5,1)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, imgH * 0.6, CARD_W, imgH * 0.4 + 40);
    } catch(e) {
      // No image — use store gradient
      ctx.fillStyle = getStoreGradient(ctx);
      ctx.fillRect(0, 0, CARD_W, Math.round(CARD_H * 0.58));
      ctx.font = '200px serif';
      ctx.textAlign = 'center';
      ctx.fillText(curStore?.emoji || '🌿', CARD_W/2, CARD_H * 0.3);
    }
  } else {
    // No image — use gradient + emoji
    ctx.fillStyle = getStoreGradient(ctx);
    ctx.fillRect(0, 0, CARD_W, Math.round(CARD_H * 0.58));
    ctx.font = '200px serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(curStore?.emoji || '🌿', CARD_W/2, CARD_H * 0.28);
  }

  // Nukkad branding top left
  ctx.font = '500 48px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '3px';
  ctx.fillText('NUKKAD ·', 80, 110);

  // Product name — large, below image
  const nameY = CARD_H * 0.645;
  ctx.font = 'bold 108px Georgia, serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 20;
  wrapText(ctx, p?.name || 'Product', 80, nameY, CARD_W - 160, 136);
  ctx.shadowBlur = 0;

  // Price — gold, prominent
  ctx.font = 'bold 124px Georgia, serif';
  ctx.fillStyle = '#C8902A';
  ctx.textAlign = 'left';
  ctx.fillText('₹' + (p?.price || '—'), 80, CARD_H * 0.765);

  // Description snippet
  if (p?.description) {
    ctx.font = '400 46px Plus Jakarta Sans,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'left';
    const desc = p.description.slice(0, 50) +
      (p.description.length > 50 ? '…' : '');
    ctx.fillText(desc, 80, CARD_H * 0.82);
  }

  // Store name pill top right
  const storeName = curStore?.brand_name || '';
  ctx.font = '600 44px Plus Jakarta Sans, sans-serif';
  const snW = ctx.measureText(storeName).width;
  const snPad = 40;
  const snPillW = snW + snPad * 2;
  const snPillH = 80;
  const snX = CARD_W - snPillW - 60;
  const snY = 60;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, snX, snY, snPillW, snPillH, 40);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.textAlign = 'left';
  ctx.fillText(storeName, snX + snPad, snY + 54);

  // QR code bottom left
  if (qrDataUrl) {
    await drawQR(ctx, qrDataUrl);
  }

  ctx.font = '400 40px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.textAlign = 'right';
  // Vertically center URL with QR
  // QR center = CARD_H - 180 - 50 + 90 = CARD_H - 140
  ctx.fillText('nukkad.in/' + (curStore?.handle || ''), CARD_W - 60, CARD_H - 130);
}

// Draw QR in bottom left corner
async function drawQR(ctx, qrDataUrl) {
  if (!qrDataUrl) return;
  try {
    const qrImg = await loadImage(qrDataUrl);
    const qrSize = 180;
    const qrX = 60;
    const qrY = CARD_H - qrSize - 50;
    // White background behind QR
    ctx.fillStyle = 'white';
    roundRect(ctx, qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 16);
    ctx.fill();
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
  } catch(e) {
    console.warn('QR draw error:', e);
  }
}

// Load image from URL returning Image object
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Wrap long text across multiple lines
function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' ');
  let line = '';
  let cy = y;
  words.forEach((word, i) => {
    const test = line + (line ? ' ' : '') + word;
    if (ctx.measureText(test).width > maxW && line !== '') {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineH;
    } else {
      line = test;
    }
  });
  if (line) ctx.fillText(line, x, cy);
}

// Draw rounded rectangle path
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function downloadStoryCard() {
  const canvas = document.getElementById('story-card-canvas');
  const type = _storyCardType;
  const name = type === 'product' && _storyCardProduct
    ? 'nukkad_' + (_storyCardProduct.name || 'product').replace(/\s+/g,'_').toLowerCase()
    : 'nukkad_' + (curStore?.handle || 'store');

  const link = document.createElement('a');
  link.download = name + '_story.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('Story card downloaded! 🎉');
}

function copyStoreLink() {
  if (!curStore) return;
  const link = window.location.origin + window.location.pathname + '?store=' + curStore.handle;
  navigator.clipboard?.writeText(link).catch(() => {});
  showToast('Store link copied! 🔗');
}

// Order on WhatsApp directly from product card
function orderWA(e, productName, price) {
  e.stopPropagation();
  e.preventDefault();
  const card = e.target.closest('.sv-prod-card');
  const img = card?.querySelector('img');
  const imageUrl = img?.src || '';
  startBuyerOrder(productName, price, imageUrl);
}

// Product detail overlay
function openProductDetail(handle, productId) {
  const s = allStores.find(x => x.handle === handle);
  if (!s) return;
  const p = (s.products||[]).find((x,i) =>
    (x.id || `seed_${i}`) === productId);
  if (!p) return;
  curStore = s;

  // ── Top bar ──
  const pillAv = document.getElementById(
    'pd-store-pill-av');
  const pillName = document.getElementById(
    'pd-store-pill-name');
  if (s.logo_url) {
    pillAv.innerHTML =
      `<img src="${s.logo_url}" alt="${s.brand_name}">`;
  } else {
    pillAv.textContent = s.emoji || '🌿';
  }
  pillName.textContent = s.brand_name;

  // ── Images ──
  // Collect all images: main + extras from images[]
  const allImgs = [];
  if (p.image_url) allImgs.push(p.image_url);
  if (Array.isArray(p.images)) {
    p.images.forEach(u => {
      if (u && u !== p.image_url) allImgs.push(u);
    });
  }

  let currentImgIdx = 0;

  function showImage(idx) {
    currentImgIdx = idx;
    const heroImg = document.getElementById(
      'pd-hero-img');
    const counter = document.getElementById(
      'pd-img-counter');
    const hero = document.getElementById('pd-hero');

    if (allImgs.length > 0) {
      heroImg.src = allImgs[idx];
      heroImg.style.display = 'block';
      // Set or update blur background
      let blurBg = hero.querySelector('.pd-hero-blur-bg');
      if (!blurBg) {
        blurBg = document.createElement('div');
        blurBg.className = 'pd-hero-blur-bg';
        hero.insertBefore(blurBg, hero.firstChild);
      }
      blurBg.style.backgroundImage = `url('${allImgs[idx]}')`;
    } else {
      heroImg.style.display = 'none';
      hero.innerHTML =
        `<div class="pd-hero-placeholder">
          ${s.emoji || '🌿'}
        </div>`;
    }

    // Counter
    if (allImgs.length > 1) {
      counter.textContent =
        `${idx + 1} / ${allImgs.length}`;
      counter.style.display = 'block';
    } else {
      counter.style.display = 'none';
    }

    // Update active thumb
    document.querySelectorAll('.pd-thumb')
      .forEach((t, i) => {
        t.classList.toggle('active', i === idx);
      });
  }

  // Thumbnails
  const thumbsEl = document.getElementById('pd-thumbs');
  if (allImgs.length > 1) {
    thumbsEl.style.display = 'flex';
    thumbsEl.innerHTML = allImgs.map((url, i) =>
      `<img class="pd-thumb ${i===0?'active':''}"
            src="${url}"
            onclick="pdShowImage(${i})">`
    ).join('');
  } else {
    thumbsEl.style.display = 'none';
    thumbsEl.innerHTML = '';
  }

  showImage(0);

  // Store showImage globally for thumb clicks
  window.pdShowImage = showImage;

  // ── Info ──
  const catMap = {
    'Hair & Skincare':'💄',
    'Home-cooked Food':'🍽️',
    'Baked Goods':'🧁',
    'Handmade Clothing':'👗',
    'Home Decor':'🏡',
    'Jewellery':'💍',
    'Herbal Products':'🌿',
    'Other':'⭐',
  };
  const catIcon = catMap[s.category] || '⭐';
  document.getElementById('pd-category-tag')
    .textContent = catIcon + ' ' +
    (s.category || 'Other');
  document.getElementById('pd-name')
    .textContent = p.name;
  document.getElementById('pd-price')
    .textContent = '₹' + p.price;

  // Sub description (first line of desc as subtitle)
  const subDescEl = document.getElementById(
    'pd-sub-desc');
  if (p.description) {
    const firstLine = p.description
      .split('.')[0].trim();
    subDescEl.textContent = firstLine.length > 60
      ? '' : firstLine;
  } else {
    subDescEl.textContent = '';
  }

  // ── Seller card ──
  const avEl = document.getElementById('pd-seller-av');
  if (s.logo_url) {
    avEl.innerHTML =
      `<img src="${s.logo_url}" alt="${s.brand_name}">`;
  } else {
    avEl.textContent = s.emoji || '🌿';
  }
  document.getElementById('pd-seller-name')
    .textContent = s.brand_name;
  document.getElementById('pd-seller-loc')
    .textContent = '📍 ' +
    ([s.area, s.city].filter(Boolean).join(', ') ||
    'India');

  // ── Feature icons by category ──
  const featureMap = {
    'Hair & Skincare':[
      {icon:'🌿',title:'Natural Ingredients',
        sub:'No harsh chemicals'},
      {icon:'🏠',title:'Handcrafted',
        sub:'Small batch made'},
      {icon:'✅',title:'Skin Safe',
        sub:'All skin types'},
      {icon:'💚',title:'Cruelty Free',
        sub:'Never tested on animals'},
    ],
    'Home-cooked Food':[
      {icon:'🏠',title:'Home Cooked',
        sub:'Made with love at home'},
      {icon:'🌿',title:'No Preservatives',
        sub:'Fresh & natural'},
      {icon:'⚡',title:'Fresh Daily',
        sub:'Prepared fresh daily'},
      {icon:'🚚',title:'Quick Delivery',
        sub:'WhatsApp to confirm'},
    ],
    'Baked Goods':[
      {icon:'🏠',title:'Home Baked',
        sub:'Fresh from scratch'},
      {icon:'🥚',title:'Quality Ingredients',
        sub:'Only the best used'},
      {icon:'🎂',title:'Custom Orders',
        sub:'Made just for you'},
      {icon:'📦',title:'Safe Packaging',
        sub:'Packed with care'},
    ],
    'Handmade Clothing':[
      {icon:'✋',title:'Handmade',
        sub:'Crafted with care'},
      {icon:'🎨',title:'Custom Designs',
        sub:'Made to your taste'},
      {icon:'📏',title:'Custom Sizing',
        sub:'Perfect fit guaranteed'},
      {icon:'🌿',title:'Quality Fabric',
        sub:'Premium materials'},
    ],
    'Home Decor':[
      {icon:'✋',title:'Handcrafted',
        sub:'Made by artisans'},
      {icon:'🎨',title:'Unique Pieces',
        sub:'No two alike'},
      {icon:'📦',title:'Safe Packaging',
        sub:'Delivered safely'},
      {icon:'🏆',title:'Premium Quality',
        sub:'Built to last'},
    ],
    'Jewellery':[
      {icon:'💎',title:'Premium Quality',
        sub:'Carefully crafted'},
      {icon:'✋',title:'Handmade',
        sub:'Artisan crafted'},
      {icon:'📦',title:'Gift Ready',
        sub:'Beautiful packaging'},
      {icon:'✅',title:'Skin Safe',
        sub:'No allergic materials'},
    ],
    'Herbal Products':[
      {icon:'🌿',title:'100% Natural',
        sub:'Pure ingredients'},
      {icon:'🏠',title:'Homemade',
        sub:'Traditional recipes'},
      {icon:'✅',title:'Chemical Free',
        sub:'No artificial additives'},
      {icon:'💚',title:'Eco Friendly',
        sub:'Good for the planet'},
    ],
  };

  // Default features for any other category
  const features = featureMap[s.category] || [
    {icon:'🏆',title:'Premium Quality',
      sub:'Carefully selected & inspected'},
    {icon:'📸',title:'Highly Detailed',
      sub:'Realistic finish inside out'},
    {icon:'📦',title:'Secure Packaging',
      sub:'Safe delivery with extra protection'},
    {icon:'🚚',title:'Pan India Shipping',
      sub:'Fast & reliable delivery'},
  ];

  document.getElementById('pd-features').innerHTML =
    features.map(f => `
      <div class="pd-feature">
        <div class="pd-feature-icon">${f.icon}</div>
        <div class="pd-feature-title">${f.title}</div>
        <div class="pd-feature-sub">${f.sub}</div>
      </div>
    `).join('');

  // ── Description + specs ──
  const descSection = document.getElementById(
    'pd-desc-section');
  const descEl = document.getElementById('pd-desc');
  const specsEl = document.getElementById('pd-specs');

  if (p.description) {
    descEl.textContent = p.description;
    descSection.style.display = 'block';
  } else {
    descSection.style.display = 'none';
  }
  specsEl.innerHTML = '';

  // ── Trust strip ──
  document.getElementById('pd-trust-strip')
    .innerHTML = `
    <div class="pd-trust-item">
      <span>🔒</span> Safe & Secure Transaction
    </div>
    <span style="color:var(--border)">|</span>
    <div class="pd-trust-item">
      <span>🔄</span> Easy Returns
    </div>
  `;

  // ── Buttons ──
  document.getElementById('pd-wa-btn').onclick = () => {
    const imageUrl = allImgs[0] || '';
    startBuyerOrder(p.name, p.price, imageUrl);
  };
  document.getElementById('pd-enquire-btn').onclick = () => {
    startBuyerOrder('Enquiry about ' + p.name, '', '');
  };

  document.getElementById('product-detail')
    .classList.add('open');
  history.pushState(
    {page:'product', store:handle, product:productId},
    '',
    `?page=store&store=${handle}&product=${productId}`
  );
  window.scrollTo(0,0);
}

function closeProductDetail() {
  document.getElementById('product-detail').classList.remove('open');
  // Always restore FAB since we're going back to the store
  document.getElementById('chat-fab').classList.add('visible');
  window.scrollTo(0,0);
}

function prefillEnq(name) {
  document.getElementById('eq-prod').value = name;
  showToast('Added: ' + name);
  document.querySelector('.enq-box').scrollIntoView({behavior:'smooth'});
}

function submitEnq() {
  const name = document.getElementById('eq-name').value.trim();
  const phone = document.getElementById('eq-phone').value.trim();
  const prod = document.getElementById('eq-prod').value.trim();
  const note = document.getElementById('eq-note').value.trim();

  if (!name || !phone) { showToast('Please fill your name & number 🙏'); return; }

  // Build message and open WhatsApp FIRST
  const msg = encodeURIComponent(
    `Hi! I found your store on Nukkad 🌿\n\n` +
    `👤 ${name}\n` +
    `📞 ${waPhone(phone)}` +
    (prod ? `\n\n*Interested in:* ${prod}` : '') +
    (note ? `\n*Message:* ${note}` : '') +
    `\n\n_Via Nukkad 🌿_`
  );

  const wa = waPhone(curStore.whatsapp);
  window.open(`https://wa.me/${wa}?text=${msg}`, '_blank');

  document.getElementById('enq-sheet-form').style.display = 'none';
  document.getElementById('enq-success').style.display = 'block';
  setTimeout(() => closeEnqSheet(), 2500);

  // Log to Supabase in background — no await
  sb.from('orders').insert({
    store_handle: curStore.handle,
    store_name: curStore.brand_name,
    store_id: curStore.id || null,
    buyer_id: null,
    buyer_name: name,
    buyer_phone: phone,
    buyer_area: '',
    buyer_city: '',
    product_name: prod || 'General enquiry',
    product_price: '—',
    status: 'pending'
  }).catch(err => console.error('Enquiry log:', err));

  // Save to buyer localStorage
  const existing = getBuyer() || {};
  saveBuyer({
    ...existing,
    name,
    phone: phone.replace(/\D/g,'')
  });
}

// ═══════════════════════════════════
// BUYER ORDER FLOW — localStorage only
// No Supabase auth needed for buyers
// ═══════════════════════════════════

// Stores the pending order details while
// the buyer completes their info
let _pendingOrder = null;

function getBuyer() {
  try {
    return JSON.parse(localStorage.getItem('nukkad_buyer') || 'null');
  } catch(e) { return null; }
}

function saveBuyer(data) {
  localStorage.setItem('nukkad_buyer', JSON.stringify(data));
}

// Entry point — called by all Order buttons
// productName, price, imageUrl are optional
function startBuyerOrder(productName, price, imageUrl) {
  if (!curStore?.whatsapp) {
    showToast('Store contact not available');
    return;
  }

  // Store pending order context
  _pendingOrder = {
    productName: productName || '',
    price: price || '',
    imageUrl: imageUrl || ''
  };

  const buyer = getBuyer();

  if (buyer?.name && buyer?.phone) {
    // Returning buyer — skip to sheet 2
    showBuyerSheet2();
  } else {
    // First time — show sheet 1
    showBuyerSheet1();
  }
}

function showBuyerSheet1() {
  const overlay = document.getElementById('buyer-overlay');
  overlay.style.display = 'flex';
  document.getElementById('buyer-sheet-1').style.display = 'block';
  document.getElementById('buyer-sheet-2').style.display = 'none';
  // Pre-fill if partial data exists
  const buyer = getBuyer();
  if (buyer?.name) {
    document.getElementById('byr-name').value = buyer.name;
  }
  if (buyer?.phone) {
    document.getElementById('byr-phone').value = buyer.phone;
  }
  // Focus name field
  setTimeout(() => {
    document.getElementById('byr-name').focus();
  }, 350);
}

function showBuyerSheet2() {
  const overlay = document.getElementById('buyer-overlay');
  overlay.style.display = 'flex';
  document.getElementById('buyer-sheet-1').style.display = 'none';
  document.getElementById('buyer-sheet-2').style.display = 'block';

  // Fill product card
  const po = _pendingOrder;
  document.getElementById('byr-product-name').textContent = po?.productName || 'Your order';
  document.getElementById('byr-product-price').textContent = po?.price ? '₹' + po.price : '';

  // Product image or emoji
  const imgDiv = document.getElementById('byr-product-img');
  if (po?.imageUrl) {
    imgDiv.innerHTML = `<img src="${po.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
  } else {
    imgDiv.textContent = curStore?.emoji || '🛍️';
  }

  // Show buyer greeting
  const buyer = getBuyer();
  const greetDiv = document.getElementById('byr-greeting');
  greetDiv.textContent = buyer?.name
    ? `Ordering as ${buyer.name} · ${buyer.phone}`
    : '';

  // Pre-fill last address if saved
  if (buyer?.lastAddress) {
    document.getElementById('byr-address').value = buyer.lastAddress;
  }

  // Clear note
  document.getElementById('byr-note').value = '';

  // Focus address
  setTimeout(() => {
    document.getElementById('byr-address').focus();
  }, 350);
}

function buyerSheet1Next() {
  const name = document.getElementById('byr-name').value.trim();
  const phone = document.getElementById('byr-phone').value.trim();

  if (!name) {
    document.getElementById('byr-name').style.borderColor = 'var(--rose)';
    document.getElementById('byr-name').focus();
    showToast('Please enter your name');
    return;
  }
  if (!phone || phone.replace(/\D/g,'').length < 10) {
    document.getElementById('byr-phone').style.borderColor = 'var(--rose)';
    document.getElementById('byr-phone').focus();
    showToast('Please enter a valid WhatsApp number');
    return;
  }

  // Reset border colours
  document.getElementById('byr-name').style.borderColor = '';
  document.getElementById('byr-phone').style.borderColor = '';

  // Save buyer info
  const existing = getBuyer() || {};
  saveBuyer({ ...existing, name, phone: phone.replace(/\D/g,'') });

  showBuyerSheet2();
}

async function buyerSendOrder() {
  const buyer = getBuyer();
  if (!buyer?.name || !buyer?.phone) {
    showBuyerSheet1();
    return;
  }

  const address = document.getElementById('byr-address').value.trim();
  const note = document.getElementById('byr-note').value.trim();

  if (!address) {
    document.getElementById('byr-address').style.borderColor = 'var(--rose)';
    document.getElementById('byr-address').focus();
    showToast('Please enter your delivery address');
    return;
  }

  // Save last address for next time
  saveBuyer({ ...buyer, lastAddress: address });

  const btn = document.getElementById('byr-send-btn');
  btn.disabled = true;
  btn.textContent = 'Opening WhatsApp...';

  const po = _pendingOrder;

  // Build WhatsApp message FIRST
  const productLine = po?.productName
    ? `*${po.productName}*${po.price ? ' (₹'+po.price+')' : ''}`
    : 'an item from your store';

  const msg = encodeURIComponent(
    `Hi! I want to order ${productLine}\n\n` +
    `👤 ${buyer.name}\n` +
    `📞 ${waPhone(buyer.phone)}\n` +
    `📦 ${address}` +
    (note ? `\n\n💬 ${note}` : '') +
    `\n\n_Order via Nukkad 🌿_`
  );

  const phone = waPhone(curStore.whatsapp);

  // Open WhatsApp IMMEDIATELY — no waiting
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');

  // Close sheet instantly
  closeBuyerFlow();
  btn.disabled = false;
  btn.innerHTML = '💬 Send order on WhatsApp';
  showToast('Order sent! 🎉');

  // Log to Supabase in background — no await
  sb.from('orders').insert({
    store_handle: curStore.handle,
    store_name: curStore.brand_name,
    store_id: curStore.id || null,
    buyer_id: null,
    buyer_name: buyer.name,
    buyer_phone: buyer.phone,
    buyer_area: address,
    buyer_city: '',
    product_name: po?.productName || 'Order',
    product_price: po?.price || '—',
    status: 'pending'
  }).then(() => {
    console.log('Order logged');
  }).catch(err => {
    console.error('Order log error:', err);
  });
}

function buyerEditDetails() {
  // Allow buyer to correct their name/phone
  const buyer = getBuyer();
  // Clear stored name/phone so sheet 1 shows
  saveBuyer({ ...buyer, name: '', phone: '' });
  showBuyerSheet1();
}

function closeBuyerFlow() {
  document.getElementById('buyer-overlay').style.display = 'none';
  document.getElementById('buyer-sheet-1').style.display = 'none';
  document.getElementById('buyer-sheet-2').style.display = 'none';
  _pendingOrder = null;
}

function openDashPanel() {
  if (!curStore) return;
  const overlay = document.getElementById('dash-panel-overlay');
  overlay.style.display = 'flex';
  loadSellerDashboard(curStore.handle);
}

function closeDashPanel() {
  document.getElementById('dash-panel-overlay').style.display = 'none';
}

function openEnqSheet() {
  // Pre-fill from buyer localStorage
  const buyer = getBuyer();
  const nameEl = document.getElementById('eq-name');
  const phoneEl = document.getElementById('eq-phone');
  if (nameEl && buyer?.name) nameEl.value = buyer.name;
  if (phoneEl && buyer?.phone) phoneEl.value = buyer.phone;
  document.getElementById('eq-prod').value = '';
  document.getElementById('eq-note').value = '';
  document.getElementById('enq-sheet-form').style.display = 'block';
  document.getElementById('enq-success').style.display = 'none';
  document.getElementById('enq-overlay').style.display = 'flex';
}

function closeEnqSheet() {
  document.getElementById('enq-overlay').style.display = 'none';
}

function shareStore() {
  const link = window.location.origin + window.location.pathname + '?store=' + curStore.handle;
  navigator.clipboard?.writeText(link).catch(()=>{});
  showToast('Link copied! 🔗');
}

function whatsappStore() {
  const link = window.location.origin + window.location.pathname + '?store=' + curStore.handle;
  const msg = encodeURIComponent(`Hey! Check out ${curStore.brand_name} on Nukkad 🌿\n\n${link}\n\n${curStore.tagline}`);
  window.open('https://wa.me/?text=' + msg, '_blank');
}

// ═══════════════════════════════════
// CREATE STORE
// ═══════════════════════════════════
const EMOJIS = ['🌿','🌸','🍃','🌺','🌻','🌼','🍀','🧴','🧼','☕','🍋','🌹','💐','🌾','🫙','🍯','🧁','🎀','💎','🌙','🍳','🎨','💄','👗','🕯️','💍','🌮','🥗','🫐','🌶️'];

function buildEmojiPicker() {
  const row = document.getElementById('ep');
  EMOJIS.forEach(e => {
    const btn = document.createElement('button');
    btn.className = 'ep-btn' + (e==='🌿'?' sel':'');
    btn.textContent = e; btn.type = 'button';
    btn.onclick = () => {
      document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('sel'));
      btn.classList.add('sel'); NS.emoji = e;
    };
    row.appendChild(btn);
  });
}

function pickCat(el) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('sel'));
  el.classList.add('sel'); NS.category = el.textContent;
}

function startCreate() {
  NS = {brand_name:'',emoji:'🌿',category:'',tagline:'',city:'',whatsapp:'',handle:'',bg_idx:0};
  NSProducts = [];
  productImageFiles = {};
  pc = 0;
  document.getElementById('prod-list').innerHTML = '';
  ['c-bname','c-tag','c-city'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  ['u-name','u-email','u-phone','u-area','u-city'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('sel'));
  document.querySelectorAll('.ep-btn').forEach(b => { b.classList.remove('sel'); if(b.textContent==='🌿') b.classList.add('sel'); });
  NS.emoji = '🌿';

  // Pre-fill if returning user
  const saved = JSON.parse(localStorage.getItem('nukkad_user') || '{}');
  if (saved.name) {
    document.getElementById('u-name').value = saved.name || '';
    document.getElementById('u-email').value = saved.email || '';
    document.getElementById('u-phone').value = saved.phone || '';
    document.getElementById('u-area').value = saved.area || '';
    document.getElementById('u-city').value = saved.city || '';
  }

  csShow(0);
  showPg('create');
}

function s0to1() {
  const name = document.getElementById('u-name').value.trim();
  const email = document.getElementById('u-email').value.trim();
  const phone = document.getElementById('u-phone').value.trim();
  const area = document.getElementById('u-area').value.trim();
  const city = document.getElementById('u-city').value.trim();

  let ok = true;
  [['u-name','cerr-uname'],['u-email','cerr-uemail'],['u-phone','cerr-uphone'],['u-area','cerr-uarea'],['u-city','cerr-ucity']].forEach(([id,eid]) => {
    const v = document.getElementById(id).value.trim();
    document.getElementById(eid).style.display = v ? 'none' : 'block';
    if(!v) ok = false;
  });
  if (!ok) return;

  USER = {name, email, phone, area, city};
  NS.whatsapp = phone;
  NS.city = city;

  // Save to localStorage
  localStorage.setItem('nukkad_user', JSON.stringify(USER));
  const initial = USER.name.charAt(0).toUpperCase();
  const navAv = document.getElementById('nav-av-btn');
  if (navAv) navAv.textContent = initial;
  document.getElementById('nav-my-store') && (document.getElementById('nav-my-store').style.display = 'block');

  csShow(1);
}

function csShow(n) {
  [0,1,2,3].forEach(i => { const el = document.getElementById('s'+i); if(el) el.style.display = i===n?'':'none'; });
  window.scrollTo(0,0);
}

function s1Validate() {
  let ok = true;
  [['c-bname','cerr-name'],['c-tag','cerr-tag']].forEach(([id,eid]) => {
    const v = document.getElementById(id).value.trim();
    document.getElementById(eid).style.display = v ? 'none' : 'block';
    if(!v) ok=false;
  });
  const ce = document.getElementById('cerr-cat');
  if(!NS.category){ce.style.display='block';ok=false;} else ce.style.display='none';
  return ok;
}

function s1to2() {
  if(!s1Validate()) return;
  NS.brand_name = document.getElementById('c-bname').value.trim();
  NS.tagline = document.getElementById('c-tag').value.trim();
  const cityOverride = document.getElementById('c-city').value.trim();
  if(cityOverride) NS.city = cityOverride;
  if(pc===0) addProd();
  csShow(2);
}

function s2to3() {
  const prods = collectProds();
  if(!prods.length){showToast('Add at least one product! 📦');return;}
  NSProducts = prods;
  NS.bg_idx = Math.floor(Math.random()*BG.length);
  buildPreview();
  csShow(3);
}

// ─── ADD PRODUCT (with image upload) ───
function addProd() {
  pc++;
  const id = pc;
  const list = document.getElementById('prod-list');
  const d = document.createElement('div');
  d.className = 'pe open'; d.id = 'pe-'+id;
  d.innerHTML = `
    <div class="pe-hdr" onclick="togglePe(${id})">
      <div><div class="pe-hdr-name" id="phn-${id}">Product ${id}</div><div class="pe-hdr-price" id="php-${id}">Fill details below</div></div>
      <span class="pe-toggle">▾</span>
    </div>
    <div class="pe-body">
      <div class="cf" style="margin:0">
        <label class="cl">Product Photo</label>
        <div class="img-upload-area" id="iua-${id}">
          <div id="ipl-${id}">
            <div style="font-size:1.5rem;margin-bottom:0.3rem">📷</div>
            <div class="img-upload-label">Upload a product photo (optional)</div>
            <button type="button" class="img-upload-btn" onclick="document.getElementById('img-${id}').click()">📷 Choose Photo</button>
          </div>
          <div id="ipw-${id}" style="display:none">
            <img id="ipv-${id}" class="img-upload-preview" alt="preview">
            <button type="button" class="img-change-btn" onclick="document.getElementById('img-${id}').click()">Change Photo</button>
          </div>
          <input type="file" class="img-upload-input" id="img-${id}" accept="image/*" onchange="handleImgSelect(${id},event)">
        </div>
      </div>
      <div class="pe-row">
        <div class="cf" style="margin:0"><label class="cl">Name <span>*</span></label>
          <input type="text" class="ci" id="pn-${id}" placeholder="Product name"
            oninput="document.getElementById('phn-${id}').textContent=this.value||'Product ${id}'">
        </div>
        <div class="cf" style="margin:0"><label class="cl">Price ₹ <span>*</span></label>
          <input type="number" class="ci" id="pp-${id}" placeholder="299"
            oninput="document.getElementById('php-${id}').textContent=this.value?'₹'+this.value:'Fill details below'">
        </div>
      </div>
      <div class="cf" style="margin:0"><label class="cl">Description</label>
        <div class="enhance-wrap">
          <textarea class="ct" id="pd-${id}" placeholder="What does it do? Who is it for?" rows="2" style="padding-bottom:2.2rem"></textarea>
          <button type="button" class="enhance-btn" onclick="enhanceDesc('pd-${id}',this)">✨ Enhance</button>
        </div>
      </div>
      <button class="rm-btn" onclick="removePe(${id})">✕ Remove</button>
    </div>`;
  list.appendChild(d);
}

function handleImgSelect(id, e) {
  const file = e.target.files[0];
  if (!file) return;
  productImageFiles[id] = file;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById('ipv-'+id).src = ev.target.result;
    document.getElementById('ipl-'+id).style.display = 'none';
    document.getElementById('ipw-'+id).style.display = 'block';
    document.getElementById('iua-'+id).classList.add('has-img');
  };
  reader.readAsDataURL(file);
}

function togglePe(id){document.getElementById('pe-'+id).classList.toggle('open');}
function removePe(id){
  const el=document.getElementById('pe-'+id);
  el.style.opacity='0';el.style.transform='translateY(-6px)';el.style.transition='all 0.2s';
  setTimeout(()=>el.remove(),200);
  delete productImageFiles[id];
}
function collectProds(){
  const ps=[];
  document.querySelectorAll('.pe').forEach(e=>{
    const id=e.id.replace('pe-','');
    const n=document.getElementById('pn-'+id)?.value.trim();
    const p=document.getElementById('pp-'+id)?.value.trim();
    const d=document.getElementById('pd-'+id)?.value.trim();
    const imgSrc=document.getElementById('ipv-'+id)?.src||null;
    if(n&&p) ps.push({name:n,price:p,description:d||'',previewSrc:imgSrc&&imgSrc.startsWith('data:')?imgSrc:null,prodId:parseInt(id)});
  });
  return ps;
}

function buildPreview(){
  const bgColors=BG[NS.bg_idx];
  const bg=`linear-gradient(135deg, ${bgColors[0]}, ${bgColors[1]}, ${bgColors[2]}, ${bgColors[3]})`;
  const h=NS.brand_name.toLowerCase().replace(/[^a-z0-9]/g,'');
  NS.handle=h;
  const prodsH=NSProducts.map(p=>`
    <div class="pv-prod">
      <div class="pv-prod-img">${p.previewSrc ? `<img src="${p.previewSrc}" alt="${p.name}">` : NS.emoji}</div>
      <div class="pv-prod-body">
        <div class="pv-prod-name">${p.name}</div>
        <div class="pv-prod-desc">${p.description||'Quality product.'}</div>
        <div class="pv-prod-price">₹${p.price}</div>
      </div>
    </div>`).join('');
  document.getElementById('pv-content').innerHTML=`
    <div class="pv-cover" style="background:${bg}"></div>
    <div class="pv-body">
      <div class="pv-av-row">
        <div class="pv-av">${NS.emoji}</div>
        <span style="font-size:0.7rem;color:var(--ink-light);background:var(--paper-deep);padding:0.22rem 0.65rem;border-radius:100px;border:1px solid var(--border);margin-top:1.2rem">Preview</span>
      </div>
      <div class="pv-name serif">${NS.brand_name}</div>
      <div class="pv-tagline">${NS.tagline}</div>
      <div class="pv-badges">
        <span class="pv-badge">${NS.category}</span>
        ${NS.city?`<span class="pv-badge">📍 ${NS.city}</span>`:''}
        <span class="pv-badge">✓ Verified</span>
        <span class="pv-badge">💬 WhatsApp orders</span>
      </div>
      <div class="pv-prods">${prodsH}</div>
      <div class="pv-link">
        <div>
          <div style="font-size:0.68rem;color:var(--ink-light);margin-bottom:0.12rem">Your store link</div>
          <div class="pv-link-text">nukkad.in/${h}</div>
        </div>
        <button class="pv-copy" onclick="navigator.clipboard?.writeText('nukkad.in/${h}');showToast('Copied! 🔗')">Copy</button>
      </div>
      <p style="font-size:0.76rem;color:var(--ink-light);text-align:center">Happy with it? Hit Publish to go live 🚀</p>
    </div>`;
}

// ─── PUBLISH ───
async function publish(){
  const btn = document.getElementById('publish-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span> Publishing...';

  try {
    // Check handle uniqueness
    const { data: existing } = await sb.from('stores').select('handle').eq('handle', NS.handle).single();
    if (existing) {
      NS.handle = NS.handle + '_' + Date.now().toString(36).slice(-4);
    }

    // Insert store
    const { data: { user: authUser } } = await sb.auth.getUser();
    const { error: storeError } = await sb.from('stores').insert({
      handle: NS.handle,
      brand_name: NS.brand_name,
      emoji: NS.emoji,
      category: NS.category,
      tagline: NS.tagline,
      city: NS.city,
      whatsapp: NS.whatsapp,
      bg_idx: NS.bg_idx,
      owner_email: authUser ? authUser.email : (USER.email || '')
    });
    if (storeError) throw storeError;

    // Upload images + insert products
    if (NSProducts.length > 0) {
      const prodsToInsert = await Promise.all(NSProducts.map(async (p) => {
        let imageUrl = null;
        const imgFile = productImageFiles[p.prodId];
        if (imgFile) {
          try {
            const ext = imgFile.name.split('.').pop();
            const fileName = `${NS.handle}/${Date.now()}_${p.prodId}.${ext}`;
            const { error: upErr } = await sb.storage.from('product-images').upload(fileName, imgFile, { upsert: true });
            if (!upErr) {
              const { data: urlData } = sb.storage.from('product-images').getPublicUrl(fileName);
              imageUrl = urlData.publicUrl;
            }
          } catch(imgErr) { console.error('Image upload error:', imgErr); }
        }
        return { store_handle: NS.handle, name: p.name, price: p.price, description: p.description, image_url: imageUrl };
      }));

      const { error: prodsError } = await sb.from('products').insert(prodsToInsert);
      if (prodsError) throw prodsError;
    }

    // Save store slug
    localStorage.setItem('nukkad_store_slug', NS.handle);
    const myStores = JSON.parse(localStorage.getItem('nukkad_my_stores') || '[]');
    if (!myStores.includes(NS.handle)) myStores.push(NS.handle);
    localStorage.setItem('nukkad_my_stores', JSON.stringify(myStores));

    // Add to local state
    const newStore = { ...NS, products: NSProducts };
    allStores.unshift(newStore);
    filteredStores = [...allStores];
    renderMarket(allStores);

    document.getElementById('so-hdl').textContent = NS.handle;
    document.getElementById('success-ov').classList.add('show');
    window.scrollTo(0,0);

  } catch(e) {
    console.error('Publish error:', e);
    showToast('Error publishing — please try again');
    btn.disabled = false;
    btn.innerHTML = '🚀 Publish My Store';
  }
}

function copySuccessLink(){
  const url = window.location.origin + window.location.pathname + '?store=' + NS.handle;
  navigator.clipboard?.writeText(url).catch(()=>{});
  showToast('Link copied! 🔗');
}
function successWA(){
  const url = window.location.origin + window.location.pathname + '?store=' + NS.handle;
  const msg=encodeURIComponent(`Hey! I just created my store on Nukkad 🌿\n\nShop here: ${url}\n\n${NS.tagline}`);
  window.open('https://wa.me/?text='+msg,'_blank');
}
function viewNewStore(){
  document.getElementById('success-ov').classList.remove('show');
  loadStores().then(() => openStore(NS.handle));
}

// ═══════════════════════════════════
// QR CODE
// ═══════════════════════════════════
function showAddProductModal() {
  document.getElementById('apm-name').value = '';
  document.getElementById('apm-price').value = '';
  document.getElementById('apm-desc').value = '';
  document.getElementById('apm-ipv').src = '';
  document.getElementById('apm-ipl').style.display = 'block';
  document.getElementById('apm-ipw').style.display = 'none';
  document.getElementById('apm-iua').classList.remove('has-img');
  document.getElementById('add-prod-modal').classList.add('open');

  // Reset AI builder state
  aiTranscript = '';
  aiIsRecording = false;
  aiStopping = false;
  if (aiVoiceRecognition) {
    aiVoiceRecognition.stop();
    aiVoiceRecognition = null;
  }
  const genBtn = document.getElementById('ai-generate-btn');
  if (genBtn) {
    genBtn.disabled = true;
    genBtn.innerHTML = '✨ Auto-fill with AI';
  }
  const voiceBtn = document.getElementById('ai-voice-btn');
  if (voiceBtn) {
    voiceBtn.textContent = '🎙 Hold to speak';
    voiceBtn.classList.remove('recording');
  }
  const statusEl = document.getElementById('ai-voice-status');
  if (statusEl) {
    statusEl.textContent = 'Describe your product in English';
  }
  const transcriptEl = document.getElementById('ai-transcript-box');
  if (transcriptEl) {
    transcriptEl.style.display = 'none';
    transcriptEl.textContent = '';
  }
}

function closeAddProductModal() {
  document.getElementById('add-prod-modal').classList.remove('open');
}

let apmImageFile = null;

// ═══════════════════════════════════
// IMAGE PROCESSOR
// Square crop + compress before upload
// Applied to NEW uploads only —
// existing images are never touched
// ═══════════════════════════════════

function processProductImage(file, outputSize, quality) {
  // outputSize default 800, quality default 0.85
  const size = outputSize || 800;
  const q = quality || 0.85;

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image file'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Read failed'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Image load failed'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // No background fill — transparent canvas
        // The blurred background on the display
        // side handles gaps cleanly
        ctx.clearRect(0, 0, size, size);

        // Contain — never crop, always show full product
        // No padding — use full canvas
        const scale = Math.min(
          size / img.width,
          size / img.height
        );
        const dw = img.width  * scale;
        const dh = img.height * scale;
        const dx = (size - dw) / 2;
        const dy = (size - dh) / 2;

        ctx.drawImage(img, dx, dy, dw, dh);

        // Convert to compressed JPEG blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas conversion failed'));
              return;
            }
            // Create a File from the blob
            const processed = new File(
              [blob],
              'product_' + Date.now() + '.png',
              { type: 'image/png' }
            );
            resolve(processed);
          },
          'image/png'
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleApmImg(e) {
  const file = e.target.files[0];
  if (!file) return;

  showToast('Processing image…');
  try {
    const processed = await processProductImage(file, 800, 0.85);
    apmImageFile = processed;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('apm-ipv').src = ev.target.result;
      document.getElementById('apm-ipl').style.display = 'none';
      document.getElementById('apm-ipw').style.display = 'block';
      document.getElementById('apm-iua').classList.add('has-img');
    };
    reader.readAsDataURL(processed);
    showToast('✓ Image ready');
  } catch(err) {
    console.error('Image process error:', err);
    apmImageFile = file;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('apm-ipv').src = ev.target.result;
      document.getElementById('apm-ipl').style.display = 'none';
      document.getElementById('apm-ipw').style.display = 'block';
      document.getElementById('apm-iua').classList.add('has-img');
    };
    reader.readAsDataURL(file);
  }
}

async function saveNewProduct() {
  const name = document.getElementById('apm-name').value.trim();
  const price = document.getElementById('apm-price').value.trim();
  const desc = document.getElementById('apm-desc').value.trim();
  if (!name || !price) { showToast('Please enter name and price'); return; }

  const btn = document.getElementById('apm-save-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span> Saving...';

  try {
    let imageUrl = null;
    if (apmImageFile) {
      const ext = apmImageFile.name.split('.').pop();
      const fileName = `${curStore.handle}/${Date.now()}.${ext}`;
      const { error: upErr } = await sb.storage.from('product-images').upload(fileName, apmImageFile, { upsert: true });
      if (!upErr) {
        const { data: urlData } = sb.storage.from('product-images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await sb.from('products').insert({
      store_handle: curStore.handle,
      name, price, description: desc, image_url: imageUrl
    });
    if (error) throw error;

    showToast('Product added! 🎉');
    closeAddProductModal();
    apmImageFile = null;

    // Reload store
    await loadStores();
    openStore(curStore.handle);

  } catch(e) {
    console.error(e);
    showToast('Error saving product');
  }
  btn.disabled = false;
  btn.innerHTML = 'Save Product';
}

// ═══════════════════════════════════
// AI PRODUCT BUILDER — VOICE + PHOTO
// ═══════════════════════════════════

let aiVoiceRecognition = null;
let aiTranscript = '';
let aiIsRecording = false;
let aiStopping = false;

function startVoiceRecording() {
  if (aiVoiceRecognition) return; // already starting/recording — ignore repeat pointerdown

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    showToast('Voice not supported — type the details manually');
    return;
  }

  aiStopping = false;
  aiTranscript = '';

  const rec = new SpeechRecognition();
  aiVoiceRecognition = rec;
  rec.continuous = true;
  rec.interimResults = true;
  // English only for now
  rec.lang = 'en-IN';

  const btn = document.getElementById('ai-voice-btn');
  const status = document.getElementById('ai-voice-status');
  const transcriptBox = document.getElementById('ai-transcript-box');

  rec.onstart = () => {
    if (aiVoiceRecognition !== rec) return; // stale — a newer session has already replaced this one
    if (aiStopping) { rec.stop(); return; } // user already released before the mic actually engaged
    aiIsRecording = true;
    btn.textContent = '⏹ Recording... release to stop';
    btn.classList.add('recording');
    status.textContent = 'Listening... speak now 🎙';
    transcriptBox.style.display = 'block';
    transcriptBox.textContent = '...';
  };

  rec.onresult = (event) => {
    if (aiVoiceRecognition !== rec) return;
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += t + ' ';
      } else {
        interim += t;
      }
    }
    aiTranscript += final;
    transcriptBox.textContent = (aiTranscript + interim).trim() || '...';
  };

  rec.onerror = (e) => {
    if (aiVoiceRecognition !== rec) return;
    console.error('Voice error:', e.error);
    if (e.error === 'not-allowed') {
      showToast('Microphone permission denied');
    } else if (e.error !== 'no-speech' && e.error !== 'aborted') {
      showToast('Voice error — try again');
    }
  };

  rec.onend = () => {
    if (aiVoiceRecognition !== rec) return;
    if (aiIsRecording && !aiStopping) {
      // Browser cut the session off on its own (e.g. silence timeout) — keep listening
      rec.start();
      return;
    }
    // Real end of the session — final results have been flushed into aiTranscript by now
    finishVoiceRecording();
  };

  rec.start();
}

function stopVoiceRecording() {
  if (!aiVoiceRecognition) return;
  aiStopping = true;
  aiVoiceRecognition.stop();
  // UI + transcript check happen in onend, once pending final results have arrived
}

function finishVoiceRecording() {
  aiIsRecording = false;
  aiStopping = false;
  aiVoiceRecognition = null;

  const btn = document.getElementById('ai-voice-btn');
  const status = document.getElementById('ai-voice-status');
  const generateBtn = document.getElementById('ai-generate-btn');

  btn.textContent = '🎙 Hold to speak';
  btn.classList.remove('recording');

  if (aiTranscript.trim()) {
    status.textContent = '✓ Got it! Now tap Auto-fill.';
    generateBtn.disabled = false;
    document.getElementById('ai-transcript-box').textContent = aiTranscript.trim();
  } else {
    status.textContent = 'No speech detected — try again';
    generateBtn.disabled = true;
  }
}

async function aiGenerateProduct() {
  const generateBtn = document.getElementById('ai-generate-btn');
  const hasPhoto = !!apmImageFile;
  const hasVoice = !!aiTranscript.trim();

  if (!hasVoice && !hasPhoto) {
    showToast('Add a photo or record your voice first');
    return;
  }

  generateBtn.disabled = true;
  generateBtn.innerHTML = '<span class="spin"></span> AI is reading your product...';

  try {
    // Build the request payload — the actual Claude call happens
    // server-side in a Supabase Edge Function, which holds the
    // Anthropic API key as a secret. We never call api.anthropic.com
    // or handle the key directly in the browser.
    const payload = { transcript: aiTranscript.trim() };
    if (hasPhoto) {
      payload.image_base64 = await fileToBase64(apmImageFile);
      payload.image_mime_type = apmImageFile.type || 'image/jpeg';
    }

    const { data, error } = await sb.functions.invoke('ai-generate-product', {
      body: payload
    });

    if (error) {
      // supabase-js wraps a non-2xx edge function response in a generic
      // FunctionsHttpError — the actual reason is in the response body,
      // not error.message, so pull it out for a useful toast.
      let detail = error.message || 'Unknown error';
      if (error.context && typeof error.context.json === 'function') {
        try {
          const body = await error.context.json();
          if (body && body.error) detail = body.error;
        } catch (_) { /* body already consumed or not JSON */ }
      }
      throw new Error(detail);
    }
    const parsed = data;

    // Fill in the form fields
    if (parsed.name) {
      document.getElementById('apm-name').value = parsed.name;
    }
    if (parsed.price && parsed.price > 0) {
      document.getElementById('apm-price').value = parsed.price;
    }
    if (parsed.description) {
      document.getElementById('apm-desc').value = parsed.description;
    }

    // Visual feedback — glow the filled fields
    const box = document.querySelector('.apm-box');
    box.classList.add('ai-filled-glow');
    setTimeout(() => box.classList.remove('ai-filled-glow'), 2000);

    showToast('✨ AI filled your listing! Review and save.');
    generateBtn.innerHTML = '✓ Done — edit if needed';

  } catch(err) {
    console.error('AI generate error:', err);
    showToast('AI error: ' + (err.message || 'could not read product — fill manually'));
    generateBtn.disabled = false;
    generateBtn.innerHTML = '✨ Try again';
  }
}

// Helper: convert File to base64 string
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Strip the data:image/jpeg;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showQR() {
  const handle = NS.handle || (curStore && curStore.handle);
  if (!handle) return;
  const url = window.location.origin + window.location.pathname + '?store=' + handle;
  document.getElementById('qr-url-label').textContent = url;
  document.getElementById('qr-canvas').innerHTML = '';
  new QRCode(document.getElementById('qr-canvas'), {
    text: url, width: 200, height: 200,
    colorDark: '#1A0F0A', colorLight: '#FFFBF4',
    correctLevel: QRCode.CorrectLevel.H
  });
  document.getElementById('qr-modal').classList.add('open');
}

function closeQR() { document.getElementById('qr-modal').classList.remove('open'); }

function downloadQR() {
  const canvas = document.querySelector('#qr-canvas canvas');
  if (!canvas) { showToast('QR not ready yet'); return; }
  const link = document.createElement('a');
  const handle = NS.handle || (curStore && curStore.handle) || 'store';
  link.download = handle + '-qr.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('QR downloaded! 📥');
}

// ═══════════════════════════════════
// UTILS
// ═══════════════════════════════════


// ═══════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════
let currentAuthUser = null;

// Check session on load
async function initAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    currentAuthUser = session.user;
    onAuthSuccess(session.user, false);
  }
  // Listen for auth changes
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      currentAuthUser = session.user;
      onAuthSuccess(session.user, false);
    } else if (event === 'SIGNED_OUT') {
      currentAuthUser = null;
      onSignOut();
    }
  });
}

function openAuthModal(tab = 'login') {
  const fab = document.getElementById('chat-fab');
  if (fab) fab.classList.remove('visible');
  switchAuthTab(tab);
  document.getElementById('auth-modal').classList.add('open');
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
  document.getElementById('login-err').classList.remove('show');
  document.getElementById('signup-err').classList.remove('show');
}

function switchAuthTab(tab) {
  document.getElementById('auth-login-form').style.display = tab === 'login' ? '' : 'none';
  document.getElementById('auth-signup-form').style.display = tab === 'signup' ? '' : 'none';
  document.getElementById('auth-tab-login').classList.toggle('on', tab === 'login');
  document.getElementById('auth-tab-signup').classList.toggle('on', tab === 'signup');
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-err');
  const btn = document.getElementById('login-btn');
  if (!email || !pass) { showAuthErr('login', 'Please fill in all fields'); return; }
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Logging in...';
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
  if (error) {
    showAuthErr('login', error.message === 'Invalid login credentials' ? 'Wrong email or password' : error.message);
    btn.disabled = false; btn.innerHTML = 'Log In';
  } else {
    closeAuthModal();
    // onAuthStateChange fires SIGNED_IN and calls onAuthSuccess — don't call it twice
    // Auth state change handles onAuthSuccess
    // Just show welcome toast here
    const savedName = JSON.parse(localStorage.getItem('nukkad_user') || '{}').name;
    showToast('Welcome back' + (savedName ? ', ' + savedName : '') + '! 👋');
  }
}

async function doSignup() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const area = document.getElementById('signup-area').value.trim();
  const city = document.getElementById('signup-city').value.trim();
  const pass = document.getElementById('signup-pass').value;
  const btn = document.getElementById('signup-btn');
  if (!name || !email || !phone || !pass) { showAuthErr('signup', 'Please fill in all fields'); return; }
  if (pass.length < 6) { showAuthErr('signup', 'Password must be at least 6 characters'); return; }
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Creating account...';
  const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { name, phone, area, city } } });
  if (error) {
    showAuthErr('signup', error.message);
    btn.disabled = false; btn.innerHTML = 'Create Account';
  } else {
    // Save profile to seller_profiles with area + city
    const { data: profile } = await sb.from('seller_profiles').upsert(
      { email, name, phone, area, city },
      { onConflict: 'email' }
    ).select().single();
    // Save to localStorage including profile id for customer link
    const user = { name, email, phone, area, city, profileId: profile?.id || data.user?.id };
    localStorage.setItem('nukkad_user', JSON.stringify(user));
    USER = user;
    closeAuthModal();
    showToast('Account created! Welcome to Nukkad 🌿');
    onAuthSuccess(data.user, true);
  }
}

function showAuthErr(form, msg) {
  const el = document.getElementById(form + '-err');
  el.textContent = msg;
  el.classList.add('show');
}

async function onAuthSuccess(user, showWelcome) {
  currentAuthUser = user;
  let saved = JSON.parse(localStorage.getItem('nukkad_user') || '{}');

  // CRITICAL: if saved email doesn't match the
  // logged-in user, clear it — it's stale data
  // from a previous user on this device
  if (saved.email && saved.email !== user.email) {
    saved = {};
    localStorage.removeItem('nukkad_user');
    localStorage.removeItem('nukkad_store_slug');
    localStorage.removeItem('nukkad_my_stores');
  }

  // Populate from Supabase user metadata if needed
  if (!saved.name && user.user_metadata?.name) {
    saved = {
      name: user.user_metadata.name,
      email: user.email,
      phone: user.user_metadata.phone || '',
      area: user.user_metadata.area || '',
      city: user.user_metadata.city || ''
    };
    localStorage.setItem('nukkad_user', JSON.stringify(saved));
    USER = saved;
  }

  // Always ensure email matches current user
  if (saved.email !== user.email) {
    saved.email = user.email;
    localStorage.setItem('nukkad_user', JSON.stringify(saved));
    USER = saved;
  }

  // Verify stored store slug belongs to this user
  const storedSlug = localStorage.getItem('nukkad_store_slug');
  if (storedSlug) {
    // Will be re-validated when store loads
    // If it doesn't belong to this user it
    // won't match owner_email check in openStore
    // so safe — but clear if email mismatch
    // was detected above
    // (already cleared in BUG 1 fix above)
  }

  // Always load fresh profile from Supabase
  // to ensure correct user data
  if (saved.email || user.email) {
    const emailToQuery = user.email || saved.email;
    const { data: profile } = await sb.from('seller_profiles').select('id, name, phone, area, city').eq('email', emailToQuery).single();
    if (profile) {
      saved.profileId = profile.id;
      // Only overwrite local data with DB data
      // if DB has more complete info
      if (profile.name) saved.name = profile.name;
      if (profile.phone) saved.phone = profile.phone;
      if (profile.area) saved.area = profile.area;
      if (profile.city) saved.city = profile.city;
      saved.email = emailToQuery;
      localStorage.setItem('nukkad_user', JSON.stringify(saved));
      USER = saved;
    }
  }

  // Also load this user's store slug if any
  const emailForStore = user.email || saved.email;
  if (emailForStore) {
    const { data: myStoreList } = await sb.from('stores').select('handle').eq('owner_email', emailForStore);
    const allHandles = (myStoreList || []).map(s => s.handle);
    if (allHandles.length > 0) {
      localStorage.setItem('nukkad_store_slug', allHandles[0]);
      localStorage.setItem('nukkad_my_stores', JSON.stringify(allHandles));
    } else {
      localStorage.removeItem('nukkad_store_slug');
      localStorage.removeItem('nukkad_my_stores');
    }
  }

  const initial = saved.name ? saved.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
  const navAv = document.getElementById('nav-av-btn');
  if (navAv) navAv.textContent = initial;
  document.getElementById('nav-login-btn').style.display = 'none';
  document.getElementById('nav-create-btn').style.display = 'block';
  if (showWelcome) showToast('Welcome back, ' + (saved.name || user.email) + '! 👋');

  // If admin — show admin nav option
  if (isAdmin()) {
    const icon = document.getElementById('bn-store-icon');
    const label = document.getElementById('bn-store-label');
    if (icon) icon.textContent = '⚙️';
    if (label) label.textContent = 'Admin';

    // Update My Store button click for admin
    const storeBtn = document.getElementById('bn-mystore');
    if (storeBtn) {
      storeBtn.onclick = () => {
        showPg('admin');
        loadAdminData();
      };
    }
  }
}

function onSignOut() {
  localStorage.removeItem('nukkad_store_slug');
  localStorage.removeItem('nukkad_my_stores');
  localStorage.removeItem('nukkad_user');
  USER = { name:'',email:'',phone:'',area:'',city:'' };
  document.getElementById('nav-login-btn').style.display = 'block';
  document.getElementById('nav-create-btn').style.display = 'none';
  const navAv = document.getElementById('nav-av-btn');
  if (navAv) navAv.textContent = '👤';
  // Re-render store page if open to remove edit/add buttons
  if (curStore) openStore(curStore.handle);
}

async function logOut() {
  await sb.auth.signOut();
  localStorage.removeItem('nukkad_user');
  localStorage.removeItem('nukkad_store_slug');
  localStorage.removeItem('nukkad_my_stores');
  USER = { name:'', email:'', phone:'', area:'', city:'' };
  closePanel();
  showToast('Logged out successfully');
  history.replaceState({page:'home'}, '', '?page=home');
  showPg('home');
}

function handleCreateClick() {
  if (!currentAuthUser) { openAuthModal('signup'); return; }
  startCreate();
}

async function loadMyStores(storeWrap) {
  storeWrap.innerHTML = '<div style="font-size:0.8rem;color:var(--ink-light);padding:0.5rem 0">Loading...</div>';
  try {
    let myList = [];
    const saved = JSON.parse(localStorage.getItem('nukkad_user') || '{}');
    // Try Supabase by email
    if (saved.email || currentAuthUser?.email) {
      const email = saved.email || currentAuthUser.email;
      const { data } = await sb.from('stores').select('handle, brand_name').eq('owner_email', email);
      if (data && data.length > 0) {
        myList = data;
        const handles = data.map(s => s.handle);
        localStorage.setItem('nukkad_my_stores', JSON.stringify(handles));
        localStorage.setItem('nukkad_store_slug', handles[0]);
      }
    }
    // Fallback to localStorage
    if (myList.length === 0) {
      const localSlugs = JSON.parse(localStorage.getItem('nukkad_my_stores') || '[]');
      myList = localSlugs.map(slug => {
        const s = allStores.find(x => x.handle === slug);
        return { handle: slug, brand_name: s ? s.brand_name : slug };
      });
    }
    if (myList.length > 0) {
      storeWrap.innerHTML = myList.map(s => `
        <div onclick="closePanel();openStore('${s.handle}')" style="cursor:pointer;padding:0.85rem 1rem;background:var(--paper-deep);border-radius:var(--radius-sm);margin-bottom:0.5rem;display:flex;align-items:center;justify-content:space-between;border:1px solid var(--border-light);">
          <div>
            <div style="font-weight:700;font-size:0.9rem;color:var(--ink)">${s.brand_name}</div>
            <div style="font-size:0.75rem;color:var(--earth);margin-top:0.1rem">nukkad.in/${s.handle}</div>
          </div>
          <span style="color:var(--ink-light)">→</span>
        </div>`).join('');
    } else {
      storeWrap.innerHTML = `<div class="pp-no-store">
        <p>You haven't created a store yet</p>
        <button class="btn-primary" style="font-size:0.82rem;padding:0.6rem 1.2rem;margin-top:0.8rem" onclick="closePanel();startCreate()">+ Create My Store</button>
      </div>`;
    }
    // Add logout button (only when logged in)
    if (currentAuthUser) {
      storeWrap.innerHTML += `<button onclick="logOut()" style="width:100%;margin-top:1.2rem;background:none;border:1.5px solid var(--rose);color:var(--rose);padding:0.7rem;border-radius:var(--radius-sm);font-size:0.84rem;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;">Log Out</button>`;
    }
  } catch(e) {
    console.error('loadMyStores error:', e);
    storeWrap.innerHTML = '<div style="font-size:0.8rem;color:var(--rose)">Error loading stores</div>';
  }
}
function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}
function enhanceDesc(textareaId, btn) {
  const textarea = document.getElementById(textareaId);
  const raw = textarea.value.trim();
  if (!raw) { showToast('Type a basic description first ✍️'); return; }

  btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span> Enhancing...';

  const card = textarea.closest('.pe') || textarea.closest('.apm-box');
  let productName = '';
  if (card) {
    const nameInput = card.querySelector('input[type="text"]') || card.querySelector('.ci');
    if (nameInput) productName = nameInput.value.trim();
  }

  setTimeout(() => {
    try {
      const enhanced = smartEnhance(raw, productName);
      textarea.value = enhanced;
      textarea.style.borderColor = 'var(--gold-light)';
      setTimeout(() => textarea.style.borderColor = '', 2000);
      showToast('Description enhanced! ✨');
    } catch(e) {
      showToast('Could not enhance — try again');
    }
    btn.disabled = false;
    btn.innerHTML = '✨ Enhance';
  }, 600);
}

function smartEnhance(raw, productName) {
  // Extract useful fragments from raw input
  const lower = raw.toLowerCase();
  const name = productName || '';

  // Detect keywords for ingredients / properties
  const ingredients = [];
  const ingredientWords = ['amla','bhringraj','neem','coconut','aloe','turmeric','rose','sandalwood',
    'kesar','saffron','honey','almond','castor','sesame','til','methi','fenugreek','curry leaf',
    'hibiscus','lavender','tea tree','shea','argan','charcoal','multani','besan','milk','cream',
    'chocolate','vanilla','cinnamon','cardamom','elaichi','cashew','kaju','pista','mango',
    'strawberry','lemon','orange','maida','wheat','atta','oats','jaggery','gud','ghee'];
  ingredientWords.forEach(i => { if (lower.includes(i)) ingredients.push(i); });

  // Detect benefit keywords
  const benefits = [];
  if (/hair.?(fall|loss|thin)/i.test(raw)) benefits.push('reduces hair fall');
  if (/dandruff|itchy scalp|flak/i.test(raw)) benefits.push('fights dandruff');
  if (/hair.?(grow|growth|long)/i.test(raw)) benefits.push('promotes hair growth');
  if (/dry.?hair|frizz/i.test(raw)) benefits.push('tames frizz and dryness');
  if (/shine|shiny|gloss/i.test(raw)) benefits.push('adds shine');
  if (/skin|glow|bright/i.test(raw)) benefits.push('gives a natural glow');
  if (/moistur|hydrat/i.test(raw)) benefits.push('deeply moisturises');
  if (/acne|pimple|breakout/i.test(raw)) benefits.push('controls acne and breakouts');
  if (/soft|smooth/i.test(raw)) benefits.push('leaves skin soft and smooth');
  if (/fresh|soft.?cake|moist.?cake|fluffy/i.test(raw)) benefits.push('incredibly soft and moist');
  if (/crunchy|crispy/i.test(raw)) benefits.push('perfectly crunchy');
  if (/spicy|masala|tangy/i.test(raw)) benefits.push('perfectly spiced');
  if (/sweet|mithai|sugar/i.test(raw)) benefits.push('perfectly sweetened');
  if (/protein|calcium|nutrition/i.test(raw)) benefits.push('packed with nutrition');
  if (/preservative|chemical|natural|organic/i.test(raw)) benefits.push('free from preservatives');
  if (/handmade|hand.?craft|homemade|home.?made/i.test(raw)) benefits.push('lovingly handcrafted');
  if (/daily|everyday|routine/i.test(raw)) benefits.push('perfect for daily use');
  if (/gift|occasion|celebrat/i.test(raw)) benefits.push('a perfect gift');
  if (/custom|order|personaliz/i.test(raw)) benefits.push('available in custom sizes');

  // Build sentence parts
  const namePhrase = name ? `**${name}**` : 'This product';
  const ingredientPhrase = ingredients.length > 0
    ? `Made with ${ingredients.slice(0,3).map(i => i.charAt(0).toUpperCase()+i.slice(1)).join(', ')}`
    : null;
  const benefitPhrase = benefits.length > 0
    ? benefits.slice(0,2).join(' and ')
    : null;

  // Closing lines pool — pick based on content
  const closings = [
    'Order now and experience the difference.',
    'Made fresh at home with love and care.',
    'Trusted by customers across Mumbai.',
    'A must-try for every home.',
    'Pure, natural, and made just for you.',
    'Made fresh, delivered with love.',
    'No shortcuts, only the best quality.',
  ];
  const closing = closings[Math.floor(Math.random() * closings.length)];

  // Assemble description
  let parts = [];

  if (ingredientPhrase && benefitPhrase) {
    parts.push(`${namePhrase} is a carefully crafted home-based product. ${ingredientPhrase}, it ${benefitPhrase}.`);
  } else if (ingredientPhrase) {
    parts.push(`${namePhrase} is made with ${ingredients.slice(0,3).join(', ')} — bringing you a pure, natural experience at home.`);
  } else if (benefitPhrase) {
    parts.push(`${namePhrase} is crafted to ${benefitPhrase}, helping you feel your best every day.`);
  } else {
    // Fallback: clean up and expand the raw text
    const cleaned = raw.charAt(0).toUpperCase() + raw.slice(1).replace(/\.$/, '');
    parts.push(`${namePhrase} — ${cleaned}. Carefully made at home with quality ingredients.`);
  }

  parts.push(closing);
  return parts.join(' ').replace(/\*\*/g, '');
}

function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2600);
}
// ═══════════════════════════════════
// CHAT WIDGET
// ═══════════════════════════════════
let chatMsgs = [];
let chatCurStore = null;

function openChatWidget() {
  if (!curStore) return;
  if (chatCurStore !== curStore) {
    chatCurStore = curStore;
    chatMsgs = [];
    document.getElementById('chat-hdr-av').textContent = curStore.emoji || '🌿';
    document.getElementById('chat-hdr-name').textContent = curStore.brand_name;
    renderChatMsgs();
    const prodCount = (curStore.products || []).length;
    const greeting = `Hi! 👋 I'm here to help you find the perfect product from **${curStore.brand_name}**.\n\nWe have ${prodCount} product${prodCount!==1?'s':''} — describe what you're looking for or any concern, and I'll point you to the right one!`;
    appendChatMsg('assistant', greeting);
  }
  document.getElementById('chat-panel').classList.add('open');
  setTimeout(() => document.getElementById('chat-input').focus(), 200);
}

function closeChatWidget() {
  document.getElementById('chat-panel').classList.remove('open');
}

function renderChatMsgs() {
  const container = document.getElementById('chat-msgs');
  container.innerHTML = chatMsgs.map(m => {
    const html = m.content
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\n/g,'<br>');
    return `<div class="cm cm-${m.role}"><div class="cm-bubble">${html}</div></div>`;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

function appendChatMsg(role, content) {
  chatMsgs.push({role, content});
  renderChatMsgs();
}

function smartChatReply(userText, store) {
  const q = userText.toLowerCase();
  const products = store.products || [];

  // Greeting
  if (/^(hi|hello|hey|hlo|hii|namaste|namaskar|good\s*(morning|evening|afternoon))\b/.test(q)) {
    return `Hi there! 👋 Welcome to **${store.brand_name}**! I'm here to help you find the right product. Tell me what you're looking for or describe your concern!`;
  }

  // Price question
  if (/price|cost|how much|kitna|rate/.test(q)) {
    if (products.length === 0) return `Please reach out to us on WhatsApp for pricing details!`;
    const list = products.map(p => `• **${p.name}** — ₹${p.price}`).join('\n');
    return `Here are our products and prices:\n\n${list}\n\nTap any product's Order button to buy on WhatsApp!`;
  }

  // All products
  if (/all product|what do you sell|what.?s available|show.?all|full list|kya hai/.test(q)) {
    if (products.length === 0) return `We're setting up our product list. Please check back soon or WhatsApp us!`;
    const list = products.map(p => `• **${p.name}** — ₹${p.price}`).join('\n');
    return `Here's everything we offer:\n\n${list}\n\nWant help choosing? Tell me your need and I'll suggest the best one!`;
  }

  // Score each product by keyword match
  const scores = products.map(p => {
    const pText = `${p.name} ${p.description || ''}`.toLowerCase();
    let score = 0;

    // Direct name match — highest weight
    if (q.includes(p.name.toLowerCase())) score += 10;

    // Word overlap
    const qWords = q.split(/\s+/).filter(w => w.length > 3);
    qWords.forEach(w => { if (pText.includes(w)) score += 2; });

    // Hair concerns
    if (/hair.?fall|hair.?loss|baal.?jhar/.test(q) && /fall|loss|bhring|amla|growth/.test(pText)) score += 5;
    if (/dandruff|itchy|scalp|khujli/.test(q) && /dandruff|neem|tea tree|anti.?fung/.test(pText)) score += 5;
    if (/dry.?hair|frizz|rough.?hair/.test(q) && /dry|moistur|smooth|coconut|argan/.test(pText)) score += 5;
    if (/hair.?grow|long.?hair|baal.?badh/.test(q) && /grow|growth|long|bhring|onion/.test(pText)) score += 5;
    if (/shine|shiny|gloss/.test(q) && /shine|gloss|smooth/.test(pText)) score += 4;

    // Skin concerns
    if (/acne|pimple|breakout/.test(q) && /acne|pimple|neem|tea tree|salicyl/.test(pText)) score += 5;
    if (/glow|bright|fair|skin light/.test(q) && /glow|bright|turmeric|saffron|kesar/.test(pText)) score += 5;
    if (/dry.?skin|moistur|hydrat/.test(q) && /moistur|hydrat|aloe|shea/.test(pText)) score += 5;
    if (/oily.?skin|oily.?face/.test(q) && /oily|control|mattif|charcoal|multani/.test(pText)) score += 5;

    // Food concerns
    if (/cake|birthday|celebrat/.test(q) && /cake|bak|celebrat/.test(pText)) score += 5;
    if (/snack|namkeen|farsan|chakli|mathri/.test(q) && /snack|namkeen|farsan|crispy|crunchy/.test(pText)) score += 5;
    if (/sweet|mithai|dessert|meetha/.test(q) && /sweet|mithai|ladoo|barfi|halwa/.test(pText)) score += 5;
    if (/spicy|masala|tangy/.test(q) && /spicy|masala|tangy/.test(pText)) score += 4;
    if (/healthy|diet|protein|nutrition/.test(q) && /healthy|protein|nutrition|oat|wheat/.test(pText)) score += 4;

    // Gift
    if (/gift|present|occasion|someone/.test(q) && /gift|hamper|pack|premium/.test(pText)) score += 4;

    return { p, score };
  });

  // Sort by score
  scores.sort((a, b) => b.score - a.score);
  const top = scores.filter(x => x.score > 0);

  if (top.length === 0) {
    // No match — give a helpful fallback
    if (products.length > 0) {
      const random = products[Math.floor(Math.random() * products.length)];
      return `I'm not sure about that specific concern, but you might want to check out **${random.name}** (₹${random.price}). For personalized advice, tap the WhatsApp button and chat directly with the seller! 😊`;
    }
    return `I'm not sure about that. Please WhatsApp the seller directly for personalized help!`;
  }

  if (top.length === 1 || top[0].score > top[1].score + 3) {
    // Clear winner
    const best = top[0].p;
    const desc = best.description ? ` — ${best.description.slice(0,80)}${best.description.length > 80 ? '...' : ''}` : '';
    return `Based on what you described, I'd recommend **${best.name}** (₹${best.price})${desc}\n\nTap the Order button on that product to place your order on WhatsApp! 🌿`;
  }

  // Multiple good matches
  const topTwo = top.slice(0, 2);
  const options = topTwo.map(x => `• **${x.p.name}** — ₹${x.p.price}`).join('\n');
  return `A couple of products could work for you:\n\n${options}\n\nCan you tell me a bit more about your concern? I'll help narrow it down! 😊`;
}

function sendChatMsg() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || !curStore) return;
  input.value = '';
  appendChatMsg('user', text);

  // Typing indicator
  const container = document.getElementById('chat-msgs');
  const typingEl = document.createElement('div');
  typingEl.className = 'cm cm-assistant';
  typingEl.id = 'chat-typing';
  typingEl.innerHTML = '<div class="cm-bubble"><span class="chat-dots"><span></span><span></span><span></span></span></div>';
  container.appendChild(typingEl);
  container.scrollTop = container.scrollHeight;
  document.getElementById('chat-send-btn').disabled = true;

  // Simulate thinking delay
  setTimeout(() => {
    document.getElementById('chat-typing')?.remove();
    const reply = smartChatReply(text, curStore);
    appendChatMsg('assistant', reply);
    document.getElementById('chat-send-btn').disabled = false;
    input.focus();
  }, 700);
}

// ═══════════════════════════════════
// NUKKAD ORIGIN STORY
// ═══════════════════════════════════

const STORY_LINES = [
  { text: 'Every lane in India has one.',             style: '',                   pause: 0 },
  { text: 'That one aunty whose pickles',             style: '',                   pause: 0 },
  { text: "you'd cross the city for.",                style: 'accent',             pause: 0 },
  { text: 'That artisan whose craft',                 style: '',                   pause: 0 },
  { text: 'you can feel before you touch.',           style: 'accent',             pause: 0 },
  { text: 'The bakery that smells like',              style: '',                   pause: 0 },
  { text: 'Sunday morning.',                          style: 'accent pause-after', pause: 400 },
  { text: 'They never needed a website.',             style: 'bold',               pause: 0 },
  { text: 'Their reputation was their storefront.',   style: '',                   pause: 0 },
  { text: 'Their neighbourhood was their marketplace.', style: 'pause-after',      pause: 400 },
  { text: 'Then the world moved online.',             style: 'bold',               pause: 0 },
  { text: 'And somehow, they got left behind.',       style: 'accent pause-after', pause: 400 },
  { text: "Not because they weren't good enough.",   style: '',                   pause: 0 },
  { text: 'Because nobody built something for them.', style: 'bold pause-after',  pause: 600 },
  { text: 'Until now.',                               style: 'accent bold',        pause: 0 },
];

let storyTimers = [];
let storySkipped = false;

function openNukkadStory() {
  storySkipped = false;
  storyTimers.forEach(clearTimeout);
  storyTimers = [];

  const overlay = document.getElementById('nukkad-story-overlay');
  const linesContainer = document.getElementById('ns-lines');
  const logo = document.getElementById('ns-logo');
  const endCard = document.getElementById('ns-end-card');

  // Reset
  linesContainer.innerHTML = '';
  logo.style.opacity = '0';
  endCard.style.opacity = '0';

  // Build line elements
  STORY_LINES.forEach((line, i) => {
    const el = document.createElement('div');
    el.className = 'ns-line ' + (line.style || '');
    el.textContent = line.text;
    el.id = 'ns-line-' + i;
    linesContainer.appendChild(el);
  });

  // Show overlay
  overlay.style.display = 'flex';
  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

  // Logo fades in first
  storyTimers.push(setTimeout(() => {
    if (!storySkipped) logo.style.opacity = '1';
  }, 400));

  // Lines appear one by one
  let delay = 1200;
  const BASE_INTERVAL = 620;

  STORY_LINES.forEach((line, i) => {
    storyTimers.push(setTimeout(() => {
      if (storySkipped) return;
      const el = document.getElementById('ns-line-' + i);
      if (!el) return;
      el.classList.add('visible');

      // Dim all previous lines slightly
      for (let j = 0; j < i; j++) {
        const prev = document.getElementById('ns-line-' + j);
        if (prev && !prev.classList.contains('accent') &&
            !prev.classList.contains('bold')) {
          prev.classList.add('dim');
        }
      }
    }, delay));

    delay += BASE_INTERVAL + (line.pause || 0);
  });

  // End card appears after all lines
  storyTimers.push(setTimeout(() => {
    if (storySkipped) return;
    endCard.style.opacity = '1';
  }, delay + 600));
}

function closeNukkadStory() {
  storySkipped = true;
  storyTimers.forEach(clearTimeout);
  storyTimers = [];

  const overlay = document.getElementById('nukkad-story-overlay');
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 600);
}

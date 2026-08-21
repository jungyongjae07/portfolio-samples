// Kitship demo product catalog — shared by index.html / product.html / admin.html.
// Static site, no backend: "purchases", reviews, and admin-uploaded products persist in localStorage only.

function KITSHIP_ICON(kind){
  var icons = {
    portfolio: '<svg viewBox="0 0 200 140" fill="none" stroke="currentColor" stroke-width="1.6" style="color:var(--accent)"><rect x="20" y="16" width="160" height="108" rx="8"/><circle cx="58" cy="52" r="14"/><path d="M40 96 q18 -22 36 0 q18 -22 36 0"/><path d="M126 40h40M126 52h28"/></svg>',
    startup: '<svg viewBox="0 0 200 140" fill="none" stroke="currentColor" stroke-width="1.6" style="color:var(--accent)"><rect x="20" y="16" width="160" height="108" rx="8"/><path d="M40 100 L74 60 L100 84 L160 34"/><circle cx="160" cy="34" r="4" fill="currentColor" stroke="none"/><path d="M40 112h120"/></svg>',
    storefront: '<svg viewBox="0 0 200 140" fill="none" stroke="currentColor" stroke-width="1.6" style="color:var(--accent)"><rect x="20" y="16" width="160" height="108" rx="8"/><rect x="38" y="38" width="46" height="46" rx="4"/><rect x="94" y="38" width="46" height="46" rx="4"/><path d="M38 100h102"/></svg>',
    local: '<svg viewBox="0 0 200 140" fill="none" stroke="currentColor" stroke-width="1.6" style="color:var(--accent)"><rect x="20" y="16" width="160" height="108" rx="8"/><path d="M60 100V64l40-24 40 24v36"/><path d="M60 100h80M92 100V78h16v22"/></svg>'
  };
  return icons[kind] || icons.portfolio;
}

// Fixed ids on seed reviews so hide/unhide keys stay stable across renders.
var KITSHIP_SEED_REVIEWS = {
  'portfolio-kit': [
    {id:'seed-1', name:'R. Souza', rating:5, text:'Clean code, easy to restyle. Had it live on my own domain in under an hour.'},
    {id:'seed-2', name:'K. Ito', rating:4, text:'Good starting point. Had to add my own dark-mode toggle but the structure made that easy.'}
  ],
  'startup-kit': [
    {id:'seed-1', name:'A. Reyes', rating:5, text:'Pricing table markup alone saved me a weekend. Plugged in Stripe Checkout without fighting the layout.'}
  ],
  'storefront-kit': [
    {id:'seed-1', name:'M. Haddad', rating:4, text:'Solid base for a single-product store. Needed to extend the option selector for a second variant type.'}
  ],
  'local-kit': [
    {id:'seed-1', name:'J. Novak', rating:5, text:'Used this for a client salon site — the multi-page nav just worked, no extra wiring needed.'}
  ]
};

function KITSHIP_BASE_PRODUCTS(){
  return [
    {
      id:'portfolio-kit', icon:KITSHIP_ICON('portfolio'), name:'Portfolio Kit', tagline:'Single-page developer or creative portfolio',
      price:29, file:'downloads/portfolio-kit.zip',
      desc:'A clean single-page portfolio template — hero, project grid, about, and contact section. Built with plain HTML/CSS/JS, no framework required.',
      specs:{ 'Pages':'1', 'Stack':'HTML / CSS / JS', 'License':'Personal & commercial use', 'Updates':'Free for 1 year' }
    },
    {
      id:'startup-kit', icon:KITSHIP_ICON('startup'), name:'Startup Landing Kit', tagline:'SaaS landing page with pricing and waitlist form',
      price:39, file:'downloads/startup-kit.zip',
      desc:'A conversion-focused SaaS landing page — hero, feature grid, pricing table, and a waitlist form ready to wire up to your email provider.',
      specs:{ 'Pages':'1 (5 sections)', 'Stack':'HTML / CSS / JS', 'License':'Personal & commercial use', 'Updates':'Free for 1 year' }
    },
    {
      id:'storefront-kit', icon:KITSHIP_ICON('storefront'), name:'Storefront Kit', tagline:'Product page with a cart-ready layout',
      price:45, file:'downloads/storefront-kit.zip',
      desc:'A product-page layout with quantity/option selectors and a cart-ready markup structure — drop in your own checkout provider.',
      specs:{ 'Pages':'1', 'Stack':'HTML / CSS / JS', 'License':'Personal & commercial use', 'Updates':'Free for 1 year' }
    },
    {
      id:'local-kit', icon:KITSHIP_ICON('local'), name:'Local Business Kit', tagline:'Multi-page site with booking and contact forms',
      price:35, file:'downloads/local-kit.zip',
      desc:'A 3-page template for local businesses — home, services, and a contact/booking page with real page-to-page navigation.',
      specs:{ 'Pages':'3', 'Stack':'HTML / CSS / JS', 'License':'Personal & commercial use', 'Updates':'Free for 1 year' }
    }
  ];
}

function KITSHIP_PRODUCTS(){
  var custom = [];
  var reviews = {};
  var orders = [];
  var hidden = [];
  try { custom = JSON.parse(localStorage.getItem('kitship_products') || '[]'); } catch(e){}
  try { reviews = JSON.parse(localStorage.getItem('kitship_reviews') || '{}'); } catch(e){}
  try { orders = JSON.parse(localStorage.getItem('kitship_orders') || '[]'); } catch(e){}
  try { hidden = JSON.parse(localStorage.getItem('kitship_hidden_reviews') || '[]'); } catch(e){}

  var all = KITSHIP_BASE_PRODUCTS().concat(custom);
  all.forEach(function(p){
    var stored = reviews[p.id] || [];
    var every = (KITSHIP_SEED_REVIEWS[p.id] || []).concat(stored);
    p.allReviews = every; // unfiltered, used by admin moderation view
    p.reviews = every.filter(function(r){ return hidden.indexOf(p.id + ':' + r.id) === -1; });
    var sum = p.reviews.reduce(function(s,r){ return s + r.rating; }, 0);
    p.rating = p.reviews.length ? (sum / p.reviews.length) : 5;
    p.orderCount = orders.filter(function(o){ return o.productId === p.id; }).length;
  });
  return all;
}

function KITSHIP_ADD_REVIEW(productId, name, rating, text){
  var reviews = {};
  try { reviews = JSON.parse(localStorage.getItem('kitship_reviews') || '{}'); } catch(e){}
  if (!reviews[productId]) reviews[productId] = [];
  reviews[productId].push({ id:'r_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6), name:name, rating:rating, text:text });
  localStorage.setItem('kitship_reviews', JSON.stringify(reviews));
}

function KITSHIP_ADD_ORDER(productId, productName, price, email){
  var orders = [];
  try { orders = JSON.parse(localStorage.getItem('kitship_orders') || '[]'); } catch(e){}
  var order = {
    id: 'ord_' + Date.now().toString(36),
    productId: productId, productName: productName, price: price,
    email: email || 'buyer@example.com',
    time: new Date().toISOString()
  };
  orders.unshift(order);
  localStorage.setItem('kitship_orders', JSON.stringify(orders));
  return order;
}

function KITSHIP_ADD_PRODUCT(product){
  var custom = [];
  try { custom = JSON.parse(localStorage.getItem('kitship_products') || '[]'); } catch(e){}
  custom.push(product);
  localStorage.setItem('kitship_products', JSON.stringify(custom));
}

function KITSHIP_TOGGLE_REVIEW(productId, reviewId){
  var hidden = [];
  try { hidden = JSON.parse(localStorage.getItem('kitship_hidden_reviews') || '[]'); } catch(e){}
  var key = productId + ':' + reviewId;
  var pos = hidden.indexOf(key);
  var nowHidden;
  if (pos === -1) { hidden.push(key); nowHidden = true; }
  else { hidden.splice(pos,1); nowHidden = false; }
  localStorage.setItem('kitship_hidden_reviews', JSON.stringify(hidden));
  return nowHidden;
}

function KITSHIP_IS_REVIEW_HIDDEN(productId, reviewId){
  var hidden = [];
  try { hidden = JSON.parse(localStorage.getItem('kitship_hidden_reviews') || '[]'); } catch(e){}
  return hidden.indexOf(productId + ':' + reviewId) !== -1;
}

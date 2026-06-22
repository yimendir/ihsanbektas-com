const animatedEls = document.querySelectorAll("[data-animate]");
const counters = document.querySelectorAll("[data-counter]");
const mapButtons = document.querySelectorAll(".location-btn");
const mapContainerInline = document.getElementById("districtMap");
const mapContainerModal = document.getElementById("districtMapModal");
const heroMapContainer = document.getElementById("heroDistrictMap");
const mapListingGrid = document.getElementById("mapListingGrid");
const catalogGrid = document.getElementById("catalogGrid");
const catalogDistrictFilter = document.getElementById("catalogDistrictFilter");
const catalogTypeFilter = document.getElementById("catalogTypeFilter");
const catalogCount = document.getElementById("catalogCount");
const openMapModalBtn = document.getElementById("openMapModal");
const closeMapModalBtn = document.getElementById("closeMapModal");
const mapModal = document.getElementById("mapModal");
const spotlightTrack = document.getElementById("spotlightTrack");
const spotlightPrevBtn = document.getElementById("spotlightPrev");
const spotlightNextBtn = document.getElementById("spotlightNext");
const spotlightDots = document.getElementById("spotlightDots");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminPasswordInput = document.getElementById("adminPassword");
const adminError = document.getElementById("adminError");
const adminLoginCard = document.getElementById("adminLoginCard");
const adminPanel = document.getElementById("adminPanel");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const listingForm = document.getElementById("listingForm");
const listingImageFile = document.getElementById("listingImageFile");
const resetListingFormBtn = document.getElementById("resetListingForm");
const listingTableBody = document.getElementById("listingTableBody");
const listingCountStat = document.getElementById("listingCountStat");
const exportListingsBtn = document.getElementById("exportListings");
const importListingsInput = document.getElementById("importListingsInput");
const adminStatus = document.getElementById("adminStatus");
const adminPickerMapContainer = document.getElementById("adminPickerMap");
const adminMapHint = document.getElementById("adminMapHint");

const districtViews = {
  all: { center: [41.606, 27.266], zoom: 10 },
  babaeski: { center: [41.6761, 27.2186], zoom: 13 },
  luleburgaz: { center: [41.4058, 27.3552], zoom: 13 },
  kirklareli: { center: [41.7351, 27.2252], zoom: 13 }
};

const LISTING_STORAGE_KEY = "emlak_agent_listings_v1";
const ADMIN_SESSION_KEY = "emlak_agent_admin_session";
const ADMIN_PASSWORD = "ib2026";
const DEFAULT_LISTINGS = [
  {
    id: "bbk-001",
    district: "babaeski",
    type: "Satılık",
    title: "KW Plus'tan Yüksek Potansiyelli Satılık Sanayi İmarlı Arsa",
    price: "₺99.000.000",
    size: "24.713 m²",
    area: "Cumhuriyet Mahallesi",
    address: "Cumhuriyet Mahallesi, Babaeski, Kırklareli, Türkiye",
    block: "",
    parcel: "",
    summary: "Sanayi imarlı | Emsal 0.50 | Gabari 12.50 | Müstakil tapulu",
    image: "assets/arsa-babaeski-cumhuriyet.jpg",
    detailUrl:
      "https://www.sahibinden.com/ilan/emlak-arsa-satilik-kw-plus-tan-yuksek-potansiyelli-satilik-sanayi-imarli-arsa-1274493174/detay",
    coords: [41.6766, 27.2191]
  },
  {
    id: "bbk-003",
    district: "babaeski",
    type: "Satılık",
    title: "KW Plus Karacaoğlan Köyü'nde Satılık Tarla",
    price: "₺2.200.000",
    size: "10.242 m²",
    area: "Karacaoğlan Köyü",
    address: "Karacaoğlan Köyü, Babaeski, Kırklareli, Türkiye",
    block: "",
    parcel: "",
    summary: "Arazi | m² fiyatı ₺215 | Müstakil tapulu | Krediye uygun değil",
    image: "",
    detailUrl:
      "https://www.sahibinden.com/ilan/emlak-arsa-satilik-kw-plus-karacaoglan-koyunde-satilik-tarla-1305146484/detay",
    coords: [41.5266, 27.0853]
  },
  {
    id: "bbk-004",
    district: "babaeski",
    type: "Satılık",
    title: "Anadolu Lisesi ve Bilim Sanat Merkezi Yanında Satılık Daire",
    price: "₺3.600.000",
    size: "140 m² (Brüt)",
    area: "Hamidiye Mahallesi",
    address: "Hamidiye Mahallesi, Babaeski, Kırklareli, Türkiye",
    block: "",
    parcel: "",
    summary: "3+1 | 120 m² net | 4. kat | Açık otopark | Hürriyet Sitesi 1",
    image: "",
    detailUrl: "",
    coords: [41.6737, 27.2208]
  }
];

let listingsData = loadListings();

function createFallbackListing() {
  return {
    id: `listing-${Date.now()}`,
    district: "babaeski",
    type: "Satılık",
    title: "Yeni İlan",
    price: "Fiyat bilgisi girilmedi",
    size: "0 m²",
    area: "Bölge bilgisi girilmedi",
    address: "",
    block: "",
    parcel: "",
    summary: "",
    image: "",
    detailUrl: "",
    coords: [41.6761, 27.2186]
  };
}

function normalizeDistrict(value) {
  const district = String(value || "")
    .toLocaleLowerCase("tr-TR")
    .trim();
  if (district === "babaeski" || district === "luleburgaz" || district === "kirklareli") {
    return district;
  }
  return "babaeski";
}

function normalizeType(value) {
  const normalized = String(value || "")
    .toLocaleLowerCase("tr-TR")
    .trim();
  return normalized.includes("kiralık") || normalized.includes("kiralik") ? "Kiralık" : "Satılık";
}

function sanitizeText(value) {
  return String(value || "").trim();
}

function normalizeSize(value) {
  const text = sanitizeText(value);
  if (!text) return "0 m²";
  const lower = text.toLocaleLowerCase("tr-TR");
  if (lower.includes("m²") || lower.includes("m2")) {
    return text.replace(/\bm2\b/gi, "m²");
  }
  return `${text} m²`;
}

function sanitizeUrl(value) {
  const text = sanitizeText(value);
  if (!text) return "";
  if (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("data:image/")) {
    return text;
  }
  return "";
}

function normalizeCoords(value) {
  if (!Array.isArray(value) || value.length !== 2) {
    return [41.6761, 27.2186];
  }
  const lat = Number(value[0]);
  const lng = Number(value[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return [41.6761, 27.2186];
  }
  return [lat, lng];
}

function sanitizeListing(entry) {
  const fallback = createFallbackListing();
  const clean = {
    id: sanitizeText(entry.id) || fallback.id,
    district: normalizeDistrict(entry.district),
    type: normalizeType(entry.type),
    title: sanitizeText(entry.title) || fallback.title,
    price: sanitizeText(entry.price) || fallback.price,
    size: normalizeSize(entry.size),
    area: sanitizeText(entry.area) || fallback.area,
    address: sanitizeText(entry.address),
    block: sanitizeText(entry.block),
    parcel: sanitizeText(entry.parcel),
    summary: sanitizeText(entry.summary),
    image: sanitizeUrl(entry.image),
    detailUrl: sanitizeUrl(entry.detailUrl),
    coords: normalizeCoords(entry.coords)
  };
  return clean;
}

function sanitizeListingArray(items) {
  if (!Array.isArray(items)) return [];
  return items.map(sanitizeListing);
}

function loadListings() {
  try {
    const raw = window.localStorage.getItem(LISTING_STORAGE_KEY);
    if (!raw) return sanitizeListingArray(DEFAULT_LISTINGS);
    const parsed = JSON.parse(raw);
    const cleaned = sanitizeListingArray(parsed);
    return cleaned.length ? cleaned : sanitizeListingArray(DEFAULT_LISTINGS);
  } catch (error) {
    return sanitizeListingArray(DEFAULT_LISTINGS);
  }
}

function saveListings(nextListings) {
  listingsData = sanitizeListingArray(nextListings);
  try {
    window.localStorage.setItem(LISTING_STORAGE_KEY, JSON.stringify(listingsData));
  } catch (error) {
    // Sessiz geç: localStorage dolu veya engelli olabilir.
  }
}

function getListings() {
  return listingsData;
}

const mapStates = {
  inline: {
    container: mapContainerInline,
    map: null,
    markerLayer: null,
    markers: new Map()
  },
  modal: {
    container: mapContainerModal,
    map: null,
    markerLayer: null,
    markers: new Map()
  }
};

let activeDistrict = "all";
let isModalOpen = false;
let lastFocusedElement = null;
const adminPickerState = {
  map: null,
  marker: null
};

function animateCounters() {
  counters.forEach((counter) => {
    const target = Number(counter.dataset.counter || 0);
    const suffix = counter.textContent.includes("%") ? "%" : "";
    let current = 0;
    const duration = 1200;
    const increment = Math.max(1, Math.floor(target / (duration / 16)));

    const step = () => {
      current += increment;
      if (current >= target) {
        counter.textContent = `${target}${suffix}`;
        return;
      }
      counter.textContent = `${current}${suffix}`;
      requestAnimationFrame(step);
    };

    counter.textContent = "0";
    requestAnimationFrame(step);
  });
}

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.13 }
  );

  animatedEls.forEach((el) => io.observe(el));
} else {
  animatedEls.forEach((el) => el.classList.add("is-visible"));
}

animateCounters();

function getFilteredListings(district) {
  if (!district || district === "all") {
    return getListings();
  }
  return getListings().filter((listing) => listing.district === district);
}

function getDistrictLabel(district) {
  if (district === "babaeski") return "Babaeski";
  if (district === "luleburgaz") return "Lüleburgaz";
  if (district === "kirklareli") return "Kırklareli";
  return "Kırklareli";
}

function getTypeKey(type) {
  return type.toLocaleLowerCase("tr-TR").includes("kiralık") ? "kiralik" : "satilik";
}

function renderListingCards(listings) {
  if (!mapListingGrid) return;

  if (!listings.length) {
    mapListingGrid.innerHTML =
      '<article class="map-listing-card"><p class="map-listing-meta">Bu bölgede henüz ilan bulunmuyor.</p></article>';
    return;
  }

  mapListingGrid.innerHTML = listings
    .map((listing) => {
      const badgeClass = listing.type.toLocaleLowerCase("tr-TR").includes("kiralık")
        ? "map-badge is-rent"
        : "map-badge";
      const detailMarkup = listing.detailUrl
        ? `<a class="map-listing-detail" href="${listing.detailUrl}" target="_blank" rel="noopener noreferrer">İlan Linki</a>`
        : "";
      const mediaMarkup = listing.image
        ? `<img class="map-listing-thumb map-listing-photo" src="${listing.image}" alt="${listing.title}" loading="lazy" />`
        : `<div class="map-listing-thumb"><span>${getDistrictLabel(listing.district)} • Örnek Görsel</span></div>`;

      return `
        <article class="map-listing-card" data-listing-id="${listing.id}">
          ${mediaMarkup}
          <div class="map-listing-head">
            <h4>${listing.title}</h4>
            <span class="${badgeClass}">${listing.type}</span>
          </div>
          <p class="map-listing-meta">${listing.area} • ${listing.size}</p>
          ${listing.summary ? `<p class="map-listing-meta">${listing.summary}</p>` : ""}
          <div class="map-listing-price">${listing.price}</div>
          <div class="map-listing-actions">
            <button type="button">Haritada Göster</button>
            ${detailMarkup}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCatalogCards(listings) {
  if (!catalogGrid) return;

  if (!listings.length) {
    catalogGrid.innerHTML =
      '<article class="catalog-card"><p class="catalog-meta">Bu filtrede ilan bulunamadı.</p></article>';
    if (catalogCount) catalogCount.textContent = "0 ilan";
    return;
  }

  catalogGrid.innerHTML = listings
    .map((listing) => {
      const badgeClass = getTypeKey(listing.type) === "kiralik" ? "map-badge is-rent" : "map-badge";
      const detailMarkup = listing.detailUrl
        ? `<a class="catalog-detail-btn" href="${listing.detailUrl}" target="_blank" rel="noopener noreferrer">İlan Linki</a>`
        : "";
      const mediaMarkup = listing.image
        ? `<img class="map-listing-thumb map-listing-photo" src="${listing.image}" alt="${listing.title}" loading="lazy" />`
        : `<div class="map-listing-thumb"><span>${getDistrictLabel(listing.district)} • Örnek Görsel</span></div>`;

      return `
        <article class="catalog-card" data-listing-id="${listing.id}">
          ${mediaMarkup}
          <div class="catalog-head">
            <h3>${listing.title}</h3>
            <span class="${badgeClass}">${listing.type}</span>
          </div>
          <p class="catalog-meta">${listing.area} • ${listing.size}</p>
          ${listing.summary ? `<p class="catalog-meta">${listing.summary}</p>` : ""}
          <p class="catalog-price">${listing.price}</p>
          <div class="catalog-actions">
            <button type="button" class="catalog-map-btn" data-map-id="${listing.id}">Haritada Göster</button>
            ${detailMarkup}
            <a class="catalog-call-btn" href="tel:+905326032339">Hemen Ara</a>
          </div>
        </article>
      `;
    })
    .join("");

  if (catalogCount) {
    catalogCount.textContent = `${listings.length} ilan`;
  }
}

function getCatalogFilteredListings() {
  const district = catalogDistrictFilter ? catalogDistrictFilter.value : "all";
  const type = catalogTypeFilter ? catalogTypeFilter.value : "all";

  return getListings().filter((listing) => {
    const districtMatch = district === "all" || listing.district === district;
    const typeMatch = type === "all" || getTypeKey(listing.type) === type;
    return districtMatch && typeMatch;
  });
}

function setActiveDistrictButton(district) {
  mapButtons.forEach((item) => {
    item.classList.toggle("is-active", (item.dataset.district || "all") === district);
  });
}

function createMarkerIcon(type) {
  const isRent = type.toLocaleLowerCase("tr-TR").includes("kiralık");

  return window.L.divIcon({
    className: "",
    html: `<span class="map-pin${isRent ? " is-rent" : ""}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function createPopupMarkup(listing) {
  const detailLink = listing.detailUrl
    ? `<p><a href="${listing.detailUrl}" target="_blank" rel="noopener noreferrer">İlan Detayı</a></p>`
    : "";
  const cadastre = listing.block || listing.parcel ? `<p>Ada/Parsel: ${listing.block || "-"} / ${listing.parcel || "-"}</p>` : "";

  return `
    <div class="map-popup">
      <h4>${listing.title}</h4>
      <p>${listing.type} • ${listing.size}</p>
      <p>${listing.area}</p>
      ${listing.address ? `<p>${listing.address}</p>` : ""}
      ${cadastre}
      <p><strong>${listing.price}</strong></p>
      ${detailLink}
    </div>
  `;
}

function addBaseTileLayer(map) {
  if (!window.L || !map) return;

  const providers = [
    {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: ["a", "b", "c"],
        maxZoom: 19
      }
    },
    {
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      options: {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20
      }
    }
  ];

  let index = 0;
  let currentLayer = null;
  let switchInProgress = false;

  const mount = () => {
    const provider = providers[index];
    currentLayer = window.L.tileLayer(provider.url, provider.options).addTo(map);

    currentLayer.on("tileerror", () => {
      if (switchInProgress) return;
      if (index >= providers.length - 1) return;
      switchInProgress = true;
      map.removeLayer(currentLayer);
      index += 1;
      window.setTimeout(() => {
        switchInProgress = false;
        mount();
      }, 120);
    });
  };

  mount();
}

function initHeroMap() {
  if (!heroMapContainer) return;

  if (!window.L) {
    heroMapContainer.innerHTML =
      '<p class="map-fallback">Harita şu anda yüklenemedi. Lütfen sayfayı yenileyin.</p>';
    return;
  }

  const heroMap = window.L.map(heroMapContainer, {
    zoomControl: true,
    minZoom: 9,
    maxZoom: 18,
    scrollWheelZoom: false
  }).setView(districtViews.all.center, districtViews.all.zoom);

  addBaseTileLayer(heroMap);

  const bounds = [];

  getListings().forEach((listing) => {
    const marker = window.L.marker(listing.coords, {
      icon: createMarkerIcon(listing.type)
    }).addTo(heroMap);

    marker.bindPopup(createPopupMarkup(listing));
    bounds.push(listing.coords);
  });

  if (bounds.length) {
    heroMap.fitBounds(bounds, {
      padding: [24, 24],
      maxZoom: 12
    });
  }

  window.addEventListener("resize", () => {
    heroMap.invalidateSize();
  });
}

function createMap(mapKey) {
  const state = mapStates[mapKey];
  if (!state || !state.container || !window.L) return null;
  if (state.map) return state.map;

  state.map = window.L.map(state.container, {
    zoomControl: true,
    minZoom: 9,
    maxZoom: 18
  }).setView(districtViews.all.center, districtViews.all.zoom);

  addBaseTileLayer(state.map);

  state.markerLayer = window.L.layerGroup().addTo(state.map);
  return state.map;
}

function renderMarkersForState(mapKey, listings) {
  const state = mapStates[mapKey];
  if (!state || !state.map || !state.markerLayer) return;

  state.markerLayer.clearLayers();
  state.markers.clear();

  listings.forEach((listing) => {
    const marker = window.L.marker(listing.coords, {
      icon: createMarkerIcon(listing.type)
    }).addTo(state.markerLayer);

    marker.bindPopup(createPopupMarkup(listing));
    marker.on("click", () => {
      setActiveListingCard(listing.id, false);
    });

    state.markers.set(listing.id, marker);
  });
}

function getPrimaryMapState() {
  if (isModalOpen && mapStates.modal.map) {
    return mapStates.modal;
  }
  if (mapStates.inline.map) {
    return mapStates.inline;
  }
  return null;
}

function setActiveListingCard(listingId, flyToMarker) {
  if (mapListingGrid) {
    const cards = mapListingGrid.querySelectorAll(".map-listing-card");
    cards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.listingId === listingId);
    });
  }

  if (catalogGrid) {
    const catalogCards = catalogGrid.querySelectorAll(".catalog-card");
    catalogCards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.listingId === listingId);
    });
  }

  if (!flyToMarker) return;

  const state = getPrimaryMapState();
  if (!state || !state.map) return;

  const listing = getListings().find((item) => item.id === listingId);
  const marker = state.markers.get(listingId);

  if (listing && marker) {
    state.map.flyTo(listing.coords, Math.max(state.map.getZoom(), 14), {
      duration: 0.45
    });
    marker.openPopup();
  }
}

function applyMapView(mapKey, district, animateView) {
  const state = mapStates[mapKey];
  if (!state || !state.map) return;

  const nextView = districtViews[district] || districtViews.all;
  if (animateView) {
    state.map.flyTo(nextView.center, nextView.zoom, { duration: 0.6 });
  } else {
    state.map.setView(nextView.center, nextView.zoom);
  }
}

function updateDistrict(district, animateView) {
  activeDistrict = district;
  const listings = getFilteredListings(activeDistrict);

  renderListingCards(listings);
  renderMarkersForState("inline", listings);
  renderMarkersForState("modal", listings);

  applyMapView("inline", activeDistrict, animateView);
  applyMapView("modal", activeDistrict, isModalOpen ? animateView : false);

  if (listings.length) {
    setActiveListingCard(listings[0].id, false);
  }
}

function openMapModal() {
  if (!mapModal || !window.L) return;

  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  mapModal.classList.add("is-open");
  mapModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  isModalOpen = true;

  createMap("modal");

  const listings = getFilteredListings(activeDistrict);
  renderMarkersForState("modal", listings);

  if (mapStates.inline.map && mapStates.modal.map) {
    const center = mapStates.inline.map.getCenter();
    const zoom = mapStates.inline.map.getZoom();
    mapStates.modal.map.setView([center.lat, center.lng], zoom);
  } else {
    applyMapView("modal", activeDistrict, false);
  }

  window.setTimeout(() => {
    if (mapStates.modal.map) {
      mapStates.modal.map.invalidateSize();
    }
  }, 140);

  if (closeMapModalBtn) {
    closeMapModalBtn.focus();
  }
}

function closeMapModal() {
  if (!mapModal || !isModalOpen) return;

  mapModal.classList.remove("is-open");
  mapModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  isModalOpen = false;

  window.setTimeout(() => {
    if (mapStates.inline.map) {
      mapStates.inline.map.invalidateSize();
    }
  }, 120);

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function initListingMap() {
  if (!mapContainerInline) return;

  if (!window.L) {
    mapContainerInline.innerHTML =
      '<p class="map-fallback">Harita şu anda yüklenemedi. Bağlantıyı yenileyip tekrar deneyebilirsin.</p>';
    renderListingCards(getFilteredListings("all"));
    return;
  }

  createMap("inline");
  updateDistrict("all", false);

  const syncMapSizes = () => {
    if (mapStates.inline.map) {
      mapStates.inline.map.invalidateSize();
    }
    if (mapStates.modal.map && isModalOpen) {
      mapStates.modal.map.invalidateSize();
    }
  };

  window.addEventListener("resize", syncMapSizes);
  window.addEventListener("orientationchange", syncMapSizes);

  mapButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveDistrictButton(btn.dataset.district || "all");
      updateDistrict(btn.dataset.district || "all", true);
    });
  });

  if (mapListingGrid) {
    mapListingGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".map-listing-card");
      if (!card || !card.dataset.listingId) return;
      setActiveListingCard(card.dataset.listingId, true);
    });
  }

  if (openMapModalBtn) {
    openMapModalBtn.addEventListener("click", openMapModal);
  }

  if (closeMapModalBtn) {
    closeMapModalBtn.addEventListener("click", closeMapModal);
  }

  if (mapModal) {
    mapModal.addEventListener("click", (event) => {
      if (event.target === mapModal) {
        closeMapModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isModalOpen) {
      closeMapModal();
    }
  });
}

function initCatalog() {
  if (!catalogGrid) return;

  const updateCatalog = () => {
    renderCatalogCards(getCatalogFilteredListings());
  };

  if (catalogDistrictFilter) {
    catalogDistrictFilter.addEventListener("change", () => {
      const nextDistrict = catalogDistrictFilter.value || "all";
      setActiveDistrictButton(nextDistrict);
      updateDistrict(nextDistrict, true);
      updateCatalog();
    });
  }

  if (catalogTypeFilter) {
    catalogTypeFilter.addEventListener("change", updateCatalog);
  }

  catalogGrid.addEventListener("click", (event) => {
    const trigger = event.target.closest(".catalog-map-btn");
    if (!trigger) return;

    const listingId = trigger.dataset.mapId;
    if (!listingId) return;

    const listing = getListings().find((item) => item.id === listingId);
    if (!listing) return;

    if (catalogDistrictFilter) {
      catalogDistrictFilter.value = listing.district;
    }

    setActiveDistrictButton(listing.district);
    updateDistrict(listing.district, true);
    setActiveListingCard(listing.id, true);

    const mapSection = document.getElementById("harita");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  updateCatalog();
}

function populateCatalogDistrictOptions() {
  if (!catalogDistrictFilter) return;
  const selected = catalogDistrictFilter.value || "all";
  const districts = new Set(getListings().map((listing) => listing.district));
  const sortedDistricts = Array.from(districts).sort((a, b) =>
    getDistrictLabel(a).localeCompare(getDistrictLabel(b), "tr-TR")
  );

  const options = ['<option value="all">Tüm Bölgeler</option>'];
  sortedDistricts.forEach((district) => {
    options.push(`<option value="${district}">${getDistrictLabel(district)}</option>`);
  });
  catalogDistrictFilter.innerHTML = options.join("");

  if (sortedDistricts.includes(selected) || selected === "all") {
    catalogDistrictFilter.value = selected;
  } else {
    catalogDistrictFilter.value = "all";
  }
}

function renderSpotlightCards() {
  if (!spotlightTrack) return;

  const spotlightListings = getListings().slice(0, 6);
  spotlightTrack.innerHTML = spotlightListings
    .map((listing) => {
      const district = getDistrictLabel(listing.district);
      const imageMarkup = listing.image
        ? `<img class="spotlight-photo" src="${listing.image}" alt="${listing.title}" loading="lazy" />`
        : '<div class="spotlight-photo spotlight-photo-empty"><span>Görsel eklenecek</span></div>';
      const detailHref = listing.detailUrl || "ilanlar.html";
      return `
        <article class="spotlight-card spotlight-theme-babaeski" data-listing-id="${listing.id}">
          <div class="spotlight-card-visual spotlight-photo-visual">
            ${imageMarkup}
            <div class="spotlight-card-overlay">
              <p class="chip">${listing.type}</p>
              <span class="spotlight-district">${district}</span>
            </div>
          </div>
          <h3>${listing.title}</h3>
          <p class="spotlight-meta">${[listing.size, listing.area, listing.summary].filter(Boolean).join(" | ")}</p>
          <div class="spotlight-bottom">
            <strong>${listing.price}</strong>
            <a href="${detailHref}" target="_blank" rel="noopener noreferrer">Detayları Gör</a>
          </div>
        </article>
      `;
    })
    .join("");
}

function initSpotlightCarousel() {
  if (!spotlightTrack) return;

  renderSpotlightCards();

  const cards = Array.from(spotlightTrack.querySelectorAll(".spotlight-card"));
  if (!cards.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let dots = [];
  let autoTimer = null;

  const getStep = () => {
    const firstCard = cards[0];
    if (!firstCard) return 1;
    const styles = window.getComputedStyle(spotlightTrack);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
    return Math.max(1, firstCard.getBoundingClientRect().width + gap);
  };

  const getCurrentIndex = () => {
    const step = getStep();
    return Math.round(spotlightTrack.scrollLeft / step);
  };

  const updateDots = () => {
    if (!dots.length) return;
    const currentIndex = Math.min(cards.length - 1, Math.max(0, getCurrentIndex()));
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentIndex);
    });
  };

  const scrollToIndex = (index) => {
    const clampedIndex = Math.min(cards.length - 1, Math.max(0, index));
    spotlightTrack.scrollTo({
      left: clampedIndex * getStep(),
      behavior: "smooth"
    });
  };

  const stopAutoplay = () => {
    if (autoTimer) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  };

  const startAutoplay = () => {
    if (reducedMotion || cards.length < 2) return;
    stopAutoplay();
    autoTimer = window.setInterval(() => {
      const currentIndex = getCurrentIndex();
      const nextIndex = currentIndex >= cards.length - 1 ? 0 : currentIndex + 1;
      scrollToIndex(nextIndex);
    }, 4200);
  };

  if (spotlightDots) {
    spotlightDots.innerHTML = cards
      .map(
        (_, index) =>
          `<button type="button" class="spotlight-dot${index === 0 ? " is-active" : ""}" aria-label="İlan ${
            index + 1
          }"></button>`
      )
      .join("");

    dots = Array.from(spotlightDots.querySelectorAll(".spotlight-dot"));

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        scrollToIndex(index);
      });
    });
  }

  if (spotlightPrevBtn) {
    spotlightPrevBtn.addEventListener("click", () => {
      scrollToIndex(getCurrentIndex() - 1);
    });
  }

  if (spotlightNextBtn) {
    spotlightNextBtn.addEventListener("click", () => {
      scrollToIndex(getCurrentIndex() + 1);
    });
  }

  spotlightTrack.addEventListener("scroll", updateDots, { passive: true });
  spotlightTrack.addEventListener("mouseenter", stopAutoplay);
  spotlightTrack.addEventListener("mouseleave", startAutoplay);
  spotlightTrack.addEventListener("focusin", stopAutoplay);
  spotlightTrack.addEventListener("focusout", startAutoplay);
  window.addEventListener("resize", updateDots);

  updateDots();
  startAutoplay();
}

function refreshListingViews() {
  if (catalogDistrictFilter) {
    populateCatalogDistrictOptions();
  }

  if (mapContainerInline) {
    const district = catalogDistrictFilter ? catalogDistrictFilter.value || "all" : activeDistrict || "all";
    setActiveDistrictButton(district);
    updateDistrict(district, false);
  }

  if (catalogGrid) {
    renderCatalogCards(getCatalogFilteredListings());
  }

  if (heroMapContainer) {
    heroMapContainer.innerHTML = "";
    initHeroMap();
  }

  if (spotlightTrack) {
    initSpotlightCarousel();
  }
}

function setAdminMessage(message, kind) {
  if (!adminStatus) return;
  adminStatus.textContent = message;
  adminStatus.classList.remove("is-success", "is-error");
  if (kind === "success") adminStatus.classList.add("is-success");
  if (kind === "error") adminStatus.classList.add("is-error");
}

function setLatLngInputs(lat, lng) {
  if (!listingForm) return;
  listingForm.elements.lat.value = Number(lat).toFixed(6);
  listingForm.elements.lng.value = Number(lng).toFixed(6);
}

function syncAdminPickerMarker(lat, lng, shouldPan) {
  if (!adminPickerState.map || !adminPickerState.marker) return;
  const next = [Number(lat), Number(lng)];
  if (!Number.isFinite(next[0]) || !Number.isFinite(next[1])) return;
  adminPickerState.marker.setLatLng(next);
  if (shouldPan) {
    adminPickerState.map.setView(next, Math.max(adminPickerState.map.getZoom(), 14));
  }
}

function initAdminPickerMap() {
  if (!adminPickerMapContainer || !window.L || adminPickerState.map) return;

  const latRaw = String(listingForm && listingForm.elements.lat ? listingForm.elements.lat.value : "").trim();
  const lngRaw = String(listingForm && listingForm.elements.lng ? listingForm.elements.lng.value : "").trim();
  const lat = latRaw === "" ? 41.6761 : Number(latRaw);
  const lng = lngRaw === "" ? 27.2186 : Number(lngRaw);
  const initial = [Number.isFinite(lat) ? lat : 41.6761, Number.isFinite(lng) ? lng : 27.2186];

  const map = window.L.map(adminPickerMapContainer, {
    zoomControl: true,
    minZoom: 8,
    maxZoom: 19
  }).setView(initial, 12);

  addBaseTileLayer(map);

  const marker = window.L.marker(initial, {
    draggable: true,
    icon: createMarkerIcon("Satılık")
  }).addTo(map);
  marker.bindPopup("Konumu sürükleyerek ayarlayabilirsin.");

  map.on("click", (event) => {
    const { lat, lng } = event.latlng;
    setLatLngInputs(lat, lng);
    syncAdminPickerMarker(lat, lng, false);
    if (adminMapHint) {
      adminMapHint.textContent = "Konum haritadan seçildi.";
    }
    setAdminMessage("Konum haritadan güncellendi.", "success");
  });

  marker.on("dragend", () => {
    const pos = marker.getLatLng();
    setLatLngInputs(pos.lat, pos.lng);
    if (adminMapHint) {
      adminMapHint.textContent = "Marker sürüklenerek konum güncellendi.";
    }
    setAdminMessage("Konum marker ile güncellendi.", "success");
  });

  adminPickerState.map = map;
  adminPickerState.marker = marker;

  window.setTimeout(() => {
    map.invalidateSize();
  }, 180);
}

function buildAddressQuery(address, area, district, block, parcel) {
  const cadastralPart = block || parcel ? `ada ${sanitizeText(block)} parsel ${sanitizeText(parcel)}` : "";
  const parts = [
    cadastralPart,
    sanitizeText(address),
    sanitizeText(area),
    getDistrictLabel(district),
    "Kırklareli",
    "Türkiye"
  ].filter(Boolean);
  return parts.join(", ");
}

async function geocodeFromAddress(query) {
  const endpoint = new URL("https://nominatim.openstreetmap.org/search");
  endpoint.searchParams.set("format", "jsonv2");
  endpoint.searchParams.set("limit", "1");
  endpoint.searchParams.set("countrycodes", "tr");
  endpoint.searchParams.set("q", query);

  const response = await fetch(endpoint.toString(), {
    headers: {
      Accept: "application/json"
    }
  });
  if (!response.ok) return null;
  const data = await response.json();
  if (!Array.isArray(data) || !data.length) return null;
  const first = data[0];
  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return [lat, lon];
}

function fillFormWithListing(listing) {
  if (!listingForm) return;
  listingForm.elements.id.value = listing.id;
  listingForm.elements.title.value = listing.title;
  listingForm.elements.district.value = listing.district;
  listingForm.elements.type.value = getTypeKey(listing.type) === "kiralik" ? "Kiralık" : "Satılık";
  listingForm.elements.price.value = listing.price;
  listingForm.elements.size.value = listing.size.replace(/\s*m²/gi, "").trim();
  listingForm.elements.area.value = listing.area;
  if (listingForm.elements.address) {
    listingForm.elements.address.value = listing.address || "";
  }
  if (listingForm.elements.block) {
    listingForm.elements.block.value = listing.block || "";
  }
  if (listingForm.elements.parcel) {
    listingForm.elements.parcel.value = listing.parcel || "";
  }
  listingForm.elements.summary.value = listing.summary;
  listingForm.elements.image.value = listing.image || "";
  listingForm.elements.detailUrl.value = listing.detailUrl || "";
  listingForm.elements.lat.value = listing.coords[0];
  listingForm.elements.lng.value = listing.coords[1];
  syncAdminPickerMarker(listing.coords[0], listing.coords[1], true);
}

function renderAdminTable() {
  if (!listingTableBody) return;
  const items = getListings();
  if (listingCountStat) {
    listingCountStat.textContent = String(items.length);
  }
  if (!items.length) {
    listingTableBody.innerHTML =
      '<tr><td colspan="6" class="admin-empty">Henüz ilan yok. Formdan ekleyebilirsin.</td></tr>';
    return;
  }

  listingTableBody.innerHTML = items
    .map(
      (listing) => `
        <tr>
          <td>${listing.title}</td>
          <td>${getDistrictLabel(listing.district)}</td>
          <td>${listing.type}</td>
          <td>${listing.price}</td>
          <td>${listing.coords[0].toFixed(4)}, ${listing.coords[1].toFixed(4)}</td>
          <td class="admin-table-actions">
            <button type="button" class="admin-btn admin-btn-light" data-action="edit" data-id="${listing.id}">Düzenle</button>
            <button type="button" class="admin-btn admin-btn-danger" data-action="delete" data-id="${listing.id}">Sil</button>
          </td>
        </tr>
      `
    )
    .join("");
}

function getAdminSession() {
  try {
    return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
  } catch (error) {
    return false;
  }
}

function setAdminSession(isLoggedIn) {
  try {
    if (isLoggedIn) {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    } else {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch (error) {
    // Sessiz geç.
  }
}

function toggleAdminUI(isLoggedIn) {
  if (adminLoginCard) {
    adminLoginCard.hidden = isLoggedIn;
  }
  if (adminPanel) {
    adminPanel.hidden = !isLoggedIn;
  }
}

function readListingFormValues() {
  if (!listingForm) return null;
  const lat = Number(listingForm.elements.lat.value);
  const lng = Number(listingForm.elements.lng.value);

  return sanitizeListing({
    id: listingForm.elements.id.value || `listing-${Date.now()}`,
    title: listingForm.elements.title.value,
    district: listingForm.elements.district.value,
    type: listingForm.elements.type.value,
    price: listingForm.elements.price.value,
    size: listingForm.elements.size.value,
    area: listingForm.elements.area.value,
    address: listingForm.elements.address ? listingForm.elements.address.value : "",
    block: listingForm.elements.block ? listingForm.elements.block.value : "",
    parcel: listingForm.elements.parcel ? listingForm.elements.parcel.value : "",
    summary: listingForm.elements.summary.value,
    image: listingForm.elements.image.value,
    detailUrl: listingForm.elements.detailUrl.value,
    coords: [lat, lng]
  });
}

function importListingsFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "[]"));
      const cleaned = sanitizeListingArray(parsed);
      if (!cleaned.length) {
        setAdminMessage("Dosyada geçerli ilan bulunamadı.", "error");
        return;
      }
      saveListings(cleaned);
      renderAdminTable();
      refreshListingViews();
      setAdminMessage("İlanlar içe aktarıldı.", "success");
    } catch (error) {
      setAdminMessage("JSON dosyası okunamadı.", "error");
    }
  };
  reader.readAsText(file, "utf-8");
}

function initAdminPanel() {
  if (!adminLoginForm || !adminPanel) return;

  const loggedIn = getAdminSession();
  toggleAdminUI(loggedIn);

  if (loggedIn) {
    renderAdminTable();
    initAdminPickerMap();
  }

  adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = adminPasswordInput ? adminPasswordInput.value.trim() : "";
    if (password !== ADMIN_PASSWORD) {
      if (adminError) adminError.textContent = "Şifre hatalı.";
      return;
    }
    if (adminError) adminError.textContent = "";
    setAdminSession(true);
    toggleAdminUI(true);
    renderAdminTable();
    initAdminPickerMap();
    setAdminMessage("Panele giriş yapıldı.", "success");
    if (adminPasswordInput) adminPasswordInput.value = "";
  });

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", () => {
      setAdminSession(false);
      toggleAdminUI(false);
      setAdminMessage("", "");
    });
  }

  if (listingForm) {
    const syncFromInputs = () => {
      const lat = Number(listingForm.elements.lat.value);
      const lng = Number(listingForm.elements.lng.value);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        syncAdminPickerMarker(lat, lng, false);
      }
    };
    if (listingForm.elements.lat) {
      listingForm.elements.lat.addEventListener("change", syncFromInputs);
    }
    if (listingForm.elements.lng) {
      listingForm.elements.lng.addEventListener("change", syncFromInputs);
    }

    listingForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      let nextListing = readListingFormValues();
      if (!nextListing) return;

      const latRaw = String(listingForm.elements.lat.value || "").trim();
      const lngRaw = String(listingForm.elements.lng.value || "").trim();
      const hasManualCoords = latRaw !== "" && lngRaw !== "";
      if (!hasManualCoords) {
        const addressQuery = buildAddressQuery(
          nextListing.address,
          nextListing.area,
          nextListing.district,
          nextListing.block,
          nextListing.parcel
        );
        if (!addressQuery) {
          setAdminMessage("Koordinat boşsa açık adres girmen gerekiyor.", "error");
          return;
        }
        setAdminMessage("Adres üzerinden konum bulunuyor...", "success");
        const coords = await geocodeFromAddress(addressQuery);
        if (coords) {
          nextListing = sanitizeListing({
            ...nextListing,
            coords
          });
          listingForm.elements.lat.value = String(coords[0].toFixed(6));
          listingForm.elements.lng.value = String(coords[1].toFixed(6));
          syncAdminPickerMarker(coords[0], coords[1], true);
          setAdminMessage("Konum adresten otomatik bulundu.", "success");
        } else {
          setAdminMessage("Adres için konum bulunamadı. Açık adresi detaylandır veya enlem-boylamı elle gir.", "error");
          return;
        }
      } else {
        const lat = Number(latRaw);
        const lng = Number(lngRaw);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          setAdminMessage("Enlem/Boylam sayısal olmalı.", "error");
          return;
        }
      }

      const items = getListings();
      const existingIndex = items.findIndex((item) => item.id === nextListing.id);
      const nextItems = [...items];
      if (existingIndex >= 0) {
        nextItems[existingIndex] = nextListing;
        setAdminMessage("İlan güncellendi.", "success");
      } else {
        nextItems.unshift(nextListing);
        setAdminMessage("Yeni ilan eklendi.", "success");
      }

      saveListings(nextItems);
      renderAdminTable();
      refreshListingViews();
      listingForm.reset();
      listingForm.elements.id.value = "";
      if (adminMapHint) {
        adminMapHint.textContent = "Haritaya tıkla veya marker'ı sürükle.";
      }
    });
  }

  if (listingImageFile && listingForm) {
    listingImageFile.addEventListener("change", async () => {
      const file = listingImageFile.files && listingImageFile.files[0];
      if (!file) return;
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }).catch(() => "");
      if (dataUrl) {
        listingForm.elements.image.value = dataUrl;
        setAdminMessage("Görsel yüklendi. Kaydet'e basmayı unutma.", "success");
      } else {
        setAdminMessage("Görsel yüklenemedi.", "error");
      }
    });
  }

  if (resetListingFormBtn && listingForm) {
    resetListingFormBtn.addEventListener("click", () => {
      listingForm.reset();
      listingForm.elements.id.value = "";
      if (adminMapHint) {
        adminMapHint.textContent = "Haritaya tıkla veya marker'ı sürükle.";
      }
      syncAdminPickerMarker(41.6761, 27.2186, true);
      setAdminMessage("Form temizlendi.", "success");
    });
  }

  if (listingTableBody) {
    listingTableBody.addEventListener("click", (event) => {
      const trigger = event.target.closest("button[data-action]");
      if (!trigger) return;
      const listingId = trigger.dataset.id;
      const action = trigger.dataset.action;
      if (!listingId || !action) return;

      const items = getListings();
      const target = items.find((item) => item.id === listingId);
      if (!target) return;

      if (action === "edit") {
        fillFormWithListing(target);
        setAdminMessage("İlan formu düzenleme için dolduruldu.", "success");
      }

      if (action === "delete") {
        const ok = window.confirm(`"${target.title}" ilanını silmek istiyor musun?`);
        if (!ok) return;
        saveListings(items.filter((item) => item.id !== listingId));
        renderAdminTable();
        refreshListingViews();
        setAdminMessage("İlan silindi.", "success");
      }
    });
  }

  if (exportListingsBtn) {
    exportListingsBtn.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(getListings(), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ilanlar-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setAdminMessage("İlanlar JSON olarak indirildi.", "success");
    });
  }

  if (importListingsInput) {
    importListingsInput.addEventListener("change", () => {
      const file = importListingsInput.files && importListingsInput.files[0];
      importListingsFromFile(file);
      importListingsInput.value = "";
    });
  }
}

populateCatalogDistrictOptions();
initListingMap();
initCatalog();
initHeroMap();
initSpotlightCarousel();
initAdminPanel();

/**
 * RoadGuard AI - Citizen Map & AI Scanner Application Controller
 */

const RoadGuardApp = (function() {
  let map;
  let markersLayer;
  let activeFilter = 'all';
  let selectedPotholeId = null;
  let activePotholes = [];

  // Default Metro Center (Indore, India)
  const DEFAULT_CENTER = [22.7196, 75.8577];
  const DEFAULT_ZOOM = 13;
  let userLocation = null;
  let userLocationMarker = null;

  function init() {
    initMap();
    bindEvents();
    loadData();
    updateStatsBar();
    detectLiveLocation();

    // Listen to data store updates
    window.addEventListener('roadguard:data_updated', (e) => {
      activePotholes = e.detail.potholes;
      renderMarkers();
      updateStatsBar();
      if (selectedPotholeId) {
        renderDetailsPanel(selectedPotholeId);
      }
    });
  }

  function initMap() {
    map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    // Google Maps Satellite Layer
    const googleSatellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    });

    // Google Maps Roadmap Layer
    const googleRoadmap = L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    }).addTo(map);

    // Google Maps Hybrid Layer
    const googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '&copy; Google Maps'
    });

    const baseMaps = {
      "🗺️ Google Roadmap": googleRoadmap,
      "🛰️ Google Satellite": googleSatellite,
      "🌍 Google Hybrid": googleHybrid
    };

    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    // Mouse coordinates tracker
    map.on('mousemove', function(e) {
      const el = document.getElementById('mouse-coords');
      if (el) {
        el.textContent = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
      }
    });

    // Map click to report
    map.on('click', function(e) {
      openReportModalWithCoords(e.latlng.lat, e.latlng.lng);
    });
  }

  function getMarkerIcon(severity, status) {
    let className = 'pulse-marker-medium';
    let iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';

    if (status === 'repaired' || status === 'verified') {
      className = 'pulse-marker-repaired';
      iconHtml = '<i class="fa-solid fa-check"></i>';
    } else if (severity === 'high') {
      className = 'pulse-marker-high';
      iconHtml = '!';
    } else if (severity === 'low') {
      className = 'pulse-marker-low';
      iconHtml = '<i class="fa-solid fa-circle text-[6px]"></i>';
    }

    return L.divIcon({
      className: '',
      html: `<div class="${className}">${iconHtml}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  }

  function renderMarkers() {
    markersLayer.clearLayers();

    const filtered = activePotholes.filter(p => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'repaired') return p.status === 'repaired' || p.status === 'verified';
      return p.severity === activeFilter && p.status !== 'repaired';
    });

    filtered.forEach(p => {
      const icon = getMarkerIcon(p.severity, p.status);
      const marker = L.marker([p.lat, p.lng], { icon: icon });

      // Interactive popup
      const popupContent = `
        <div class="p-3 text-slate-100 max-w-[220px]">
          <div class="relative h-24 -mx-3 -mt-3 mb-2 overflow-hidden bg-slate-950">
            <img src="${p.imageUrl}" alt="${p.title}" class="w-full h-full object-cover">
            <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
              p.severity === 'high' ? 'bg-red-600' : p.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
            } text-white">${p.severity}</span>
          </div>
          <h5 class="font-bold text-xs line-clamp-1">${p.title}</h5>
          <p class="text-[11px] text-slate-400 mt-0.5 line-clamp-1"><i class="fa-solid fa-location-dot mr-1"></i>${p.address}</p>
          <div class="mt-2 flex items-center justify-between text-[10px] text-slate-300 border-t border-slate-800 pt-1.5">
            <span>Status: <strong class="text-cyan-400 uppercase">${p.status}</strong></span>
            <span class="text-slate-400"><i class="fa-solid fa-thumbs-up mr-1 text-cyan-400"></i>${p.upvotes || 0}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        selectPothole(p.id);
      });

      markersLayer.addLayer(marker);
    });
  }

  function selectPothole(id) {
    selectedPotholeId = id;
    renderDetailsPanel(id);

    const pothole = activePotholes.find(p => p.id === id);
    if (pothole) {
      map.flyTo([pothole.lat, pothole.lng], 15, { duration: 0.8 });
    }
  }

  function renderDetailsPanel(id) {
    const p = activePotholes.find(item => item.id === id);
    if (!p) return;

    const emptyState = document.getElementById('panel-empty-state');
    const activeContent = document.getElementById('panel-active-content');
    const panelTitle = document.getElementById('panel-title');
    const panelBadge = document.getElementById('panel-status-badge');

    if (emptyState) emptyState.classList.add('hidden');
    if (activeContent) activeContent.classList.remove('hidden');

    if (panelTitle) panelTitle.textContent = `Dossier: ${p.id}`;
    if (panelBadge) {
      panelBadge.textContent = p.status.replace('-', ' ');
      panelBadge.className = `px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
        p.status === 'repaired' ? 'bg-blue-900/60 text-blue-300 border border-blue-700' :
        p.status === 'in-progress' ? 'bg-amber-900/60 text-amber-300 border border-amber-700' :
        'bg-slate-800 text-slate-300 border border-slate-700'
      }`;
    }

    // Image & Bounding Box
    const img = document.getElementById('detail-image');
    if (img) img.src = p.imageUrl;

    const bboxText = document.getElementById('detail-bbox-text');
    if (bboxText) {
      bboxText.textContent = `YOLOv8: ${(p.confidence * 100).toFixed(0)}%`;
    }

    const sevBadge = document.getElementById('detail-severity-badge');
    if (sevBadge) {
      sevBadge.textContent = `${p.severity} severity`;
      sevBadge.className = `px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider text-white shadow-md ${
        p.severity === 'high' ? 'bg-red-600' : p.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-600'
      }`;
    }

    // Telemetry
    document.getElementById('detail-title').textContent = p.title;
    document.getElementById('detail-address').innerHTML = `<i class="fa-solid fa-location-dot text-rose-400 mr-1.5"></i> ${p.address}`;
    document.getElementById('detail-confidence').textContent = `${(p.confidence * 100).toFixed(1)}%`;
    document.getElementById('detail-width').textContent = `${p.width_cm} cm`;
    document.getElementById('detail-depth').textContent = `${p.depth_cm} cm`;
    document.getElementById('detail-assigned-crew').textContent = p.assignedCrew || 'Pending Dispatch';
    document.getElementById('detail-notes').textContent = p.notes || 'No detailed inspector notes available.';
    document.getElementById('detail-upvotes').textContent = p.upvotes || 0;

    // Status Stepper
    updateStatusStepper(p.status);

    // Comments
    renderComments(p.comments || []);

    // Repaired before/after toggle
    const toggleAfter = document.getElementById('repaired-photo-toggle');
    if (toggleAfter) {
      if (p.repairedImageUrl) {
        toggleAfter.classList.remove('hidden');
        const btn = document.getElementById('btn-toggle-after-photo');
        btn.onclick = function() {
          const isShowingAfter = img.src === p.repairedImageUrl;
          img.src = isShowingAfter ? p.imageUrl : p.repairedImageUrl;
          btn.innerHTML = isShowingAfter ? '<i class="fa-solid fa-images mr-1"></i> View Fixed Road' : '<i class="fa-solid fa-history mr-1"></i> View Before Repair';
        };
      } else {
        toggleAfter.classList.add('hidden');
      }
    }
  }

  function updateStatusStepper(status) {
    const steps = ['reported', 'assigned', 'inprogress', 'repaired'];
    const lines = ['line-1', 'line-2', 'line-3'];

    let activeIndex = 0;
    if (status === 'assigned') activeIndex = 1;
    else if (status === 'in-progress') activeIndex = 2;
    else if (status === 'repaired' || status === 'verified') activeIndex = 3;

    steps.forEach((s, idx) => {
      const node = document.getElementById(`step-${s}`);
      if (!node) return;
      const circle = node.querySelector('div');
      if (idx <= activeIndex) {
        circle.className = 'w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px] font-bold shadow-md shadow-cyan-500/30';
      } else {
        circle.className = 'w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold';
      }
    });

    lines.forEach((l, idx) => {
      const line = document.getElementById(l);
      if (!line) return;
      if (idx < activeIndex) {
        line.className = 'h-0.5 bg-cyan-400 flex-1 mx-1 shadow-sm';
      } else {
        line.className = 'h-0.5 bg-slate-700 flex-1 mx-1';
      }
    });
  }

  function renderComments(comments) {
    const feed = document.getElementById('detail-comments-feed');
    const countEl = document.getElementById('detail-comments-count');
    if (!feed) return;

    if (countEl) countEl.textContent = `${comments.length} updates`;

    if (comments.length === 0) {
      feed.innerHTML = `<p class="text-[11px] text-slate-500 italic py-2">No community notes yet. Add the first report below.</p>`;
      return;
    }

    feed.innerHTML = comments.map(c => `
      <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-xs">
        <div class="flex items-center justify-between text-[10px] mb-1">
          <span class="font-semibold ${c.role === 'Official' ? 'text-amber-400' : 'text-cyan-400'}">${c.user} <span class="text-[9px] opacity-75 font-normal">(${c.role || 'Citizen'})</span></span>
          <span class="text-slate-500">${formatRelativeTime(c.time)}</span>
        </div>
        <p class="text-slate-300 text-[11px]">${escapeHtml(c.text)}</p>
      </div>
    `).join('');
  }

  function updateStatsBar() {
    const stats = window.RoadGuardDB.getStats();
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-high').textContent = stats.high;
    document.getElementById('stat-inprogress').textContent = stats.inProgress;
    document.getElementById('stat-repaired').textContent = stats.repaired;
  }

  function loadData() {
    activePotholes = window.RoadGuardDB.getPotholes();
    renderMarkers();
  }

  function bindEvents() {
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-cyan-500', 'text-slate-950');
          b.classList.add('bg-slate-800', 'text-slate-300');
        });
        btn.classList.add('bg-cyan-500', 'text-slate-950');
        btn.classList.remove('bg-slate-800', 'text-slate-300');

        activeFilter = btn.dataset.filter;
        renderMarkers();
      });
    });

    // Recenter to live GPS
    document.getElementById('btn-recenter').addEventListener('click', () => {
      if (userLocation) {
        map.flyTo(userLocation, 15, { duration: 0.8 });
        showToast('Map centered to your live location.');
      } else {
        detectLiveLocation();
      }
    });

    // Search bar
    const searchInput = document.getElementById('input-search');
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        activeFilter = 'all';
        renderMarkers();
        return;
      }
      const match = activePotholes.find(p => 
        p.id.toLowerCase().includes(q) || 
        p.address.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q)
      );
      if (match) {
        selectPothole(match.id);
      }
    });

    // Upvote
    document.getElementById('btn-upvote').addEventListener('click', () => {
      if (!selectedPotholeId) return;
      const count = window.RoadGuardDB.upvote(selectedPotholeId);
      document.getElementById('detail-upvotes').textContent = count;
      showToast('Citizen confirmation recorded! Thank you for improving road safety.');
    });

    // Flag as fixed
    document.getElementById('btn-flag-fixed').addEventListener('click', () => {
      if (!selectedPotholeId) return;
      window.RoadGuardDB.addComment(selectedPotholeId, 'Citizen reported this spot has been patched and leveled.', 'Citizen Verifier', 'Citizen');
      showToast('Marked for municipal verification. Inspector assigned!');
    });

    // Post comment
    const postBtn = document.getElementById('btn-post-comment');
    const commentInput = document.getElementById('input-new-comment');
    const submitComment = () => {
      if (!selectedPotholeId) return;
      const val = commentInput.value.trim();
      if (!val) return;
      window.RoadGuardDB.addComment(selectedPotholeId, val, 'Citizen Reporter', 'Citizen');
      commentInput.value = '';
      showToast('Observation posted to live feed');
    };
    postBtn.addEventListener('click', submitComment);
    commentInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') submitComment();
    });

    // Modal controls
    const modal = document.getElementById('report-modal');
    document.getElementById('btn-open-report-modal').addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
    document.getElementById('btn-close-modal').addEventListener('click', () => {
      modal.classList.add('hidden');
    });
    document.getElementById('btn-cancel-modal').addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    // Sample image selector
    const sampleBtns = document.querySelectorAll('.sample-img-btn');
    sampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const preview = document.getElementById('preview-image');
        preview.src = btn.dataset.url;
        document.getElementById('report-input-title').value = btn.dataset.name;
        document.getElementById('report-input-severity').value = btn.dataset.severity;
        
        triggerAiScanSimulation({
          confidence: parseFloat(btn.dataset.conf),
          severity: btn.dataset.severity,
          width_cm: parseInt(btn.dataset.width),
          depth_cm: parseInt(btn.dataset.depth)
        });
      });
    });

    // Custom File upload
    const fileUpload = document.getElementById('file-upload');
    fileUpload.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          document.getElementById('preview-image').src = event.target.result;
          triggerAiScanSimulation({
            confidence: 0.94,
            severity: 'high',
            width_cm: 45,
            depth_cm: 7
          });
        };
        reader.readAsDataURL(file);
      }
    });

    // Trigger AI Scan Button
    document.getElementById('btn-trigger-ai-scan').addEventListener('click', () => {
      triggerAiScanSimulation();
    });

    // GPS Detect button
    document.getElementById('btn-use-current-gps').addEventListener('click', () => {
      showToast('Acquiring high-accuracy GPS coordinates...');
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            document.getElementById('report-input-lat').value = lat.toFixed(4);
            document.getElementById('report-input-lng').value = lng.toFixed(4);
            applyUserLocation(lat, lng, 'Exact Device GPS');
            showToast('Device GPS fix locked.');
          },
          async () => {
            await fallbackIpLocation();
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        fallbackIpLocation();
      }
    });

    // Submit Report
    document.getElementById('btn-submit-report').addEventListener('click', () => {
      const title = document.getElementById('report-input-title').value;
      const address = document.getElementById('report-input-address').value;
      const lat = parseFloat(document.getElementById('report-input-lat').value);
      const lng = parseFloat(document.getElementById('report-input-lng').value);
      const severity = document.getElementById('report-input-severity').value;
      const notes = document.getElementById('report-input-notes').value;
      const imageUrl = document.getElementById('preview-image').src;

      const result = window.RoadGuardDB.addPothole({
        title,
        address,
        lat,
        lng,
        severity,
        notes,
        imageUrl,
        confidence: 0.95,
        width_cm: 48,
        depth_cm: 8
      });

      modal.classList.add('hidden');

      if (result.isDuplicate) {
        showToast('Duplicate detected within 30m! Upvoted existing hazard priority score.');
        selectPothole(result.item.id);
      } else {
        showToast('New road hazard registered and queued for municipal repair!');
        selectPothole(result.item.id);
      }
    });
  }

  function triggerAiScanSimulation(customParams = null) {
    const scanLine = document.getElementById('modal-scan-line');
    const scanGrid = document.getElementById('modal-scan-grid');
    const bbox = document.getElementById('modal-bbox');
    const bboxLabel = document.getElementById('modal-bbox-label');
    const spinner = document.getElementById('scan-spinner');

    scanLine.classList.remove('hidden');
    scanGrid.classList.remove('hidden');
    bbox.classList.add('opacity-40');
    if (spinner) spinner.classList.remove('hidden');
    bboxLabel.textContent = 'Analyzing neural tensors...';

    setTimeout(() => {
      scanLine.classList.add('hidden');
      scanGrid.classList.add('hidden');
      bbox.classList.remove('opacity-40');
      if (spinner) spinner.classList.add('hidden');

      const conf = customParams ? customParams.confidence : (0.92 + Math.random() * 0.06);
      const sev = customParams ? customParams.severity : 'high';
      const w = customParams ? customParams.width_cm : 46;
      const d = customParams ? customParams.depth_cm : 8;

      bboxLabel.textContent = `YOLOv8-Pothole: ${(conf * 100).toFixed(1)}%`;
      document.getElementById('ai-res-conf').textContent = `${(conf * 100).toFixed(1)}%`;
      document.getElementById('ai-res-sev').textContent = sev.toUpperCase();
      document.getElementById('ai-res-size').textContent = `${w}x${d} cm`;

      showToast(`AI Detection Complete: Identified ${sev} severity road hazard`);
    }, 1200);
  }

  async function detectLiveLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyUserLocation(pos.coords.latitude, pos.coords.longitude, 'Device GPS (High Accuracy)');
        },
        async (err) => {
          console.warn('Browser GPS permission denied or file:// restriction, trying IP-based GPS fallback...', err);
          await fallbackIpLocation();
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    } else {
      await fallbackIpLocation();
    }
  }

  async function fallbackIpLocation() {
    try {
      const res = await fetch('https://ipwho.is/');
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        applyUserLocation(data.latitude, data.longitude, `${data.city}, ${data.country} (Network GPS)`);
      } else {
        applyUserLocation(22.7196, 75.8577, 'Indore, India');
      }
    } catch (e) {
      applyUserLocation(22.7196, 75.8577, 'Indore, India');
    }
  }

  function applyUserLocation(lat, lng, label) {
    userLocation = [lat, lng];

    if (map) {
      map.setView([lat, lng], 14);

      if (userLocationMarker) {
        userLocationMarker.setLatLng([lat, lng]);
      } else {
        const userIcon = L.divIcon({
          className: '',
          html: `<div class="pulse-marker-user"><i class="fa-solid fa-location-arrow text-[10px]"></i></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        userLocationMarker = L.marker([lat, lng], { icon: userIcon, draggable: true, zIndexOffset: 1000 }).addTo(map);
        
        // Allow dragging the marker to manually correct position if GPS is off
        userLocationMarker.on('dragend', function(e) {
          const pos = e.target.getLatLng();
          userLocation = [pos.lat, pos.lng];
          
          const latIn = document.getElementById('report-input-lat');
          const lngIn = document.getElementById('report-input-lng');
          if (latIn && lngIn) {
            latIn.value = pos.lat.toFixed(4);
            lngIn.value = pos.lng.toFixed(4);
          }
          showToast(`📍 Location adjusted manually to: ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`);
        });
      }
    }

    const gpsBanner = document.getElementById('live-gps-badge');
    if (gpsBanner) {
      gpsBanner.innerHTML = `<i class="fa-solid fa-satellite-dish text-emerald-400 mr-1.5 animate-pulse"></i>GPS: <strong class="text-white">${escapeHtml(label)}</strong>`;
    }

    const latIn = document.getElementById('report-input-lat');
    const lngIn = document.getElementById('report-input-lng');
    const addrIn = document.getElementById('report-input-address');
    if (latIn && lngIn) {
      latIn.value = lat.toFixed(4);
      lngIn.value = lng.toFixed(4);
    }
    if (addrIn && (addrIn.value.includes('Park Ave') || addrIn.value.includes('Lexington'))) {
      addrIn.value = `Near ${label}`;
    }

    showToast(`📍 Live Location Locked: ${label}`);
  }

  function openReportModalWithCoords(lat, lng) {
    const modal = document.getElementById('report-modal');
    document.getElementById('report-input-lat').value = lat.toFixed(4);
    document.getElementById('report-input-lng').value = lng.toFixed(4);
    document.getElementById('report-input-address').value = `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    modal.classList.remove('hidden');
    showToast('Map pin selected. Review AI detection and submit.');
  }

  function selectRandomPothole() {
    if (activePotholes.length > 0) {
      const random = activePotholes[Math.floor(Math.random() * activePotholes.length)];
      selectPothole(random.id);
    }
  }

  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'glass-panel px-4 py-3 rounded-xl shadow-2xl border border-slate-700/80 text-xs text-white flex items-center space-x-2.5 transform transition-all duration-300 translate-y-3 opacity-0';
    toast.innerHTML = `
      <i class="fa-solid fa-circle-check text-cyan-400 text-sm"></i>
      <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  function formatRelativeTime(isoString) {
    if (!isoString) return 'recently';
    const date = new Date(isoString);
    const diffHours = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours <= 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
  }

  return {
    init,
    selectPothole,
    selectRandomPothole,
    showToast
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  RoadGuardApp.init();
});

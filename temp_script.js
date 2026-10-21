
  // ============================================================
  // ZONE DATA
  // ============================================================
  var zones = [
    {
      id: 'area1',
      name: 'Student Parking Area 1',
      type: 'student',
      assigned: true,
      coordinates: [
        [-29.1090, 26.1820],
        [-29.1090, 26.1835],
        [-29.1098, 26.1835],
        [-29.1098, 26.1820]
      ],
      center: [-29.1094, 26.18275],
      total: 50,
      available: 24,
      breakdown: { regular: 20, disabled: 2, reserved: 1, motorcycle: 1 },
      location: 'Near Main Building, West Side',
      hours: '06:00 – 22:00',
      access: 'Student Permit Required',
      gate: 'Gate 1 (Light traffic)',
      distance: '150m from gate'
    },
    {
      id: 'area2',
      name: 'Student Parking Area 2',
      type: 'student',
      assigned: true,
      coordinates: [
        [-29.1110, 26.1830],
        [-29.1110, 26.1842],
        [-29.1118, 26.1842],
        [-29.1118, 26.1830]
      ],
      center: [-29.1114, 26.1836],
      total: 40,
      available: 5,
      breakdown: { regular: 3, disabled: 1, reserved: 1, motorcycle: 0 },
      location: 'East of Humanities Building',
      hours: '06:00 – 22:00',
      access: 'Student Permit Required',
      gate: 'Gate 2 (Moderate traffic)',
      distance: '310m from gate'
    },
    {
      id: 'area3',
      name: 'Staff Parking Area 3',
      type: 'staff',
      assigned: false,
      coordinates: [
        [-29.1120, 26.1850],
        [-29.1120, 26.1860],
        [-29.1128, 26.1860],
        [-29.1128, 26.1850]
      ],
      center: [-29.1124, 26.1855],
      total: 30,
      available: 0,
      breakdown: { regular: 0, disabled: 0, reserved: 0, motorcycle: 0 },
      location: 'Admin Block Courtyard',
      hours: '06:00 – 18:00',
      access: 'Staff Permit Only',
      gate: 'Gate 3 (Heavy traffic)',
      distance: '420m from gate'
    },
    {
      id: 'area4',
      name: 'Visitor Parking Area A',
      type: 'visitor',
      assigned: false,
      coordinates: [
        [-29.1100, 26.1850],
        [-29.1100, 26.1858],
        [-29.1106, 26.1858],
        [-29.1106, 26.1850]
      ],
      center: [-29.1103, 26.1854],
      total: 25,
      available: 18,
      breakdown: { regular: 15, disabled: 2, reserved: 1, motorcycle: 0 },
      location: 'Main Entrance Plaza',
      hours: '07:00 – 20:00',
      access: 'Visitor Permit / Pay',
      gate: 'Gate 1 (Light traffic)',
      distance: '90m from gate'
    }
  ];

  var zoneLayers = {}; // id -> { polygon, marker }

  // ============================================================
  // STYLE / COLOR HELPERS
  // ============================================================
  function getZoneStyle(zone) {
    var fillColor, fillOpacity, color, weight, dashArray, className;

    if (zone.assigned) {
      fillColor = '#0F204B';
      fillOpacity = 0.2;
      color = '#0F204B';
      weight = 3;
      dashArray = null;
      className = 'zone-assigned';
    } else if (zone.type === 'student') {
      fillColor = '#0F204B';
      fillOpacity = 0.08;
      color = 'rgba(15,32,75,0.3)';
      weight = 2;
      dashArray = '8, 6';
      className = 'zone-student';
    } else if (zone.type === 'staff') {
      fillColor = '#636669';
      fillOpacity = 0.15;
      color = '#636669';
      weight = 2;
      dashArray = null;
      className = 'zone-staff';
    } else if (zone.type === 'visitor') {
      fillColor = '#A71930';
      fillOpacity = 0.12;
      color = '#A71930';
      weight = 2;
      dashArray = null;
      className = 'zone-visitor';
    }

    return { fillColor: fillColor, fillOpacity: fillOpacity, color: color, weight: weight, dashArray: dashArray, className: className };
  }

  function getCapacityColor(available, total) {
    var pct = available / total;
    if (pct > 0.3) return '#059669';
    if (pct > 0.1) return '#D97706';
    return '#DC2626';
  }

  function getCapacityText(available, total) {
    if (available === 0) return 'FULL';
    return String(available);
  }

  function centroid(coords) {
    var lat = 0, lng = 0;
    coords.forEach(function (c) { lat += c[0]; lng += c[1]; });
    return [lat / coords.length, lng / coords.length];
  }

  // ============================================================
  // MAP INIT
  // ============================================================
  var map = L.map('map', {
    zoomControl: false,
    attributionControl: false
  }).setView([-29.1106, 26.1841], 16);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  function buildPopupHtml(zone) {
    var color = getCapacityColor(zone.available, zone.total);
    var availText = zone.available === 0 ? 'No spots available' : zone.available + ' spots available';
    return '' +
      '<div style="padding:14px 16px;">' +
        '<div style="font-size:14px;font-weight:600;color:#0F204B;margin-bottom:8px;">' + zone.name + '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">' +
          '<div style="width:8px;height:8px;border-radius:50%;background:' + color + ';"></div>' +
          '<span style="font-size:13px;color:#636669;">' + availText + '</span>' +
        '</div>' +
        '<div style="font-size:11px;color:#9EA3A8;padding-top:8px;border-top:1px solid rgba(15,32,75,0.06);">Tap zone for details →</div>' +
      '</div>';
  }

  function renderZones() {
    zones.forEach(function (zone) {
      var style = getZoneStyle(zone);

      var polygon = L.polygon(zone.coordinates, {
        fillColor: style.fillColor,
        fillOpacity: style.fillOpacity,
        color: style.color,
        weight: style.weight,
        dashArray: style.dashArray,
        className: style.className
      }).addTo(map);

      polygon.bindTooltip(zone.name, { sticky: true, className: 'zone-tooltip' });

      polygon.on('mouseover', function () {
        polygon.setStyle({ fillOpacity: style.fillOpacity + 0.1, weight: style.weight + 1 });
      });
      polygon.on('mouseout', function () {
        polygon.setStyle({ fillOpacity: style.fillOpacity, weight: style.weight });
      });
      polygon.on('click', function () { openBottomSheet(zone.id); });

      var color = getCapacityColor(zone.available, zone.total);
      var text = getCapacityText(zone.available, zone.total);
      var dotHtml = text !== 'FULL' ? '<span class="marker-dot"></span>' : '';
      var html = '<div class="capacity-marker" style="background:' + color + ';">' + dotHtml + text + '</div>';

      var icon = L.divIcon({ html: html, className: 'capacity-marker-container', iconSize: null, iconAnchor: [30, 16] });
      var marker = L.marker(zone.center, { icon: icon }).addTo(map);

      marker.bindPopup(buildPopupHtml(zone), { closeButton: false, className: 'zone-popup', offset: [0, -10] });
      marker.on('mouseover', function () { marker.openPopup(); });
      marker.on('mouseout', function () { marker.closePopup(); });
      marker.on('click', function () { openBottomSheet(zone.id); });

      zoneLayers[zone.id] = { polygon: polygon, marker: marker, style: style };

      if (zone.id === 'area3') {
        var labelIcon = L.divIcon({
          html: '<div class="staff-label">STAFF ONLY</div>',
          className: 'staff-label-container',
          iconSize: null
        });
        L.marker(centroid(zone.coordinates), { icon: labelIcon, interactive: false }).addTo(map);
      }
    });
  }
  renderZones();

  function refreshMarker(zone) {
    var layer = zoneLayers[zone.id];
    if (!layer) return;
    var color = getCapacityColor(zone.available, zone.total);
    var text = getCapacityText(zone.available, zone.total);
    var dotHtml = text !== 'FULL' ? '<span class="marker-dot"></span>' : '';
    var html = '<div class="capacity-marker" style="background:' + color + ';">' + dotHtml + text + '</div>';
    var icon = L.divIcon({ html: html, className: 'capacity-marker-container', iconSize: null, iconAnchor: [30, 16] });
    layer.marker.setIcon(icon);
    layer.marker.setPopupContent(buildPopupHtml(zone));
  }

  // ============================================================
  // CUSTOM ZOOM CONTROLS
  // ============================================================
  document.getElementById('zoom-in-btn').addEventListener('click', function () { map.zoomIn(); });
  document.getElementById('zoom-out-btn').addEventListener('click', function () { map.zoomOut(); });

  // ============================================================
  // BOTTOM SHEET
  // ============================================================
  var sheetOverlay = document.getElementById('sheet-overlay');
  var bottomSheet = document.getElementById('bottom-sheet');
  var currentZoneId = null;

  function findZone(id) {
    for (var i = 0; i < zones.length; i++) {
      if (zones[i].id === id) return zones[i];
    }
    return null;
  }

  function openBottomSheet(id) {
    var zone = findZone(id);
    if (!zone) return;
    currentZoneId = id;

    document.getElementById('sheet-zone-name-text').textContent = zone.name;
    document.getElementById('sheet-your-zone-badge').style.display = zone.assigned ? 'inline-flex' : 'none';

    var pct = Math.round((zone.available / zone.total) * 100);
    var color = getCapacityColor(zone.available, zone.total);

    document.getElementById('sheet-pct').textContent = pct + '%';
    document.getElementById('sheet-pct').style.color = color;
    document.getElementById('sheet-bar').style.width = pct + '%';
    document.getElementById('sheet-bar').style.background = color;
    document.getElementById('sheet-capacity-text').innerHTML = '<strong>' + zone.available + '</strong> of ' + zone.total + ' spots available';

    var cats = document.getElementById('sheet-categories');
    cats.innerHTML =
      '<div class="spot-category"><div class="spot-count">' + zone.breakdown.regular + '</div><div class="spot-label">Regular</div></div>' +
      '<div class="spot-category"><div class="spot-count">' + zone.breakdown.disabled + '</div><div class="spot-label">Disabled</div></div>' +
      '<div class="spot-category"><div class="spot-count">' + zone.breakdown.reserved + '</div><div class="spot-label">Reserved</div></div>' +
      '<div class="spot-category"><div class="spot-count">' + zone.breakdown.motorcycle + '</div><div class="spot-label">Motorcycle</div></div>';

    document.getElementById('sheet-updated-text').textContent = 'Updated just now';
    document.getElementById('sheet-location').textContent = zone.location;
    document.getElementById('sheet-hours').textContent = zone.hours;
    document.getElementById('sheet-access').textContent = zone.access;
    document.getElementById('sheet-gate').textContent = zone.gate;
    document.getElementById('sheet-distance').textContent = zone.distance;

    sheetOverlay.classList.add('active');
    bottomSheet.classList.add('active');
  }

  function closeBottomSheet() {
    sheetOverlay.classList.remove('active');
    bottomSheet.classList.remove('active');
    currentZoneId = null;
  }

  sheetOverlay.addEventListener('click', closeBottomSheet);
  document.getElementById('sheet-close-btn').addEventListener('click', closeBottomSheet);

  document.getElementById('get-directions-btn').addEventListener('click', function () {
    showToast('Directions feature coming soon');
  });
  document.getElementById('set-reminder-btn').addEventListener('click', function () {
    showToast('Reminder set for this zone');
  });

  // ---- Drag to dismiss ----
  var dragHandle = document.getElementById('drag-handle');
  var startY = null;
  var currentDiff = 0;

  dragHandle.addEventListener('touchstart', function (e) {
    startY = e.touches[0].clientY;
    bottomSheet.classList.add('dragging');
  }, { passive: true });

  dragHandle.addEventListener('touchmove', function (e) {
    if (startY === null) return;
    currentDiff = e.touches[0].clientY - startY;
    if (currentDiff > 0) {
      bottomSheet.style.transform = 'translateY(' + currentDiff + 'px)';
    }
  }, { passive: true });

  dragHandle.addEventListener('touchend', function () {
    bottomSheet.classList.remove('dragging');
    bottomSheet.style.transform = '';
    if (currentDiff > 100) {
      closeBottomSheet();
    }
    startY = null;
    currentDiff = 0;
  });

  // ============================================================
  // LEGEND TOGGLE
  // ============================================================
  var legendPanel = document.getElementById('legend-panel');
  document.getElementById('legend-header').addEventListener('click', function () {
    legendPanel.classList.toggle('collapsed');
  });

  // ============================================================
  // TOAST
  // ============================================================
  var toastEl = document.getElementById('toast');
  var toastTimer = null;
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3000);
  }

  // ============================================================
  // MY LOCATION
  // ============================================================
  document.getElementById('locate-btn').addEventListener('click', function () {
    if (!navigator.geolocation) {
      showToast('Location not available');
      map.setView([-29.1106, 26.1841], 17);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        map.setView([pos.coords.latitude, pos.coords.longitude], 17);
      },
      function () {
        showToast('Location not available');
        map.setView([-29.1106, 26.1841], 17);
      },
      { timeout: 5000 }
    );
  });

  // ============================================================
  // SEARCH (placeholder)
  // ============================================================
  document.getElementById('search-btn').addEventListener('click', function () {
    showToast('Search coming soon');
  });

  // ============================================================
  // REFRESH SIMULATION (every 30s)
  // ============================================================
  var refreshIndicator = document.getElementById('refresh-indicator');

  function simulateRefresh() {
    refreshIndicator.classList.add('active');
    setTimeout(function () {
      zones.forEach(function (zone) {
        if (zone.total === 0) return;
        var delta = Math.floor(Math.random() * 5) - 2; // -2..+2
        zone.available = Math.max(0, Math.min(zone.total, zone.available + delta));
        refreshMarker(zone);
      });

      if (currentZoneId) {
        openBottomSheet(currentZoneId);
      }

      refreshIndicator.classList.remove('active');
    }, 1000);
  }
  setInterval(simulateRefresh, 30000);

  // ============================================================
  // CACHED DATA WARNING (demo trigger + dismiss)
  // ============================================================
  var cachedWarning = document.getElementById('cached-warning');
  document.getElementById('close-warning').addEventListener('click', function () {
    cachedWarning.classList.remove('active');
  });

  // Demonstration: surface the cached-data warning once, shortly after load,
  // as if a live refresh had failed and cached data was served instead.
  setTimeout(function () {
    cachedWarning.classList.add('active');
  }, 8000);

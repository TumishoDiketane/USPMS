/**
 * USPMS Universal App Shell Controller
 * Provides standardized interactions across all portal screens:
 * - User avatar dropdown menu
 * - Mobile slide-out navigation drawer
 * - Toast notification manager
 * - Active navigation synchronization
 */

(function () {
  'use strict';

  // 1. Toast Notification Helper
  window.showToast = function (message, duration) {
    duration = duration || 3000;
    var container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
      '<span>' + message + '</span>';

    container.appendChild(toast);

    // Trigger reflow to animate
    setTimeout(function () {
      toast.classList.add('show');
    }, 10);

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  };

  // 2. DOM Ready Controller
  document.addEventListener('DOMContentLoaded', function () {
    // ---- User Avatar Dropdown ----
    var avatarBtn = document.getElementById('avatar-btn') || document.getElementById('avatarBtn');
    var userDropdown = document.getElementById('user-dropdown') || document.getElementById('userDropdown');

    if (avatarBtn && userDropdown) {
      avatarBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = userDropdown.classList.toggle('open');
        avatarBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      document.addEventListener('click', function (e) {
        if (!userDropdown.contains(e.target) && e.target !== avatarBtn) {
          userDropdown.classList.remove('open');
          avatarBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // ---- Mobile Drawer ----
    var hamburgerBtn = document.getElementById('hamburger-btn') || document.getElementById('hamBtn');
    var drawer = document.getElementById('mobile-drawer') || document.getElementById('mobSidebar');
    var overlay = document.getElementById('drawer-overlay') || document.getElementById('mobOverlay');
    var closeDrawerBtn = document.getElementById('drawer-close-btn') || document.getElementById('closeDrawer');

    function openDrawer() {
      if (drawer) drawer.classList.add('open');
      if (overlay) overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      if (drawer) drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        openDrawer();
      });
    }

    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', closeDrawer);
    }

    if (overlay) {
      overlay.addEventListener('click', closeDrawer);
    }

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (userDropdown) {
          userDropdown.classList.remove('open');
          if (avatarBtn) avatarBtn.setAttribute('aria-expanded', 'false');
        }
        closeDrawer();
      }
    });

    // ---- Logout Handler ----
    var logoutBtns = document.querySelectorAll('.dropdown-logout, .btn-logout, .dropdown-item.logout');
    logoutBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.showToast('Signing out...');
        setTimeout(function () {
          window.location.href = 'index.html';
        }, 500);
      });
    });
  });
})();

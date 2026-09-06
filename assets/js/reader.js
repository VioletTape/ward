(function() {
  function initTheme() {
    const savedTheme = localStorage.getItem('ward_theme') || 'light';
    setTheme(savedTheme, false);

    const savedFontSize = localStorage.getItem('ward_fontsize') || '18';
    setFontSize(parseInt(savedFontSize, 10), false);

    const savedFontFamily = localStorage.getItem('ward_fontfamily') || 'sans';
    setFontFamily(savedFontFamily, false);
  }

  window.setTheme = function(theme, save) {
    if (save === undefined) save = true;
    document.body.classList.remove('theme-light', 'theme-sepia', 'theme-dark');
    document.body.classList.add('theme-' + theme);
    document.querySelectorAll('[data-theme-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeBtn === theme);
    });
    if (save) localStorage.setItem('ward_theme', theme);
  };

  window.setFontSize = function(size, save) {
    if (save === undefined) save = true;
    size = Math.max(14, Math.min(26, size));
    document.documentElement.style.setProperty('--font-base', size + 'px');
    const display = document.getElementById('fontSizeDisplay');
    if (display) display.textContent = size + 'px';
    if (save) localStorage.setItem('ward_fontsize', size);
  };

  window.changeFontSize = function(delta) {
    const current = parseInt(localStorage.getItem('ward_fontsize') || '18', 10);
    setFontSize(current + delta);
  };

  window.setFontFamily = function(family, save) {
    if (save === undefined) save = true;
    document.body.classList.remove('font-serif', 'font-sans');
    document.body.classList.add('font-' + family);
    document.querySelectorAll('[data-font-btn]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.fontBtn === family);
    });
    if (save) localStorage.setItem('ward_fontfamily', family);
  };

  window.toggleSettings = function() {
    const panel = document.getElementById('settingsPanel');
    if (panel) panel.classList.toggle('open');
  };

  document.addEventListener('click', function(e) {
    const panel = document.getElementById('settingsPanel');
    const btn = document.getElementById('settingsBtn');
    if (panel && panel.classList.contains('open')) {
      if (!panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('open');
      }
    }
  });

  let lastScrollY = window.scrollY;
  const topbar = document.querySelector('.reader-topbar');
  const progressBar = document.getElementById('reading-progress');

  window.addEventListener('scroll', function() {
    const currentScrollY = window.scrollY;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (progressBar && totalHeight > 0) {
      const progress = Math.min(100, Math.max(0, (currentScrollY / totalHeight) * 100));
      progressBar.style.width = progress + '%';
    }

    if (topbar) {
      const settingsOpen = document.getElementById('settingsPanel')?.classList.contains('open');
      if (currentScrollY > 80 && currentScrollY > lastScrollY && !settingsOpen) {
        topbar.classList.add('hidden');
      } else {
        topbar.classList.remove('hidden');
      }
    }
    lastScrollY = currentScrollY;
  }, { passive: true });

  if (document.body.dataset.chapterId) {
    const currentChapter = {
      id: document.body.dataset.chapterId,
      title: document.title.replace(' | Ward', ''),
      path: window.location.pathname,
      url: window.location.href,
      updatedAt: Date.now()
    };
    localStorage.setItem('ward_last_chapter', JSON.stringify(currentChapter));
  }

  // Keyboard navigation
  window.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') {
      const prev = document.querySelector('a.nav-prev');
      if (prev && prev.href) window.location.href = prev.href;
    } else if (e.key === 'ArrowRight') {
      const next = document.querySelector('a.nav-next');
      if (next && next.href) window.location.href = next.href;
    } else if (e.key === 'Escape') {
      const panel = document.getElementById('settingsPanel');
      if (panel) panel.classList.remove('open');
    }
  });

  // Index page continue reading & accordion logic
  function initIndexPage() {
    try {
      const saved = JSON.parse(localStorage.getItem('ward_last_chapter') || 'null');
      if (saved && saved.path && saved.title) {
        const btn = document.getElementById('continueBtn');
        if (btn) {
          btn.href = saved.path;
          btn.innerHTML = '▶ Продолжить чтение: <strong>' + saved.title + '</strong>';
        }
      }
    } catch (e) {}

    document.querySelectorAll('.arc-header').forEach(header => {
      header.addEventListener('click', function() {
        header.parentElement.classList.toggle('open');
      });
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      const swPath = document.body.dataset.isChapter ? '../../sw.js' : './sw.js';
      navigator.serviceWorker.register(swPath).catch(function() {});
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    if (!document.body.dataset.isChapter) {
      initIndexPage();
    }
  });
  initTheme();
})();

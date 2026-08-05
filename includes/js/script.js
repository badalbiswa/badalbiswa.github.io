document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // =========================================================================
  // 1. Navigation & Scroll Effects
  // =========================================================================
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky Navbar Scroll Trigger
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const closeMobileMenu = () => {
    navLinksContainer.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
  };

  // Mobile Menu Toggle
  mobileToggle.addEventListener('click', () => {
    const isOpen = navLinksContainer.classList.toggle('active');
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
    const icon = mobileToggle.querySelector('i');
    icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  });

  // Close Mobile Menu on Link Click
  navLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
    }
  });

  const sections = [...navLinks]
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const setActiveNavLink = (id) => {
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };


  // =========================================================================
  // 2. Intersection Observer (Scroll-Linked Fade-In)
  // =========================================================================
  const animateElements = [
    '.project-card', '.skill-category-card', '.edu-card',
    '.contact-info-panel', '.contact-form-panel'
  ];

  // Add scroll animate classes dynamically
  animateElements.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      el.classList.add('animate-on-scroll');
    });
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    scrollObserver.observe(el);
  });

  const navObserver = new IntersectionObserver((entries) => {
    const visibleEntries = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visibleEntries[0]) {
      setActiveNavLink(visibleEntries[0].target.id);
    }
  }, {
    rootMargin: '-35% 0px -55% 0px',
    threshold: [0.05, 0.2, 0.5]
  });

  sections.forEach(section => navObserver.observe(section));


  // =========================================================================
  // 3. Contact Form Operations
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  const toast = document.getElementById('toast');

  // Show Toast Dialog
  const showToast = (message, duration = 3000) => {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  };

  // Copy Email Logic
  const copyBtn = document.getElementById('copy-email-btn');
  copyBtn.addEventListener('click', () => {
    const email = 'badalbiswa03@gmail.com';
    if (!navigator.clipboard) {
      showToast(email);
      return;
    }

    navigator.clipboard.writeText(email).then(() => {
      copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: var(--color-success);"></i>';
      showToast('Email address copied to clipboard!');
      setTimeout(() => {
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
      }, 2000);
    }).catch(err => {
      showToast('Failed to copy. Please copy manually.');
    });
  });

  // Submit Handler
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const message = document.getElementById('form-message').value.trim();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = prefersReducedMotion
      ? 'Opening Email...'
      : '<i class="fa-solid fa-circle-notch fa-spin"></i> Opening Email...';

    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nReply-to: ${email}`);
    window.location.href = `mailto:badalbiswa03@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      showToast('Email draft opened in your mail app.');
    }, 700);
  });

});

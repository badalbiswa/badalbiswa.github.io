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
    '.about-card', '.about-bio', 
    '.experience-showcase', '.exp-kpi-card',
    '.skills-category-card', '.edu-card',
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
        
        // Trigger skill progress bars when skills section is visible
        if (entry.target.classList.contains('skills-category-card')) {
          const fills = entry.target.querySelectorAll('.progress-fill');
          fills.forEach(fill => {
            const width = fill.style.width;
            fill.style.width = '0%';
            setTimeout(() => {
              fill.style.transition = 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
              fill.style.width = width;
            }, 50);
          });
        }
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
  // 3. FinTech Simulator & Asset Allocator
  // =========================================================================
  
  // Elements
  const initialInvInput = document.getElementById('initial-investment');
  const monthlyContInput = document.getElementById('monthly-contribution');
  const annualYieldInput = document.getElementById('annual-yield');
  const horizonInput = document.getElementById('investment-horizon');
  
  const initialValDisplay = document.getElementById('initial-val');
  const monthlyValDisplay = document.getElementById('monthly-val');
  const yieldValDisplay = document.getElementById('yield-val');
  const horizonValDisplay = document.getElementById('horizon-val');
  
  const fvTotalDisplay = document.getElementById('fv-total');
  const contributionsDisplay = document.getElementById('total-contributions');
  const interestDisplay = document.getElementById('interest-earned');
  
  const growthPath = document.getElementById('growth-path');
  const contributionsPath = document.getElementById('contributions-path');
  const chartGrid = document.getElementById('chart-grid');
  
  const midYearLabel = document.getElementById('mid-year');
  const maxYearLabel = document.getElementById('max-year');
  
  const allocationBar = document.getElementById('allocation-bar');
  const allocationMixBtns = document.querySelectorAll('[data-mix]');

  // Allocation Profiles
  const allocationProfiles = {
    conservative: { bonds: 65, equities: 25, cash: 10 },
    moderate: { bonds: 40, equities: 50, cash: 10 },
    aggressive: { bonds: 10, equities: 80, cash: 10 }
  };

  let currentMix = 'conservative';

  // Format Helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Run Calculations and Render Chart
  const calculateAndRender = () => {
    const P0 = parseFloat(initialInvInput.value);
    const PMT = parseFloat(monthlyContInput.value);
    const annualR = parseFloat(annualYieldInput.value);
    const years = parseInt(horizonInput.value);

    // Update Slider Value labels
    initialValDisplay.textContent = formatCurrency(P0);
    monthlyValDisplay.textContent = formatCurrency(PMT);
    yieldValDisplay.textContent = `${annualR}%`;
    horizonValDisplay.textContent = `${years} Years`;
    
    midYearLabel.textContent = `Year ${Math.round(years / 2 * 10) / 10}`;
    maxYearLabel.textContent = `Year ${years}`;

    const months = years * 12;
    const r = (annualR / 100) / 12;

    let balance = P0;
    let totalCont = P0;
    const balances = [P0];
    const contributions = [P0];

    for (let m = 1; m <= months; m++) {
      balance = balance * (1 + r) + PMT;
      totalCont += PMT;
      balances.push(balance);
      contributions.push(totalCont);
    }

    const finalValue = balances[balances.length - 1];
    const finalCont = contributions[contributions.length - 1];
    const finalInterest = finalValue - finalCont;

    // Update KPI panels
    fvTotalDisplay.textContent = formatCurrency(finalValue);
    contributionsDisplay.textContent = formatCurrency(finalCont);
    interestDisplay.textContent = formatCurrency(finalInterest);

    // Render SVG Line Chart
    renderChart(balances, contributions, years);
  };

  // SVG Chart Renderer
  const renderChart = (balances, contributions, years) => {
    const svgWidth = 600;
    const svgHeight = 240;
    const padding = { top: 20, right: 20, bottom: 20, left: 60 };
    
    const maxVal = Math.max(...balances);
    
    // Scale Helpers
    const getX = (index) => {
      return padding.left + (index / (balances.length - 1)) * (svgWidth - padding.left - padding.right);
    };
    
    const getY = (val) => {
      return svgHeight - padding.bottom - (val / maxVal) * (svgHeight - padding.top - padding.bottom);
    };

    // Draw Grid Lines (Horizontal & Vertical)
    let gridHTML = '';
    const gridCount = 4;
    
    // Horizontal Grids
    for (let i = 0; i <= gridCount; i++) {
      const val = (maxVal / gridCount) * i;
      const y = getY(val);
      gridHTML += `
        <line x1="${padding.left}" y1="${y}" x2="${svgWidth - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
        <text x="${padding.left - 10}" y="${y + 4}" fill="#64748b" font-size="9" text-anchor="end" font-family="'Space Grotesk', sans-serif">${formatCompact(val)}</text>
      `;
    }
    
    // Vertical Grids for intervals
    const vertInterval = Math.max(1, Math.floor(years / 5));
    for (let y = 0; y <= years; y += vertInterval) {
      const idx = y * 12;
      if (idx < balances.length) {
        const x = getX(idx);
        gridHTML += `<line x1="${x}" y1="${padding.top}" x2="${x}" y2="${svgHeight - padding.bottom}" stroke="rgba(255,255,255,0.05)" stroke-width="1" />`;
      }
    }
    
    chartGrid.innerHTML = gridHTML;

    // Generate Path Data
    let growthPoints = [];
    let contPoints = [];
    
    for (let idx = 0; idx < balances.length; idx++) {
      growthPoints.push(`${getX(idx).toFixed(1)},${getY(balances[idx]).toFixed(1)}`);
      contPoints.push(`${getX(idx).toFixed(1)},${getY(contributions[idx]).toFixed(1)}`);
    }
    
    growthPath.setAttribute('d', `M ${growthPoints.join(' L ')}`);
    contributionsPath.setAttribute('d', `M ${contPoints.join(' L ')}`);
  };

  // Compact Number Formatter for Axis (e.g. 50k)
  const formatCompact = (val) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toFixed(0)}`;
  };

  // Target Asset Allocator UI Trigger
  const updateAllocationUI = (mixKey) => {
    const profile = allocationProfiles[mixKey];
    const segments = allocationBar.querySelectorAll('.allocation-segment');
    
    segments[0].style.width = `${profile.bonds}%`;
    segments[0].textContent = profile.bonds >= 10 ? `Bonds: ${profile.bonds}%` : '';
    
    segments[1].style.width = `${profile.equities}%`;
    segments[1].textContent = profile.equities >= 10 ? `Equities: ${profile.equities}%` : '';
    
    segments[2].style.width = `${profile.cash}%`;
    segments[2].textContent = profile.cash >= 10 ? `Cash: ${profile.cash}%` : '';
  };

  // Setup Simulator Event Listeners
  [initialInvInput, monthlyContInput, annualYieldInput, horizonInput].forEach(input => {
    input.addEventListener('input', calculateAndRender);
  });

  allocationMixBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      allocationMixBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      e.currentTarget.classList.add('active');
      e.currentTarget.setAttribute('aria-pressed', 'true');
      currentMix = e.currentTarget.getAttribute('data-mix');
      updateAllocationUI(currentMix);
    });
  });

  // Init calculations
  calculateAndRender();
  updateAllocationUI(currentMix);


  // =========================================================================
  // 4. Contact Form Operations
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
      copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981;"></i>';
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

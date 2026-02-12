/**
 * Personal Website - Main JavaScript
 * Handles navigation, portfolio filtering, and contact form
 */

(function() {
  'use strict';

  // ============================================
  // Mobile Navigation Toggle
  // ============================================
  function initNavigation() {
    const navToggle = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', function() {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', function(event) {
        if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
          navToggle.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('active');
        }
      });
      
      // Close menu when pressing Escape
      document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
          navToggle.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('active');
        }
      });
    }
  }

  // ============================================
  // Portfolio Category Filtering
  // ============================================
  function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    if (filterButtons.length === 0 || projectCards.length === 0) return;
    
    filterButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        const filter = this.getAttribute('data-filter');
        
        // Update active button
        filterButtons.forEach(function(btn) {
          btn.classList.remove('active');
        });
        this.classList.add('active');
        
        // Filter projects
        projectCards.forEach(function(card) {
          const category = card.getAttribute('data-category');
          
          if (filter === 'all' || category === filter) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            // Trigger reflow for animation
            card.offsetHeight;
            
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(function() {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  // ============================================
  // Contact Form Handler (mailto fallback)
  // ============================================
  function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();
      
      // Validate fields
      if (!name || !email || !subject || !message) {
        alert('Please fill in all fields.');
        return;
      }
      
      // Create mailto link
      const recipient = 'reza.sz70@gmail.com';
      const mailtoSubject = encodeURIComponent(subject);
      const mailtoBody = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n\n' +
        'Message:\n' + message
      );
      
      const mailtoLink = 'mailto:' + recipient + 
                         '?subject=' + mailtoSubject + 
                         '&body=' + mailtoBody;
      
      // Open email client
      window.location.href = mailtoLink;
    });
  }

  // ============================================
  // Smooth Scroll for Anchor Links
  // ============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(event) {
        const href = this.getAttribute('href');
        
        if (href === '#') return;
        
        const target = document.querySelector(href);
        
        if (target) {
          event.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // ============================================
  // Highlight Current Page in Navigation
  // ============================================
  function highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav__link');
    
    navLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      
      // Check if this link matches the current page
      if (currentPath.endsWith(href) || 
          (currentPath.endsWith('/') && href === 'index.html') ||
          (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // ============================================
  // Initialize Everything
  // ============================================
  function init() {
    initNavigation();
    initPortfolioFilters();
    initContactForm();
    initSmoothScroll();
    highlightCurrentPage();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

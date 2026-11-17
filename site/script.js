/* global tailwind */
// Global Config for App Name
    window.APP_CONFIG = {
      APP_NAME: "WPT 202",
      COMPANY_NAME: "White Pixel Technologies",
      SUPPORT_EMAIL: "contactus@whitepixeltechnologies.in",
      WEBSITE_URL: "https://www.whitepixeltechnologies.in",
      WEBSITE_DISPLAY: "www.whitepixeltechnologies.in"
    };

    tailwind.config = {
      theme: {
        extend: {
          colors: {
            day: {
              bg: '#F7F5EF',
              text: '#1E2430',
              accent: '#3A7D44',
              accentHover: '#2E6437',
              accentLight: '#E8F2EA',
              card: '#FFFFFF',
              border: '#E5E0D5',
              muted: '#656D7A'
            },
            night: {
              bg: '#0B1020',
              card: '#141C33',
              text: '#E8ECF5',
              accent: '#F5D76E',
              accentMuted: '#B89B38',
              muted: '#9CA7C0',
              border: '#1F2A48'
            }
          },
          fontFamily: {
            sans: ['Nunito', 'sans-serif'],
          }
        }
      }
    }

document.addEventListener("DOMContentLoaded", function() {
      // Dynamic App Name Replacement from single config
      const appName = window.APP_CONFIG.APP_NAME;
      document.querySelectorAll(".app-name-label").forEach(function(el) {
        el.textContent = appName;
      });

      // Year update
      const yearEl = document.getElementById("current-year");
      if (yearEl) yearEl.textContent = new Date().getFullYear();

      // Mobile menu toggle
      const menuBtn = document.getElementById("mobile-menu-btn");
      const menu = document.getElementById("mobile-menu");
      if (menuBtn && menu) {
        menuBtn.addEventListener("click", function() {
          menu.classList.toggle("hidden");
        });
        // Close menu on link click
        menu.querySelectorAll("a").forEach(function(link) {
          link.addEventListener("click", function() {
            menu.classList.add("hidden");
          });
        });
      }

      // Scroll Spy Implementation
      const sections = ['home', 'features', 'screenshots', 'support']
        .map(id => document.getElementById(id))
        .filter(Boolean);

      const desktopNavLinks = document.querySelectorAll("header nav .nav-link");
      const mobileNavLinks = document.querySelectorAll("#mobile-menu .mobile-nav-link");

      function updateActiveNav(activeId) {
        desktopNavLinks.forEach(link => {
          const href = link.getAttribute("href");
          if (href === '#' + activeId) {
            link.classList.add("active");
            link.classList.remove("text-day-muted");
          } else {
            link.classList.remove("active");
            link.classList.add("text-day-muted");
          }
        });

        mobileNavLinks.forEach(link => {
          const href = link.getAttribute("href");
          if (href === '#' + activeId) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }

      function onScroll() {
        const scrollPosition = window.scrollY + 140;
        let currentSectionId = sections[0] ? sections[0].id : 'home';

        // Check if near bottom of document for the last section (Support)
        if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60)) {
          currentSectionId = sections[sections.length - 1].id;
        } else {
          sections.forEach(section => {
            const top = section.offsetTop;
            if (scrollPosition >= top) {
              currentSectionId = section.id;
            }
          });
        }

        updateActiveNav(currentSectionId);
      }

      window.addEventListener("scroll", onScroll, { passive: true });
      // Trigger once on page load
      onScroll();
    });

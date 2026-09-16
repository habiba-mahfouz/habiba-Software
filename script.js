/*=========================================================================
    Mobile Navigation Toggle & Scroll Spy
===========================================================================*/
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navbar = document.querySelector('.navbar');

    if (navToggle && navMenu && navbar) {
        function toggleNav() {
            const isOpen = navbar.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
            navToggle.classList.toggle('is-active', isOpen);
        }

        function closeNav() {
            navbar.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.classList.remove('is-active');
        }

        navToggle.addEventListener('click', toggleNav);

        // Close when clicking a nav link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeNav);
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!navbar.contains(e.target) && navbar.classList.contains('nav-open')) {
                closeNav();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navbar.classList.contains('nav-open')) {
                closeNav();
            }
        });
    }

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('#navMenu a[href^="#"]');

    if (sections.length && navLinks.length) {
        window.addEventListener('scroll', () => {
            let currentSectionId = '';
            const scrollPos = window.scrollY + 140;

            sections.forEach(sec => {
                const top = sec.offsetTop;
                const height = sec.offsetHeight;
                if (scrollPos >= top && scrollPos < top + height) {
                    currentSectionId = sec.getAttribute('id');
                }
            });

            if (currentSectionId) {
                navLinks.forEach(link => {
                    const href = link.getAttribute('href').replace('#', '');
                    if (href === currentSectionId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        }, { passive: true });
    }
});

/*=========================================================================
    Certifications
===========================================================================*/
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('track');
    const dotsContainer = document.getElementById('dots');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let current = 0;

    // ---- Build slides + dots from certificatesData ----
    certificatesData.forEach((cert, i) => {
        // Slide
        const slide = document.createElement('div');
        slide.className = 'slide' + (i === 0 ? ' is-active' : '');

        if (cert.image) {
            const img = document.createElement('img');
            img.src = cert.image;
            img.alt = cert.title || `Certificate ${i + 1}`;
            slide.appendChild(img);
        } else {
            const placeholder = document.createElement('span');
            placeholder.className = 'slide-placeholder';
            placeholder.textContent = cert.title || `Certificate ${i + 1}`;
            slide.appendChild(placeholder);
        }

        track.appendChild(slide);

        // Dot
        const li = document.createElement('li');
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to ${cert.title || `certificate ${i + 1}`}`);
        dot.addEventListener('click', () => goTo(i));
        li.appendChild(dot);
        dotsContainer.appendChild(li);
    });

    const slides = Array.from(track.querySelectorAll('.slide'));
    const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

    // ---- Carousel logic ----
    function goTo(index) {
        if (!slides.length) return;
        slides[current].classList.remove('is-active');
        dots[current].classList.remove('is-active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('is-active');
        dots[current].classList.add('is-active');
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    document.querySelector('.carousel-wrap').addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });
});


/*=========================================================================
    projects
===========================================================================*/

document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('projectsTrack');
    if (!track) return;

    const MAX_DESC_LENGTH = 200;

    // ---- Build the (single, shared) video lightbox once ----
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    modal.innerHTML = `
    <div class="video-modal-backdrop"></div>
    <div class="video-modal-content">
      <button class="video-modal-close" type="button" aria-label="Close video">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="6" y1="6" x2="18" y2="18"></line>
          <line x1="18" y1="6" x2="6" y2="18"></line>
        </svg>
      </button>
      <video class="video-modal-player" controls playsinline></video>
    </div>
  `;
    document.body.appendChild(modal);

    const modalPlayer = modal.querySelector('.video-modal-player');
    const modalClose = modal.querySelector('.video-modal-close');
    const modalBackdrop = modal.querySelector('.video-modal-backdrop');

    let activeCardVideo = null; // background card video that triggered the popup

    function openModal(src, cardVideoEl) {
        activeCardVideo = cardVideoEl || null;
        if (activeCardVideo) activeCardVideo.pause(); // stop the card's background video

        modalPlayer.muted = false; // play with sound automatically
        modalPlayer.src = src;

        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';

        const tryPlay = () => {
            modalPlayer.play().catch(() => {
                console.warn('Autoplay with sound blocked, retrying muted');
                modalPlayer.muted = true; // fallback if the browser blocks sound
                modalPlayer.play().catch(() => { });
            });
        };
        if (modalPlayer.readyState >= 2) {
            tryPlay();
        } else {
            modalPlayer.addEventListener('loadeddata', tryPlay, { once: true });
        }
    }

    function closeModal() {
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
        modalPlayer.pause();
        modalPlayer.removeAttribute('src');
        modalPlayer.load();

        if (activeCardVideo) {
            activeCardVideo.play().catch(() => { }); // resume the card's background video
            activeCardVideo = null;
        }
    }

    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    // ---- Icon helpers ----
    function githubIcon() {
        return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58l-.01-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.19 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.89.12 3.19.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .3Z"/></svg>`;
    }
    function linkedinIcon() {
        return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z"/></svg>`;
    }
    function playIcon() {
        return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
    }

    projectsData.forEach((project) => {
        const card = document.createElement('div');
        card.className = 'project-card';

        // Media — auto-detects video vs image from the file extension
        if (project.image) {
            const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(project.image);

            if (isVideo) {
                const video = document.createElement('video');
                video.src = project.image;
                video.muted = true;
                video.autoplay = true;
                video.loop = true;
                video.playsInline = true;
                video.preload = 'auto';
                card.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = project.image;
                img.alt = project.title;
                card.appendChild(img);
            }
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'project-placeholder';
            card.appendChild(placeholder);
        }

        // Hover overlay
        const overlay = document.createElement('div');
        overlay.className = 'project-overlay';

        const title = document.createElement('h3');
        title.className = 'project-title';
        title.textContent = project.title;

        const desc = document.createElement('p');
        desc.className = 'project-desc';
        const description = project.description || '';
        desc.textContent = description.length > MAX_DESC_LENGTH
            ? description.slice(0, MAX_DESC_LENGTH).trim() + '…'
            : description;

        // ---- 3-button action row ----
        const actions = document.createElement('div');
        actions.className = 'project-actions';

        if (project.github) {
            const gh = document.createElement('a');
            gh.className = 'project-icon-btn';
            gh.href = project.github;
            gh.target = '_blank';
            gh.rel = 'noopener';
            gh.setAttribute('aria-label', `${project.title} on GitHub`);
            gh.innerHTML = githubIcon();
            actions.appendChild(gh);
        }

        if (project.linkedin) {
            const li = document.createElement('a');
            li.className = 'project-icon-btn';
            li.href = project.linkedin;
            li.target = '_blank';
            li.rel = 'noopener';
            li.setAttribute('aria-label', `${project.title} on LinkedIn`);
            li.innerHTML = linkedinIcon();
            actions.appendChild(li);
        }

        if (project.video) {
            const cardVideoEl = card.querySelector('video'); // the card's own background video (if any)
            const play = document.createElement('button');
            play.type = 'button';
            play.className = 'project-icon-btn';
            play.setAttribute('aria-label', `Play ${project.title} video`);
            play.innerHTML = playIcon();
            play.addEventListener('click', () => openModal(project.video, cardVideoEl));
            actions.appendChild(play);
        }

        overlay.appendChild(title);
        overlay.appendChild(desc);
        overlay.appendChild(actions);
        card.appendChild(overlay);

        track.appendChild(card);
    });

    // ---- Arrow scroll buttons ----
    const prevBtn = document.getElementById('projectsPrevBtn');
    const nextBtn = document.getElementById('projectsNextBtn');

    function scrollByCard(direction) {
        const card = track.querySelector('.project-card');
        if (!card) return;
        const gap = 32; // must match the .projects-track gap in CSS
        const distance = card.getBoundingClientRect().width + gap;
        track.scrollBy({ left: direction * distance, behavior: 'smooth' });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => scrollByCard(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollByCard(1));
});

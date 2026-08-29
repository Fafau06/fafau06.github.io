(function () {

  'use strict';

  const gallery = document.getElementById('gallery');

  if (!gallery) {
    return;
  }


  /*
   * -----------------------------------------------
   * FlexMasonry
   * -----------------------------------------------
   */

  const galleryImages =
    Array.from(
      gallery.querySelectorAll('img')
    );


  function initializeMasonry() {

    FlexMasonry.init('#gallery', {

      responsive: true,

      breakpointCols: {
        'min-width: 1200px': 5,
        'min-width: 992px': 4,
        'min-width: 768px': 3,
        'min-width: 576px': 2
      },

      numCols: 1

    });

  }


  /*
   * Wait until all images have dimensions before
   * FlexMasonry calculates the container height.
   */

  if (galleryImages.length === 0) {

    initializeMasonry();

  } else {

    let loadedImages = 0;

    galleryImages.forEach(function (image) {

      function imageLoaded() {

        loadedImages++;

        if (
          loadedImages === galleryImages.length
        ) {
          initializeMasonry();
        }

      }

      if (image.complete) {

        imageLoaded();

      } else {

        image.addEventListener(
          'load',
          imageLoaded,
          { once: true }
        );

        image.addEventListener(
          'error',
          imageLoaded,
          { once: true }
        );

      }

    });

  }


  /*
   * -----------------------------------------------
   * Lightbox
   * -----------------------------------------------
   */

  const lightbox =
    document.getElementById(
      'gallery-lightbox'
    );

  const lightboxImage =
    document.getElementById(
      'gallery-lightbox-image'
    );

  const lightboxTitle =
    document.getElementById(
      'gallery-lightbox-title'
    );

  const closeButton =
    document.getElementById(
      'gallery-lightbox-close'
    );

  const previousButton =
    document.getElementById(
      'gallery-lightbox-prev'
    );

  const nextButton =
    document.getElementById(
      'gallery-lightbox-next'
    );

  const triggers =
    Array.from(
      document.querySelectorAll(
        '.gallery-image-link'
      )
    );

  let currentIndex = 0;


  function openLightbox(index) {

    currentIndex = index;

    const trigger =
      triggers[currentIndex];

    lightboxImage.src =
      trigger.dataset.galleryImage;

    lightboxImage.alt =
      trigger.dataset.galleryTitle;

    lightboxTitle.textContent =
      trigger.dataset.galleryTitle;

    lightbox.classList.add(
      'is-open'
    );

    lightbox.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'gallery-lightbox-open'
    );

    closeButton.focus();

  }


  function closeLightbox() {

    lightbox.classList.remove(
      'is-open'
    );

    lightbox.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove(
      'gallery-lightbox-open'
    );

    lightboxImage.removeAttribute(
      'src'
    );

  }


  function showPrevious() {

    currentIndex =
      (
        currentIndex -
        1 +
        triggers.length
      ) % triggers.length;

    openLightbox(currentIndex);

  }


  function showNext() {

    currentIndex =
      (
        currentIndex +
        1
      ) % triggers.length;

    openLightbox(currentIndex);

  }


  /*
   * Image click opens lightbox instead of
   * navigating to the detail page.
   */

  triggers.forEach(
    function (trigger, index) {

      trigger.addEventListener(
        'click',
        function (event) {

          event.preventDefault();

          openLightbox(index);

        }
      );

    }
  );


  closeButton.addEventListener(
    'click',
    closeLightbox
  );


  previousButton.addEventListener(
    'click',
    showPrevious
  );


  nextButton.addEventListener(
    'click',
    showNext
  );


  lightbox.addEventListener(
    'click',
    function (event) {

      if (
        event.target === lightbox
      ) {
        closeLightbox();
      }

    }
  );


  document.addEventListener(
    'keydown',
    function (event) {

      if (
        !lightbox.classList.contains(
          'is-open'
        )
      ) {
        return;
      }

      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft') {
        showPrevious();
      }

      if (event.key === 'ArrowRight') {
        showNext();
      }

    }
  );


})();
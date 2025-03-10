// Add these performance optimizations to the main.js file

// Optimize image loading with lazy loading
function initResponsiveImages() {
  // Use native lazy loading if supported
  if ("loading" in HTMLImageElement.prototype) {
    const lazyImages = document.querySelectorAll("img[data-src]")
    lazyImages.forEach((img) => {
      img.src = img.dataset.src
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset
      }
      img.removeAttribute("data-src")
      img.removeAttribute("data-srcset")
    })
  } else {
    // Fallback for browsers that don't support lazy loading
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target
          lazyImage.src = lazyImage.dataset.src
          if (lazyImage.dataset.srcset) {
            lazyImage.srcset = lazyImage.dataset.srcset
          }
          lazyImage.removeAttribute("data-src")
          lazyImage.removeAttribute("data-srcset")
          lazyImage.classList.add("loaded")
          observer.unobserve(lazyImage)
        }
      })
    })

    const lazyImages = document.querySelectorAll("img[data-src]")
    lazyImages.forEach((lazyImage) => {
      lazyImageObserver.observe(lazyImage)
    })
  }
}

// Optimize animation on scroll with IntersectionObserver
function initAnimateOnScroll() {
  const animatedElements = document.querySelectorAll(".animate-on-scroll")

  if (animatedElements.length === 0) return

  const animateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-in")
          // Once the animation is applied, we don't need to observe it anymore
          animateObserver.unobserve(entry.target)
        }
      })
    },
    {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    },
  )

  // Add animate-on-scroll class to common elements if not already present
  const elementsToAnimate = document.querySelectorAll(
    "section > .container > h2, .benefit-card, .team-member, .value-card, .certification, .faq-item",
  )

  elementsToAnimate.forEach((element) => {
    if (!element.classList.contains("animate-on-scroll")) {
      element.classList.add("animate-on-scroll")
    }
    animateObserver.observe(element)
  })
}

// Optimize event listeners with debouncing
function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// Optimize scroll event handling
function initScrollHandlers() {
  const header = document.querySelector(".site-header")

  if (header) {
    // Use requestAnimationFrame for smoother scrolling effects
    let lastScrollPosition = window.scrollY
    let ticking = false

    window.addEventListener("scroll", () => {
      lastScrollPosition = window.scrollY

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (lastScrollPosition > 50) {
            header.classList.add("scrolled")
          } else {
            header.classList.remove("scrolled")
          }
          ticking = false
        })

        ticking = true
      }
    })
  }
}

// Optimize FAQ accordion for performance
function initFAQs() {
  const faqContainer = document.querySelector(".faq-container")

  if (faqContainer) {
    // Use event delegation instead of multiple event listeners
    faqContainer.addEventListener("click", (e) => {
      const question = e.target.closest(".faq-question")

      if (question) {
        const answer = question.nextElementSibling
        const icon = question.querySelector(".faq-toggle i")

        // Toggle active class
        question.classList.toggle("active")
        answer.classList.toggle("active")

        // Toggle icon
        if (answer.classList.contains("active")) {
          icon.classList.remove("fa-plus")
          icon.classList.add("fa-minus")
        } else {
          icon.classList.remove("fa-minus")
          icon.classList.add("fa-plus")
        }
      }
    })
  }
}

// Initialize performance optimizations
document.addEventListener("DOMContentLoaded", () => {
  // Cache frequently accessed DOM elements
  const DOM = {}
  DOM.header = document.querySelector(".site-header")
  DOM.menuToggle = document.querySelector(".mobile-menu-toggle")
  DOM.mainNav = document.querySelector(".main-nav")
  DOM.faqContainer = document.querySelector(".faq-container")

  // Initialize scroll handlers with performance optimization
  initScrollHandlers()

  // Initialize mobile menu with event delegation
  if (DOM.menuToggle && DOM.mainNav) {
    DOM.menuToggle.addEventListener("click", () => {
      DOM.menuToggle.classList.toggle("active")
      DOM.mainNav.classList.toggle("active")
    })
  }

  // Initialize FAQ accordions with event delegation
  initFAQs()

  // Initialize smooth scrolling with performance optimization
  document.body.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]')

    if (anchor) {
      const targetId = anchor.getAttribute("href")
      if (targetId === "#") return

      const targetElement = document.querySelector(targetId)
      if (targetElement) {
        e.preventDefault()

        // Close mobile menu if open
        if (DOM.menuToggle && DOM.menuToggle.classList.contains("active")) {
          DOM.menuToggle.classList.remove("active")
          DOM.mainNav.classList.remove("active")
        }

        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for header height
          behavior: "smooth",
        })
      }
    }
  })

  // Initialize lazy loading for images
  initResponsiveImages()

  // Initialize animation on scroll with IntersectionObserver
  initAnimateOnScroll()

  // Add Font Awesome for icons - load asynchronously
  const fontAwesome = document.createElement("link")
  fontAwesome.rel = "stylesheet"
  fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
  fontAwesome.media = "print"
  fontAwesome.onload = function () {
    this.media = "all"
  }
  document.head.appendChild(fontAwesome)

  // Initialize accessibility features
  initAccessibilityFeatures()

  // Initialize form validation with performance optimization
  initFormValidation()
})

// Accessibility features
function initAccessibilityFeatures() {
  // Add skip to content link if not present
  if (!document.querySelector(".skip-to-content")) {
    const skipLink = document.createElement("a")
    skipLink.href = "#main-content"
    skipLink.className = "skip-to-content"
    skipLink.textContent = "Skip to content"
    document.body.prepend(skipLink)

    // Add ID to main content if not present
    const mainContent = document.querySelector("main")
    if (mainContent && !mainContent.id) {
      mainContent.id = "main-content"
    }
  }

  // Ensure all interactive elements have appropriate aria attributes
  const buttons = document.querySelectorAll("button:not([aria-label]):not([aria-labelledby])")
  buttons.forEach((button) => {
    if (!button.textContent.trim()) {
      button.setAttribute("aria-label", "Button")
    }
  })

  // Ensure all images have alt text
  const images = document.querySelectorAll("img:not([alt])")
  images.forEach((img) => {
    img.setAttribute("alt", "")
  })
}

// Form validation
function initFormValidation() {
  const forms = document.querySelectorAll("form")

  forms.forEach((form) => {
    const requiredInputs = form.querySelectorAll("[required]")

    form.addEventListener("submit", (e) => {
      let isValid = true

      requiredInputs.forEach((input) => {
        if (!input.value.trim()) {
          isValid = false
          input.classList.add("invalid")

          // Add error message if not already present
          const errorMessage = input.nextElementSibling
          if (!errorMessage || !errorMessage.classList.contains("error-message")) {
            const message = document.createElement("div")
            message.className = "error-message"
            message.textContent = "This field is required"
            message.style.color = "#e74c3c"
            message.style.fontSize = "0.85rem"
            message.style.marginTop = "0.25rem"

            input.parentNode.insertBefore(message, input.nextSibling)
          }
        } else {
          input.classList.remove("invalid")

          // Remove error message if present
          const errorMessage = input.nextElementSibling
          if (errorMessage && errorMessage.classList.contains("error-message")) {
            errorMessage.remove()
          }
        }
      })

      if (!isValid) {
        e.preventDefault()

        // Scroll to first invalid input
        const firstInvalid = form.querySelector(".invalid")
        if (firstInvalid) {
          firstInvalid.focus()
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    })

    // Real-time validation
    requiredInputs.forEach((input) => {
      input.addEventListener("blur", function () {
        if (!this.value.trim()) {
          this.classList.add("invalid")
        } else {
          this.classList.remove("invalid")

          // Remove error message if present
          const errorMessage = this.nextElementSibling
          if (errorMessage && errorMessage.classList.contains("error-message")) {
            errorMessage.remove()
          }
        }
      })

      input.addEventListener("input", function () {
        if (this.value.trim()) {
          this.classList.remove("invalid")

          // Remove error message if present
          const errorMessage = this.nextElementSibling
          if (errorMessage && errorMessage.classList.contains("error-message")) {
            errorMessage.remove()
          }
        }
      })
    })
  })
}


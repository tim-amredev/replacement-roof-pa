document.addEventListener("DOMContentLoaded", () => {
  // Header scroll effect
  const header = document.querySelector(".site-header")

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled")
    } else {
      header.classList.remove("scrolled")
    }
  })

  // Mobile menu toggle
  const menuToggle = document.querySelector(".mobile-menu-toggle")
  const mainNav = document.querySelector(".main-nav")

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active")
      mainNav.classList.toggle("active")
    })
  }

  // FAQ accordion
  const faqQuestions = document.querySelectorAll(".faq-question")

  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
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
    })
  })

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href")
      if (targetId === "#") return

      const targetElement = document.querySelector(targetId)
      if (targetElement) {
        // Close mobile menu if open
        if (menuToggle && menuToggle.classList.contains("active")) {
          menuToggle.classList.remove("active")
          mainNav.classList.remove("active")
        }

        window.scrollTo({
          top: targetElement.offsetTop - 80, // Adjust for header height
          behavior: "smooth",
        })
      }
    })
  })

  // Add animation classes on scroll
  //const animatedElements = document.querySelectorAll(".animate-on-scroll")

  //const checkIfInView = () => {
  //  const windowHeight = window.innerHeight
  //  const windowTopPosition = window.scrollY
  //  const windowBottomPosition = windowTopPosition + windowHeight

  //  animatedElements.forEach((element) => {
  //    const elementHeight = element.offsetHeight
  //    const elementTopPosition = element.offsetTop
  //    const elementBottomPosition = elementTopPosition + elementHeight

  //    // Check if element is in viewport
  //    if (elementBottomPosition >= windowTopPosition && elementTopPosition <= windowBottomPosition) {
  //      element.classList.add("fade-in")
  //    }
  //  })
  //}

  //window.addEventListener("scroll", checkIfInView)
  //window.addEventListener("resize", checkIfInView)
  //window.addEventListener("load", checkIfInView)

  // Initialize tooltips
  const tooltipIcons = document.querySelectorAll(".tooltip-icon")

  tooltipIcons.forEach((icon) => {
    const tooltip = icon.querySelector(".tooltip")

    icon.addEventListener("mouseenter", () => {
      tooltip.style.opacity = "1"
      tooltip.style.visibility = "visible"
    })

    icon.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0"
      tooltip.style.visibility = "hidden"
    })
  })

  // Current year for copyright
  const yearElement = document.querySelector(".current-year")
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear()
  }

  // Add Font Awesome for icons
  const fontAwesome = document.createElement("link")
  fontAwesome.rel = "stylesheet"
  fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
  document.head.appendChild(fontAwesome)

  // Logo fallback - try to load the logo with JavaScript as a fallback
  window.addEventListener("load", () => {
    const logoImg = document.querySelector(".logo-wrapper img")
    if (logoImg) {
      // Create a new image element
      const newImg = new Image()
      newImg.onload = function () {
        // If it loads successfully, replace the existing image
        logoImg.src = this.src
        logoImg.style.display = "block"
      }
      newImg.onerror = () => {
        // If it fails to load, use the background image fallback
        logoImg.style.display = "none"
      }
      // Try loading the image
      newImg.src =
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20design%20%2824%29-CM5D0lI7FMWRManB7DbdGfokTyocQg.png"
    }
  })

  // Initialize animation on scroll for all pages
  initAnimateOnScroll()

  // Initialize accessible focus handling
  initAccessibilityFeatures()

  // Initialize responsive image loading
  initResponsiveImages()

  // Initialize consistent form validation
  initFormValidation()
})

// Animation on scroll
function initAnimateOnScroll() {
  const animatedElements = document.querySelectorAll(".animate-on-scroll")

  if (animatedElements.length === 0) return

  const checkIfInView = () => {
    const windowHeight = window.innerHeight
    const windowTopPosition = window.scrollY
    const windowBottomPosition = windowTopPosition + windowHeight

    animatedElements.forEach((element) => {
      const elementHeight = element.offsetHeight
      const elementTopPosition = element.offsetTop
      const elementBottomPosition = elementTopPosition + elementHeight

      // Check if element is in viewport
      if (elementBottomPosition >= windowTopPosition && elementTopPosition <= windowBottomPosition) {
        element.classList.add("fade-in")
      }
    })
  }

  // Add animate-on-scroll class to common elements if not already present
  const elementsToAnimate = document.querySelectorAll(
    "section > .container > h2, .benefit-card, .team-member, .value-card, .certification, .faq-item",
  )
  elementsToAnimate.forEach((element) => {
    if (!element.classList.contains("animate-on-scroll")) {
      element.classList.add("animate-on-scroll")
    }
  })

  window.addEventListener("scroll", checkIfInView)
  window.addEventListener("resize", checkIfInView)

  // Initial check
  setTimeout(checkIfInView, 100)
}

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

// Responsive image loading
function initResponsiveImages() {
  // Lazy load images that are not in the viewport
  if ("loading" in HTMLImageElement.prototype) {
    const images = document.querySelectorAll("img[data-src]")
    images.forEach((img) => {
      img.src = img.dataset.src
      img.removeAttribute("data-src")
    })
  } else {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js"
    document.body.appendChild(script)
  }
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


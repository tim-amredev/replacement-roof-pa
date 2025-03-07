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
  const animatedElements = document.querySelectorAll(".animate-on-scroll")

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

  window.addEventListener("scroll", checkIfInView)
  window.addEventListener("resize", checkIfInView)
  window.addEventListener("load", checkIfInView)

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
})

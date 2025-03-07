document.addEventListener("DOMContentLoaded", () => {
  // Gallery filtering
  const filters = document.querySelectorAll(".gallery-filter")
  const galleryItems = document.querySelectorAll(".gallery-item")

  filters.forEach((filter) => {
    filter.addEventListener("click", function () {
      // Remove active class from all filters
      filters.forEach((f) => f.classList.remove("active"))

      // Add active class to clicked filter
      this.classList.add("active")

      const filterValue = this.getAttribute("data-filter")

      // Show/hide gallery items based on filter
      galleryItems.forEach((item) => {
        if (filterValue === "all" || item.getAttribute("data-category") === filterValue) {
          item.style.display = "block"
        } else {
          item.style.display = "none"
        }
      })
    })
  })

  // Gallery item hover effect
  galleryItems.forEach((item) => {
    const overlay = item.querySelector(".gallery-overlay")

    item.addEventListener("mouseenter", () => {
      overlay.style.opacity = "1"
    })

    item.addEventListener("mouseleave", () => {
      overlay.style.opacity = "0"
    })
  })

  // Before & After image comparison slider
  const beforeAfterItems = document.querySelectorAll(".before-after-item")

  beforeAfterItems.forEach((item) => {
    const beforeImage = item.querySelector(".before-image")
    const afterImage = item.querySelector(".after-image")
    const container = item.querySelector(".before-after-images")

    // Create slider handle
    const sliderHandle = document.createElement("div")
    sliderHandle.className = "slider-handle"
    container.appendChild(sliderHandle)

    // Set initial position
    afterImage.style.width = "50%"
    sliderHandle.style.left = "50%"

    // Add event listeners for slider functionality
    let isDragging = false

    const startDrag = (e) => {
      isDragging = true
      e.preventDefault()
    }

    const stopDrag = () => {
      isDragging = false
    }

    const drag = (e) => {
      if (!isDragging) return

      const containerRect = container.getBoundingClientRect()
      let x

      // Handle both mouse and touch events
      if (e.type === "mousemove") {
        x = e.clientX - containerRect.left
      } else {
        x = e.touches[0].clientX - containerRect.left
      }

      // Calculate percentage
      let percent = (x / containerRect.width) * 100

      // Constrain values
      if (percent < 0) percent = 0
      if (percent > 100) percent = 100

      // Update positions
      afterImage.style.width = `${percent}%`
      sliderHandle.style.left = `${percent}%`
    }

    // Add mouse events
    sliderHandle.addEventListener("mousedown", startDrag)
    document.addEventListener("mouseup", stopDrag)
    document.addEventListener("mousemove", drag)

    // Add touch events for mobile
    sliderHandle.addEventListener("touchstart", startDrag)
    document.addEventListener("touchend", stopDrag)
    document.addEventListener("touchmove", drag)
  })
})


document.addEventListener("DOMContentLoaded", () => {
  // Questionnaire variables
  let currentStep = 1
  const totalSteps = 4
  let userSelections = {
    roofType: "",
    material: "",
    size: 0,
    complexity: "",
    stories: "",
  }

  // Price ranges per square foot (in USD) - updated for 2025 accuracy
  const pricingData = {
    asphalt: {
      simple: { min: 3.75, max: 5.75 },
      moderate: { min: 4.75, max: 6.75 },
      complex: { min: 5.75, max: 7.75 },
    },
    metal: {
      simple: { min: 8.5, max: 12.5 },
      moderate: { min: 10.5, max: 14.5 },
      complex: { min: 12.5, max: 16.5 },
    },
    tile: {
      simple: { min: 10.5, max: 15.5 },
      moderate: { min: 12.5, max: 18.5 },
      complex: { min: 15.5, max: 22.5 },
    },
    slate: {
      simple: { min: 16.0, max: 26.0 },
      moderate: { min: 19.0, max: 31.0 },
      complex: { min: 23.0, max: 36.0 },
    },
  }

  // Story multipliers
  const storyMultiplier = {
    1: 1,
    2: 1.25,
    3: 1.45,
  }

  // Roof type to pitch mapping
  const roofTypeToPitch = {
    gable: "Medium Pitch",
    hip: "Medium to Steep Pitch",
    flat: "Low Pitch",
    mansard: "Steep Pitch",
  }

  // Initialize questionnaire
  initQuestionnaire()
  initFAQs()

  function initQuestionnaire() {
    // Option card selection
    const optionCards = document.querySelectorAll(".option-card")
    optionCards.forEach((card) => {
      card.addEventListener("click", function () {
        // Remove selected class from siblings
        const siblings = this.parentElement.querySelectorAll(".option-card")
        siblings.forEach((sibling) => sibling.classList.remove("selected"))

        // Add selected class to clicked card
        this.classList.add("selected")

        // Store selection based on current step
        const value = this.getAttribute("data-value")
        if (currentStep === 1) {
          userSelections.roofType = value
        } else if (currentStep === 2) {
          userSelections.material = value
        }
      })
    })

    // Next step buttons
    const nextButtons = document.querySelectorAll(".next-step")
    nextButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (validateStep(currentStep)) {
          if (currentStep < totalSteps) {
            goToStep(currentStep + 1)
          }
        }
      })
    })

    // Previous step buttons
    const prevButtons = document.querySelectorAll(".prev-step")
    prevButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (currentStep > 1) {
          goToStep(currentStep - 1)
        }
      })
    })

    // Restart questionnaire
    const restartButton = document.querySelector(".restart-questionnaire")
    if (restartButton) {
      restartButton.addEventListener("click", () => {
        resetQuestionnaire()
      })
    }

    // Form submission
    const leadForm = document.getElementById("lead-form")
    if (leadForm) {
      leadForm.addEventListener("submit", (e) => {
        // Update hidden fields with user selections
        document.getElementById("form-roof-type").value = userSelections.roofType
        document.getElementById("form-material").value = userSelections.material
        document.getElementById("form-size").value = userSelections.size
        document.getElementById("form-complexity").value = userSelections.complexity
        document.getElementById("form-estimate").value = document.getElementById("result-price-range").textContent

        // Form will submit to FormSubmit
      })
    }
  }

  function validateStep(step) {
    if (step === 1) {
      if (!userSelections.roofType) {
        alert("Please select a roof type to continue.")
        return false
      }
    } else if (step === 2) {
      if (!userSelections.material) {
        alert("Please select a roofing material to continue.")
        return false
      }
    } else if (step === 3) {
      const homeSqFt = document.getElementById("home-sqft").value
      const complexity = document.getElementById("roof-complexity").value
      const stories = document.getElementById("number-stories").value

      if (!homeSqFt || homeSqFt < 500) {
        alert("Please enter a valid home square footage (minimum 500 sq ft).")
        return false
      }

      // Store values
      userSelections.size = Number.parseInt(homeSqFt)
      userSelections.complexity = complexity
      userSelections.stories = stories

      // Calculate and display results
      calculateEstimate()
    }

    return true
  }

  function goToStep(step) {
    // Hide all steps
    const steps = document.querySelectorAll(".questionnaire-step")
    steps.forEach((s) => (s.style.display = "none"))

    // Show requested step
    document.getElementById(`step-${step}`).style.display = "block"

    // Update current step
    currentStep = step

    // Update progress bar
    updateProgress(step)

    // Scroll to top of questionnaire
    const questionnaire = document.getElementById("roofing-questionnaire")
    if (questionnaire) {
      questionnaire.scrollIntoView({ behavior: "smooth" })
    }
  }

  function updateProgress(step) {
    // Update progress fill
    const progressFill = document.getElementById("progress-fill")
    if (progressFill) {
      progressFill.style.width = `${(step / totalSteps) * 100}%`
    }

    // Update step indicators
    const progressSteps = document.querySelectorAll(".progress-step")
    progressSteps.forEach((stepEl) => {
      const stepNum = Number.parseInt(stepEl.getAttribute("data-step"))
      if (stepNum <= step) {
        stepEl.classList.add("active")
      } else {
        stepEl.classList.remove("active")
      }
    })
  }

  function calculateEstimate() {
    // Calculate roof square footage (typically 1.5x the home's footprint for pitched roofs)
    let roofMultiplier = 1.5
    if (userSelections.roofType === "flat") {
      roofMultiplier = 1.1
    } else if (userSelections.roofType === "mansard") {
      roofMultiplier = 1.8
    }

    const roofSqFt = userSelections.size * roofMultiplier

    // Get price range based on material and complexity
    const priceRange = pricingData[userSelections.material][userSelections.complexity]

    // Apply story multiplier
    const storyFactor = storyMultiplier[userSelections.stories]

    // Calculate total price range
    const minPrice = Math.round(roofSqFt * priceRange.min * storyFactor)
    const maxPrice = Math.round(roofSqFt * priceRange.max * storyFactor)

    // Update results in the DOM
    document.getElementById("result-roof-type").textContent =
      userSelections.roofType.charAt(0).toUpperCase() +
      userSelections.roofType.slice(1) +
      ` (${roofTypeToPitch[userSelections.roofType]})`

    document.getElementById("result-material").textContent =
      userSelections.material.charAt(0).toUpperCase() + userSelections.material.slice(1)

    document.getElementById("result-size").textContent =
      `${roofSqFt.toLocaleString()} sq ft (based on ${userSelections.size.toLocaleString()} sq ft home)`

    document.getElementById("result-complexity").textContent =
      userSelections.complexity.charAt(0).toUpperCase() +
      userSelections.complexity.slice(1) +
      ` (${userSelections.stories} ${userSelections.stories === "1" ? "story" : "stories"})`

    document.getElementById("result-price-range").textContent =
      `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`
  }

  function resetQuestionnaire() {
    // Reset user selections
    userSelections = {
      roofType: "",
      material: "",
      size: 0,
      complexity: "",
      stories: "",
    }

    // Reset form fields
    document.getElementById("home-sqft").value = ""
    document.getElementById("roof-complexity").selectedIndex = 0
    document.getElementById("number-stories").selectedIndex = 0

    // Reset selected cards
    const selectedCards = document.querySelectorAll(".option-card.selected")
    selectedCards.forEach((card) => card.classList.remove("selected"))

    // Go back to step 1
    goToStep(1)
  }

  function initFAQs() {
    const faqQuestions = document.querySelectorAll(".faq-question")

    faqQuestions.forEach((question) => {
      question.addEventListener("click", () => {
        const answer = question.nextElementSibling
        const icon = question.querySelector(".faq-toggle i")

        // Toggle active class
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
  }
})


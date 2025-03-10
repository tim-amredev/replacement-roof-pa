document.addEventListener("DOMContentLoaded", () => {
  // Initialize the calculator
  initRoofCalculator()

  /**
   * Main initialization function for the roof calculator
   * Separates concerns and sets up event handlers
   */
  function initRoofCalculator() {
    // Initialize smooth scrolling
    initSmoothScrolling()

    // Initialize the main calculator functionality
    initCalculator()

    // Initialize UI enhancements
    initUIEnhancements()
  }

  /**
   * Sets up smooth scrolling to the calculator section
   */
  function initSmoothScrolling() {
    const scrollToCalculatorBtn = document.querySelector(".scroll-to-calculator")
    if (scrollToCalculatorBtn) {
      scrollToCalculatorBtn.addEventListener("click", (e) => {
        e.preventDefault()
        const calculatorSection = document.querySelector(".calculator-section")
        if (calculatorSection) {
          calculatorSection.scrollIntoView({ behavior: "smooth" })
        }
      })
    }
  }

  /**
   * Initializes the main calculator functionality
   */
  function initCalculator() {
    const form = document.getElementById("calculator-form")
    const calculateButton = document.getElementById("calculate-button")
    const resultsContainer = document.getElementById("results-container")

    if (!form || !calculateButton || !resultsContainer) {
      console.error("Required calculator elements not found")
      return
    }

    // Add event listeners to all form inputs
    form.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("change", () => calculateRoofCost(form, resultsContainer))
    })

    // Calculate button click event
    calculateButton.addEventListener("click", () => {
      if (validateForm(form)) {
        calculateRoofCost(form, resultsContainer)
        resultsContainer.style.display = "block"
        resultsContainer.scrollIntoView({ behavior: "smooth" })
      }
    })
  }

  /**
   * Validates the calculator form
   * @param {HTMLFormElement} form - The calculator form element
   * @returns {boolean} - Whether the form is valid
   */
  function validateForm(form) {
    let isValid = true
    const requiredFields = form.querySelectorAll("select, input[type='number']")

    // Reset previous validation states
    requiredFields.forEach((field) => {
      field.classList.remove("invalid")
      const errorMessage = field.nextElementSibling
      if (errorMessage && errorMessage.classList.contains("error-message")) {
        errorMessage.remove()
      }
    })

    // Check each required field
    requiredFields.forEach((field) => {
      if (!field.value) {
        isValid = false
        field.classList.add("invalid")

        // Add error message
        const errorMessage = document.createElement("div")
        errorMessage.className = "error-message"
        errorMessage.textContent = "This field is required"
        errorMessage.style.color = "#e74c3c"
        errorMessage.style.fontSize = "0.85rem"
        errorMessage.style.marginTop = "0.25rem"

        field.parentNode.insertBefore(errorMessage, field.nextSibling)
      }
    })

    if (!isValid) {
      // Focus the first invalid field
      form.querySelector(".invalid")?.focus()
    }

    return isValid
  }

  /**
   * Calculates the roof cost based on form inputs
   * @param {HTMLFormElement} form - The calculator form element
   * @param {HTMLElement} resultsContainer - The container for displaying results
   */
  function calculateRoofCost(form, resultsContainer) {
    // Get form values
    const formValues = getFormValues(form)

    // Calculate costs
    const costs = calculateCosts(formValues)

    // Update the UI with the calculated costs
    updateResultsUI(costs, formValues)
  }

  /**
   * Extracts values from the calculator form
   * @param {HTMLFormElement} form - The calculator form element
   * @returns {Object} - The extracted form values
   */
  function getFormValues(form) {
    return {
      roofType: document.getElementById("roof-type").value,
      roofSqFt: Number.parseInt(document.getElementById("roof-square-footage").value),
      roofPitch: document.getElementById("roof-pitch").value,
      roofComplexity: document.getElementById("roof-complexity").value,
      material: document.getElementById("roofing-material").value,
      materialQuality: document.getElementById("material-quality").value,
      removalType: document.getElementById("old-roof-removal").value,
      deckRepair: document.getElementById("roof-deck-repair").value,
      additionalComponents: {
        "new-underlayment": document.getElementById("new-underlayment").checked,
        "ice-water-shield": document.getElementById("ice-water-shield").checked,
        "ridge-vent": document.getElementById("ridge-vent").checked,
        "new-flashing": document.getElementById("new-flashing").checked,
        "drip-edge": document.getElementById("drip-edge").checked,
        "new-gutters": document.getElementById("new-gutters").checked,
      },
    }
  }

  /**
   * Calculates all costs based on form values
   * @param {Object} formValues - The extracted form values
   * @returns {Object} - The calculated costs
   */
  function calculateCosts(formValues) {
    // Get pricing data
    const pricingData = getPricingData()

    // Calculate material costs
    const materialCosts = calculateMaterialCosts(formValues, pricingData)

    // Calculate labor costs
    const laborCosts = calculateLaborCosts(materialCosts)

    // Calculate removal costs
    const removalCosts = calculateRemovalCosts(formValues, pricingData)

    // Calculate deck repair costs
    const deckRepairCosts = calculateDeckRepairCosts(formValues, pricingData)

    // Calculate additional component costs
    const componentCosts = calculateComponentCosts(formValues, pricingData)

    // Calculate total costs
    const totalCosts = calculateTotalCosts(materialCosts, laborCosts, removalCosts, deckRepairCosts, componentCosts)

    return {
      materialCosts,
      laborCosts,
      removalCosts,
      deckRepairCosts,
      componentCosts,
      totalCosts,
    }
  }

  /**
   * Returns the pricing data for calculations
   * @returns {Object} - The pricing data
   */
  function getPricingData() {
    return {
      // Material base prices per square foot (2025 PA market rates)
      materialBasePrices: {
        asphalt: { min: 3.75, max: 5.75 },
        metal: { min: 9.5, max: 15.75 },
        "cedar-shake": { min: 8.5, max: 14.5 },
        slate: { min: 16.0, max: 32.0 },
      },

      // Quality multipliers
      qualityMultipliers: {
        economy: { min: 0.85, max: 0.9 },
        standard: { min: 1.0, max: 1.0 },
        premium: { min: 1.15, max: 1.25 },
      },

      // Complexity multipliers
      complexityMultipliers: {
        simple: { min: 0.9, max: 0.95 },
        moderate: { min: 1.0, max: 1.0 },
        complex: { min: 1.2, max: 1.3 },
        "very-complex": { min: 1.35, max: 1.55 },
      },

      // Pitch multipliers
      pitchMultipliers: {
        flat: { min: 0.9, max: 0.95 },
        low: { min: 0.95, max: 1.0 },
        medium: { min: 1.0, max: 1.05 },
        steep: { min: 1.2, max: 1.3 },
        "very-steep": { min: 1.35, max: 1.6 },
      },

      // Removal costs
      removalCosts: {
        "single-layer": { min: 0.75, max: 1.25 },
        "multiple-layers": { min: 1.25, max: 2.0 },
        "no-removal": { min: 0, max: 0 },
      },

      // Deck repair costs
      deckRepairCosts: {
        none: { min: 0, max: 0, percentage: 0 },
        minimal: { min: 0.5, max: 1.0, percentage: 0.05 },
        moderate: { min: 0.75, max: 1.5, percentage: 0.15 },
        extensive: { min: 1.0, max: 2.0, percentage: 0.3 },
      },

      // Component costs
      componentCosts: {
        "new-underlayment": { min: 0.3, max: 0.5 },
        "ice-water-shield": { min: 0.5, max: 0.8 },
        "ridge-vent": { min: 0.25, max: 0.4 },
        "new-flashing": { min: 0.2, max: 0.35 },
        "drip-edge": { min: 0.15, max: 0.25 },
        "new-gutters": { min: 6.0, max: 12.0, perLinearFoot: true },
      },
    }
  }

  /**
   * Calculates material costs
   * @param {Object} formValues - The form values
   * @param {Object} pricingData - The pricing data
   * @returns {Object} - The calculated material costs
   */
  function calculateMaterialCosts(formValues, pricingData) {
    const { material, materialQuality, roofComplexity, roofPitch, roofSqFt } = formValues

    // Get base material cost
    const baseMaterialCost = pricingData.materialBasePrices[material] || { min: 4.5, max: 7.5 }

    // Apply multipliers
    const qualityMultiplier = pricingData.qualityMultipliers[materialQuality] || { min: 1.0, max: 1.0 }
    const complexityMultiplier = pricingData.complexityMultipliers[roofComplexity] || { min: 1.0, max: 1.0 }
    const pitchMultiplier = pricingData.pitchMultipliers[roofPitch] || { min: 1.0, max: 1.05 }

    // Calculate material cost per square foot with all multipliers
    const materialCostPerSqFt = {
      min: baseMaterialCost.min * qualityMultiplier.min * complexityMultiplier.min * pitchMultiplier.min,
      max: baseMaterialCost.max * qualityMultiplier.max * complexityMultiplier.max * pitchMultiplier.max,
    }

    // Calculate total material costs
    return {
      perSqFt: materialCostPerSqFt,
      total: {
        min: materialCostPerSqFt.min * roofSqFt,
        max: materialCostPerSqFt.max * roofSqFt,
      },
    }
  }

  /**
   * Calculates labor costs
   * @param {Object} materialCosts - The calculated material costs
   * @returns {Object} - The calculated labor costs
   */
  function calculateLaborCosts(materialCosts) {
    // Labor is typically 60% of material cost for standard installations
    const laborCostPerSqFt = {
      min: materialCosts.perSqFt.min * 0.6,
      max: materialCosts.perSqFt.max * 0.6,
    }

    return {
      perSqFt: laborCostPerSqFt,
      total: {
        min: materialCosts.total.min * 0.6,
        max: materialCosts.total.max * 0.6,
      },
    }
  }

  /**
   * Calculates removal costs
   * @param {Object} formValues - The form values
   * @param {Object} pricingData - The pricing data
   * @returns {Object} - The calculated removal costs
   */
  function calculateRemovalCosts(formValues, pricingData) {
    const { removalType, roofSqFt } = formValues

    const removalCostPerSqFt = pricingData.removalCosts[removalType] || { min: 0, max: 0 }

    return {
      perSqFt: removalCostPerSqFt,
      total: {
        min: removalCostPerSqFt.min * roofSqFt,
        max: removalCostPerSqFt.max * roofSqFt,
      },
    }
  }

  /**
   * Calculates deck repair costs
   * @param {Object} formValues - The form values
   * @param {Object} pricingData - The pricing data
   * @returns {Object} - The calculated deck repair costs
   */
  function calculateDeckRepairCosts(formValues, pricingData) {
    const { deckRepair, roofSqFt } = formValues

    const deckRepairInfo = pricingData.deckRepairCosts[deckRepair] || { min: 0, max: 0, percentage: 0 }
    const deckRepairCostPerSqFt = {
      min: deckRepairInfo.min * deckRepairInfo.percentage,
      max: deckRepairInfo.max * deckRepairInfo.percentage,
    }

    return {
      perSqFt: deckRepairCostPerSqFt,
      total: {
        min: deckRepairCostPerSqFt.min * roofSqFt,
        max: deckRepairCostPerSqFt.max * roofSqFt,
      },
    }
  }

  /**
   * Calculates additional component costs
   * @param {Object} formValues - The form values
   * @param {Object} pricingData - The pricing data
   * @returns {Object} - The calculated component costs
   */
  function calculateComponentCosts(formValues, pricingData) {
    const { additionalComponents, roofSqFt } = formValues

    const componentsTotal = { min: 0, max: 0 }

    for (const [component, isSelected] of Object.entries(additionalComponents)) {
      if (isSelected && pricingData.componentCosts[component]) {
        if (pricingData.componentCosts[component].perLinearFoot) {
          // Estimate linear feet based on square footage (perimeter)
          const estimatedPerimeter = Math.sqrt(roofSqFt) * 4
          componentsTotal.min += pricingData.componentCosts[component].min * estimatedPerimeter
          componentsTotal.max += pricingData.componentCosts[component].max * estimatedPerimeter
        } else {
          componentsTotal.min += pricingData.componentCosts[component].min * roofSqFt
          componentsTotal.max += pricingData.componentCosts[component].max * roofSqFt
        }
      }
    }

    return {
      total: componentsTotal,
    }
  }

  /**
   * Calculates total costs
   * @param {Object} materialCosts - The calculated material costs
   * @param {Object} laborCosts - The calculated labor costs
   * @param {Object} removalCosts - The calculated removal costs
   * @param {Object} deckRepairCosts - The calculated deck repair costs
   * @param {Object} componentCosts - The calculated component costs
   * @returns {Object} - The calculated total costs
   */
  function calculateTotalCosts(materialCosts, laborCosts, removalCosts, deckRepairCosts, componentCosts) {
    const totalCost = {
      min:
        materialCosts.total.min +
        laborCosts.total.min +
        removalCosts.total.min +
        deckRepairCosts.total.min +
        componentCosts.total.min,
      max:
        materialCosts.total.max +
        laborCosts.total.max +
        removalCosts.total.max +
        deckRepairCosts.total.max +
        componentCosts.total.max,
    }

    // Round costs to nearest hundred
    return {
      exact: totalCost,
      rounded: {
        min: Math.round(totalCost.min / 100) * 100,
        max: Math.round(totalCost.max / 100) * 100,
      },
    }
  }

  /**
   * Updates the UI with the calculated costs
   * @param {Object} costs - The calculated costs
   * @param {Object} formValues - The form values
   */
  function updateResultsUI(costs, formValues) {
    // Store calculation results for potential chart animations
    window.calculationResults = costs

    // Update price display
    document.getElementById("price-low").textContent = `$${costs.totalCosts.rounded.min.toLocaleString()}`
    document.getElementById("price-high").textContent = `$${costs.totalCosts.rounded.max.toLocaleString()}`

    // Update breakdown details
    document.getElementById("materials-cost").textContent =
      `$${Math.round(costs.materialCosts.total.min).toLocaleString()} - $${Math.round(costs.materialCosts.total.max).toLocaleString()}`

    document.getElementById("labor-cost").textContent =
      `$${Math.round(costs.laborCosts.total.min).toLocaleString()} - $${Math.round(costs.laborCosts.total.max).toLocaleString()}`

    const removalAndDeckTotal = {
      min: costs.removalCosts.total.min + costs.deckRepairCosts.total.min,
      max: costs.removalCosts.total.max + costs.deckRepairCosts.total.max,
    }

    document.getElementById("removal-cost").textContent =
      `$${Math.round(removalAndDeckTotal.min).toLocaleString()} - $${Math.round(removalAndDeckTotal.max).toLocaleString()}`

    document.getElementById("components-cost").textContent =
      `$${Math.round(costs.componentCosts.total.min).toLocaleString()} - $${Math.round(costs.componentCosts.total.max).toLocaleString()}`

    // Update summary details
    updateSummaryDetails(formValues)
  }

  /**
   * Updates the summary details in the UI
   * @param {Object} formValues - The form values
   */
  function updateSummaryDetails(formValues) {
    const roofTypeText =
      document.querySelector(`#roof-type option[value="${formValues.roofType}"]`)?.textContent || formValues.roofType
    const roofPitchText =
      document.querySelector(`#roof-pitch option[value="${formValues.roofPitch}"]`)?.textContent || formValues.roofPitch
    const complexityText =
      document.querySelector(`#roof-complexity option[value="${formValues.roofComplexity}"]`)?.textContent ||
      formValues.roofComplexity
    const materialText =
      document.querySelector(`#roofing-material option[value="${formValues.material}"]`)?.textContent ||
      formValues.material
    const qualityText =
      document.querySelector(`#material-quality option[value="${formValues.materialQuality}"]`)?.textContent ||
      formValues.materialQuality

    document.getElementById("roof-details-summary").textContent =
      `${roofTypeText}, ${formValues.roofSqFt} sq ft, ${roofPitchText} pitch, ${complexityText} complexity`

    document.getElementById("materials-summary").textContent = `${materialText}, ${qualityText} quality`
  }

  /**
   * Initializes UI enhancements like animations
   */
  function initUIEnhancements() {
    // Add animations to UI elements
    addAnimations()

    // Initialize FAQs if they exist
    initFAQs()

    // Initialize tooltips if they exist
    initTooltips()

    // Hide material prices in the UI
    hideMaterialPrices()
  }

  /**
   * Adds animations to UI elements
   */
  function addAnimations() {
    // Animate the select cards
    animateElements(".select-card")

    // Animate the material cards
    animateElements(".material-card")

    // Animate the quality options
    animateElements(".quality-option")
  }

  /**
   * Animates elements with a staggered fade-in effect
   * @param {string} selector - CSS selector for the elements to animate
   */
  function animateElements(selector) {
    const elements = document.querySelectorAll(selector)

    elements.forEach((element, index) => {
      setTimeout(() => {
        element.style.opacity = "0"
        element.style.transform = "translateY(20px)"

        setTimeout(
          () => {
            element.style.transition = "opacity 0.5s ease, transform 0.5s ease"
            element.style.opacity = "1"
            element.style.transform = "translateY(0)"
          },
          100 + index * 100,
        )
      }, 0)
    })
  }

  /**
   * Initializes FAQ accordions
   */
  function initFAQs() {
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
  }

  /**
   * Initializes tooltips
   */
  function initTooltips() {
    const tooltipIcons = document.querySelectorAll(".tooltip-icon")

    tooltipIcons.forEach((icon) => {
      const tooltip = icon.querySelector(".tooltip")

      if (tooltip) {
        icon.addEventListener("mouseenter", () => {
          tooltip.style.opacity = "1"
          tooltip.style.visibility = "visible"
        })

        icon.addEventListener("mouseleave", () => {
          tooltip.style.opacity = "0"
          tooltip.style.visibility = "hidden"
        })
      }
    })
  }

  /**
   * Hides material prices in the UI
   */
  function hideMaterialPrices() {
    const materialPrices = document.querySelectorAll(".material-price")

    materialPrices.forEach((price) => {
      price.style.display = "none"
    })
  }
})


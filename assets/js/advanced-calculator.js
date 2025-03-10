document.addEventListener("DOMContentLoaded", () => {
  // This will add smooth scrolling to the calculator section
  const scrollToCalculatorBtn = document.querySelector(".scroll-to-calculator")
  if (scrollToCalculatorBtn) {
    scrollToCalculatorBtn.addEventListener("click", (e) => {
      e.preventDefault()
      const calculatorSection = document.getElementById("calculator-wizard")
      calculatorSection.scrollIntoView({ behavior: "smooth" })
    })
  }

  // Initialize the calculator wizard
  // initCalculatorWizard()
  // initFAQs()
  // initTooltips()

  initCalculator()

  function initCalculator() {
    const form = document.getElementById("calculator-form")
    const calculateButton = document.getElementById("calculate-button")
    const resultsContainer = document.getElementById("results-container")

    // Add event listeners to all form inputs
    form.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("change", calculateRoofCost)
    })

    // Calculate button click event
    calculateButton.addEventListener("click", () => {
      if (validateForm()) {
        calculateRoofCost()
        resultsContainer.style.display = "block"
        resultsContainer.scrollIntoView({ behavior: "smooth" })
      }
    })

    // Material base prices per square foot (2025 PA market rates)
    const materialBasePrices = {
      asphalt: { min: 3.75, max: 5.75 },
      metal: { min: 9.5, max: 15.75 },
      "cedar-shake": { min: 8.5, max: 14.5 },
      slate: { min: 16.0, max: 32.0 },
    }

    // Other calculation factors (quality multipliers, complexity multipliers, etc.)
    const qualityMultipliers = {
      economy: { min: 0.85, max: 0.9 },
      standard: { min: 1.0, max: 1.0 },
      premium: { min: 1.15, max: 1.25 },
    }

    const complexityMultipliers = {
      simple: { min: 0.9, max: 0.95 },
      moderate: { min: 1.0, max: 1.0 },
      complex: { min: 1.2, max: 1.3 },
      "very-complex": { min: 1.35, max: 1.55 },
    }

    const pitchMultipliers = {
      flat: { min: 0.9, max: 0.95 },
      low: { min: 0.95, max: 1.0 },
      medium: { min: 1.0, max: 1.05 },
      steep: { min: 1.2, max: 1.3 },
      "very-steep": { min: 1.35, max: 1.6 },
    }

    const removalCosts = {
      "single-layer": { min: 0.75, max: 1.25 },
      "multiple-layers": { min: 1.25, max: 2.0 },
      "no-removal": { min: 0, max: 0 },
    }

    const deckRepairCosts = {
      none: { min: 0, max: 0, percentage: 0 },
      minimal: { min: 0.5, max: 1.0, percentage: 0.05 },
      moderate: { min: 0.75, max: 1.5, percentage: 0.15 },
      extensive: { min: 1.0, max: 2.0, percentage: 0.3 },
    }

    const componentCosts = {
      "new-underlayment": { min: 0.3, max: 0.5 },
      "ice-water-shield": { min: 0.5, max: 0.8 },
      "ridge-vent": { min: 0.25, max: 0.4 },
      "new-flashing": { min: 0.2, max: 0.35 },
      "drip-edge": { min: 0.15, max: 0.25 },
      "new-gutters": { min: 6.0, max: 12.0, perLinearFoot: true },
    }

    function validateForm() {
      let isValid = true
      form.querySelectorAll("select, input[type='number']").forEach((input) => {
        if (!input.value) {
          alert(`Please fill in all required fields.`)
          isValid = false
          return false
        }
      })
      return isValid
    }

    function calculateRoofCost() {
      // Get form values
      const roofType = document.getElementById("roof-type").value
      const roofSqFt = Number.parseInt(document.getElementById("roof-square-footage").value)
      const roofPitch = document.getElementById("roof-pitch").value
      const roofComplexity = document.getElementById("roof-complexity").value
      const material = document.getElementById("roofing-material").value
      const materialQuality = document.getElementById("material-quality").value
      const removalType = document.getElementById("old-roof-removal").value
      const deckRepair = document.getElementById("roof-deck-repair").value

      // Get additional components
      const additionalComponents = {
        "new-underlayment": document.getElementById("new-underlayment").checked,
        "ice-water-shield": document.getElementById("ice-water-shield").checked,
        "ridge-vent": document.getElementById("ridge-vent").checked,
        "new-flashing": document.getElementById("new-flashing").checked,
        "drip-edge": document.getElementById("drip-edge").checked,
        "new-gutters": document.getElementById("new-gutters").checked,
      }

      // Calculate base material cost
      const baseMaterialCost = materialBasePrices[material] || { min: 4.5, max: 7.5 }

      // Apply multipliers
      const qualityMultiplier = qualityMultipliers[materialQuality] || { min: 1.0, max: 1.0 }
      const complexityMultiplier = complexityMultipliers[roofComplexity] || { min: 1.0, max: 1.0 }
      const pitchMultiplier = pitchMultipliers[roofPitch] || { min: 1.0, max: 1.05 }

      // Calculate material cost per square foot with all multipliers
      const materialCostPerSqFt = {
        min: baseMaterialCost.min * qualityMultiplier.min * complexityMultiplier.min * pitchMultiplier.min,
        max: baseMaterialCost.max * qualityMultiplier.max * complexityMultiplier.max * pitchMultiplier.max,
      }

      // Calculate labor cost (typically 60% of material cost for standard installations)
      const laborCostPerSqFt = {
        min: materialCostPerSqFt.min * 0.6,
        max: materialCostPerSqFt.max * 0.6,
      }

      // Calculate removal cost
      const removalCostPerSqFt = removalCosts[removalType] || { min: 0, max: 0 }

      // Calculate deck repair cost
      const deckRepairInfo = deckRepairCosts[deckRepair] || { min: 0, max: 0, percentage: 0 }
      const deckRepairCostPerSqFt = {
        min: deckRepairInfo.min * deckRepairInfo.percentage,
        max: deckRepairInfo.max * deckRepairInfo.percentage,
      }

      // Calculate additional components cost
      const componentsTotal = { min: 0, max: 0 }
      for (const [component, isSelected] of Object.entries(additionalComponents)) {
        if (isSelected && componentCosts[component]) {
          if (componentCosts[component].perLinearFoot) {
            // Estimate linear feet based on square footage (perimeter)
            const estimatedPerimeter = Math.sqrt(roofSqFt) * 4
            componentsTotal.min += componentCosts[component].min * estimatedPerimeter
            componentsTotal.max += componentCosts[component].max * estimatedPerimeter
          } else {
            componentsTotal.min += componentCosts[component].min * roofSqFt
            componentsTotal.max += componentCosts[component].max * roofSqFt
          }
        }
      }

      // Calculate total costs
      const materialsCost = {
        min: materialCostPerSqFt.min * roofSqFt,
        max: materialCostPerSqFt.max * roofSqFt,
      }

      const laborCost = {
        min: laborCostPerSqFt.min * roofSqFt,
        max: laborCostPerSqFt.max * roofSqFt,
      }

      const removalCost = {
        min: removalCostPerSqFt.min * roofSqFt,
        max: removalCostPerSqFt.max * roofSqFt,
      }

      const deckRepairCost = {
        min: deckRepairCostPerSqFt.min * roofSqFt,
        max: deckRepairCostPerSqFt.max * roofSqFt,
      }

      // Calculate total project cost
      const totalCost = {
        min: materialsCost.min + laborCost.min + removalCost.min + deckRepairCost.min + componentsTotal.min,
        max: materialsCost.max + laborCost.max + removalCost.max + deckRepairCost.max + componentsTotal.max,
      }

      // Round costs to nearest hundred
      const roundedTotalCost = {
        min: Math.round(totalCost.min / 100) * 100,
        max: Math.round(totalCost.max / 100) * 100,
      }

      // Update results in the DOM
      document.getElementById("price-low").textContent = `$${roundedTotalCost.min.toLocaleString()}`
      document.getElementById("price-high").textContent = `$${roundedTotalCost.max.toLocaleString()}`

      // Update breakdown details
      document.getElementById("materials-cost").textContent =
        `$${Math.round(materialsCost.min).toLocaleString()} - $${Math.round(materialsCost.max).toLocaleString()}`
      document.getElementById("labor-cost").textContent =
        `$${Math.round(laborCost.min).toLocaleString()} - $${Math.round(laborCost.max).toLocaleString()}`
      document.getElementById("removal-cost").textContent =
        `$${Math.round(removalCost.min + deckRepairCost.min).toLocaleString()} - $${Math.round(removalCost.max + deckRepairCost.max).toLocaleString()}`
      document.getElementById("components-cost").textContent =
        `$${Math.round(componentsTotal.min).toLocaleString()} - $${Math.round(componentsTotal.max).toLocaleString()}`

      // Update summary details
      const roofTypeText = document.querySelector(`#roof-type option[value="${roofType}"]`).textContent
      const roofPitchText = document.querySelector(`#roof-pitch option[value="${roofPitch}"]`).textContent
      const complexityText = document.querySelector(`#roof-complexity option[value="${roofComplexity}"]`).textContent
      const materialText = document.querySelector(`#roofing-material option[value="${material}"]`).textContent
      const qualityText = document.querySelector(`#material-quality option[value="${materialQuality}"]`).textContent

      document.getElementById("roof-details-summary").textContent =
        `${roofTypeText}, ${roofSqFt} sq ft, ${roofPitchText} pitch, ${complexityText} complexity`
      document.getElementById("materials-summary").textContent = `${materialText}, ${qualityText} quality`

      // Enhance the chart animation
      function enhanceChartAnimation() {
        // Add animation to chart segments
        setTimeout(() => {
          const materialsSegment = document.getElementById("materials-segment")
          const laborSegment = document.getElementById("labor-segment")
          const removalSegment = document.getElementById("removal-segment")
          const componentsSegment = document.getElementById("components-segment")

          if (materialsSegment) materialsSegment.style.width = "0%"
          if (laborSegment) laborSegment.style.width = "0%"
          if (removalSegment) removalSegment.style.width = "0%"
          if (componentsSegment) componentsSegment.style.width = "0%"

          setTimeout(() => {
            const totalMin =
              window.materialsCost?.min +
                window.laborCost?.min +
                window.removalCost?.min +
                window.deckRepairCost?.min +
                window.componentsTotal?.min || 100

            if (materialsSegment)
              materialsSegment.style.width = `${(window.materialsCost?.min / totalMin) * 100 || 40}%`
            if (laborSegment) laborSegment.style.width = `${(window.laborCost?.min / totalMin) * 100 || 30}%`
            if (removalSegment)
              removalSegment.style.width = `${((window.removalCost?.min + window.deckRepairCost?.min) / totalMin) * 100 || 20}%`
            if (componentsSegment)
              componentsSegment.style.width = `${(window.componentsTotal?.min / totalMin) * 100 || 10}%`
          }, 500)
        }, 300)
      }
    }
  }

  // Add animations to the calculator elements
  function addAnimations() {
    // Animate the select cards when they appear
    const selectCards = document.querySelectorAll(".select-card")
    selectCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = "0"
        card.style.transform = "translateY(20px)"

        setTimeout(
          () => {
            card.style.transition = "opacity 0.5s ease, transform 0.5s ease"
            card.style.opacity = "1"
            card.style.transform = "translateY(0)"
          },
          100 + index * 100,
        )
      }, 0)
    })

    // Animate the material cards when they appear
    const materialCards = document.querySelectorAll(".material-card")
    materialCards.forEach((materialCard, index) => {
      setTimeout(() => {
        materialCard.style.opacity = "0"
        materialCard.style.transform = "translateY(20px)"

        setTimeout(
          () => {
            materialCard.style.transition = "opacity 0.5s ease, transform 0.5s ease"
            materialCard.style.opacity = "1"
            materialCard.style.transform = "translateY(0)"
          },
          100 + index * 100,
        )
      }, 0)
    })

    // Animate the quality options when they appear
    const qualityOptions = document.querySelectorAll(".quality-option")
    qualityOptions.forEach((option, index) => {
      setTimeout(() => {
        option.style.opacity = "0"
        option.style.transform = "translateY(20px)"

        setTimeout(
          () => {
            option.style.transition = "opacity 0.5s ease, transform 0.5s ease"
            option.style.opacity = "1"
            option.style.transform = "translateY(0)"
          },
          100 + index * 100,
        )
      }, 0)
    })
  }

  // Enhance the goToStep function to add animations
  function enhanceGoToStep() {
    // Find the original goToStep function
    const originalGoToStep = window.goToStep

    // If it exists, enhance it
    if (typeof originalGoToStep === "function") {
      window.goToStep = (step) => {
        // Call the original function
        originalGoToStep(step)

        // Add animations
        addAnimations()
      }
    }
  }

  // Try to enhance the goToStep function
  enhanceGoToStep()

  // Hide material prices in the UI
  function hideMaterialPrices() {
    const materialPrices = document.querySelectorAll(".material-price")
    materialPrices.forEach((price) => {
      price.style.display = "none"
    })
  }

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

  function initTooltips() {
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
  }

  // Call this function when the page loads
  hideMaterialPrices()

  // Call animations on page load
  addAnimations()
})


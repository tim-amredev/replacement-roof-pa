document.addEventListener("DOMContentLoaded", () => {
  // Initialize the calculator wizard
  initCalculatorWizard()
  initFAQs()
  initTooltips()

  function initCalculatorWizard() {
    // Step navigation
    const nextButtons = document.querySelectorAll(".next-step")
    const prevButtons = document.querySelectorAll(".prev-step")
    const calculateButton = document.getElementById("calculate-button")
    const resetButton = document.getElementById("reset-calculator")
    const progressFill = document.getElementById("progress-fill")
    const progressSteps = document.querySelectorAll(".progress-step")

    // Select cards
    const selectCards = document.querySelectorAll(".select-card")
    const materialCards = document.querySelectorAll(".material-card")
    const qualityOptions = document.querySelectorAll(".quality-option")

    // Current step
    let currentStep = 1
    const totalSteps = 4

    // Material base prices per square foot (2025 PA market rates - updated for accuracy)
    const materialBasePrices = {
      asphalt: { min: 3.75, max: 5.75 },
      metal: { min: 9.5, max: 15.75 },
      "cedar-shake": { min: 8.5, max: 14.5 },
      slate: { min: 16.0, max: 32.0 },
    }

    // Quality multipliers
    const qualityMultipliers = {
      economy: { min: 0.85, max: 0.9 },
      standard: { min: 1.0, max: 1.0 },
      premium: { min: 1.15, max: 1.25 },
    }

    // Complexity multipliers
    const complexityMultipliers = {
      simple: { min: 0.9, max: 0.95 },
      moderate: { min: 1.0, max: 1.0 },
      complex: { min: 1.2, max: 1.3 },
      "very-complex": { min: 1.35, max: 1.55 },
    }

    // Pitch multipliers
    const pitchMultipliers = {
      flat: { min: 0.9, max: 0.95 },
      low: { min: 0.95, max: 1.0 },
      medium: { min: 1.0, max: 1.05 },
      steep: { min: 1.2, max: 1.3 },
      "very-steep": { min: 1.35, max: 1.6 },
    }

    // Story multipliers
    const storyMultipliers = {
      1: { min: 1.0, max: 1.0 },
      2: { min: 1.1, max: 1.2 },
      3: { min: 1.25, max: 1.4 },
    }

    // Roof type multipliers (for estimating roof square footage from home square footage)
    const roofTypeMultipliers = {
      gable: 1.3,
      hip: 1.4,
      flat: 1.1,
      mansard: 1.7,
      gambrel: 1.6,
    }

    // Removal costs per square foot
    const removalCosts = {
      "single-layer": { min: 0.75, max: 1.25 },
      "multiple-layers": { min: 1.25, max: 2.0 },
      "no-removal": { min: 0, max: 0 },
    }

    // Deck repair costs per square foot (percentage of roof area)
    const deckRepairCosts = {
      none: { min: 0, max: 0, percentage: 0 },
      minimal: { min: 0.5, max: 1.0, percentage: 0.05 },
      moderate: { min: 0.75, max: 1.5, percentage: 0.15 },
      extensive: { min: 1.0, max: 2.0, percentage: 0.3 },
    }

    // Regional price adjustments
    const regionMultipliers = {
      philadelphia: { min: 1.1, max: 1.15 },
      pittsburgh: { min: 1.05, max: 1.1 },
      harrisburg: { min: 1.0, max: 1.0 },
      allentown: { min: 1.03, max: 1.08 },
      erie: { min: 0.9, max: 0.95 },
      scranton: { min: 0.95, max: 1.0 },
      reading: { min: 0.98, max: 1.03 },
      lancaster: { min: 0.95, max: 1.0 },
      "state-college": { min: 0.9, max: 0.95 },
      rural: { min: 0.85, max: 0.9 },
    }

    // Additional component costs
    const componentCosts = {
      "new-underlayment": { min: 0.3, max: 0.5 },
      "ice-water-shield": { min: 0.5, max: 0.8 },
      "ridge-vent": { min: 0.25, max: 0.4 },
      "new-flashing": { min: 0.2, max: 0.35 },
      "drip-edge": { min: 0.15, max: 0.25 },
      "new-gutters": { min: 6.0, max: 12.0, perLinearFoot: true },
    }

    // Initialize select cards
    selectCards.forEach((card) => {
      card.addEventListener("click", () => {
        // Remove selected class from siblings
        selectCards.forEach((c) => c.classList.remove("selected"))
        // Add selected class to clicked card
        card.classList.add("selected")
        // Update hidden input
        document.getElementById("roof-type").value = card.getAttribute("data-value")
      })
    })

    // Initialize material cards
    materialCards.forEach((card) => {
      card.addEventListener("click", () => {
        // Remove selected class from siblings
        materialCards.forEach((c) => c.classList.remove("selected"))
        // Add selected class to clicked card
        card.classList.add("selected")
        // Update hidden input
        document.getElementById("roofing-material").value = card.getAttribute("data-value")
      })
    })

    // Initialize quality options
    qualityOptions.forEach((option) => {
      option.addEventListener("click", () => {
        // Remove selected class from siblings
        qualityOptions.forEach((o) => o.classList.remove("selected"))
        // Add selected class to clicked option
        option.classList.add("selected")
        // Update hidden input
        document.getElementById("material-quality").value = option.getAttribute("data-value")
      })
    })

    // Remove the regionMarkers initialization and event listeners
    const regionMarkers = document.querySelectorAll(".region-marker")

    // Initialize region markers
    regionMarkers.forEach((marker) => {
      marker.addEventListener("click", () => {
        // Remove selected class from siblings
        regionMarkers.forEach((m) => m.classList.remove("selected"))
        // Add selected class to clicked marker
        marker.classList.add("selected")
        // Update hidden input
        document.getElementById("location").value = marker.getAttribute("data-region")
      })
    })

    // Next step buttons
    nextButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (validateStep(currentStep)) {
          goToStep(currentStep + 1)
        }
      })
    })

    // Previous step buttons
    prevButtons.forEach((button) => {
      button.addEventListener("click", () => {
        goToStep(currentStep - 1)
      })
    })

    // Calculate button
    if (calculateButton) {
      calculateButton.addEventListener("click", () => {
        if (validateStep(currentStep)) {
          calculateRoofCost()
          goToStep(4)
        }
      })
    }

    // Reset button
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        resetCalculator()
      })
    }

    // Validate current step
    function validateStep(step) {
      let isValid = true

      switch (step) {
        case 1:
          // Validate roof type
          if (!document.getElementById("roof-type").value) {
            alert("Please select a roof type to continue.")
            isValid = false
          }

          // Validate roof square footage
          const roofSqFt = document.getElementById("roof-square-footage").value
          if (!roofSqFt || roofSqFt < 500) {
            alert("Please enter a valid roof square footage (minimum 500 sq ft).")
            isValid = false
          }

          // Validate roof pitch
          if (!document.getElementById("roof-pitch").value) {
            alert("Please select a roof pitch to continue.")
            isValid = false
          }

          // Validate roof complexity
          if (!document.getElementById("roof-complexity").value) {
            alert("Please select a roof complexity to continue.")
            isValid = false
          }

          // Validate number of stories
          if (!document.getElementById("number-stories").value) {
            alert("Please select the number of stories to continue.")
            isValid = false
          }
          break

        case 2:
          // Validate roofing material
          if (!document.getElementById("roofing-material").value) {
            alert("Please select a roofing material to continue.")
            isValid = false
          }

          // Validate material quality
          if (!document.getElementById("material-quality").value) {
            alert("Please select a material quality to continue.")
            isValid = false
          }
          break

        case 3:
          // Validate old roof removal
          if (!document.getElementById("old-roof-removal").value) {
            alert("Please select an old roof removal option to continue.")
            isValid = false
          }

          // Validate roof deck repair
          if (!document.getElementById("roof-deck-repair").value) {
            alert("Please select a roof deck repair option to continue.")
            isValid = false
          }

          // Set a default location for Pennsylvania
          document.getElementById("location").value = "pennsylvania"
          break
      }

      return isValid
    }

    // Go to step
    function goToStep(step) {
      // Hide all steps
      document.querySelectorAll(".wizard-step").forEach((s) => {
        s.style.display = "none"
      })

      // Show requested step
      document.getElementById(`step-${step}`).style.display = "block"

      // Update current step
      currentStep = step

      // Update progress bar
      updateProgress(step)

      // Scroll to top of calculator
      document.querySelector(".calculator-wizard-container").scrollIntoView({ behavior: "smooth" })
    }

    // Update progress
    function updateProgress(step) {
      // Update progress fill
      if (progressFill) {
        progressFill.style.width = `${(step / totalSteps) * 100}%`
      }

      // Update step indicators
      progressSteps.forEach((stepEl) => {
        const stepNum = Number.parseInt(stepEl.getAttribute("data-step"))
        if (stepNum < step) {
          stepEl.classList.add("completed")
          stepEl.classList.remove("active")
        } else if (stepNum === step) {
          stepEl.classList.add("active")
          stepEl.classList.remove("completed")
        } else {
          stepEl.classList.remove("active", "completed")
        }
      })
    }

    // Calculate roof cost
    function calculateRoofCost() {
      // Get form values
      const roofType = document.getElementById("roof-type").value
      const roofSqFt = Number.parseInt(document.getElementById("roof-square-footage").value)
      const roofPitch = document.getElementById("roof-pitch").value
      const roofComplexity = document.getElementById("roof-complexity").value
      const stories = document.getElementById("number-stories").value
      const material = document.getElementById("roofing-material").value
      const materialQuality = document.getElementById("material-quality").value
      const removalType = document.getElementById("old-roof-removal").value
      const deckRepair = document.getElementById("roof-deck-repair").value

      // Set a standard location for all of PA
      const location = "pennsylvania"

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
      const baseMaterialCost = materialBasePrices[material] || { min: 4.5, max: 7.5 } // Default to architectural if not found

      // Apply quality multiplier
      const qualityMultiplier = qualityMultipliers[materialQuality] || { min: 1.0, max: 1.0 }

      // Apply complexity multiplier
      const complexityMultiplier = complexityMultipliers[roofComplexity] || { min: 1.0, max: 1.0 }

      // Apply pitch multiplier
      const pitchMultiplier = pitchMultipliers[roofPitch] || { min: 1.0, max: 1.05 }

      // Apply story multiplier
      const storyMultiplier = storyMultipliers[stories] || { min: 1.0, max: 1.0 }

      // Use a standard regional multiplier for all of PA
      const regionMultiplier = { min: 1.0, max: 1.0 }

      // Calculate material cost per square foot with all multipliers
      const materialCostPerSqFt = {
        min:
          baseMaterialCost.min *
          qualityMultiplier.min *
          complexityMultiplier.min *
          pitchMultiplier.min *
          regionMultiplier.min,
        max:
          baseMaterialCost.max *
          qualityMultiplier.max *
          complexityMultiplier.max *
          pitchMultiplier.max *
          regionMultiplier.max,
      }

      // Calculate labor cost (typically 60% of material cost for standard installations)
      const laborCostPerSqFt = {
        min: materialCostPerSqFt.min * 0.6 * storyMultiplier.min,
        max: materialCostPerSqFt.max * 0.6 * storyMultiplier.max,
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
      const materialsElement = document.getElementById("materials-cost")
      const laborElement = document.getElementById("labor-cost")
      const removalElement = document.getElementById("removal-cost")
      const componentsElement = document.getElementById("components-cost")

      if (materialsElement) {
        materialsElement.textContent = `$${Math.round(materialsCost.min).toLocaleString()} - $${Math.round(materialsCost.max).toLocaleString()}`
      }

      if (laborElement) {
        laborElement.textContent = `$${Math.round(laborCost.min).toLocaleString()} - $${Math.round(laborCost.max).toLocaleString()}`
      }

      if (removalElement) {
        removalElement.textContent = `$${Math.round(removalCost.min + deckRepairCost.min).toLocaleString()} - $${Math.round(removalCost.max + deckRepairCost.max).toLocaleString()}`
      }

      if (componentsElement) {
        componentsElement.textContent = `$${Math.round(componentsTotal.min).toLocaleString()} - $${Math.round(componentsTotal.max).toLocaleString()}`
      }

      // Update chart segments if they exist
      const totalMin = materialsCost.min + laborCost.min + removalCost.min + deckRepairCost.min + componentsTotal.min

      const materialsSegment = document.getElementById("materials-segment")
      const laborSegment = document.getElementById("labor-segment")
      const removalSegment = document.getElementById("removal-segment")
      const componentsSegment = document.getElementById("components-segment")

      if (materialsSegment) {
        materialsSegment.style.width = `${(materialsCost.min / totalMin) * 100}%`
      }

      if (laborSegment) {
        laborSegment.style.width = `${(laborCost.min / totalMin) * 100}%`
      }

      if (removalSegment) {
        removalSegment.style.width = `${((removalCost.min + deckRepairCost.min) / totalMin) * 100}%`
      }

      if (componentsSegment) {
        componentsSegment.style.width = `${(componentsTotal.min / totalMin) * 100}%`
      }

      // Update summary details
      let roofTypeText = ""
      selectCards.forEach((card) => {
        if (card.getAttribute("data-value") === roofType) {
          roofTypeText = card.querySelector("h4").textContent
        }
      })

      const roofPitchText = document.querySelector(`#roof-pitch option[value="${roofPitch}"]`).textContent
      const complexityText = document.querySelector(`#roof-complexity option[value="${roofComplexity}"]`).textContent
      const storiesText = document.querySelector(`#number-stories option[value="${stories}"]`).textContent

      const roofDetailsSummary = document.getElementById("roof-details-summary")
      if (roofDetailsSummary) {
        roofDetailsSummary.textContent = `${roofTypeText}, ${roofSqFt} sq ft, ${roofPitchText} pitch, ${complexityText} complexity, ${storiesText}`
      }

      let materialText = ""
      materialCards.forEach((card) => {
        if (card.getAttribute("data-value") === material) {
          materialText = card.querySelector("h4").textContent
        }
      })

      let qualityText = ""
      qualityOptions.forEach((option) => {
        if (option.getAttribute("data-value") === materialQuality) {
          qualityText = option.querySelector(".quality-label").textContent
        }
      })

      const materialsSummary = document.getElementById("materials-summary")
      if (materialsSummary) {
        materialsSummary.textContent = `${materialText}, ${qualityText} quality`
      }

      // Set location summary to Pennsylvania
      const locationSummary = document.getElementById("location-summary")
      if (locationSummary) {
        locationSummary.textContent = "Pennsylvania"
      }

      // Update hidden form fields for lead form
      const formRoofType = document.getElementById("form-roof-type")
      const formRoofSize = document.getElementById("form-roof-size")
      const formMaterial = document.getElementById("form-material")
      const formEstimate = document.getElementById("form-estimate")

      if (formRoofType) formRoofType.value = roofTypeText
      if (formRoofSize) formRoofSize.value = roofSqFt
      if (formMaterial) formMaterial.value = materialText
      if (formEstimate)
        formEstimate.value = `$${roundedTotalCost.min.toLocaleString()} - $${roundedTotalCost.max.toLocaleString()}`

      console.log("Calculation complete. Total cost:", roundedTotalCost)
    }

    // Reset calculator
    function resetCalculator() {
      // Reset form
      document.getElementById("calculator-form").reset()

      // Reset select cards
      selectCards.forEach((card) => card.classList.remove("selected"))
      materialCards.forEach((card) => card.classList.remove("selected"))
      qualityOptions.forEach((option) => option.classList.remove("selected"))
      regionMarkers.forEach((marker) => marker.classList.remove("selected"))

      // Reset hidden inputs
      document.getElementById("roof-type").value = ""
      document.getElementById("roofing-material").value = ""
      document.getElementById("material-quality").value = ""
      document.getElementById("location").value = ""

      // Go back to step 1
      goToStep(1)
    }
  }

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
})


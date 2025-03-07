document.addEventListener("DOMContentLoaded", () => {
  // Initialize the calculator
  initAdvancedCalculator();
  initFAQs();
  initTooltips();

  function initAdvancedCalculator() {
    // Get form elements
    const calculatorForm = document.getElementById("calculator-form");
    const calculateButton = document.getElementById("calculate-button");
    const resetButton = document.getElementById("reset-calculator");
    const resultsSection = document.getElementById("calculation-results");
    
    // Material base prices per square foot (2025 PA market rates)
    const materialBasePrices = {
      "3-tab": { min: 3.50, max: 5.50 },
      "architectural": { min: 4.50, max: 7.50 },
      "premium-architectural": { min: 6.00, max: 10.00 },
      "metal-shingles": { min: 7.00, max: 12.00 },
      "standing-seam": { min: 9.00, max: 15.00 },
      "cedar-shake": { min: 8.00, max: 14.00 },
      "synthetic-slate": { min: 10.00, max: 18.00 },
      "natural-slate": { min: 15.00, max: 30.00 },
      "clay-tile": { min: 12.00, max: 25.00 },
      "concrete-tile": { min: 10.00, max: 20.00 },
      "tpo-membrane": { min: 5.50, max: 8.50 },
      "epdm-rubber": { min: 5.00, max: 9.50 }
    };
    
    // Quality multipliers
    const qualityMultipliers = {
      "economy": { min: 0.85, max: 0.90 },
      "standard": { min: 1.00, max: 1.00 },
      "premium": { min: 1.15, max: 1.25 }
    };
    
    // Complexity multipliers
    const complexityMultipliers = {
      "simple": { min: 0.90, max: 0.95 },
      "moderate": { min: 1.00, max: 1.00 },
      "complex": { min: 1.15, max: 1.25 },
      "very-complex": { min: 1.30, max: 1.50 }
    };
    
    // Pitch multipliers
    const pitchMultipliers = {
      "flat": { min: 0.90, max: 0.95 },
      "low": { min: 0.95, max: 1.00 },
      "medium": { min: 1.00, max: 1.05 },
      "steep": { min: 1.15, max: 1.25 },
      "very-steep": { min: 1.30, max: 1.50 }
    };
    
    // Story multipliers
    const storyMultipliers = {
      "1": { min: 1.00, max: 1.00 },
      "2": { min: 1.10, max: 1.20 },
      "3": { min: 1.25, max: 1.40 }
    };
    
    // Roof type multipliers (for estimating roof square footage from home square footage)
    const roofTypeMultipliers = {
      "gable": 1.3,
      "hip": 1.4,
      "flat": 1.1,
      "mansard": 1.7,
      "gambrel": 1.6
    };
    
    // Removal costs per square foot
    const removalCosts = {
      "single-layer": { min: 0.75, max: 1.25 },
      "multiple-layers": { min: 1.25, max: 2.00 },
      "no-removal": { min: 0, max: 0 }
    };
    
    // Deck repair costs per square foot (percentage of roof area)
    const deckRepairCosts = {
      "none": { min: 0, max: 0 },
      "minimal": { min: 0.50, max: 1.00, percentage: 0.05 },
      "moderate": { min: 0.75, max: 1.50, percentage: 0.15 },
      "extensive": { min: 1.00, max: 2.00, percentage: 0.30 }
    };
    
    // Regional price adjustments
    const regionMultipliers = {
      "philadelphia": { min: 1.10, max: 1.15 },
      "pittsburgh": { min: 1.05, max: 1.10 },
      "harrisburg": { min: 1.00, max: 1.00 },
      "allentown": { min: 1.03, max: 1.08 },
      "erie": { min: 0.90, max: 0.95 },
      "scranton": { min: 0.95, max: 1.00 },
      "reading": { min: 0.98, max: 1.03 },
      "lancaster": { min: 0.95, max: 1.00 },
      "state-college": { min: 0.90, max: 0.95 },
      "rural": { min: 0.85, max: 0.90 }
    };
    
    // Additional component costs
    const componentCosts = {
      "new-underlayment": { min: 0.30, max: 0.50 },
      "ice-water-shield": { min: 0.50, max: 0.80 },
      "ridge-vent": { min: 0.25, max: 0.40 },
      "new-flashing": { min: 0.20, max: 0.35 },
      "drip-edge": { min: 0.15, max: 0.25 },
      "new-gutters": { min: 6.00, max: 12.00, perLinearFoot: true }
    };
    
    // Calculate button click handler
    if (calculateButton) {
      calculateButton.addEventListener("click", () => {
        if (validateForm()) {
          calculateRoofCost();
          resultsSection.style.display = "block";
          resultsSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
    
    // Reset button click handler
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        calculatorForm.reset();
        resultsSection.style.display = "none";
      });
    }
    
    // Form validation
    function validateForm() {
      const requiredFields = calculatorForm.querySelectorAll("[required]");
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value) {
          field.classList.add("invalid");
          isValid = false;
        } else {
          field.classList.remove("invalid");
        }
      });
      
      if (!isValid) {
        alert("Please fill in all required fields to calculate your roof cost.");
      }
      
      return isValid;
    }
    
    // Main calculation function
    function calculateRoofCost() {
      // Get form values
      const roofType = document.getElementById("roof-type").value;
      const roofSqFt = parseInt(document.getElementById("roof-square-footage").value);
      const roofPitch = document.getElementById("roof-pitch").value;
      const roofComplexity = document.getElementById("roof-complexity").value;
      const stories = document.getElementById("number-stories").value;
      const material = document.getElementById("roofing-material").value;
      const materialQuality = document.getElementById("material-quality").value;
      const removalType = document.getElementById("old-roof-removal").value;
      const deckRepair = document.getElementById("roof-deck-repair").value;
      const location = document.getElementById("location").value;
      
      // Get additional components
      const additionalComponents = {
        "new-underlayment": document.getElementById("new-underlayment").checked,
        "ice-water-shield": document.getElementById("ice-water-shield").checked,
        "ridge-vent": document.getElementById("ridge-vent").checked,
        "new-flashing": document.getElementById("new-flashing").checked,
        "drip-edge": document.getElementById("drip-edge").checked,
        "new-gutters": document.getElementById("new-gutters").checked
      };
      
      // Calculate base material cost
      const baseMaterialCost = materialBasePrices[material] || { min: 4.50, max: 7.50 }; // Default to architectural if not found
      
      // Apply quality multiplier
      const qualityMultiplier = qualityMultipliers[materialQuality] || { min: 1.00, max: 1.00 };
      
      // Apply complexity multiplier
      const complexityMultiplier = complexityMultipliers[roofComplexity] || { min: 1.00, max: 1.00 };
      
      // Apply pitch multiplier
      const pitchMultiplier = pitchMultipliers[roofPitch] || { min: 1.00, max: 1.05 };
      
      // Apply story multiplier
      const storyMultiplier = storyMultipliers[stories] || { min: 1.00, max: 1.00 };
      
      // Apply regional multiplier
      const regionMultiplier = regionMultipliers[location] || { min: 1.00, max: 1.00 };
      
      // Calculate material cost per square foot with all multipliers
      const materialCostPerSqFt = {
        min: baseMaterialCost.min * qualityMultiplier.min * complexityMultiplier.min * pitchMultiplier.min * regionMultiplier.min,
        max: baseMaterialCost.max * qualityMultiplier.max * complexityMultiplier.max * pitchMultiplier.max * regionMultiplier.max
      };
      
      // Calculate labor cost (typically 60% of material cost for standard installations)
      const laborCostPerSqFt = {
        min: materialCostPerSqFt.min * 0.60 * storyMultiplier.min,
        max: materialCostPerSqFt.max * 0.60 * storyMultiplier.max
      };
      
      // Calculate removal cost
      const removalCostPerSqFt = removalCosts[removalType] || { min: 0, max: 0 };
      
      // Calculate deck repair cost
      const deckRepairInfo = deckRepairCosts[deckRepair] || { min: 0, max: 0, percentage: 0 };
      const deckRepairCostPerSqFt = {
        min: deckRepairInfo.min * deckRepairInfo.percentage,
        max: deckRepairInfo.max * deckRepairInfo.percentage
      };
      
      // Calculate additional components cost
      let componentsTotal = { min: 0, max: 0 };
      for (const [component, isSelected] of Object.entries(additionalComponents)) {
        if (isSelected && componentCosts[component]) {
          if (componentCosts[component].perLinearFoot) {
            // Estimate linear feet based on square footage (perimeter)
            const estimatedPerimeter = Math.sqrt(roofSqFt) * 4;
            componentsTotal.min += componentCosts[component].min * estimatedPerimeter;
            componentsTotal.max += componentCosts[component].max * estimatedPerimeter;
          } else {
            componentsTotal.min += componentCosts[component].min * roofSqFt;
            componentsTotal.max += componentCosts[component].max * roofSqFt;
          }
        }
      }
      
      // Calculate total costs
      const materialsCost = {
        min: materialCostPerSqFt.min * roofSqFt,
        max: materialCostPerSqFt.max * roofSqFt
      };
      
      const laborCost = {
        min: laborCostPerSqFt.min * roofSqFt,
        max: laborCostPerSqFt.max * roofSqFt
      };
      
      const removalCost = {
        min: removalCostPerSqFt.min * roofSqFt,
        max: removalCostPerSqFt.max * roofSqFt
      };
      
      const deckRepairCost = {
        min: deckRepairCostPerSqFt.min * roofSqFt,
        max: deckRepairCostPerSqFt.max * roofSqFt
      };
      
      // Calculate total project cost
      const totalCost = {
        min: materialsCost.min + laborCost.min + removalCost.min + deckRepairCost.min + componentsTotal.min,
        max: materialsCost.max + laborCost.max + removalCost.max + deckRepairCost.max + componentsTotal.max
      };
      
      // Round costs to nearest hundred
      const roundedTotalCost = {
        min: Math.round(totalCost.min / 100) * 100,
        max: Math.round(totalCost.max / 100) * 100
      };
      
      // Update results in the DOM
      document.getElementById("price-low").textContent = `$${roundedTotalCost.min.toLocaleString()}`;
      document.getElementById("price-high").textContent = `$${roundedTotalCost.max.toLocaleString()}`;
      
      document.getElementById("materials-cost").textContent = `$${Math.round(materialsCost.min).toLocaleString()} - $${Math.round(materialsCost.max).toLocaleString()}`;
      document.getElementById("labor-cost").textContent = `$${Math.round(laborCost.min).toLocaleString()} - $${Math.round(laborCost.max).toLocaleString()}`;
      document.getElementById("removal-cost").textContent = `$${Math.round(removalCost.min + deckRepairCost.min).toLocaleString()} - $${Math.round(removalCost.max + deckRepairCost.max).toLocaleString()}`;
      document.getElementById("components-cost").textContent = `$${Math.round(componentsTotal.min).toLocaleString()} - $${Math.round(componentsTotal.max).toLocaleString()}`;
      
      // Update summary details
      const roofTypeText = document.getElementById("roof-type").options[document.getElementById("roof-type").selectedIndex].text;
      const roofPitchText = document.getElementById("roof-pitch").options[document.getElementById("roof-pitch").selectedIndex].text;
      const complexityText = document.getElementById("roof-complexity").options[document.getElementById("roof-complexity").selectedIndex].text;
      const storiesText = document.getElementById("number-stories").options[document.getElementById("number-stories").selectedIndex].text;
      
      document.getElementById("roof-details-summary").textContent = `${roofTypeText}, ${roofSqFt} sq ft, ${roofPitchText} pitch, ${complexityText} complexity, ${storiesText}`;
      
      const materialText = document.getElementById("roofing-material").options[document.getElementById("roofing-material").selectedIndex].text;
      const qualityText = document.getElementById("material-quality").options[document.getElementById("material-quality").selectedIndex].text;
      
      document.getElementById("materials-summary").textContent = `${materialText}, ${qualityText} quality`;
      
      const locationText = document.getElementById("location").options[document.getElementById("location").selectedIndex].text;
      document.getElementById("location-summary").textContent = locationText;
      
      // Update hidden form fields for lead form
      document.getElementById("form-roof-type").value = roofTypeText;
      document.getElementById("form-roof-size").value = roofSqFt;
      document.getElementById("form-material").value = materialText;
      document.getElementById("form-estimate").value = `$${roundedTotalCost.min.toLocaleString()} - $${roundedTotalCost.max.toLocaleString()}`;
    }
  }
  
  function initFAQs() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const icon = question.querySelector('.faq-toggle i');
        
        // Toggle active class
        answer.classList.toggle('active');
        
        // Toggle icon
        if (answer.classList.contains('active')) {
          icon.classList.remove('fa-plus');
          icon.classList.add('fa-minus');
        } else {
          icon.classList.remove('fa-minus');
          icon.classList.add('fa-plus');
        }
      });
    });
  }
  
  function initTooltips() {
    const tooltipIcons = document.querySelectorAll('.tooltip-icon');
    
    tooltipIcons.forEach(icon => {
      const tooltipText = icon.getAttribute('data-tooltip');
      
      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = tooltipText;
      
      // Add tooltip to icon
      icon.appendChild(tooltip);
      
      // Show tooltip on hover
      icon.addEventListener('mouseenter', () => {
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
      });
      
      // Hide tooltip when mouse leaves
      icon.addEventListener('mouseleave', () => {
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '0';
      });
    });
  }
});

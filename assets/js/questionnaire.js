document.addEventListener("DOMContentLoaded", () => {
  // Questionnaire variables
  let currentStep = 1;
  const totalSteps = 4;
  let userSelections = {
    roofType: "",
    material: "",
    size: 0,
    complexity: "",
    stories: "",
  };

  // Material base prices per square foot (2025 PA market rates - updated for accuracy)
  const materialBasePrices = {
    "asphalt": { min: 3.75, max: 5.75 },
    "architectural": { min: 4.75, max: 7.75 },
    "metal": { min: 9.5, max: 15.75 },
    "slate": { min: 16.0, max: 32.0 },
    "wood": { min: 8.5, max: 14.5 },
    "tile": { min: 12.5, max: 26.0 },
  };

  // Quality multipliers
  const qualityMultipliers = {
    economy: { min: 0.85, max: 0.9 },
    standard: { min: 1.0, max: 1.0 },
    premium: { min: 1.15, max: 1.25 },
  };

  // Complexity multipliers
  const complexityMultipliers = {
    simple: { min: 0.9, max: 0.95 },
    moderate: { min: 1.0, max: 1.0 },
    complex: { min: 1.2, max: 1.3 },
  };

  // Story multipliers
  const storyMultipliers = {
    "1": { min: 1.0, max: 1.0 },
    "2": { min: 1.1, max: 1.2 },
    "3": { min: 1.25, max: 1.4 },
  };

  // Roof type multipliers (for estimating roof square footage from home square footage)
  const roofTypeMultipliers = {
    "Gabled": 1.3,
    "Hip": 1.4,
    "Flat/low slope": 1.1,
    "Mansard": 1.7,
    "Gambrel": 1.6,
  };

  // Regional price adjustments (simplified for questionnaire)
  const regionMultipliers = {
    "Philadelphia": { min: 1.1, max: 1.15 },
    "Pittsburgh": { min: 1.05, max: 1.1 },
    "Central PA": { min: 1.0, max: 1.0 },
    "Northeast PA": { min: 0.95, max: 1.0 },
    "Northwest PA": { min: 0.9, max: 0.95 },
  };

  // Initialize questionnaire
  initQuestionnaire();
  initFAQs();

  function initQuestionnaire() {
    // Option card selection for roof type
    const roofTypeCards = document.querySelectorAll(".roof-type-card input[type='radio']");
    roofTypeCards.forEach((input) => {
      input.addEventListener("change", function() {
        if (this.checked) {
          userSelections.roofType = this.value;
        }
      });
    });

    // Material selection
    const materialInputs = document.querySelectorAll("input[name='new_material']");
    materialInputs.forEach((input) => {
      input.addEventListener("change", function() {
        if (this.checked) {
          // Map the selected material to our pricing categories
          const materialValue = this.value.toLowerCase();
          if (materialValue.includes("asphalt")) {
            userSelections.material = "asphalt";
          } else if (materialValue.includes("architectural")) {
            userSelections.material = "architectural";
          } else if (materialValue.includes("metal")) {
            userSelections.material = "metal";
          } else if (materialValue.includes("slate")) {
            userSelections.material = "slate";
          } else if (materialValue.includes("wood")) {
            userSelections.material = "wood";
          } else if (materialValue.includes("tile")) {
            userSelections.material = "tile";
          } else {
            userSelections.material = "architectural"; // Default to architectural if not matched
          }
        }
      });
    });

    // Next step buttons
    const nextButtons = document.querySelectorAll('.next-step');
    nextButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (validateStep(currentStep)) {
          goToStep(currentStep + 1);
        }
      });
    });
    
    // Previous step buttons
    const prevButtons = document.querySelectorAll('.prev-step');
    prevButtons.forEach(button => {
      button.addEventListener('click', () => {
        goToStep(currentStep - 1);
      });
    });
    
    // Show/hide "Other" input fields
    document.getElementById('reason-other').addEventListener('change', function() {
      document.querySelector('.other-reason-container').style.display = this.checked ? 'block' : 'none';
    });
    
    document.getElementById('current-other').addEventListener('change', function() {
      document.querySelector('.other-current-material-container').style.display = this.checked ? 'block' : 'none';
    });
    
    document.getElementById('new-other').addEventListener('change', function() {
      document.querySelector('.other-new-material-container').style.display = this.checked ? 'block' : 'none';
    });
    
    document.getElementById('issue-other').addEventListener('change', function() {
      document.querySelector('.other-issue-container').style.display = this.checked ? 'block' : 'none';
    });
    
    document.getElementById('feature-other').addEventListener('change', function() {
      document.querySelector('.other-feature-container').style.display = this.checked ? 'block' : 'none';
    });
    
    // Handle referral source "Other" option
    const referralSelect = document.querySelector('select[name="referral_source"]');
    if (referralSelect) {
      referralSelect.addEventListener('change', function() {
        const otherContainer = document.querySelector('.other-referral-container');
        if (otherContainer) {
          otherContainer.style.display = this.value === 'Other' ? 'block' : 'none';
        }
      });
    }
    
    // Validate current step
    function validateStep(step) {
      let isValid = true;
      const currentStepElement = document.getElementById(`step-${step}`);
      
      if (step === 2) {
        // Validate roof type selection
        if (!userSelections.roofType) {
          alert("Please select a roof structure type to continue.");
          isValid = false;
        }
      } else if (step === 3) {
        // Capture roof size and complexity from step 2
        const selectedMaterial = document.querySelector('input[name="new_material"]:checked');
        if (!selectedMaterial) {
          alert("Please select a roofing material to continue.");
          isValid = false;
        } else {
          // Material is already captured in the change event
        }
      }
      
      // Check required fields in current step
      const requiredFields = currentStepElement.querySelectorAll('[required]');
      requiredFields.forEach(field => {
        if (field.type === 'radio') {
          // For radio buttons, check if any in the group is checked
          const name = field.name;
          const checked = currentStepElement.querySelector(`input[name="${name}"]:checked`);
          if (!checked) {
            isValid = false;
            // Find the label for this radio group
            const label = currentStepElement.querySelector(`label[for="${field.id}"]`).closest('.form-group').querySelector('label');
            alert(`Please select an option for: ${label.textContent}`);
            return;
          }
        } else if (!field.value.trim()) {
          isValid = false;
          field.classList.add('invalid');
          alert(`Please fill in the field: ${field.previousElementSibling.textContent}`);
          return;
        } else {
          field.classList.remove('invalid');
        }
      });
      
      // Check ranking selections for duplicates in step 4
      if (step === 4) {
        // Capture home square footage and complexity for calculation
        const homeSqFt = document.getElementById('address').value; // Using address as a proxy for home size
        const complexity = "moderate"; // Default to moderate complexity
        const stories = "2"; // Default to 2 stories
        
        userSelections.size = 1800; // Default size if not specified
        userSelections.complexity = complexity;
        userSelections.stories = stories;
        
        // Calculate estimate before form submission
        calculateEstimate();
        
        const rankSelects = currentStepElement.querySelectorAll('select[name^="rank_"]');
        const selectedRanks = [];
        
        rankSelects.forEach(select => {
          if (select.value) {
            selectedRanks.push(select.value);
          }
        });
        
        // Check for duplicates
        const uniqueRanks = [...new Set(selectedRanks)];
        if (selectedRanks.length !== uniqueRanks.length) {
          isValid = false;
          alert('Please assign a unique rank (1-5) to each factor. No duplicate rankings allowed.');
        }
      }
      
      return isValid;
    }
    
    // Go to step
    function goToStep(step) {
      // Validate step boundaries
      if (step < 1 || step > totalSteps) return;
      
      // Hide all steps
      document.querySelectorAll('.questionnaire-step').forEach(s => {
        s.style.display = 'none';
      });
      
      // Show requested step
      document.getElementById(`step-${step}`).style.display = 'block';
      
      // Update current step
      currentStep = step;
      
      // Update progress bar
      updateProgress(step);
      
      // Scroll to top of questionnaire
      document.querySelector('.questionnaire-container').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update progress
    function updateProgress(step) {
      // Update progress fill
      const progressFill = document.getElementById('progress-fill');
      if (progressFill) {
        progressFill.style.width = `${(step / totalSteps) * 100}%`;
      }
      
      // Update step indicators
      const progressSteps = document.querySelectorAll('.progress-step');
      progressSteps.forEach(stepEl => {
        const stepNum = parseInt(stepEl.getAttribute('data-step'));
        if (stepNum < step) {
          stepEl.classList.add('completed');
          stepEl.classList.remove('active');
        } else if (stepNum === step) {
          stepEl.classList.add('active');
          stepEl.classList.remove('completed');
        } else {
          stepEl.classList.remove('active', 'completed');
        }
      });
    }
    
    // Form submission
    const form = document.getElementById('roof-questionnaire-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        // Final validation before submission
        if (!validateStep(currentStep)) {
          e.preventDefault();
          return false;
        }
        
        // Calculate estimate one more time to ensure it's up to date
        calculateEstimate();
        
        // Add hidden field with estimate
        const estimateField = document.createElement('input');
        estimateField.type = 'hidden';
        estimateField.name = 'estimated_price_range';
        estimateField.value = document.getElementById('estimated-price-range').value || 'Not calculated';
        form.appendChild(estimateField);
        
        // FormSubmit will handle the rest
        return true;
      });
    }
  }

  function calculateEstimate() {
    // Use the same calculation logic as the advanced calculator
    
    // Default values if not specified
    if (!userSelections.size) userSelections.size = 1800;
    if (!userSelections.complexity) userSelections.complexity = "moderate";
    if (!userSelections.stories) userSelections.stories = "2";
    if (!userSelections.material) userSelections.material = "architectural";
    
    // Calculate roof square footage based on roof type
    const roofMultiplier = roofTypeMultipliers[userSelections.roofType] || 1.4; // Default to hip roof multiplier
    const roofSqFt = userSelections.size * roofMultiplier;
    
    // Get base material cost
    const baseMaterialCost = materialBasePrices[userSelections.material] || materialBasePrices.architectural;
    
    // Apply complexity multiplier
    const complexityMultiplier = complexityMultipliers[userSelections.complexity] || complexityMultipliers.moderate;
    
    // Apply story multiplier
    const storyMultiplier = storyMultipliers[userSelections.stories] || storyMultipliers["2"];
    
    // Apply regional multiplier (default to Central PA)
    const regionMultiplier = regionMultipliers["Central PA"];
    
    // Calculate material cost per square foot with all multipliers
    const materialCostPerSqFt = {
      min: baseMaterialCost.min * complexityMultiplier.min * regionMultiplier.min,
      max: baseMaterialCost.max * complexityMultiplier.max * regionMultiplier.max,
    };
    
    // Calculate labor cost
    const laborCostPerSqFt = {
      min: materialCostPerSqFt.min * 0.6 * storyMultiplier.min,
      max: materialCostPerSqFt.max * 0.6 * storyMultiplier.max,
    };
    
    // Calculate total costs
    const materialsCost = {
      min: materialCostPerSqFt.min * roofSqFt,
      max: materialCostPerSqFt.max * roofSqFt,
    };
    
    const laborCost = {
      min: laborCostPerSqFt.min * roofSqFt,
      max: laborCostPerSqFt.max * roofSqFt,
    };
    
    // Add removal and other costs (simplified)
    const otherCosts = {
      min: roofSqFt * 1.5, // Simplified estimate for removal and additional components
      max: roofSqFt * 2.5,
    };
    
    // Calculate total project cost
    const totalCost = {
      min: materialsCost.min + laborCost.min + otherCosts.min,
      max: materialsCost.max + laborCost.max + otherCosts.max,
    };
    
    // Round costs to nearest hundred
    const roundedTotalCost = {
      min: Math.round(totalCost.min / 100) * 100,
      max: Math.round(totalCost.max / 100) * 100,
    };
    
    // Store the estimate in a hidden field for form submission
    let estimatedPriceField = document.getElementById('estimated-price-range');
    if (!estimatedPriceField) {
      estimatedPriceField = document.createElement('input');
      estimatedPriceField.type = 'hidden';
      estimatedPriceField.id = 'estimated-price-range';
      document.getElementById('roof-questionnaire-form').appendChild(estimatedPriceField);
    }
    
    estimatedPriceField.value = `$${roundedTotalCost.min.toLocaleString()} - $${roundedTotalCost.max.toLocaleString()}`;
    
    console.log("Questionnaire estimate calculated:", estimatedPriceField.value);
    
    return roundedTotalCost;
  }

  function initFAQs() {
    const faqQuestions = document.querySelectorAll(".faq-question");

    faqQuestions.forEach((question) => {
      question.addEventListener("click", () => {
        const answer = question.nextElementSibling;
        const icon = question.querySelector(".faq-toggle i");

        // Toggle active class
        answer.classList.toggle("active");

        // Toggle icon
        if (answer.classList.contains("active")) {
          icon.classList.remove("fa-plus");
          icon.classList.add("fa-minus");
        } else {
          icon.classList.remove("fa-minus");
          icon.classList.add("fa-plus");
        }
      });
    });
  }
});

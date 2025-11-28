// src/sections/SetupWizard/SetupWizard.js

// Module-scoped variables (private)
let projectSettings;
let estimateItems;
let stateSalesTax;
let onCompletionCallback;
let onBackToEntryCallback;
let renderMessageBoxCallback;
let closeMessageBoxCallback;

// UI Element references (Updated and New)
let setupWizardContainer;
let wizardSteps = [];
let stepItems = [];
let progressBar;
let logoUploadInput, logoUploadArea, wizardLogoPreview, placeholderContent, clearLogoBtn;
let projectNameInput, clientNameInput, projectTypeSelect, projectStateSelect;
let tradeSearchInput, tradesDropdown, selectedTradesDisplay;
let showAdvancedDetailsLink, advancedDetailsSection;
let dynamicLaborRateInputs, advancedLink, advancedSkillLevelControls, newSkillTitleInput, newSkillRateInput;
let profitMarginInput, salesTaxInput, miscellaneousInput, overheadInput, materialMarkupInput;
let additionalConsiderationsValueInput, toggleAdditionalConsiderationsBtn;
// NEW STEP 3 (Smart Scope) UI REFERENCES
let documentUploadInput, documentUploadArea, analyzeDocumentsBtn, uploadStatusText;
let uploadedFilesContainer; 
let scopeOutputPanel, scopeNarrativeTextarea, scopeInclusionsTextarea, scopeExclusionsTextarea;
let taskLineItemsContainer;
let overwriteConfirmBtn, cancelOverwriteBtn, overwriteConfirmationModal;
let optionalCitationsToggle, optionalFollowupToggle; 
let processingProgressContainer, progressMessage;
let guidanceCard, guidanceTitle, guidanceText;
let prevStepBtn, nextStepBtn, startEstimatingBtn, backToEntryBtn;


// State for wizard navigation
let currentStep = 1;
let isAdvancedModeActive = false;
let isScopeGenerated = false; 
let isProcessing = false; 

// NEW STATE FOR STEP 3 DATA
let generatedScopeTasks = []; 
let uploadedFiles = []; 

const guidanceContent = {
    default: {
        title: "Smart Suggestions",
        text: "As you fill out the form, we'll provide helpful tips and information right here."
    },
    projectName: {
        title: "Project Name",
        text: "Use a descriptive name that you and your client will easily recognize, like 'Kitchen Remodel - Smith Residence'."
    },
    projectType: {
        title: "Project Type",
        text: "This choice can affect material suggestions and labor assumptions later. 'Commercial' often involves different compliance standards than 'Residential'."
    },
    clientName: {
        title: "Client Name/Company",
        text: "Enter the full name of your client or their company. This will be used on all official documents and quotes."
    },
    projectState: {
        title: "State/Location",
        text: "Selecting the project's state automatically sets the baseline sales tax for materials. You can adjust this later."
    },
    tradesInvolved: {
        title: "Trades Involved",
        text: "Select all trades that will perform work on this project. This determines which labor rate categories will be available."
    },
    logoUpload: {
        title: "Company Logo",
        text: "A professional logo builds trust. For best results, use a PNG file with a transparent background."
    },
    advancedDetails: {
        title: "Advanced Details",
        text: "These optional fields add more context to your project and will be included in detailed PDF exports."
    },
    // Guidance for STEP 4 Financials
    overhead: {
        title: "Overhead %",
        text: "Overhead covers your fixed business costs (rent, utilities, salaries). This percentage is applied to the total direct cost of the project."
    },
    materialMarkup: {
        title: "Material Markup %",
        text: "This is the percentage you add to the raw cost of materials to cover handling, storage, and profit on materials."
    },
    contingency: {
        title: "Contingency / Misc. %",
        text: "A buffer amount added to cover unexpected costs or unforeseen problems during the project. 5-10% is a common range."
    },
    profitMargin: {
        title: "Profit Margin %",
        text: "This is the percentage of profit you want to make on the total cost of the project (including overhead and other markups)."
    },
    salesTax: {
        title: "Sales Tax %",
        text: "This was auto-filled based on your state selection. It is typically applied only to materials and material markup."
    },
    additionalConsiderations: {
        title: "Additional Considerations",
        text: "Use this for any final adjustments. It can be a percentage of the subtotal or a fixed dollar amount (click the button to toggle)."
    },
    // NEW GUIDANCE CONTENT FOR STEP 3 (Smart Scope Builder)
    documentUpload: {
        title: "Upload Project Documents",
        text: "Upload PDF or DOCX files (drawings, specifications, RFIs) to analyze. The system will process them as a single batch to generate your scope."
    },
    analyze: {
        title: "Generate Smart Scope",
        text: "Click 'Analyze Documents' to initiate AI processing. This will extract trade requirements, inclusions, and exclusions based on the documents and your selected trades."
    },
    scopeOutput: {
        title: "Review Generated Scope",
        text: "Review the narrative and task line items. Accept the line items you want to include in your estimate, or edit the scope text before finalizing."
    },
    optionalFeatures: {
        title: "Optional Features",
        text: "Toggle these features for deeper document analysis or to include reference notes in the output for better traceability."
    }
};

/**
 * Initializes the SetupWizard module.
 * @param {object} config - Configuration object.
 */
export function init(config) {
    // Store passed-in objects and callbacks
    projectSettings = config.projectSettings;
    estimateItems = config.estimateItems;
    stateSalesTax = config.stateSalesTax;
    onCompletionCallback = config.onCompletion;
    onBackToEntryCallback = config.onBackToEntry;
    renderMessageBoxCallback = config.renderMessageBox;
    closeMessageBoxCallback = config.closeMessageBox;

    // --- GET ALL UI ELEMENTS (as listed above) ---
    setupWizardContainer = document.getElementById('setupWizard');
    wizardSteps = [
        document.getElementById('wizardStep1'),
        document.getElementById('wizardStep2'),
        document.getElementById('wizardStep3'), // NEW STEP 3
        document.getElementById('wizardStep4')  // FORMER STEP 3 IS NOW STEP 4
    ];
    stepItems = [
        document.getElementById('step1Container'),
        document.getElementById('step2Container'),
        document.getElementById('step3Container'), // NEW STEP 3
        document.getElementById('step4Container')  // FORMER STEP 3 IS NOW STEP 4
    ];
    progressBar = document.getElementById('progressBar');
    
    // Step 1
    logoUploadInput = document.getElementById('logoUploadInput');
    logoUploadArea = document.getElementById('logoUploadArea');
    wizardLogoPreview = document.getElementById('wizardLogoPreview');
    placeholderContent = document.getElementById('placeholderContent');
    clearLogoBtn = document.getElementById('clearLogoBtn');
    projectNameInput = document.getElementById('projectName');
    clientNameInput = document.getElementById('clientName');
    projectTypeSelect = document.getElementById('projectType');
    projectStateSelect = document.getElementById('projectState');
    tradeSearchInput = document.getElementById('tradeSearchInput');
    tradesDropdown = document.getElementById('tradesDropdown');
    selectedTradesDisplay = document.getElementById('selectedTradesDisplay');
    showAdvancedDetailsLink = document.getElementById('showAdvancedDetailsLink');
    advancedDetailsSection = document.getElementById('advancedDetailsSection');
    
    // Step 2
    dynamicLaborRateInputs = document.getElementById('dynamicLaborRateInputs');
    advancedLink = document.getElementById('advancedLink');
    advancedSkillLevelControls = document.getElementById('advancedSkillLevelControls');
    newSkillTitleInput = document.getElementById('newSkillTitle');
    newSkillRateInput = document.getElementById('newSkillRate');

    // Step 4
    profitMarginInput = document.getElementById('profitMargin');
    salesTaxInput = document.getElementById('salesTax');
    miscellaneousInput = document.getElementById('miscellaneous');
    overheadInput = document.getElementById('overhead');
    materialMarkupInput = document.getElementById('materialMarkup');
    additionalConsiderationsValueInput = document.getElementById('additionalConsiderationsValue');
    toggleAdditionalConsiderationsBtn = document.getElementById('toggleAdditionalConsiderationsBtn');

    // Step 3 (Smart Scope Builder)
    documentUploadInput = document.getElementById('documentUploadInput');
    documentUploadArea = document.getElementById('documentUploadArea');
    analyzeDocumentsBtn = document.getElementById('analyzeDocumentsBtn');
    uploadStatusText = document.getElementById('uploadStatusText');
    uploadedFilesContainer = document.getElementById('uploadedFilesContainer');
    scopeOutputPanel = document.getElementById('scopeOutputPanel');
    scopeNarrativeTextarea = document.getElementById('scopeNarrative');
    scopeInclusionsTextarea = document.getElementById('scopeInclusions');
    scopeExclusionsTextarea = document.getElementById('scopeExclusions');
    taskLineItemsContainer = document.getElementById('taskLineItemsContainer');
    overwriteConfirmationModal = document.getElementById('overwriteConfirmationModal');
    overwriteConfirmBtn = document.getElementById('overwriteConfirmBtn');
    cancelOverwriteBtn = document.getElementById('cancelOverwriteBtn');
    optionalCitationsToggle = document.getElementById('optionalCitationsToggle');
    optionalFollowupToggle = document.getElementById('optionalFollowupToggle');
    processingProgressContainer = document.getElementById('processingProgressContainer');
    progressMessage = document.getElementById('progressMessage');
    
    // Global UI
    guidanceCard = document.getElementById('guidanceCard');
    guidanceTitle = document.getElementById('guidanceTitle');
    guidanceText = document.getElementById('guidanceText');
    prevStepBtn = document.getElementById('prevStepBtn');
    nextStepBtn = document.getElementById('nextStepBtn');
    startEstimatingBtn = document.getElementById('startEstimatingBtn');
    backToEntryBtn = document.getElementById('backToEntryBtn');


    // Attach all event listeners for the wizard
    attachEventListeners();
}

// --- Logo Handling Functions ---
function handleLogoInputChange(event) {
    const file = event.target.files[0];
    if (file) {
        processLogoFile(file);
    }
}

function handleLogoDrop(event) {
    event.preventDefault();
    logoUploadArea.classList.remove('drag-over');
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processLogoFile(file);
    } else if (file) {
        renderMessageBoxCallback('Please upload a valid image file (PNG, JPG) for the logo.');
    }
}

function processLogoFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        projectSettings.contractorLogo = e.target.result;
        loadSavedLogo();
    };
    reader.readAsDataURL(file);
}

function clearLogo() {
    projectSettings.contractorLogo = '';
    loadSavedLogo();
    // Clear the input element as well
    if (logoUploadInput) logoUploadInput.value = '';
}

// --- Trade Selection Logic ---

function showTradeDropdown() {
    if (!tradesDropdown) return;
    // Set position right under the input field
    const rect = tradeSearchInput.getBoundingClientRect();
    tradesDropdown.style.top = `${rect.bottom + 5}px`;
    tradesDropdown.style.left = `${rect.left}px`;
    tradesDropdown.style.width = `${rect.width}px`;
    tradesDropdown.classList.remove('hidden');
    updateGuidance('tradesInvolved');
}

function hideTradeDropdown() {
    // Delay hiding to allow clicks on dropdown items to register
    setTimeout(() => {
        if (tradesDropdown && !tradesDropdown.contains(document.activeElement)) {
            tradesDropdown.classList.add('hidden');
            updateGuidance('default');
        }
    }, 100);
}

function toggleTradeDropdown(event) {
    // If the click happened on the remove button, do not toggle the dropdown
    if (event.target.classList.contains('remove-tag')) {
        return;
    }
    if (tradesDropdown.classList.contains('hidden')) {
        showTradeDropdown();
    } else {
        hideTradeDropdown();
    }
}

function handleTradeSelection(checkbox) {
    const trade = checkbox.value;
    if (checkbox.checked) {
        if (!projectSettings.activeTrades.includes(trade)) {
            projectSettings.activeTrades.push(trade);
        }
    } else {
        projectSettings.activeTrades = projectSettings.activeTrades.filter(t => t !== trade);
        // Optional: Remove custom skills for this trade if it was removed
        if (projectSettings.allTradeLaborRates[trade]) {
             // Future improvement: reset to default or delete rates if trade is removed
        }
    }
    updateSelectedTradesDisplay();
    // Keep the dropdown visible after interaction
    if (tradesDropdown.classList.contains('hidden')) {
        showTradeDropdown();
    }
}

// --- Labor Rate Logic (Step 2) ---

function populateWizardStep2LaborRates() {
    if (!dynamicLaborRateInputs) return;
    dynamicLaborRateInputs.innerHTML = '';

    projectSettings.activeTrades.forEach(trade => {
        const tradeGroup = document.createElement('div');
        tradeGroup.className = 'trade-labor-rates-group';
        tradeGroup.innerHTML = `<h3>${trade} Labor Rates</h3>`;

        const rates = projectSettings.allTradeLaborRates[trade] || {};
        const roles = Object.keys(rates);

        roles.forEach(role => {
            const isStandard = ["Project Manager", "Superintendent", "General Foreman", "Foreman", "Journeyman", "Apprentice"].includes(role);
            
            const rate = rates[role] || 0;
            const row = document.createElement('div');
            row.className = 'skill-level-row';
            row.dataset.role = role;
            
            row.innerHTML = `
                <div class="skill-name-display">${role}</div>
                <div class="rate-input-group">
                    <span class="rate-label">Rate ($/hr):</span>
                    <input type="number" data-trade="${trade}" data-role="${role}" class="input-field rate-input" value="${rate}" step="1" min="0">
                    ${!isStandard ? `<button class="remove-skill-btn" data-trade="${trade}" data-role="${role}" title="Remove Skill">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>` : ''}
                </div>
            `;
            tradeGroup.appendChild(row);
        });

        dynamicLaborRateInputs.appendChild(tradeGroup);
    });
}

function toggleAdvancedRates() {
    isAdvancedModeActive = !isAdvancedModeActive;
    if (advancedSkillLevelControls) advancedSkillLevelControls.classList.toggle('hidden', !isAdvancedModeActive);
    if (advancedLink) advancedLink.textContent = isAdvancedModeActive ? 'Hide Advanced Skill Options' : 'Show Advanced Skill Options';
}

function addSkillLevelFromAdvanced() {
    const newSkillTitle = newSkillTitleInput.value.trim();
    const newSkillRate = parseFloat(newSkillRateInput.value);

    if (!newSkillTitle) {
        renderMessageBoxCallback("Please enter a title for the new skill level.");
        return;
    }
    if (isNaN(newSkillRate) || newSkillRate < 0) {
        renderMessageBoxCallback("Please enter a valid, non-negative hourly rate.");
        return;
    }

    // Check for duplicates across all trades
    const isDuplicate = projectSettings.activeTrades.some(trade => 
        projectSettings.allTradeLaborRates[trade] && projectSettings.allTradeLaborRates[trade].hasOwnProperty(newSkillTitle)
    );

    if (isDuplicate) {
        renderMessageBoxCallback(`The skill title "${newSkillTitle}" already exists.`);
        return;
    }

    // Add skill to all active trades
    projectSettings.activeTrades.forEach(trade => {
        if (projectSettings.allTradeLaborRates[trade]) {
            projectSettings.allTradeLaborRates[trade][newSkillTitle] = newSkillRate;
        }
    });

    // Reset inputs and re-render Step 2
    newSkillTitleInput.value = '';
    newSkillRateInput.value = '0';
    populateWizardStep2LaborRates();
    renderMessageBoxCallback(`Skill level "${newSkillTitle}" added to all active trades.`);
}

function updateLaborRate(trade, role, value) {
    const rate = parseFloat(value);
    if (!isNaN(rate) && rate >= 0) {
        projectSettings.allTradeLaborRates[trade][role] = rate;
    } else {
        // Prevent saving invalid data, but allow user to keep typing
    }
}

function confirmRemoveSkillLevel(trade, role) {
    renderMessageBoxCallback(`Are you sure you want to remove the skill "${role}" from the "${trade}" trade?`, () => {
        delete projectSettings.allTradeLaborRates[trade][role];
        populateWizardStep2LaborRates();
        if(closeMessageBoxCallback) closeMessageBoxCallback();
    }, true);
}


// --- Project Info Logic (Step 1) ---

function populateWizardInputs() {
    // Basic Info
    // FIX 1: Only pre-fill Project Name and Client Name if the value is explicitly set (e.g., from a loaded project)
    if (projectNameInput) projectNameInput.value = projectSettings.projectName && projectSettings.projectName !== "New Project" ? projectSettings.projectName : '';
    if (clientNameInput) clientNameInput.value = projectSettings.clientName || '';
    
    // Project Type and State always have a default value from initialProjectSettings
    if (projectTypeSelect) projectTypeSelect.value = projectSettings.projectType || 'Commercial';
    if (projectStateSelect) projectStateSelect.value = projectSettings.projectState || 'CA';
    
    // Advanced Details
    const projectAddressInput = document.getElementById('projectAddress');
    if (projectAddressInput) projectAddressInput.value = projectSettings.projectAddress || '';
    const projectCityInput = document.getElementById('projectCity');
    if (projectCityInput) projectCityInput.value = projectSettings.projectCity || '';
    const projectZipInput = document.getElementById('projectZip');
    if (projectZipInput) projectZipInput.value = projectSettings.projectZip || '';
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) startDateInput.value = projectSettings.startDate || '';
    const endDateInput = document.getElementById('endDate');
    if (endDateInput) endDateInput.value = projectSettings.endDate || '';
    const projectIDInput = document.getElementById('projectID');
    if (projectIDInput) projectIDInput.value = projectSettings.projectID || '';
    const projectDescriptionTextarea = document.getElementById('projectDescription');
    if (projectDescriptionTextarea) projectDescriptionTextarea.value = projectSettings.projectDescription || '';

    // Show/Hide Advanced Section based on data presence
    const hasAdvancedData = projectSettings.projectAddress || projectSettings.startDate || projectSettings.projectID;
    if (advancedDetailsSection) advancedDetailsSection.classList.toggle('hidden', !hasAdvancedData);
    if (showAdvancedDetailsLink) showAdvancedDetailsLink.textContent = hasAdvancedData ? 'Hide Advanced Details' : 'Show Advanced Details';
}

function toggleAdvancedDetails(event) {
    event.preventDefault();
    const isHidden = advancedDetailsSection.classList.contains('hidden');
    advancedDetailsSection.classList.toggle('hidden', !isHidden);
    showAdvancedDetailsLink.textContent = isHidden ? 'Hide Advanced Details' : 'Show Advanced Details';
}


// --- Financial Settings Logic (Step 4) ---

function populateWizardStep4Settings() {
    if (profitMarginInput) profitMarginInput.value = projectSettings.profitMargin || 0;
    if (salesTaxInput) salesTaxInput.value = projectSettings.salesTax || 0;
    if (miscellaneousInput) miscellaneousInput.value = projectSettings.miscellaneous || 0;
    if (overheadInput) overheadInput.value = projectSettings.overhead || 0;
    if (materialMarkupInput) materialMarkupInput.value = projectSettings.materialMarkup || 0;
    if (additionalConsiderationsValueInput) additionalConsiderationsValueInput.value = projectSettings.additionalConsiderationsValue || 0;
    
    if (toggleAdditionalConsiderationsBtn) {
        toggleAdditionalConsiderationsBtn.textContent = projectSettings.additionalConsiderationsType === '%' ? '%' : '$';
    }
}

function toggleAdditionalConsiderationsType() {
    const currentType = toggleAdditionalConsiderationsBtn.textContent;
    const newType = currentType === '%' ? '$' : '%';
    toggleAdditionalConsiderationsBtn.textContent = newType;
    projectSettings.additionalConsiderationsType = newType;
}

// --- Smart Scope Builder Logic (Step 3) ---

function populateWizardStep3ScopeBuilder() {
    renderUploadedFiles();
    updateUploadStatus(); // Updates button state and status text
    
    // Check if we have existing scope data (e.g., reconfiguring)
    if (projectSettings.scopeNarrative) {
        isScopeGenerated = true;
        renderMockScopeData(false); // Render existing data
    }
    
    if (scopeOutputPanel) scopeOutputPanel.classList.toggle('hidden', !isScopeGenerated);
    
    if (optionalCitationsToggle) optionalCitationsToggle.checked = projectSettings.includeCitations || false;
    if (optionalFollowupToggle) optionalFollowupToggle.checked = projectSettings.allowFollowup || false;
}

// ✨ FIX: startAnalysis implementation using sequential promise chain
async function startAnalysis() {
    overwriteConfirmationModal.classList.add('hidden');
    isProcessing = true;
    isScopeGenerated = false;
    if (analyzeDocumentsBtn) {
         analyzeDocumentsBtn.textContent = "Processing...";
         analyzeDocumentsBtn.className = "btn btn-blue-solid w-full opacity-70 cursor-wait";
    }

    if (scopeOutputPanel) scopeOutputPanel.classList.add('hidden');
    if (processingProgressContainer) processingProgressContainer.classList.remove('hidden');
    updateGuidance('analyze');
    
    const stages = [
        "Extracting content from documents...",
        "Reviewing trade scope requirements...",
        "Generating draft narrative and items...",
        "Finalizing scope structure..."
    ];
    
    let success = true;

    for (let i = 0; i < stages.length; i++) {
        if (progressMessage) progressMessage.textContent = stages[i];
        
        // Use a Promise-based setTimeout for sequential simulation
        try {
            await new Promise(resolve => setTimeout(resolve, 3000 + (Math.random() * 2000))); // 3-5 seconds delay per stage
        } catch (e) {
            console.error("Analysis interrupted:", e);
            success = false;
            break;
        }
    }
    
    // Simulate overall failure after stages are complete
    if (success) {
        success = Math.random() < 0.9; 
    }
    
    finishAnalysis(success);
}

function finishAnalysis(success) {
    isProcessing = false;
    if (analyzeDocumentsBtn) {
        analyzeDocumentsBtn.disabled = false;
    }
    if (processingProgressContainer) processingProgressContainer.classList.add('hidden');
    
    if (success) {
        // MOCK data generation
        isScopeGenerated = true;
        if (analyzeDocumentsBtn) {
            analyzeDocumentsBtn.textContent = "Rerun Analysis";
            analyzeDocumentsBtn.className = "btn btn-blue-solid w-full";
        }
        if (scopeOutputPanel) scopeOutputPanel.classList.remove('hidden');
        renderMockScopeData();
        updateGuidance('scopeOutput');
    } else {
        // Error Handling
        renderMessageBoxCallback("Something went wrong during analysis. Please check your document format and try again.");
        if (analyzeDocumentsBtn) {
            analyzeDocumentsBtn.textContent = "Analyze Documents & Generate Scope";
            analyzeDocumentsBtn.className = "btn btn-blue-solid w-full";
        }
        isScopeGenerated = false;
    }
}


function renderMockScopeData(generateNewData = true) {
    if (generateNewData) {
        // MOCK: Generate new structured task data
        generatedScopeTasks = [
            { id: 1, description: "Install 100A main service panel per plan 3/A-4.", trade: "Electrical", category: "Labor", accepted: true },
            { id: 2, description: "Rough-in supply and waste lines for 3 fixtures.", trade: "Plumbing", category: "Labor", accepted: true },
            { id: 3, description: "Supply and install 4-ton HVAC unit (Citation: Spec 11.3)", trade: "HVAC", category: "Material", accepted: true },
            { id: 4, description: "Upgrade all existing light fixtures to LED.", trade: "Electrical", category: "Labor", accepted: false },
            { id: 5, description: "Pour 20 yards of structural concrete slab.", trade: "Concrete", category: "Subcontractor", accepted: true },
            { id: 6, description: "Paint all interior surfaces (two coats).", trade: "Painting", category: "Labor", accepted: true }
        ].filter(task => projectSettings.activeTrades.includes(task.trade)); // Filter tasks by active trades

        // MOCK: Fill text areas with initial generated content (or persistent content)
        projectSettings.scopeNarrative = "The scope of work generated from the documents is comprehensive, covering all selected trades and adheres to a neutral professional tone.";
        projectSettings.scopeInclusions = "- All materials and labor required for installation.\n- Standard 1-year warranty on workmanship.";
        projectSettings.scopeExclusions = "- Permitting fees are excluded.\n- Hazardous material abatement is excluded from this scope.";
    }

    if (scopeNarrativeTextarea) scopeNarrativeTextarea.value = projectSettings.scopeNarrative;
    if (scopeInclusionsTextarea) scopeInclusionsTextarea.value = projectSettings.scopeInclusions;
    if (scopeExclusionsTextarea) scopeExclusionsTextarea.value = projectSettings.scopeExclusions;

    // RENDER: Render structured task data
    if (!taskLineItemsContainer) return;
    taskLineItemsContainer.innerHTML = ''; // Clear previous tasks
    
    if (generatedScopeTasks.length === 0) {
         taskLineItemsContainer.innerHTML = `<p class="p-3 text-sm text-gray-500">No tasks remaining for selected trades.</p>`;
         return;
    }

    generatedScopeTasks.forEach(task => {
        const row = document.createElement('div');
        row.className = "line-item-row flex items-center gap-4 p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150";
        
        row.innerHTML = `
            <input type="checkbox" id="task-${task.id}" data-task-id="${task.id}" ${task.accepted ? 'checked' : ''} class="task-checkbox">
            <label for="task-${task.id}" class="flex-grow text-sm cursor-pointer">${task.description} <span class="text-xs text-blue-500">(${task.trade})</span></label>
            <select class="input-field w-32 text-xs" data-task-id="${task.id}">
                <option value="Labor" ${task.category === 'Labor' ? 'selected' : ''}>Labor</option>
                <option value="Material" ${task.category === 'Material' ? 'selected' : ''}>Material</option>
                <option value="Subcontractor" ${task.category === 'Subcontractor' ? 'selected' : ''}>Subcontractor</option>
            </select>
            <button class="btn btn-red-outline btn-sm py-1 px-3">Reject</button>
        `;
        taskLineItemsContainer.appendChild(row);
    });
    
}


// --- Wizard Navigation Logic ---
export function showStep(stepNumber) {
    wizardSteps.forEach((stepDiv, index) => {
        stepDiv.classList.toggle('hidden', index + 1 !== stepNumber);
    });

    stepItems.forEach((stepItem, index) => {
        const stepNum = index + 1;
        stepItem.classList.remove('active', 'completed');

        if (stepNum < stepNumber) {
            stepItem.classList.add('completed');
        } else if (stepNum === stepNumber) {
            stepItem.classList.add('active');
        }
    });

    const totalSteps = wizardSteps.length; // Now 4
    progressBar.style.width = totalSteps > 1 ? `${((stepNumber - 1) / (totalSteps - 1)) * 100}%` : '0%';
    currentStep = stepNumber;

    // Update navigation buttons visibility
    prevStepBtn.classList.toggle('hidden', stepNumber === 1);
    nextStepBtn.classList.toggle('hidden', stepNumber === totalSteps);
    startEstimatingBtn.classList.toggle('hidden', stepNumber !== totalSteps);
    backToEntryBtn.textContent = stepNumber === 1 ? 'Back to Start' : 'Cancel';


    // Populate inputs for the current step
    if (stepNumber === 1) { 
        populateWizardInputs();
        updateSelectedTradesDisplay(); 
        populateTradesDropdown();
    }
    if (stepNumber === 2) populateWizardStep2LaborRates();
    if (stepNumber === 3) populateWizardStep3ScopeBuilder(); 
    if (stepNumber === 4) populateWizardStep4Settings(); 
}

function handleNextStep() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return; 

    if (currentStep < wizardSteps.length) {
        showStep(currentStep + 1);
    }
}

function handlePrevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}


function startEstimating() {
    if (!validateStep4()) return;
    
    // Save final settings from Step 4
    projectSettings.profitMargin = parseFloat(profitMarginInput.value) || 0;
    projectSettings.salesTax = parseFloat(salesTaxInput.value) || 0;
    projectSettings.miscellaneous = parseFloat(miscellaneousInput.value) || 0;
    projectSettings.overhead = parseFloat(overheadInput.value) || 0;
    projectSettings.materialMarkup = parseFloat(materialMarkupInput.value) || 0;
    projectSettings.additionalConsiderationsValue = parseFloat(additionalConsiderationsValueInput.value) || 0;
    projectSettings.additionalConsiderationsType = toggleAdditionalConsiderationsBtn.textContent === '%' ? '%' : '$';
    
    // Save generated scope data from Step 3
    projectSettings.scopeNarrative = scopeNarrativeTextarea.value;
    projectSettings.scopeInclusions = scopeInclusionsTextarea.value;
    projectSettings.scopeExclusions = scopeExclusionsTextarea.value;
    projectSettings.includeCitations = optionalCitationsToggle.checked;
    projectSettings.allowFollowup = optionalFollowupToggle.checked;

    // ** LOGIC TO INSERT SCOPE LINES INTO estimateItems **
    const acceptedScopeTasks = generatedScopeTasks.filter(t => t.accepted);
    projectSettings.acceptedScopeTasks = acceptedScopeTasks;

    // Check if we have accepted tasks from the AI scope
    if (acceptedScopeTasks.length > 0) {
        estimateItems.length = 0; // Clears the array
        
        acceptedScopeTasks.forEach((task, index) => {
            // Create a new labor entry for the default item
            const defaultTrade = task.trade || projectSettings.activeTrades[0] || "General";
            const defaultRole = projectSettings.allTradeLaborRates[defaultTrade] && Object.keys(projectSettings.allTradeLaborRates[defaultTrade]).length > 0 ? Object.keys(projectSettings.allTradeLaborRates[defaultTrade])[0] : "Journeyman";
            
            const newItem = {
                id: Date.now() + index, // Ensure unique ID
                taskName: task.description, // Use task description as initial task name
                description: `Generated from scope analysis (${task.trade})`,
                laborEntries: [],
                materialQuantity: 0,
                materialUnitCost: 0,
                equipmentRentalCost: 0,
                subcontractorCostLineItem: 0,
                miscLineItem: 0,
                isChangeOrder: false
            };

            // Add the initial labor entry based on the task trade/category
            const laborEntry = { 
                id: `lab_${Date.now()}_${index}`, 
                trade: defaultTrade, 
                rateRole: defaultRole, 
                hours: 0, 
                otDtMultiplier: 1.0 
            };

            // Pre-fill fields based on AI-suggested category
            if (task.category === 'Material') {
                newItem.materialQuantity = 1;
                newItem.materialUnitCost = 100; // Mock starting value
            } else if (task.category === 'Subcontractor') {
                newItem.subcontractorCostLineItem = 500; // Mock starting value
            } else { // Default to Labor
                laborEntry.hours = 4; // Mock starting hours
            }
            
            newItem.laborEntries.push(laborEntry);
            estimateItems.push(newItem);
        });
    } else if (estimateItems.length === 0) {
        // If scope was generated but nothing was accepted AND the estimate is empty, create one default item
         const defaultTrade = projectSettings.activeTrades[0] || "General";
         const defaultRole = projectSettings.allTradeLaborRates[defaultTrade] && Object.keys(projectSettings.allTradeLaborRates[defaultTrade]).length > 0 ? Object.keys(projectSettings.allTradeLaborRates[defaultTrade])[0] : "Journeyman";

         estimateItems.push({
            id: Date.now(),
            taskName: 'First Task',
            description: 'Detail your first project task here.',
            laborEntries: [
                { id: `lab_${Date.now()}`, trade: defaultTrade, rateRole: defaultRole, hours: 0, otDtMultiplier: 1.0 }
            ],
            materialQuantity: 0, materialUnitCost: 0, equipmentRentalCost: 0,
            subcontractorCostLineItem: 0, miscLineItem: 0, isChangeOrder: false
         });
    }
    // If there were existing items and no scope was accepted, the existing items are preserved.

    onCompletionCallback(projectSettings);
}

// --- Validation Logic ---
function validateStep1() {
    const fields = [
        { value: projectNameInput.value, name: "Project Name" },
        { value: clientNameInput.value, name: "Client Name/Company" },
        { value: projectTypeSelect.value, name: "Project Type" },
        { value: projectStateSelect.value, name: "State/Location" }
    ];

    for (const field of fields) {
        if (!field.value.trim()) {
            renderMessageBoxCallback(`Please enter a ${field.name}.`);
            return false;
        }
    }
    
    // FIX 2: If the only active trade is "General" (the default initialization value) 
    // AND the user hasn't actively selected more, force selection.
    const isDefaultTradeOnly = projectSettings.activeTrades.length === 1 && projectSettings.activeTrades[0] === "General";
    
    // We assume if the user has touched the trade selection and it's still 'General', they intended it.
    // However, since we are auto-clearing the default project name now, we should make sure the user actively selects a trade.
    
    // For simplicity, we just check if it's more than 0. If they didn't touch it, it should be "General".
    // Let's refine the check on the display side to only show "Click to select trades..." if it's the *default* general trade.
    
    // The safest validation check is if there are NO active trades. Since the project always starts with "General",
    // we only fail validation if they explicitly removed "General" AND didn't select anything else.
    // Since the initial state is always ["General"], we allow it. The visual fix is enough.

    if (projectSettings.activeTrades.length === 0) {
        renderMessageBoxCallback("Please select at least one Trade Involved.");
        return false;
    }

    // Save valid data
    projectSettings.projectName = projectNameInput.value.trim();
    projectSettings.clientName = clientNameInput.value.trim();
    projectSettings.projectType = projectTypeSelect.value;
    projectSettings.projectState = projectStateSelect.value;
    // Save advanced details
    const projectAddressInput = document.getElementById('projectAddress');
    if (projectAddressInput) projectSettings.projectAddress = projectAddressInput.value;
    const projectCityInput = document.getElementById('projectCity');
    if (projectCityInput) projectSettings.projectCity = projectCityInput.value;
    const projectZipInput = document.getElementById('projectZip');
    if (projectZipInput) projectSettings.projectZip = projectZipInput.value;
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) projectSettings.startDate = startDateInput.value;
    const endDateInput = document.getElementById('endDate');
    if (endDateInput) projectSettings.endDate = endDateInput.value;
    const projectIDInput = document.getElementById('projectID');
    if (projectIDInput) projectSettings.projectID = projectIDInput.value;
    const projectDescriptionTextarea = document.getElementById('projectDescription');
    if (projectDescriptionTextarea) projectSettings.projectDescription = projectDescriptionTextarea.value;

    return true;
}

function validateStep2() {
    for (const trade of projectSettings.activeTrades) {
        if (projectSettings.allTradeLaborRates[trade]) {
            for (const role in projectSettings.allTradeLaborRates[trade]) {
                const rate = parseFloat(projectSettings.allTradeLaborRates[trade][role]);
                if (isNaN(rate) || rate < 0) {
                    renderMessageBoxCallback(`Labor rate for "${role}" in "${trade}" is not valid. Please ensure all rates are non-negative numbers.`);
                    return false;
                }
            }
        }
    }
    return true;
}

function validateStep3() {
    // Check if user confirmed to skip analysis (handled by confirmOrStartAnalysis)
    if (!isScopeGenerated) {
        renderMessageBoxCallback("Please analyze documents and review the generated scope before proceeding.");
        return false;
    }
    
    // Save current scope text before moving to the next step
    projectSettings.scopeNarrative = scopeNarrativeTextarea.value;
    projectSettings.scopeInclusions = scopeInclusionsTextarea.value;
    projectSettings.scopeExclusions = scopeExclusionsTextarea.value;
    projectSettings.includeCitations = optionalCitationsToggle.checked;
    projectSettings.allowFollowup = optionalFollowupToggle.checked;
    
    return true;
}

function validateStep4() {
    const fields = [
        { value: profitMarginInput.value, name: "Profit Margin" },
        { value: salesTaxInput.value, name: "Sales Tax" },
        { value: miscellaneousInput.value, name: "Contingency / Misc." },
        { value: overheadInput.value, name: "Overhead" },
        { value: materialMarkupInput.value, name: "Material Markup" },
        { value: additionalConsiderationsValueInput.value, name: "Additional Considerations" }
    ];

    for (const field of fields) {
        const rate = parseFloat(field.value);
        if (isNaN(rate) || rate < 0) {
            renderMessageBoxCallback(`The field "${field.name}" is not valid. Please ensure it is a non-negative number.`);
            return false;
        }
    }
    return true;
}


// --- Event Handling ---
function attachEventListeners() {
    // Logo upload
    logoUploadInput.addEventListener('change', handleLogoInputChange);
    logoUploadArea.addEventListener('dragover', (e) => { e.preventDefault(); logoUploadArea.classList.add('drag-over'); });
    logoUploadArea.addEventListener('dragleave', () => logoUploadArea.classList.remove('drag-over'));
    logoUploadArea.addEventListener('drop', handleLogoDrop);
    logoUploadArea.addEventListener('click', (e) => { if (e.target !== clearLogoBtn && !clearLogoBtn.contains(e.target)) logoUploadInput.click(); });
    clearLogoBtn.addEventListener('click', clearLogo);

    // Step 1
    projectStateSelect.addEventListener('change', (e) => updateSalesTaxForState(e.target.value));
    showAdvancedDetailsLink.addEventListener('click', toggleAdvancedDetails);
    
    // Trades (Now in Step 1)
    tradeSearchInput.addEventListener('input', populateTradesDropdown);
    tradeSearchInput.addEventListener('focus', showTradeDropdown);
    tradeSearchInput.addEventListener('blur', hideTradeDropdown);
    selectedTradesDisplay.addEventListener('click', toggleTradeDropdown);
    tradesDropdown.addEventListener('change', (e) => handleTradeSelection(e.target));
    selectedTradesDisplay.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-tag')) {
            const tradeToRemove = e.target.dataset.trade;
            const correspondingCheckbox = tradesDropdown.querySelector(`input[value="${tradeToRemove}"]`);
            if(correspondingCheckbox) {
                correspondingCheckbox.checked = false;
            }
            handleTradeSelection({ value: tradeToRemove, checked: false });
        }
    });
    
    // Step 2 (Labor Rates)
    advancedLink.addEventListener('click', toggleAdvancedRates);
    document.getElementById('addSkillLevelBtn').addEventListener('click', addSkillLevelFromAdvanced);
    dynamicLaborRateInputs.addEventListener('change', (e) => {
        const target = e.target;
        if (target.classList.contains('rate-input')) {
            updateLaborRate(target.dataset.trade, target.dataset.role, target.value);
        }
    });
    dynamicLaborRateInputs.addEventListener('click', (e) => {
        const button = e.target.closest('.remove-skill-btn');
        if (button) {
            confirmRemoveSkillLevel(button.dataset.trade, button.dataset.role);
        }
    });
    
    // Step 3 (Smart Scope)
    documentUploadInput.addEventListener('change', handleDocumentInputChange);
    documentUploadArea.addEventListener('drop', handleDocumentDrop);
    documentUploadArea.addEventListener('dragover', (e) => { e.preventDefault(); documentUploadArea.classList.add('drag-over'); updateGuidance('documentUpload'); });
    documentUploadArea.addEventListener('dragleave', () => documentUploadArea.classList.remove('drag-over'));
    documentUploadArea.addEventListener('click', (e) => { 
        if (documentUploadInput && !analyzeDocumentsBtn.contains(e.target)) {
             documentUploadInput.click(); 
        }
    });
    analyzeDocumentsBtn.addEventListener('click', confirmOrStartAnalysis);
    
    // Add event delegation for scope item interaction (Step 3)
    if (taskLineItemsContainer) {
        taskLineItemsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('task-checkbox')) {
                const taskId = parseInt(e.target.dataset.taskId);
                const task = generatedScopeTasks.find(t => t.id === taskId);
                if (task) {
                    task.accepted = e.target.checked;
                }
            }
        });
        taskLineItemsContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('input-field') && e.target.closest('.line-item-row')) {
                const row = e.target.closest('.line-item-row');
                const checkbox = row.querySelector('.task-checkbox');
                if (checkbox) {
                    const taskId = parseInt(checkbox.dataset.taskId);
                    const task = generatedScopeTasks.find(t => t.id === taskId);
                    if (task) {
                        task.category = e.target.value;
                    }
                }
            }
        });
        taskLineItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-red-outline')) {
                const row = e.target.closest('.line-item-row');
                const checkbox = row.querySelector('.task-checkbox');
                if (checkbox) {
                    const taskId = parseInt(checkbox.dataset.taskId);
                    confirmRemoveScopeTask(taskId);
                }
            }
        });
    }
    
    // Handle file deletion clicks
    if (uploadedFilesContainer) {
        uploadedFilesContainer.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-file-btn');
            if (deleteBtn) {
                const fileIndex = parseInt(deleteBtn.dataset.index);
                removeUploadedFile(fileIndex);
            }
        });
    }

    // Step 4 (Financials)
    if (toggleAdditionalConsiderationsBtn) toggleAdditionalConsiderationsBtn.addEventListener('click', toggleAdditionalConsiderationsType);

    // Wizard navigation
    if (backToEntryBtn) backToEntryBtn.addEventListener('click', onBackToEntryCallback);
    if (nextStepBtn) nextStepBtn.addEventListener('click', handleNextStep);
    if (prevStepBtn) prevStepBtn.addEventListener('click', handlePrevStep);
    if (startEstimatingBtn) startEstimatingBtn.addEventListener('click', startEstimating);

    // Guidance Panel Listeners
    document.querySelectorAll('[data-guidance-id]').forEach(el => {
        el.addEventListener('focus', () => updateGuidance(el.dataset.guidanceId));
        el.addEventListener('blur', () => updateGuidance('default'));
    });
}

function updateGuidance(id) {
    const content = guidanceContent[id] || guidanceContent.default;
    if (guidanceTitle) guidanceTitle.textContent = content.title;
    if (guidanceText) guidanceText.textContent = content.text;

    if (id === 'projectState') {
        const stateCode = projectStateSelect.value;
        const taxRate = stateSalesTax[stateCode] || 0;
        if (guidanceTitle) guidanceTitle.textContent = `${stateCode} Sales Tax`;
        if (guidanceText) guidanceText.textContent = `The state sales tax for ${stateCode} is ${taxRate.toFixed(2)}%. This has been automatically applied to your project's financials.`;
    }
}


// --- Exported Helper Functions for App.js ---
// These must be kept as they are the public interface for the module

export function loadSavedLogo() {
    const hasLogo = !!projectSettings.contractorLogo;
    if (wizardLogoPreview) wizardLogoPreview.src = projectSettings.contractorLogo || '';
    if (wizardLogoPreview) wizardLogoPreview.classList.toggle('hidden', !hasLogo);
    if (placeholderContent) placeholderContent.classList.toggle('hidden', hasLogo);
    if (clearLogoBtn) clearLogoBtn.classList.toggle('hidden', !hasLogo);
}
export function populateTradesDropdown() {
    if (!tradesDropdown) return;
    tradesDropdown.innerHTML = '';
    const allTrades = Object.keys(projectSettings.allTradeLaborRates);
    const searchTerm = tradeSearchInput.value.toLowerCase();
    const filteredTrades = allTrades.filter(trade => trade.toLowerCase().includes(searchTerm));

    if (filteredTrades.length > 0) {
        filteredTrades.forEach(trade => {
            const isChecked = projectSettings.activeTrades.includes(trade);
            const checkboxId = `trade-${trade.replace(/\s/g, '-')}`;
            tradesDropdown.innerHTML += `
                <label>
                    <input type="checkbox" id="${checkboxId}" value="${trade}" ${isChecked ? 'checked' : ''} onchange="SetupWizard.handleTradeSelection(this)">
                    <span>${trade}</span>
                </label>
            `;
        });
    } else {
        tradesDropdown.innerHTML = `<p class="text-center text-gray-500 p-2">No trades found.</p>`;
    }
}
export function updateSelectedTradesDisplay() {
    if (!selectedTradesDisplay) return;
    selectedTradesDisplay.innerHTML = '';
    
    // FIX 3: Check if the project only contains the default "General" trade.
    const isOnlyDefaultTrade = projectSettings.activeTrades.length === 1 && projectSettings.activeTrades[0] === "General";
    
    if (projectSettings.activeTrades.length === 0 || isOnlyDefaultTrade) {
        selectedTradesDisplay.innerHTML = `<span class="text-gray-400">Click to select trades...</span>`;
        // If we only have "General" selected, display the placeholder but keep the data for validation/logic
        if (isOnlyDefaultTrade) {
             selectedTradesDisplay.innerHTML = `<span class="text-gray-400">Click to select trades...</span>`;
             // We ensure that the initial Project Name and Client Name are cleared on load, 
             // so the user is forced to actively interact with this step.
             
             // If we must show something, show it, but the goal is to prompt action.
             // If the user hasn't touched it (new project), we show the prompt.
        } else if (projectSettings.activeTrades.length === 0) {
            selectedTradesDisplay.innerHTML = `<span class="text-gray-400">Click to select trades...</span>`;
        }

        return;
    }
    
    projectSettings.activeTrades.forEach(trade => {
        selectedTradesDisplay.innerHTML += `
            <span class="selected-trade-tag">
                ${trade} <span class="remove-tag" data-trade="${trade}">&times;</span>
            </span>
        `;
    });
}
export function updateSalesTaxForState(stateCode) {
    const taxRate = stateSalesTax[stateCode] || 0;
    if (salesTaxInput) salesTaxInput.value = taxRate;
    projectSettings.salesTax = taxRate;
    updateGuidance('projectState'); 
}

// Re-export private functions required by inline HTML (like onchange/onclick)
export { handleTradeSelection, handleLogoDrop, clearLogo, handleLogoInputChange };

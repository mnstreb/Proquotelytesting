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
    
    // Save generated scope data from Step 3
    projectSettings.scopeNarrative = scopeNarrativeTextarea.value;
    projectSettings.scopeInclusions = scopeInclusionsTextarea.value;
    projectSettings.scopeExclusions = scopeExclusionsTextarea.value;
    projectSettings.includeCitations = optionalCitationsToggle.checked;
    projectSettings.allowFollowup = optionalFollowupToggle.checked;

    // ** LOGIC TO INSERT SCOPE LINES INTO estimateItems **
    projectSettings.acceptedScopeTasks = generatedScopeTasks.filter(t => t.accepted);
    
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
    if (uploadedFiles.length === 0) {
         renderMessageBoxCallback("Please upload at least one document before running the scope analysis.");
         return false;
    }

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
            // ✨ EDITED: Handle category change separately and more specifically
            if (e.target.classList.contains('task-category-select')) {
                const taskId = parseInt(e.target.dataset.taskId);
                const task = generatedScopeTasks.find(t => t.id === taskId);
                if (task) {
                    task.category = e.target.value;
                }
            }
        });
        taskLineItemsContainer.addEventListener('click', (e) => {
            // ✨ EDITED: Changed class name to task-reject-btn for clarity
            if (e.target.classList.contains('task-reject-btn')) {
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


// --- Logo Management ---
function handleLogoInputChange(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            projectSettings.contractorLogo = e.target.result;
            loadSavedLogo();
        };
        reader.readAsDataURL(file);
    }
}

function handleLogoDrop(event) {
    event.preventDefault();
    logoUploadArea.classList.remove('drag-over');
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            projectSettings.contractorLogo = e.target.result;
            loadSavedLogo();
        };
        reader.readAsDataURL(file);
    }
}

function clearLogo() {
    projectSettings.contractorLogo = '';
    loadSavedLogo();
}


// --- File Management Functions (New and Updated) ---

function updateUploadedFiles(newFiles) {
    // Convert FileList to Array and append to existing files
    uploadedFiles = uploadedFiles.concat(Array.from(newFiles));
    renderUploadedFiles();
    updateUploadStatus();
}

function removeUploadedFile(index) {
    if (index < 0 || index >= uploadedFiles.length) {
        console.error("Invalid file index provided for deletion.");
        return;
    }
    
    renderMessageBoxCallback(`Are you sure you want to remove ${uploadedFiles[index].name}?`, () => {
        uploadedFiles.splice(index, 1);
        renderUploadedFiles();
        updateUploadStatus();
        if(closeMessageBoxCallback) closeMessageBoxCallback();
    }, true);
}

function renderUploadedFiles() {
    if (!uploadedFilesContainer) return;

    if (uploadedFiles.length === 0) {
        uploadedFilesContainer.classList.add('hidden');
        return;
    }

    uploadedFilesContainer.classList.remove('hidden');
    uploadedFilesContainer.innerHTML = uploadedFiles.map((file, index) => `
        <div class="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">${file.name}</span>
            <button type="button" class="delete-file-btn ml-2 text-red-500 hover:text-red-700 transition duration-150" data-index="${index}" title="Remove file">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `).join('');
}

function handleDocumentInputChange(event) {
    const files = event.target.files;
    if (files.length > 0) {
        updateUploadedFiles(files);
        // Clear file input to allow re-uploading the same file
        event.target.value = ''; 
    }
}

function handleDocumentDrop(event) {
    event.preventDefault();
    documentUploadArea.classList.remove('drag-over');
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        updateUploadedFiles(files);
    }
}

function updateUploadStatus() {
    if (uploadedFiles.length > 0) {
        if (uploadStatusText) uploadStatusText.textContent = `${uploadedFiles.length} file(s) selected for analysis.`;
        if (analyzeDocumentsBtn) {
            analyzeDocumentsBtn.disabled = false;
            // Use a higher contrast class for the active button
            analyzeDocumentsBtn.className = "btn btn-blue-solid w-full"; 
            analyzeDocumentsBtn.textContent = "Analyze Documents & Generate Scope";
        }
    } else {
        if (uploadStatusText) uploadStatusText.textContent = `Supported: PDF, DOCX (Max 50MB)`;
        if (analyzeDocumentsBtn) {
            analyzeDocumentsBtn.disabled = true;
            analyzeDocumentsBtn.className = "btn btn-blue-solid w-full opacity-50 cursor-not-allowed"; // Style disabled state
            analyzeDocumentsBtn.textContent = "Analyze Documents & Generate Scope";
        }
        isScopeGenerated = false; // Reset scope if files are removed
        if (scopeOutputPanel) scopeOutputPanel.classList.add('hidden');
    }
}

function confirmOrStartAnalysis() {
    if (isProcessing) return;
    
    // CHECK AGAINST NEW STATE
    if (uploadedFiles.length === 0) {
        renderMessageBoxCallback("Please upload at least one PDF or DOCX file to begin analysis.");
        return;
    }

    if (isScopeGenerated) {
        overwriteConfirmationModal.classList.remove('hidden');
        overwriteConfirmBtn.onclick = startAnalysis;
        cancelOverwriteBtn.onclick = () => overwriteConfirmationModal.classList.add('hidden');
    } else {
        startAnalysis();
    }
}

function startAnalysis() {
    overwriteConfirmationModal.classList.add('hidden');
    isProcessing = true;
    isScopeGenerated = false;
    if (analyzeDocumentsBtn) {
         analyzeDocumentsBtn.textContent = "Processing...";
         analyzeDocumentsBtn.className = "btn btn-blue-solid w-full opacity-70 cursor-wait";
    }

    if (scopeOutputPanel) scopeOutputPanel.classList.add('hidden');
    if (processingProgressContainer) processingProgressContainer.classList.remove('hidden');
    
    // MOCK Processing Stages (target: ~32 seconds)
    const stages = [
        "Extracting content from documents...",
        "Reviewing trade scope requirements...",
        "Generating draft narrative and items...",
        "Finalizing scope structure..."
    ];
    
    let stageIndex = 0;
    const interval = 8000; // 8 seconds per stage (simulating long ops)
    
    if (progressMessage) progressMessage.textContent = stages[stageIndex];
    stageIndex++;

    const processingInterval = setInterval(() => {
        if (stageIndex < stages.length) {
            if (progressMessage) progressMessage.textContent = stages[stageIndex];
            stageIndex++;
        } else {
            clearInterval(processingInterval);
            // Simulate 90% success rate
            const success = Math.random() < 0.9;
            finishAnalysis(success);
        }
    }, interval);

    updateGuidance('analyze');
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
        renderMessageBoxCallback("Something went wrong. Please try again.");
        if (analyzeDocumentsBtn) {
            analyzeDocumentsBtn.textContent = "Analyze Documents & Generate Scope";
            analyzeDocumentsBtn.className = "btn btn-blue-solid w-full";
        }
        isScopeGenerated = false;
    }
}

function confirmRemoveScopeTask(taskId) {
    renderMessageBoxCallback('Are you sure you want to reject this task line item? It will be removed from the list.', () => {
        generatedScopeTasks = generatedScopeTasks.filter(t => t.id !== taskId);
        renderMockScopeData(false); // Re-render without generating new mock data
        if(closeMessageBoxCallback) closeMessageBoxCallback();
    }, true);
}

function renderMockScopeData(generateNewData = true) {
    if (generateNewData) {
        // MOCK: Generate new structured task data
        generatedScopeTasks = [
            { id: 1, description: "Install 100A main service panel per plan 3/A-4.", trade: "Electrical", category: "Labor", accepted: true },
            { id: 2, description: "Rough-in supply and waste lines for 3 fixtures.", trade: "Plumbing", category: "Labor", accepted: true },
            { id: 3, description: "Supply and install 4-ton HVAC unit (Citation: Spec 11.3)", trade: "HVAC", category: "Material", accepted: true },
            { id: 4, description: "Upgrade all existing light fixtures to LED.", trade: "Electrical", category: "Labor", accepted: false }
        ].filter(task => projectSettings.activeTrades.includes(task.trade)); // Filter tasks by active trades

        // MOCK: Fill text areas with initial generated content (or persistent content)
        if (scopeNarrativeTextarea) projectSettings.scopeNarrative = projectSettings.scopeNarrative || "The scope of work generated from the documents is comprehensive, covering all selected trades and adheres to a neutral professional tone.";
        if (scopeInclusionsTextarea) projectSettings.scopeInclusions = projectSettings.scopeInclusions || "- All materials and labor required for installation.\n- Standard 1-year warranty on workmanship.";
        if (scopeExclusionsTextarea) projectSettings.scopeExclusions = projectSettings.scopeExclusions || "- Permitting fees are excluded.\n- Hazardous material abatement is excluded from this scope.";
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
            <select class="input-field w-32 text-xs task-category-select" data-task-id="${task.id}">
                <option value="Labor" ${task.category === 'Labor' ? 'selected' : ''}>Labor</option>
                <option value="Material" ${task.category === 'Material' ? 'selected' : ''}>Material</option>
                <option value="Subcontractor" ${task.category === 'Subcontractor' ? 'selected' : ''}>Subcontractor</option>
            </select>
            <button class="btn btn-secondary-outline btn-sm py-1 px-3 task-reject-btn">Reject</button>
        `;
        taskLineItemsContainer.appendChild(row);
    });
    
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
                    <input type="checkbox" id="${checkboxId}" value="${trade}" ${isChecked ? 'checked' : ''}>
                    <span>${trade}</span>
                </label>
            `;
        });
    } else {
        tradesDropdown.innerHTML = `<p class="text-center text-gray-500 p-2">No trades found.</p>`;
    }
}

function handleTradeSelection(target) {
    const trade = target.value;
    const isChecked = target.checked;

    if (isChecked) {
        if (!projectSettings.activeTrades.includes(trade)) {
            projectSettings.activeTrades.push(trade);
        }
    } else {
        projectSettings.activeTrades = projectSettings.activeTrades.filter(t => t !== trade);
    }
    updateSelectedTradesDisplay();
}

export function updateSelectedTradesDisplay() {
    if (!selectedTradesDisplay) return;
    selectedTradesDisplay.innerHTML = '';
    if (projectSettings.activeTrades.length === 0) {
        selectedTradesDisplay.innerHTML = `<span class="text-gray-400">Click to select trades...</span>`;
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

// ✨ FIXED: Function to correctly position the trades dropdown
function showTradeDropdown() {
    if (!tradesDropdown || !tradeSearchInput) return;
    
    // Calculate position of the dropdown relative to the tradeSearchInput
    const rect = tradeSearchInput.getBoundingClientRect();
    const containerRect = setupWizardContainer.getBoundingClientRect(); // Use wizard container for offset

    // FIXED: Set position and width dynamically to ensure it stays below the input
    tradesDropdown.style.width = `${rect.width}px`;
    tradesDropdown.style.left = `${rect.left - containerRect.left}px`;
    // Position below the input, plus a small gap (relative to the container scroll position)
    tradesDropdown.style.top = `${rect.bottom - containerRect.top + setupWizardContainer.scrollTop + 5}px`;
    
    tradesDropdown.classList.remove('hidden');
}

function hideTradeDropdown() {
    // Delay hiding to allow click events on checkboxes inside the dropdown
    setTimeout(() => {
        if (!tradesDropdown) return;
        
        // Check if the focus is still inside the multi-select container (input or dropdown)
        const activeElement = document.activeElement;
        const isFocusInside = tradesDropdown.contains(activeElement) || tradeSearchInput.contains(activeElement);

        if (!isFocusInside) {
            tradesDropdown.classList.add('hidden');
        }
    }, 150);
}

function toggleTradeDropdown(event) {
    // Only toggle if clicking the display area itself, not a remove tag
    if (event.target.classList.contains('remove-tag')) return;

    if (tradesDropdown.classList.contains('hidden')) {
        showTradeDropdown();
    } else {
        tradesDropdown.classList.add('hidden');
    }
}

export function updateSalesTaxForState(stateCode) {
    const taxRate = stateSalesTax[stateCode] || 0;
    if (salesTaxInput) salesTaxInput.value = taxRate;
    projectSettings.salesTax = taxRate;
    updateGuidance('projectState'); 
}

function toggleAdvancedDetails() {
    isAdvancedModeActive = !isAdvancedModeActive;
    if (advancedDetailsSection) advancedDetailsSection.classList.toggle('hidden', !isAdvancedModeActive);
    if (showAdvancedDetailsLink) showAdvancedDetailsLink.textContent = isAdvancedModeActive ? 'Hide Advanced Details' : 'Show Advanced Details';
    updateGuidance('default');
}

function populateWizardInputs() {
    // Load data from projectSettings into the wizard inputs
    if (projectNameInput) projectNameInput.value = projectSettings.projectName || '';
    if (clientNameInput) clientNameInput.value = projectSettings.clientName || '';
    if (projectTypeSelect) projectTypeSelect.value = projectSettings.projectType || 'Commercial';
    if (projectStateSelect) projectStateSelect.value = projectSettings.projectState || 'CA';
    
    // ✨ FIXED: Ensure advanced details fields are loaded as empty strings for a new project
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
    
    // Initial call to update sales tax
    updateSalesTaxForState(projectSettings.projectState);
}


// --- Wizard Step 2 Logic ---
function populateWizardStep2LaborRates() {
    if (!dynamicLaborRateInputs) return;
    dynamicLaborRateInputs.innerHTML = '';
    
    projectSettings.activeTrades.forEach(trade => {
        const rates = projectSettings.allTradeLaborRates[trade];
        if (rates) {
            dynamicLaborRateInputs.innerHTML += renderTradeRateGroup(trade, rates);
        }
    });

    if (advancedSkillLevelControls) {
        advancedSkillLevelControls.classList.toggle('hidden', !isAdvancedModeActive);
    }
}

function updateLaborRate(trade, role, rate) {
    rate = parseFloat(rate);
    if (!isNaN(rate) && rate >= 0) {
        if (projectSettings.allTradeLaborRates[trade]) {
            projectSettings.allTradeLaborRates[trade][role] = rate;
        }
    } else {
        renderMessageBoxCallback("Please enter a valid, non-negative hourly rate.");
    }
}

function toggleAdvancedRates() {
    isAdvancedModeActive = !isAdvancedModeActive;
    if (advancedSkillLevelControls) advancedSkillLevelControls.classList.toggle('hidden', !isAdvancedModeActive);
    if (advancedLink) advancedLink.textContent = isAdvancedModeActive ? 'Hide Advanced Skill Options' : 'Show Advanced Skill Options';
}

function addSkillLevelFromAdvanced() {
    const title = newSkillTitleInput.value.trim();
    const rate = parseFloat(newSkillRateInput.value);

    if (!title) {
        renderMessageBoxCallback("Please enter a title for the new skill level.");
        return;
    }
    if (isNaN(rate) || rate < 0) {
        renderMessageBoxCallback("Please enter a valid, non-negative hourly rate for the new skill.");
        return;
    }

    // Add skill to all active trades
    projectSettings.activeTrades.forEach(trade => {
        if (projectSettings.allTradeLaborRates[trade]) {
            projectSettings.allTradeLaborRates[trade][title] = rate;
        }
    });

    // Clear inputs and re-render step 2
    newSkillTitleInput.value = '';
    newSkillRateInput.value = '0';
    populateWizardStep2LaborRates();
    renderMessageBoxCallback(`Skill level "${title}" added to all active trades with a rate of $${rate.toFixed(2)}/hr.`);
}

function confirmRemoveSkillLevel(trade, role) {
    renderMessageBoxCallback(`Are you sure you want to remove the skill "${role}" from the "${trade}" trade?`, () => {
        removeSkillLevel(trade, role);
        if(closeMessageBoxCallback) closeMessageBoxCallback();
    }, true);
}

function removeSkillLevel(trade, role) {
    if (projectSettings.allTradeLaborRates[trade] && projectSettings.allTradeLaborRates[trade].hasOwnProperty(role)) {
        delete projectSettings.allTradeLaborRates[trade][role];
        populateWizardStep2LaborRates();
    }
}

function renderTradeRateGroup(trade, rates) {
    const skillLevels = Object.keys(rates);
    
    let rows = '';
    skillLevels.forEach(role => {
        const rate = rates[role];
        // Allow removing custom skills, but prevent removing core/default roles
        const isRemovable = !["Project Manager", "Superintendent", "General Foreman", "Foreman", "Journeyman", "Apprentice"].includes(role);
        
        rows += `
            <div class="skill-level-row">
                <span class="skill-name-display">${role}</span>
                <div class="rate-input-group">
                    <span class="rate-label">$/hr:</span>
                    <input type="number" value="${rate}" data-trade="${trade}" data-role="${role}" class="input-field rate-input" step="0.01">
                    ${isRemovable ? `<button type="button" class="remove-skill-btn" data-trade="${trade}" data-role="${role}" title="Remove Skill Level"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>` : ''}
                </div>
            </div>
        `;
    });

    return `
        <div class="trade-labor-rates-group">
            <h3>${trade}</h3>
            <div>${rows}</div>
        </div>
    `;
}

// --- Wizard Step 3 Logic ---
function populateWizardStep3ScopeBuilder() {
    updateUploadStatus();
    renderUploadedFiles();
    renderMockScopeData(false); // Render existing mock data if generated
}


// --- Wizard Step 4 Logic ---

function populateWizardStep4Settings() {
    if (profitMarginInput) profitMarginInput.value = projectSettings.profitMargin;
    if (salesTaxInput) salesTaxInput.value = projectSettings.salesTax;
    if (miscellaneousInput) miscellaneousInput.value = projectSettings.miscellaneous;
    if (overheadInput) overheadInput.value = projectSettings.overhead;
    if (materialMarkupInput) materialMarkupInput.value = projectSettings.materialMarkup;
    
    if (additionalConsiderationsValueInput) additionalConsiderationsValueInput.value = projectSettings.additionalConsiderationsValue;
    if (toggleAdditionalConsiderationsBtn) {
        toggleAdditionalConsiderationsBtn.textContent = projectSettings.additionalConsiderationsType === '%' ? '%' : '$';
    }
}

function toggleAdditionalConsiderationsType() {
    if (projectSettings.additionalConsiderationsType === '%') {
        projectSettings.additionalConsiderationsType = '$';
        toggleAdditionalConsiderationsBtn.textContent = '$';
    } else {
        projectSettings.additionalConsiderationsType = '%';
        toggleAdditionalConsiderationsBtn.textContent = '%';
    }
    renderMessageBoxCallback(`Additional Considerations type changed to ${projectSettings.additionalConsiderationsType}.`);
}

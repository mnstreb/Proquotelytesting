// src/app.js

// ✨ IMPORTS: All our specialists are now in the directory!
import * as AppHeader from './components/AppHeader/AppHeader.js';
import * as CompanyProfile from './components/CompanyProfile/CompanyProfile.js';
import * as SummaryOverview from './sections/SummaryOverview/SummaryOverview.js';
import * as SetupWizard from './sections/SetupWizard/SetupWizard.js';
import * as SavedProjects from './sections/SavedProjects/SavedProjects.js';
import QuickQuoteSummary from './sections/QuickQuoteSummary/QuickQuoteSummary.js';
import { exportClientQuoteToPdf, exportDetailedReportToPdf, exportEstimateToCsv } from './services/exportService.js';

// Global state for authentication
let isAuthenticated = false;

// Define permanent logo path
const PERMANENT_DEFAULT_LOGO = "Assets/Proquotelyasset-25.png";

// --- Auth functions for testing ---
function showLoginModal() {
    isAuthenticated = true;
    AppHeader.setAuthState(isAuthenticated);
    renderMessageBox('You are now logged in for testing purposes.');
}

function handleLogout() {
    isAuthenticated = false;
    AppHeader.setAuthState(isAuthenticated);
    renderMessageBox('You have been logged out.');
}


// --- Core Application Functions ---

async function loadAppHeader() {
    try {
        const htmlResponse = await fetch('src/components/AppHeader/AppHeader.html');
        if (!htmlResponse.ok) throw new Error(`HTTP error! status: ${htmlResponse.status} for AppHeader.html`);
        const html = await htmlResponse.text();
        document.getElementById('appHeaderPlaceholder').innerHTML = html;

        AppHeader.init({
            loginMenuItemId: 'loginMenuItem',
            logoutMenuItemId: 'logoutMenuItem',
            mainAppLogoId: 'mainAppLogo',
            reconfigureBtnId: 'reconfigureBtn',
            saveProjectBtnId: 'saveProjectBtn',
            exportDropdownBtnId: 'exportDropdownBtn',
            exportDropdownMenuId: 'exportDropdownMenu',
            userProfileBtnId: 'userProfileBtn',
            userProfileDropdownMenuId: 'userProfileDropdownMenu',
            profileDropdownThemeToggleId: 'profileDropdownThemeToggle',
            savedProjectsMenuItemId: 'savedProjectsMenuItem',
            companyProfileMenuItemId: 'companyProfileMenuItem',
            exportPdfReportBtnId: 'exportPdfReportBtn',
            exportCsvBtnId: 'exportCsvBtn',
            exportPdfQuoteBtnId: 'exportPdfQuoteBtn',
            emailClientBtnId: 'emailClientBtn',
            onLoginClick: showLoginModal,
            onLogoutClick: handleLogout,
            onThemeToggle: toggleTheme,
            onReconfigure: reconfigureApp,
            onSaveProject: handleSaveProject,
            onGoHomeClick: showEntryPoint, // ✨ ADDED: New callback for the header
            onExportPdfReport: () => {
                if (!isAuthenticated) { showLoginModal(); return; }
                calculateTotals();
                exportDetailedReportToPdf(projectSettings, estimateItems, formatCurrency, formatHours, renderMessageBox);
            },
            onExportCsv: () => {
                if (!isAuthenticated) { showLoginModal(); return; }
                calculateTotals();
                exportEstimateToCsv(projectSettings, estimateItems, renderMessageBox);
            },
            onExportPdfQuote: () => {
                if (!isAuthenticated) { showLoginModal(); return; }
                calculateTotals();
                exportClientQuoteToPdf(projectSettings, estimateItems, currentAppMode, formatCurrency, renderMessageBox);
            },
            onEmailClient: sendEstimateEmailToClient,
            onUserProfileClick: showSavedProjects,
            onCompanyProfileClick: showCompanyProfile
        });

        AppHeader.setAuthState(isAuthenticated);
        AppHeader.updateThemeToggleSlider(isDarkTheme);

    } catch (error) {
        console.error("Error loading AppHeader component:", error);
    }
}

async function loadCompanyProfile() {
    try {
        const htmlResponse = await fetch('src/components/CompanyProfile/CompanyProfile.html');
        if (!htmlResponse.ok) throw new Error(`HTTP error! status: ${htmlResponse.status} for CompanyProfile.html`);
        const html = await htmlResponse.text();
        document.getElementById('companyProfilePlaceholder').innerHTML = html;

        CompanyProfile.init({
            onSave: handleCompanyProfileSave
        });

    } catch (error) {
        console.error("Error loading CompanyProfile component:", error);
    }
}

async function loadSummaryOverview() {
    try {
        const htmlResponse = await fetch('src/sections/SummaryOverview/SummaryOverview.html');
        if (!htmlResponse.ok) throw new Error(`HTTP error! status: ${htmlResponse.status} for SummaryOverview.html`);
        const html = await htmlResponse.text();
        document.getElementById('summaryOverviewPlaceholder').innerHTML = html;

        SummaryOverview.init({
            projectSettings: projectSettings,
            estimateItems: estimateItems,
            formatCurrency: formatCurrency,
            formatHours: formatHours,
            isDarkTheme: isDarkTheme
        });

    } catch (error) {
        console.error("Error loading SummaryOverview component:", error);
    }
}

async function loadQuickQuoteSummary() {
    try {
        const htmlResponse = await fetch('src/sections/QuickQuoteSummary/QuickQuoteSummary.html');
        if (!htmlResponse.ok) throw new Error(`HTTP error! status: ${htmlResponse.status} for QuickQuoteSummary.html`);
        const html = await htmlResponse.text();
        document.getElementById('quickQuoteSummaryPlaceholder').innerHTML = html;

        if (QuickQuoteSummary) {
            QuickQuoteSummary.init({
                projectSettings: projectSettings,
                formatCurrency: formatCurrency,
                formatHours: formatHours,
                isDarkTheme: isDarkTheme
            });
        } else {
            console.error('QuickQuoteSummary module not available after loading. Check import path.');
        }

    } catch (error) {
        console.error("Error loading QuickQuoteSummary component:", error);
    }
}


async function loadSetupWizard() {
    try {
        const htmlResponse = await fetch('src/sections/SetupWizard/SetupWizard.html');
        if (!htmlResponse.ok) throw new Error(`HTTP error! status: ${htmlResponse.status} for SetupWizard.html`);
        const html = await htmlResponse.text();
        const placeholder = document.getElementById('setupWizardPlaceholder');
        placeholder.innerHTML = html;
        placeholder.classList.remove('hidden');

        SetupWizard.init({
            projectSettings: projectSettings,
            estimateItems: estimateItems,
            stateSalesTax: stateSalesTax,
            onCompletion: handleWizardCompletion,
            onBackToEntry: showEntryPoint,
            renderMessageBox: renderMessageBox,
            closeMessageBox: closeMessageBox,
            mode: currentAppMode
        });
        
        SetupWizard.showStep(1);
        SetupWizard.populateTradesDropdown();
        SetupWizard.updateSelectedTradesDisplay();
        SetupWizard.updateSalesTaxForState(projectSettings.projectState);
        SetupWizard.loadSavedLogo();

    } catch (error) {
        console.error("Error loading SetupWizard component:", error);
    }
}

async function loadSavedProjects() {
    try {
        const htmlResponse = await fetch('src/sections/SavedProjects/SavedProjects.html');
        if (!htmlResponse.ok) throw new Error(`HTTP error! status: ${htmlResponse.status} for SavedProjects.html`);
        const html = await htmlResponse.text();
        document.getElementById('savedProjectsPlaceholder').innerHTML = html;
        
        SavedProjects.init({
            onGoToCalculator: showMainApp,
            onLoadProject: handleProjectLoad, 
            formatCurrency: formatCurrency,
            isDarkTheme: isDarkTheme,
            renderMessageBox: renderMessageBox,
            closeMessageBox: closeMessageBox
        });
        document.getElementById('savedProjectsPlaceholder').classList.remove('hidden');

    } catch (error) {
        console.error("Error loading SavedProjects component:", error);
    }
}

function handleProjectLoad(loadedData) {
    if (!loadedData || !loadedData.settings || !loadedData.items) {
        renderMessageBox('Failed to load project: data is incomplete.');
        return;
    }

    projectSettings = JSON.parse(JSON.stringify(loadedData.settings));
    estimateItems = JSON.parse(JSON.stringify(loadedData.items));

    showMainApp(); 
}


function showCompanyProfile() {
    if (!isAuthenticated) { showLoginModal(); return; }
    
    const companyData = {
        ownerName: projectSettings.ownerName,
        ownerAddress: projectSettings.ownerAddress,
        ownerCity: projectSettings.ownerCity,
        ownerZip: projectSettings.ownerZip,
        ownerEmail: projectSettings.ownerEmail
    };
    CompanyProfile.show(companyData);
}

function handleCompanyProfileSave(companyData) {
    projectSettings.ownerName = companyData.ownerName;
    projectSettings.ownerAddress = companyData.ownerAddress;
    projectSettings.ownerCity = companyData.ownerCity;
    projectSettings.ownerZip = companyData.ownerZip;
    projectSettings.ownerEmail = companyData.ownerEmail;
    renderMessageBox('Company information has been updated.');
}


// Helper function for currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Helper function for hours formatting (2 decimal places)
function formatHours(hours) {
    return parseFloat(hours).toFixed(2);
}

const initialProjectSettings = JSON.parse(JSON.stringify({
    projectName: "New Project",
    clientName: "",
    projectAddress: "",
    projectCity: "",
    ownerName: "",
    ownerAddress: "",
    ownerCity: "",
    ownerZip: "",
    ownerEmail: "",
    projectZip: "",
    startDate: "",
    endDate: "",
    projectID: "",
    projectDescription: "",
    contractorLogo: "",
    projectType: "Commercial",
    projectState: "CA",
    profitMargin: 15,
    salesTax: 0,
    miscellaneous: 5,
    overhead: 10,
    materialMarkup: 10,
    discount: 0,
    additionalConsiderationsType: '%',
    additionalConsiderationsValue: 0,
    allTradeLaborRates: {
        "General": { "Project Manager": 120, "Superintendent": 100, "General Foreman": 90, "Foreman": 85, "Journeyman": 75, "Apprentice": 50 },
        "Electrical": { "Project Manager": 135, "Superintendent": 110, "General Foreman": 100, "Foreman": 95, "Journeyman": 80, "Apprentice": 55 },
        "Plumbing": { "Project Manager": 125, "Superintendent": 105, "General Foreman": 95, "Foreman": 90, "Journeyman": 78, "Apprentice": 52 },
        "HVAC": { "Project Manager": 130, "Superintendent": 108, "General Foreman": 98, "Foreman": 92, "Journeyman": 77, "Apprentice": 53 },
        "Carpentry": { "Project Manager": 115, "Superintendent": 95, "General Foreman": 85, "Foreman": 80, "Journeyman": 70, "Apprentice": 48 },
        "Concrete": { "Project Manager": 110, "Superintendent": 90, "General Foreman": 80, "Foreman": 75, "Journeyman": 68, "Apprentice": 45 },
        "Roofing": { "Project Manager": 120, "Superintendent": 98, "General Foreman": 88, "Foreman": 83, "Journeyman": 73, "Apprentice": 47 },
        "Painting": { "Project Manager": 105, "Superintendent": 88, "General Foreman": 78, "Foreman": 73, "Journeyman": 65, "Apprentice": 42 },
        "Drywall": { "Project Manager": 112, "Superintendent": 92, "General Foreman": 82, "Foreman": 77, "Journeyman": 69, "Apprentice": 44 },
        "Masonry": { "Project Manager": 128, "Superintendent": 102, "General Foreman": 93, "Foreman": 88, "Journeyman": 76, "Apprentice": 51 },
        "Landscaping": { "Project Manager": 100, "Superintendent": 85, "General Foreman": 75, "Foreman": 70, "Journeyman": 60, "Apprentice": 40 }
    },
    activeTrades: ["General"],
}));

const initialEstimateItems = JSON.parse(JSON.stringify([
    {
        id: Date.now(), taskName: 'First Task', description: 'Detail your first project task here.',
        trade: 'General', rateRole: 'Journeyman', hours: 0, otDtMultiplier: 1.0,
        materialQuantity: 0, materialUnitCost: 0, equipmentRentalCost: 0,
        subcontractorCostLineItem: 0, miscLineItem: 0
    }
]));

let projectSettings = JSON.parse(JSON.stringify(initialProjectSettings));
let estimateItems = JSON.parse(JSON.stringify(initialEstimateItems));

let currentAppMode = 'entry'; 

const entryPointContainer = document.getElementById('entryPointContainer');
const mainApp = document.getElementById('mainApp');
const quickQuoteApp = document.getElementById('quickQuoteApp');
const appHeaderContainer = document.getElementById('appHeaderContainer');
const estimateItemsContainer = document.getElementById('estimateItemsContainer');
const saveProjectModal = document.getElementById('saveProjectModal');
const saveProjectNameInput = document.getElementById('saveProjectName');
const saveCustomerNameInput = document.getElementById('saveCustomerName');
const saveLocationInput = document.getElementById('saveLocation');
const saveProjectCostInput = document.getElementById('saveProjectCost');
const cancelSaveProjectBtn = document.getElementById('cancelSaveProjectBtn');
const confirmSaveProjectBtn = document.getElementById('confirmSaveProjectBtn');

let defaultTradeSelectorElem;
let currentlySelectedTradeForLineItems = "General";

let aiChatButton;
let aiChatModal;
let aiChatCloseBtn;
let aiChatHistory;
let aiChatInput;
let aiChatSendBtn;
let chatHistory = [];
let lastUserMessage = "";

let isDarkTheme = false;

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        AppHeader.updateThemeToggleSlider(isDarkTheme);
    } else {
        document.body.classList.remove('dark-theme');
        AppHeader.updateThemeToggleSlider(isDarkTheme);
    }
    if (currentAppMode === 'detailed') {
        SummaryOverview.updateSummaries(projectSettings, estimateItems, isDarkTheme);
    } else if (currentAppMode === 'quickQuote' && QuickQuoteSummary && typeof QuickQuoteSummary.calculateTotals === 'function') {
        QuickQuoteSummary.calculateTotals();
    }
    if (SavedProjects) {
        SavedProjects.updateCustomerTotalsChart(SavedProjects.getSavedProjectsData(), isDarkTheme);
    }
}

function handleWizardCompletion(updatedSettings) {
    projectSettings = { ...updatedSettings };

    if (currentAppMode === 'detailed' && !projectSettings.contractorLogo) {
        projectSettings.contractorLogo = PERMANENT_DEFAULT_LOGO;
    }

    const setupWizardPlaceholder = document.getElementById('setupWizardPlaceholder');
    setupWizardPlaceholder.classList.add('hidden');
    setupWizardPlaceholder.innerHTML = '';

    entryPointContainer.classList.add('hidden');
    mainApp.classList.add('hidden');
    quickQuoteApp.classList.add('hidden');

    let nextScreen;
    if (projectSettings.projectType === "Quick Quote") {
        nextScreen = quickQuoteApp;
        loadQuickQuoteSummary();
    } else {
        nextScreen = mainApp;
        loadSummaryOverview();
    }

    appHeaderContainer.classList.remove('hidden');
    nextScreen.classList.remove('hidden');

    document.getElementById('savedProjectsPlaceholder').classList.add('hidden');

    AppHeader.updateProjectInfo(projectSettings.projectType, projectSettings.projectName, projectSettings.clientName, projectSettings.projectState);
    AppHeader.updateLogo(projectSettings.contractorLogo);

    populateDefaultTradeSelector();

    if (estimateItems.length > 0) {
        const firstItem = estimateItems[0];
        const defaultTrade = projectSettings.activeTrades.length > 0 ? projectSettings.activeTrades[0] : "General";
        firstItem.trade = defaultTrade;
        const availableRoles = Object.keys(projectSettings.allTradeLaborRates[firstItem.trade] || {});
        firstItem.rateRole = availableRoles.length > 0 ? availableRoles[0] : "Journeyman";
    }

    renderItems();

    if (currentAppMode === 'detailed') {
        SummaryOverview.updateSummaries(projectSettings, estimateItems, isDarkTheme);
    }
}

function showEntryPoint() {
    currentAppMode = 'entry';

    appHeaderContainer.classList.add('hidden');
    mainApp.classList.add('hidden');
    quickQuoteApp.classList.add('hidden');
    document.getElementById('setupWizardPlaceholder').classList.add('hidden');
    document.getElementById('savedProjectsPlaceholder').classList.add('hidden');

    entryPointContainer.classList.remove('hidden');

    AppHeader.updateProjectInfo('Project Type', 'Project Name', 'Client Name', 'Location');
    AppHeader.updateLogo('');
}

function reconfigureApp() {
    showEntryPoint();
}

function showSetupWizard() {
    loadSetupWizard();
}

function showMainApp() {
    currentAppMode = 'detailed';

    document.getElementById('savedProjectsPlaceholder').classList.add('hidden');
    appHeaderContainer.classList.remove('hidden');
    mainApp.classList.remove('hidden');
    quickQuoteApp.classList.add('hidden');

    AppHeader.updateProjectInfo(projectSettings.projectType, projectSettings.projectName, projectSettings.clientName, projectSettings.projectState);
    AppHeader.updateLogo(projectSettings.contractorLogo);
    
    renderItems();
    calculateTotals();
    populateDefaultTradeSelector();
}

function handleSaveProject() {
    if (!isAuthenticated) { showLoginModal(); return; }

    if (currentAppMode === 'detailed') {
        calculateTotals();
    } else if (currentAppMode === 'quickQuote') {
        if (QuickQuoteSummary && typeof QuickQuoteSummary.calculateTotals === 'function') {
            QuickQuoteSummary.calculateTotals();
        }
    }

    saveProjectNameInput.value = projectSettings.projectName || '';
    saveCustomerNameInput.value = projectSettings.clientName || '';
    saveLocationInput.value = projectSettings.projectState || '';
    saveProjectCostInput.value = formatCurrency(projectSettings.grandTotal || 0);
    saveProjectModal.classList.add('show');
}

function closeSaveProjectModal() {
    saveProjectModal.classList.remove('show');
}

function confirmSaveProject() {
    const projectName = saveProjectNameInput.value.trim();
    const customerName = saveCustomerNameInput.value.trim();
    const projectState = saveLocationInput.value.trim();

    if (!projectName || !customerName || !projectState) {
        renderMessageBox('Project Name, Customer Name, and Location (State) are required.');
        return;
    }

    projectSettings.projectName = projectName;
    projectSettings.clientName = customerName;
    projectSettings.projectState = projectState;

    AppHeader.updateProjectInfo(projectSettings.projectType, projectSettings.projectName, projectSettings.clientName, projectSettings.projectState);

    const totalProposalRaw = projectSettings.grandTotal || 0;

    const newSavedProject = {
        id: `proj_${Date.now()}`,
        projectName: projectName,
        customerName: customerName,
        projectType: projectSettings.projectType,
        projectState: projectState,
        totalProposal: totalProposalRaw,
        lastSavedDate: new Date().toISOString().split('T')[0],
        status: 'Draft',
        projectDetails: JSON.stringify({
            settings: { ...projectSettings },
            items: currentAppMode === 'detailed' ? [...estimateItems] : (QuickQuoteSummary ? QuickQuoteSummary.getQuickQuoteItems() : [])
        })
    };

    const saveStatus = SavedProjects.addProject(newSavedProject);
    
    closeSaveProjectModal();

    if (saveStatus === 'updated') {
        renderMessageBox(`Project "${projectName}" has been updated successfully!`);
    } else {
        renderMessageBox(`Project "${projectName}" saved successfully!`);
    }
}

function showSavedProjects() {
    if (!isAuthenticated) { showLoginModal(); return; }

    mainApp.classList.add('hidden');
    quickQuoteApp.classList.add('hidden');
    document.getElementById('setupWizardPlaceholder').classList.add('hidden');
    appHeaderContainer.classList.remove('hidden');
    const savedProjectsPlaceholder = document.getElementById('savedProjectsPlaceholder');
    if (savedProjectsPlaceholder.innerHTML === '') {
        loadSavedProjects();
    } else {
        savedProjectsPlaceholder.classList.remove('hidden');
        if (SavedProjects) {
            SavedProjects.renderProjects(SavedProjects.getSavedProjectsData());
            SavedProjects.updateCustomerTotalsChart(SavedProjects.getSavedProjectsData(), isDarkTheme);
        }
    }
    if(typeof closeMessageBox === 'function') closeMessageBox();
}

const stateSalesTax = {
    'CA': 8.25, 'TX': 6.25, 'NY': 4.0, 'FL': 6.0, 'WA': 6.5, 'IL': 6.25,
    'AL': 4.0, 'AK': 0.0, 'AZ': 5.6, 'AR': 6.5, 'CO': 2.9, 'CT': 6.35, 'DE': 0.0,
    'GA': 4.0, 'HI': 4.0, 'ID': 6.0, 'IN': 7.0, 'IA': 6.0, 'KS': 6.5, 'KY': 6.0,
    'LA': 4.45, 'ME': 5.5, 'MD': 6.0, 'MA': 6.25, 'MI': 6.0, 'MN': 6.875, 'MS': 7.0,
    'MO': 4.225, 'MT': 0.0, 'NE': 5.5, 'NV': 6.85, 'NH': 0.0, 'NJ': 6.625, 'NM': 5.125,
    'NC': 4.75, 'ND': 5.0, 'OH': 5.75, 'OK': 4.5, 'OR': 0.0, 'PA': 6.0, 'RI': 7.0,
    'SC': 6.0, 'SD': 4.5, 'TN': 7.0, 'UT': 4.85, 'VT': 6.0, 'VA': 5.3, 'WV': 6.0,
    'WI': 5.0, 'WY': 4.0
};

function addItem() {
    const defaultTradeForNewItem = currentlySelectedTradeForLineItems;
    const defaultRoleForNewItem = projectSettings.allTradeLaborRates[defaultTradeForNewItem] && Object.keys(projectSettings.allTradeLaborRates[defaultTradeForNewItem]).length > 0 ? Object.keys(projectSettings.allTradeLaborRates[defaultTradeForNewItem])[0] : "Journeyman";

    const newItem = {
        id: Date.now(), taskName: 'New Task', description: 'Add a description for your new task.',
        trade: defaultTradeForNewItem, rateRole: defaultRoleForNewItem, hours: 0,
        otDtMultiplier: 1.0,
        materialQuantity: 0, materialUnitCost: 0, equipmentRentalCost: 0,
        subcontractorCostLineItem: 0, miscLineItem: 0
    };
    estimateItems.push(newItem);
    renderItems();
}

function deleteItem(id) {
    estimateItems = estimateItems.filter(item => item.id !== id);
    renderItems();
}

function duplicateItem(id) {
    const itemToDuplicateIndex = estimateItems.findIndex(item => item.id === id);

    if (itemToDuplicateIndex !== -1) {
        const originalItem = estimateItems[itemToDuplicateIndex];
        const duplicatedItem = JSON.parse(JSON.stringify(originalItem));
        duplicatedItem.id = Date.now();
        estimateItems.splice(itemToDuplicateIndex + 1, 0, duplicatedItem);
        renderItems();

        setTimeout(() => {
            const newItemElement = document.querySelector(`.line-item-row[data-id="${duplicatedItem.id}"]`);
            if (newItemElement) {
                newItemElement.style.transition = 'background-color 0.5s ease-in-out';
                newItemElement.style.backgroundColor = 'rgba(144, 238, 144, 0.3)';
                setTimeout(() => {
                    newItemElement.style.backgroundColor = '';
                    newItemElement.style.transition = '';
                }, 1000);
            }
        }, 50);
    }
}

function updateItem(id, field, value) {
    const item = estimateItems.find(item => item.id === id);
    if (item) {
        if (['hours', 'materialQuantity', 'materialUnitCost', 'equipmentRentalCost', 'subcontractorCostLineItem', 'miscLineItem', 'otDtMultiplier'].includes(field)) {
            item[field] = parseFloat(value) || 0;
        } else if (field === 'trade') {
            item.trade = value;
            const availableRoles = Object.keys(projectSettings.allTradeLaborRates[item.trade] || {});
            item.rateRole = availableRoles.length > 0 ? availableRoles[0] : "Journeyman";
        } else {
            item[field] = value;
        }
        renderItems();
    }
}

function renderItems() {
    if(!estimateItemsContainer) return;
    
    // Store which items are currently expanded
    const expandedIds = new Set();
    document.querySelectorAll('.line-item-row.expanded').forEach(row => {
        expandedIds.add(parseInt(row.dataset.id));
    });

    estimateItemsContainer.innerHTML = '';
    
    const activeTrades = projectSettings.activeTrades;

    estimateItems.forEach(item => {
        // Data validation and sanitization
        if (!activeTrades.includes(item.trade)) {
            item.trade = activeTrades.length > 0 ? activeTrades[0] : "General";
        }
        if (!projectSettings.allTradeLaborRates[item.trade] || !projectSettings.allTradeLaborRates[item.trade][item.rateRole]) {
            const availableRoles = Object.keys(projectSettings.allTradeLaborRates[item.trade] || {});
            item.rateRole = availableRoles.length > 0 ? availableRoles[0] : "Journeyman";
        }

        // Calculations
        const laborRate = projectSettings.allTradeLaborRates[item.trade]?.[item.rateRole] || 0;
        const effectiveLaborRate = laborRate * (item.otDtMultiplier || 1.0);
        const laborTotal = item.hours * effectiveLaborRate;
        const materialsTotal = item.materialQuantity * item.materialUnitCost;
        const otherCategoryTotal = item.equipmentRentalCost + item.subcontractorCostLineItem + item.miscLineItem;
        const lineTotal = laborTotal + materialsTotal + otherCategoryTotal;

        const isExpanded = expandedIds.has(item.id);

        const itemRow = document.createElement('div');
        itemRow.className = `line-item-row ${isExpanded ? 'expanded' : ''}`;
        itemRow.dataset.id = item.id;

        itemRow.innerHTML = `
            <div class="line-item-header">
                <div class="task-name">${item.taskName}</div>
                <div class="description">${item.description}</div>
                <div class="line-total">${formatCurrency(lineTotal)}</div>
                <div class="actions">
                    <button class="btn btn-orange btn-sm" data-action="duplicate" title="Duplicate Item">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                    <button class="btn btn-red btn-sm" data-action="delete" title="Delete Item">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-circle"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    </button>
                    <svg class="expand-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
            </div>
            <div class="line-item-details ${isExpanded ? 'expanded' : ''}">
                <div class="details-grid">
                    <div class="details-section">
                        <h4>Task Details</h4>
                        <div class="form-group">
                            <label class="label">Task Name</label>
                            <input type="text" value="${item.taskName}" data-field="taskName" class="input-field">
                        </div>
                        <div class="form-group">
                            <label class="label">Description</label>
                            <textarea rows="3" data-field="description" class="input-field">${item.description}</textarea>
                        </div>
                    </div>
                    <div class="details-section">
                        <h4>Labor</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label class="label">Trade</label>
                                <select data-field="trade" class="input-field">
                                    ${activeTrades.map(tradeOption => `<option value="${tradeOption}" ${item.trade === tradeOption ? 'selected' : ''}>${tradeOption}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="label">Skill</label>
                                <select data-field="rateRole" class="input-field">
                                     ${(projectSettings.allTradeLaborRates[item.trade] ? Object.keys(projectSettings.allTradeLaborRates[item.trade]) : []).map(role => `<option value="${role}" ${item.rateRole === role ? 'selected' : ''}>${role}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="label">Hours</label>
                                <input type="number" value="${item.hours}" data-field="hours" class="input-field">
                            </div>
                             <div class="form-group">
                                <label class="label">OT/DT Multiplier</label>
                                <select data-field="otDtMultiplier" class="input-field">
                                    <option value="1.0" ${item.otDtMultiplier === 1.0 ? 'selected' : ''}>1.0x</option>
                                    <option value="1.5" ${item.otDtMultiplier === 1.5 ? 'selected' : ''}>1.5x</option>
                                    <option value="2.0" ${item.otDtMultiplier === 2.0 ? 'selected' : ''}>2.0x</option>
                                </select>
                            </div>
                        </div>
                    </div>
                     <div class="details-section">
                        <h4>Materials</h4>
                         <div class="grid grid-cols-2 gap-4">
                            <div class="form-group">
                                <label class="label">Quantity</label>
                                <input type="number" value="${item.materialQuantity}" data-field="materialQuantity" class="input-field">
                            </div>
                            <div class="form-group">
                                <label class="label">Cost per Unit ($)</label>
                                <input type="number" value="${item.materialUnitCost}" data-field="materialUnitCost" class="input-field">
                            </div>
                        </div>
                    </div>
                    <div class="details-section">
                        <h4>Other Costs ($)</h4>
                         <div class="grid grid-cols-2 gap-4">
                           <div class="form-group">
                                <label class="label">Equipment/Rental</label>
                                <input type="number" value="${item.equipmentRentalCost}" data-field="equipmentRentalCost" class="input-field">
                            </div>
                            <div class="form-group">
                                <label class="label">Subcontractor</label>
                                <input type="number" value="${item.subcontractorCostLineItem}" data-field="subcontractorCostLineItem" class="input-field">
                            </div>
                             <div class="form-group col-span-2">
                                <label class="label">Misc.</label>
                                <input type="number" value="${item.miscLineItem}" data-field="miscLineItem" class="input-field">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        estimateItemsContainer.appendChild(itemRow);
    });
    calculateTotals();
}

function calculateTotals() {
    let totalLaborCost = 0, totalMaterialCostRaw = 0, totalEquipmentCost = 0, totalSubcontractorCost = 0, totalMiscLineItemCosts = 0;
    let laborHoursBreakdown = {};
    const allPossibleRoles = new Set();
    Object.keys(projectSettings.allTradeLaborRates).forEach(trade => {
        if (projectSettings.allTradeLaborRates[trade]) {
            Object.keys(projectSettings.allTradeLaborRates[trade]).forEach(role => allPossibleRoles.add(role));
        }
    });
    allPossibleRoles.forEach(role => { laborHoursBreakdown[role] = 0; });

    if (currentAppMode === 'detailed') {
        estimateItems.forEach(item => {
            const laborRate = projectSettings.allTradeLaborRates[item.trade]?.[item.rateRole] || 0;
            const effectiveLaborRate = laborRate * (item.otDtMultiplier || 1.0);
            const laborTotal = item.hours * effectiveLaborRate;
            const materialsTotal = item.materialQuantity * item.materialUnitCost;
            totalLaborCost += laborTotal;
            totalMaterialCostRaw += materialsTotal;
            totalEquipmentCost += item.equipmentRentalCost;
            totalSubcontractorCost += item.subcontractorCostLineItem;
            totalMiscLineItemCosts += item.miscLineItem;
            if (laborHoursBreakdown[item.rateRole] !== undefined) {
                laborHoursBreakdown[item.rateRole] += item.hours;
            }
        });
    } else if (currentAppMode === 'quickQuote') {
        if (QuickQuoteSummary && typeof QuickQuoteSummary.getQuickQuoteItems === 'function') {
            const quickQuoteItems = QuickQuoteSummary.getQuickQuoteItems();
            quickQuoteItems.forEach(item => {
                if (item.type === 'labor') {
                    totalLaborCost += item.totalAmount;
                    if (laborHoursBreakdown["Journeyman"] !== undefined) {
                        laborHoursBreakdown["Journeyman"] += item.totalAmount / (projectSettings.allTradeLaborRates?.General?.Journeyman || 75);
                    }
                } else if (item.type === 'material') {
                    totalMaterialCostRaw += item.totalAmount;
                } else if (item.type === 'equipment') {
                    totalEquipmentCost += item.totalAmount;
                } else {
                    totalMiscLineItemCosts += item.totalAmount;
                }
            });
            if (QuickQuoteSummary && typeof QuickQuoteSummary.getQuickQuoteSettings === 'function') {
                const qqSettings = QuickQuoteSummary.getQuickQuoteSettings();
                projectSettings.overhead = qqSettings.overhead;
                projectSettings.materialMarkup = qqSettings.materialMarkup;
                projectSettings.profitMargin = qqSettings.profitMargin;
                projectSettings.miscellaneous = qqSettings.miscellaneous;
            }
        }
    }


    const totalProjectCostDirect = totalLaborCost + totalMaterialCostRaw + totalEquipmentCost + totalSubcontractorCost + totalMiscLineItemCosts;
    projectSettings.totalProjectCostDirect = totalProjectCostDirect;

    const materialMarkupPercent = parseFloat(projectSettings.materialMarkup) || 0;
    const overheadPercent = parseFloat(projectSettings.overhead) || 0;
    const miscellaneousPercent = parseFloat(projectSettings.miscellaneous) || 0;
    const profitMarginPercent = parseFloat(projectSettings.profitMargin) || 0;
    const salesTaxPercent = parseFloat(projectSettings.salesTax) || 0;
    const discountPercent = parseFloat(projectSettings.discount) || 0;
    const additionalConsiderationsValue = parseFloat(projectSettings.additionalConsiderationsValue) || 0;
    const materialMarkupAmount = totalMaterialCostRaw * (materialMarkupPercent / 100);
    const baseCostForOverheadMiscProfit = totalProjectCostDirect + materialMarkupAmount;
    const totalOverheadCost = baseCostForOverheadMiscProfit * (overheadPercent / 100);
    const totalMiscCostAmount = baseCostForOverheadMiscProfit * (miscellaneousPercent / 100);
    const subtotalBeforeProfitTax = baseCostForOverheadMiscProfit + totalMiscCostAmount + totalOverheadCost;
    const totalProfitMarginAmount = subtotalBeforeProfitTax * (profitMarginPercent / 100);
    const estimateSubtotalAmount = subtotalBeforeProfitTax + totalProfitMarginAmount;
    const salesTaxApplicableBase = totalMaterialCostRaw + materialMarkupAmount;
    const salesTaxAmount = salesTaxApplicableBase * (salesTaxPercent / 100);
    let additionalConsiderationAmount = 0;
    if (projectSettings.additionalConsiderationsType === '%') {
        additionalConsiderationAmount = estimateSubtotalAmount * (additionalConsiderationsValue / 100);
    } else {
        additionalConsiderationAmount = additionalConsiderationsValue;
    }
    const subtotalBeforeDiscount = estimateSubtotalAmount + salesTaxAmount + additionalConsiderationAmount;
    const discountAmount = subtotalBeforeDiscount * (discountPercent / 100);
    const grandTotal = subtotalBeforeDiscount - discountAmount;

    projectSettings.grandTotal = grandTotal;
    projectSettings.discountAmount = discountAmount;
    projectSettings.salesTaxAmount = salesTaxAmount;
    projectSettings.totalOverheadCost = totalOverheadCost;
    projectSettings.materialMarkupAmount = materialMarkupAmount;
    projectSettings.totalMiscCostAmount = totalMiscCostAmount;
    projectSettings.estimateSubtotalAmount = estimateSubtotalAmount;
    projectSettings.totalProfitMarginAmount = totalProfitMarginAmount;
    projectSettings.additionalConsiderationAmount = additionalConsiderationAmount;


    const overallLaborHoursSum = Object.values(laborHoursBreakdown).reduce((sum, hours) => sum + hours, 0);
    projectSettings.overallLaborHoursSum = overallLaborHoursSum;

    if (currentAppMode === 'detailed') {
        SummaryOverview.updateSummaries(projectSettings, estimateItems, isDarkTheme);
    }
}

function sendEstimateEmailToClient() {
    if (!isAuthenticated) { showLoginModal(); return; }
    calculateTotals();
    const recipientEmail = "";
    const projectName = projectSettings.projectName || 'Your Project';
    const clientName = projectSettings.clientName || 'Client';
    const projectState = projectSettings.projectState || 'N/A';
    let emailBodyContent;

    if (currentAppMode === 'detailed') {
        emailBodyContent = `This email contains a summary of the estimate for your project: "${projectName}".\n\n` +
            `Project Type: ${projectSettings.projectType}\n` +
            `Location: ${projectState}\n` +
            `Total Proposal: ${formatCurrency(projectSettings.grandTotal)}\n\n` +
            `A detailed quote will be provided in a separate attachment or document.`;
    } else {
        emailBodyContent = `This email contains a quick quote estimate for your project: "${projectName}".\n\n` +
            `Location: ${projectState}\n` +
            `Total Quick Quote Estimate: ${formatCurrency(projectSettings.grandTotal)}\n\n` +
            `This is a high-level estimate. For a detailed breakdown, please contact us.`;
    }

    const subject = encodeURIComponent(`Estimate for Your Project: ${projectName}`);
    const body = encodeURIComponent(
        `Dear ${clientName},\n\n` +
        `${emailBodyContent}\n\n` +
        `Please let us know if you have any questions.\n\n` +
        `Regards,\n${projectSettings.ownerName || 'Your Company'}`
    );
    const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    window.open(mailtoLink, '_blank');
    renderMessageBox('Your email client should open with a pre-filled estimate. Please remember to add a recipient and send it!');
}

function populateDefaultTradeSelector() {
    defaultTradeSelectorElem = document.getElementById('defaultTradeSelector');
    if (!defaultTradeSelectorElem) return;
    defaultTradeSelectorElem.innerHTML = '';
    if (projectSettings.activeTrades.length === 0) {
        defaultTradeSelectorElem.innerHTML = '<option value="">No Trades Selected</option>';
        defaultTradeSelectorElem.disabled = true;
        currentlySelectedTradeForLineItems = "";
    } else {
        projectSettings.activeTrades.forEach(trade => {
            const option = document.createElement('option');
            option.value = trade;
            option.textContent = trade;
            defaultTradeSelectorElem.appendChild(option);
        });
        if (projectSettings.activeTrades.includes(currentlySelectedTradeForLineItems)) {
            defaultTradeSelectorElem.value = currentlySelectedTradeForLineItems;
        } else {
            defaultTradeSelectorElem.value = projectSettings.activeTrades[0];
            currentlySelectedTradeForLineItems = projectSettings.activeTrades[0];
        }
    }
}

function setupAIChatListeners() {
    aiChatButton = document.getElementById('aiChatButton');
    aiChatModal = document.getElementById('aiChatModal');
    aiChatCloseBtn = document.getElementById('aiChatCloseBtn');
    aiChatHistory = document.getElementById('aiChatHistory');
    aiChatInput = document.getElementById('aiChatInput');
    aiChatSendBtn = document.getElementById('aiChatSendBtn');

    if(!aiChatButton) return;

    aiChatButton.addEventListener('click', () => {
        aiChatModal.classList.toggle('show');
    });

    aiChatCloseBtn.addEventListener('click', () => {
        aiChatModal.classList.remove('show');
    });

    aiChatSendBtn.addEventListener('click', () => handleAIChatSend(false));
    aiChatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleAIChatSend(false);
        }
    });
}

function addMessageToChat(message, sender, isError = false) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;

    if (isError) {
        bubble.innerHTML = message;
    } else {
        bubble.textContent = message;
    }

    aiChatHistory.appendChild(bubble);
    aiChatHistory.scrollTop = aiChatHistory.scrollHeight;
}

function retryLastAIChatRequest() {
    const errorBubbles = aiChatHistory.querySelectorAll('.ai');
    errorBubbles[errorBubbles.length - 1].remove();
    handleAIChatSend(true);
}

async function handleAIChatSend(isRetry = false) {
    let userMessage;
    if (isRetry) {
        userMessage = lastUserMessage;
    } else {
        userMessage = aiChatInput.value.trim();
        if (!userMessage) return;
        addMessageToChat(userMessage, 'user');
        lastUserMessage = userMessage;
        aiChatInput.value = '';
    }

    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'chat-bubble loading';
    loadingBubble.textContent = 'Thinking...';
    aiChatHistory.appendChild(loadingBubble);
    aiChatHistory.scrollTop = aiChatHistory.scrollHeight;

    const apiKey = "YOUR_API_KEY_HERE";

    if (apiKey === "YOUR_API_KEY_HERE") {
        aiChatHistory.removeChild(loadingBubble);
        addMessageToChat("Configuration error: Please add your Gemini API key to the index.html file.", 'ai');
        return;
    }

    const prompt = `
        You are an expert construction cost estimator. A user is working on an estimate for a
        '${projectSettings.projectType}' project in '${projectSettings.projectState}'.
        Provide helpful advice based on their question. Keep your answer concise and to the point. Use bullet points for clarity if needed.
        User's question: "${userMessage}"
    `;

    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        aiChatHistory.removeChild(loadingBubble);

        if (result.error) {
            console.error("Gemini API Error:", result.error);
            let errorMessage = `Error from API: ${result.error.message}`;
            if (result.error.message.includes("overloaded")) {
                errorMessage += ` <button onclick="retryLastAIChatRequest()" class="btn btn-primary btn-sm" style="padding: 2px 8px; font-size: 12px; margin-left: 8px;">Retry</button>`;
                addMessageToChat(errorMessage, 'ai', true);
            } else {
                addMessageToChat(errorMessage, 'ai');
            }
            return;
        }

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const aiMessage = result.candidates[0].content.parts[0].text;
            addMessageToChat(aiMessage, 'ai');
            chatHistory.push({ role: "model", parts: [{ text: aiMessage }] });
        } else {
            addMessageToChat('Sorry, I could not get a response. The response was empty.', 'ai');
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        aiChatHistory.removeChild(loadingBubble);
        addMessageToChat('Sorry, there was a network error connecting to the AI service.', 'ai');
    }
}

function startDetailedEstimate() {
    currentAppMode = 'detailed';
    projectSettings = JSON.parse(JSON.stringify(initialProjectSettings));
    projectSettings.contractorLogo = PERMANENT_DEFAULT_LOGO;

    entryPointContainer.classList.add('hidden');
    mainApp.classList.add('hidden');
    quickQuoteApp.classList.add('hidden');
    loadSetupWizard();
}

function startQuickQuote() {
    currentAppMode = 'quickQuote';
    projectSettings = JSON.parse(JSON.stringify(initialProjectSettings));
    projectSettings.contractorLogo = PERMANENT_DEFAULT_LOGO;
    projectSettings.projectName = "New Quick Quote";
    projectSettings.projectType = "Quick Quote";
    projectSettings.clientName = "";
    projectSettings.projectState = "";

    entryPointContainer.classList.add('hidden');
    mainApp.classList.add('hidden');

    appHeaderContainer.classList.remove('hidden');
    quickQuoteApp.classList.remove('hidden');
    loadQuickQuoteSummary();

    if (window.AppHeader && typeof window.AppHeader.updateProjectInfo === 'function') {
        window.AppHeader.updateProjectInfo('Quick Quote', 'New Quick Quote', '', 'N/A');
    }
    if (window.AppHeader && typeof window.AppHeader.updateLogo === 'function') {
        window.AppHeader.updateLogo(PERMANENT_DEFAULT_LOGO);
    }

    estimateItems = [];
}


function setupInitialEventListeners() {
    document.getElementById('startDetailedBtn').addEventListener('click', startDetailedEstimate);
    document.getElementById('startQuickQuoteBtn').addEventListener('click', startQuickQuote);

    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'goToCalculatorBtn') {
            showMainApp();
        }
    });

    if (saveProjectModal) {
        saveProjectModal.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return; 

            if (button.id === 'cancelSaveProjectBtn') {
                closeSaveProjectModal();
            } else if (button.id === 'confirmSaveProjectBtn') {
                confirmSaveProject();
            }
        });
    }

    defaultTradeSelectorElem = document.getElementById('defaultTradeSelector');
    if (defaultTradeSelectorElem) {
        defaultTradeSelectorElem.addEventListener('change', (event) => {
            currentlySelectedTradeForLineItems = event.target.value;
        });
    }

    const detailedAddItemBtn = document.getElementById('addItemBtn');
    if (detailedAddItemBtn) {
        detailedAddItemBtn.addEventListener('click', addItem);
    }

    setupAIChatListeners();

    if (estimateItemsContainer) {
        // Event delegation for all interactions within the line items container
        estimateItemsContainer.addEventListener('click', (event) => {
            const row = event.target.closest('.line-item-row');
            if (!row) return;

            // Handle button clicks (delete, duplicate)
            const button = event.target.closest('button[data-action]');
            if (button) {
                const itemId = parseInt(row.dataset.id);
                const action = button.dataset.action;
                if (action === 'delete') deleteItem(itemId);
                if (action === 'duplicate') duplicateItem(itemId);
                return; // Stop further processing to prevent toggle
            }

            // Handle header click to toggle accordion
            if (event.target.closest('.line-item-header')) {
                const details = row.querySelector('.line-item-details');
                row.classList.toggle('expanded');
                details.classList.toggle('expanded');
            }
        });

        estimateItemsContainer.addEventListener('change', (event) => {
            const target = event.target;
            const row = target.closest('.line-item-row');
            if (!row) return;

            const itemId = parseInt(row.dataset.id);
            const field = target.dataset.field;
            
            if (itemId && field) {
                updateItem(itemId, field, target.value);
            }
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    loadAppHeader();
    loadCompanyProfile();
    setupInitialEventListeners();
    if (currentAppMode === 'detailed') {
        renderItems();
    }
});

function renderMessageBox(message, onConfirmCallback = null, isConfirm = false) {
    const existingOverlay = document.getElementById('messageBoxOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    const messageBoxOverlay = document.createElement('div');
    messageBoxOverlay.id = 'messageBoxOverlay';
    messageBoxOverlay.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1002] backdrop-filter backdrop-blur-sm';

    const messageBox = document.createElement('div');
    messageBox.className = 'bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl max-w-sm mx-auto text-center';

    let buttonsHtml;
    if (isConfirm) {
        buttonsHtml = `
            <button class="btn btn-red mr-3" id="confirmYesBtn">Yes</button>
            <button class="btn btn-primary" id="confirmNoBtn">No</button>
        `;
    } else {
        buttonsHtml = `<button class="btn btn-primary" id="okBtn">OK</button>`;
    }

    messageBox.innerHTML = `
        <p class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">${message}</p>
        <div class="flex justify-center gap-3">
            ${buttonsHtml}
        </div>
    `;
    messageBoxOverlay.appendChild(messageBox);
    document.body.appendChild(messageBoxOverlay);

    messageBoxOverlay.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        if (target.id === 'okBtn' || target.id === 'confirmNoBtn') {
            closeMessageBox();
        } else if (target.id === 'confirmYesBtn') {
            if (onConfirmCallback) {
                onConfirmCallback();
            }
            closeMessageBox();
        }
    });
}


function closeMessageBox() {
    const messageBoxOverlay = document.getElementById('messageBoxOverlay');
    if (messageBoxOverlay) {
        messageBoxOverlay.remove();
    }
}

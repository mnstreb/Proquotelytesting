// src/components/AppHeader/AppHeader.js

// These variables are now private to this module automatically.
let loginMenuItemElem;
let loggedInMenuItemsContainer;
let logoutMenuItemElem;
let companyProfileMenuItemElem;
let savedProjectsMenuItemElem;
let mainAppLogoElem;
let mainAppDefaultIcon;
let projectTypeDisplayElem;
let projectNameDisplayElem;
let reconfigureBtnElem;
let saveProjectBtnElem;
let exportDropdownBtnElem;
let exportDropdownMenuElem;
let userProfileBtnElem;
let userProfileDropdownMenuElem;
let profileDropdownThemeToggleElem;
let exportPdfReportBtnElem;
let exportCsvBtnElem;
let exportPdfQuoteBtnElem;
let emailClientBtnElem;
let headerInfoContainerElem; // ✨ ADDED: Variable for the header container

// Callbacks that will be provided by app.js
let onLoginClickCallback;
let onLogoutClickCallback;
let onThemeToggleCallback;
let onReconfigureCallback;
let onSaveProjectCallback;
let onExportPdfReportCallback;
let onExportCsvCallback;
let onExportPdfQuoteCallback;
let onEmailClientCallback;
let onUserProfileClickCallback;
let onCompanyProfileClickCallback;
let onGoHomeClickCallback; // ✨ ADDED: Callback for the header click

// ✨ EXPORTED: This function is now the main entry point for this module.
export function init(config) {
    // Get all element references from the DOM
    loginMenuItemElem = document.getElementById(config.loginMenuItemId);
    loggedInMenuItemsContainer = document.getElementById('loggedInMenuItems');
    logoutMenuItemElem = document.getElementById(config.logoutMenuItemId);
    companyProfileMenuItemElem = document.getElementById(config.companyProfileMenuItemId);
    savedProjectsMenuItemElem = document.getElementById(config.savedProjectsMenuItemId);
    mainAppLogoElem = document.getElementById(config.mainAppLogoId);
    mainAppDefaultIcon = document.getElementById('mainAppDefaultIcon');
    projectTypeDisplayElem = document.getElementById('projectTypeDisplay');
    projectNameDisplayElem = document.getElementById('projectNameDisplay');
    reconfigureBtnElem = document.getElementById(config.reconfigureBtnId);
    saveProjectBtnElem = document.getElementById(config.saveProjectBtnId);
    exportDropdownBtnElem = document.getElementById(config.exportDropdownBtnId);
    exportDropdownMenuElem = document.getElementById(config.exportDropdownMenuId);
    userProfileBtnElem = document.getElementById(config.userProfileBtnId);
    userProfileDropdownMenuElem = document.getElementById(config.userProfileDropdownMenuId);
    profileDropdownThemeToggleElem = document.getElementById(config.profileDropdownThemeToggleId);
    exportPdfReportBtnElem = document.getElementById(config.exportPdfReportBtnId);
    exportCsvBtnElem = document.getElementById(config.exportCsvBtnId);
    exportPdfQuoteBtnElem = document.getElementById(config.exportPdfQuoteBtnId);
    emailClientBtnElem = document.getElementById(config.emailClientBtnId);
    headerInfoContainerElem = document.getElementById('headerInfoContainer'); // ✨ ADDED: Get the header container element

    // Assign callbacks from the config object
    onLoginClickCallback = config.onLoginClick;
    onLogoutClickCallback = config.onLogoutClick;
    onThemeToggleCallback = config.onThemeToggle;
    onReconfigureCallback = config.onReconfigure;
    onSaveProjectCallback = config.onSaveProject;
    onExportPdfReportCallback = config.onExportPdfReport;
    onExportCsvCallback = config.onExportCsv;
    onExportPdfQuoteCallback = config.onExportPdfQuote;
    onEmailClientCallback = config.onEmailClient;
    onUserProfileClickCallback = config.onUserProfileClick;
    onCompanyProfileClickCallback = config.onCompanyProfileClick;
    onGoHomeClickCallback = config.onGoHomeClick; // ✨ ADDED: Assign the new callback

    // Set up all event listeners for the header's buttons and menus
    if (headerInfoContainerElem) headerInfoContainerElem.addEventListener('click', onGoHomeClickCallback); // ✨ ADDED: Attach the click listener
    if (loginMenuItemElem) loginMenuItemElem.addEventListener('click', () => { onLoginClickCallback(); hideDropdown(userProfileDropdownMenuElem); });
    if (logoutMenuItemElem) logoutMenuItemElem.addEventListener('click', () => { onLogoutClickCallback(); hideDropdown(userProfileDropdownMenuElem); });
    if (reconfigureBtnElem) reconfigureBtnElem.addEventListener('click', onReconfigureCallback);
    if (saveProjectBtnElem) saveProjectBtnElem.addEventListener('click', onSaveProjectCallback);
    if (exportDropdownBtnElem) {
        exportDropdownBtnElem.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleDropdown(exportDropdownMenuElem);
            hideDropdown(userProfileDropdownMenuElem);
        });
    }
    if (exportPdfReportBtnElem) exportPdfReportBtnElem.addEventListener('click', () => { onExportPdfReportCallback(); hideDropdown(exportDropdownMenuElem); });
    if (exportCsvBtnElem) exportCsvBtnElem.addEventListener('click', () => { onExportCsvCallback(); hideDropdown(exportDropdownMenuElem); });
    if (exportPdfQuoteBtnElem) exportPdfQuoteBtnElem.addEventListener('click', () => { onExportPdfQuoteCallback(); hideDropdown(exportDropdownMenuElem); });
    if (emailClientBtnElem) emailClientBtnElem.addEventListener('click', () => { onEmailClientCallback(); hideDropdown(exportDropdownMenuElem); });
    if (userProfileBtnElem) {
        userProfileBtnElem.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleDropdown(userProfileDropdownMenuElem);
            hideDropdown(exportDropdownMenuElem);
        });
    }
    if (profileDropdownThemeToggleElem) profileDropdownThemeToggleElem.addEventListener('change', onThemeToggleCallback);
    if (companyProfileMenuItemElem) {
        companyProfileMenuItemElem.addEventListener('click', () => {
            onCompanyProfileClickCallback();
            hideDropdown(userProfileDropdownMenuElem);
        });
    }
    if (savedProjectsMenuItemElem) {
        savedProjectsMenuItemElem.addEventListener('click', () => {
            onUserProfileClickCallback();
            hideDropdown(userProfileDropdownMenuElem);
        });
    }

    // A single global click listener to close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        const isClickOutsideExport = !(exportDropdownBtnElem && exportDropdownBtnElem.contains(event.target)) &&
                                     !(exportDropdownMenuElem && exportDropdownMenuElem.contains(event.target));
        const isClickOutsideUserProfile = !(userProfileBtnElem && userProfileBtnElem.contains(event.target)) &&
                                          !(userProfileDropdownMenuElem && userProfileDropdownMenuElem.contains(event.target));
        if (isClickOutsideExport) hideDropdown(exportDropdownMenuElem);
        if (isClickOutsideUserProfile) hideDropdown(userProfileDropdownMenuElem);
    });
}

// ✨ EXPORTED: This function can be called directly by app.js
export function setAuthState(isLoggedIn) {
    if (isLoggedIn) {
        loginMenuItemElem.classList.add('hidden');
        loggedInMenuItemsContainer.classList.remove('hidden');
    } else {
        loginMenuItemElem.classList.remove('hidden');
        loggedInMenuItemsContainer.classList.add('hidden');
    }
}

// These are "private" helper functions; they don't need to be exported.
function toggleDropdown(dropdownElem) {
    if (dropdownElem) dropdownElem.classList.toggle('show');
}

function hideDropdown(dropdownElem) {
    if (dropdownElem) dropdownElem.classList.remove('show');
}

// ✨ EXPORTED: This function can be called directly by app.js
export function updateProjectInfo(projectType, projectName, clientName, projectState) {
    if (projectTypeDisplayElem) projectTypeDisplayElem.textContent = projectName;
    if (projectNameDisplayElem) {
        let subtitleParts = [];
        if (clientName) subtitleParts.push(clientName);
        if (projectType && projectType !== "Quick Quote") subtitleParts.push(projectType);
        if (projectState) subtitleParts.push(projectState);
        projectNameDisplayElem.textContent = subtitleParts.join(' | ');
    }
}

// ✨ EXPORTED: This function can be called directly by app.js
export function updateLogo(logoSrc) {
    if (mainAppLogoElem) {
        if (logoSrc) {
            mainAppLogoElem.src = logoSrc;
            mainAppLogoElem.classList.remove('hidden');
            mainAppDefaultIcon.classList.add('hidden');
        } else {
            mainAppLogoElem.src = '';
            mainAppLogoElem.classList.add('hidden');
            mainAppDefaultIcon.classList.remove('hidden');
        }
    }
}

// ✨ EXPORTED: This function can be called directly by app.js
export function updateThemeToggleSlider(isDark) {
    if (profileDropdownThemeToggleElem) {
        profileDropdownThemeToggleElem.checked = !isDark;
    }
}

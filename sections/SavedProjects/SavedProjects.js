// src/sections/SavedProjects/SavedProjects.js

// Module-scoped variables (private)
let projectsList;
let customerFilterInput;
let customerProjectsPieChart;
let customerProjectsPieChartCanvas;
let noCustomerDataMessage;
let noProjectsMessage;

// Callbacks and helpers from app.js
let onLoadProjectCallback;
let onGoToCalculatorCallback;
let renderMessageBoxCallback;
let closeMessageBoxCallback;
let formatCurrency;
let isDarkTheme;

// ✨ MODIFIED: Mock data removed. This will be populated by a call to the back-end API.
let savedProjectsData = [];

/**
 * Initializes the SavedProjects module.
 * @param {object} config - Configuration object.
 */
export function init(config) {
    // Store callbacks and helpers from app.js
    onLoadProjectCallback = config.onLoadProject; 
    onGoToCalculatorCallback = config.onGoToCalculator;
    renderMessageBoxCallback = config.renderMessageBox;
    closeMessageBoxCallback = config.closeMessageBox;
    formatCurrency = config.formatCurrency;
    isDarkTheme = config.isDarkTheme;

    // Get UI element references
    projectsList = document.getElementById('projectsList');
    customerFilterInput = document.getElementById('customerFilterInput');
    customerProjectsPieChartCanvas = document.getElementById('customerProjectsPieChart');
    noCustomerDataMessage = document.getElementById('noCustomerDataMessage');
    noProjectsMessage = document.getElementById('noProjectsMessage');
    const goToCalculatorBtn = document.getElementById('goToCalculatorBtn');

    // Attach event listeners
    if (goToCalculatorBtn) {
        goToCalculatorBtn.addEventListener('click', onGoToCalculatorCallback);
    }
    if (customerFilterInput) {
        customerFilterInput.addEventListener('input', () => filterAndRenderProjects(isDarkTheme));
    }

    // Event Delegation for project list actions (load, delete, status change)
    if (projectsList) {
        projectsList.addEventListener('click', (event) => {
            const target = event.target.closest('button'); // Find the closest button
            if (!target) return;

            if (target.classList.contains('load-project-btn')) {
                loadProject(target.dataset.id);
            } else if (target.classList.contains('delete-project-btn')) {
                deleteProject(target.dataset.id);
            }
        });

        projectsList.addEventListener('change', (event) => {
            if (event.target.classList.contains('status-select')) {
                const projectId = event.target.id.replace('status-', '');
                updateProjectStatus(projectId, event.target.value);
            }
        });
    }

    // Initial render
    renderProjects(savedProjectsData);
    updateCustomerTotalsChart(savedProjectsData, isDarkTheme);
}

/**
 * Adds or updates a project and returns a status.
 * @param {object} newProject - The project object to save.
 * @returns {string} 'saved' or 'updated'
 */
export function addProject(newProject) {
    const existingProjectIndex = savedProjectsData.findIndex(p => 
        p.projectName === newProject.projectName && p.customerName === newProject.customerName
    );

    let status = 'saved';
    if (existingProjectIndex !== -1) {
        savedProjectsData[existingProjectIndex] = {
            ...savedProjectsData[existingProjectIndex],
            ...newProject,
            lastSavedDate: new Date().toISOString().split('T')[0]
        };
        status = 'updated';
    } else {
        savedProjectsData.push(newProject);
    }
    savedProjectsData.sort((a, b) => a.projectName.localeCompare(b.projectName));
    
    // We still need to re-render the projects list if the user is viewing it
    if (document.getElementById('savedProjectsContainer') && !document.getElementById('savedProjectsContainer').classList.contains('hidden')) {
        filterAndRenderProjects(document.body.classList.contains('dark-theme'));
    }
    
    return status;
}


/**
 * Returns the current saved projects data.
 */
export function getSavedProjectsData() {
    return savedProjectsData;
}

/**
 * Updates the chart with new data and theme.
 */
export function updateCustomerTotalsChart(projects, newIsDarkTheme) {
    isDarkTheme = newIsDarkTheme; // Update theme status
    const customerTotals = {};
    projects.forEach(project => {
        customerTotals[project.customerName] = (customerTotals[project.customerName] || 0) + project.totalProposal;
    });

    const labels = Object.keys(customerTotals);
    const data = Object.values(customerTotals);

    const shouldShowChart = data.length > 0;
    if (customerProjectsPieChartCanvas) customerProjectsPieChartCanvas.classList.toggle('hidden', !shouldShowChart);
    if (noCustomerDataMessage) noCustomerDataMessage.classList.toggle('hidden', shouldShowChart);


    if (!shouldShowChart) {
        if (customerProjectsPieChart) customerProjectsPieChart.destroy();
        customerProjectsPieChart = null;
        return;
    }
    
    const baseColors = ['#2563eb', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#d946ef', '#0ea5e9', '#eab308', '#64748b'];
    const backgroundColors = data.map((_, i) => baseColors[i % baseColors.length]);
    
    if (customerProjectsPieChart) {
        // Update existing chart
        customerProjectsPieChart.data.labels = labels;
        customerProjectsPieChart.data.datasets[0].data = data;
        customerProjectsPieChart.options.plugins.legend.labels.color = isDarkTheme ? '#e2e8f0' : '#4b5563';
        customerProjectsPieChart.update();
    } else {
        // Create new chart
        const ctx = customerProjectsPieChartCanvas.getContext('2d');
        customerProjectsPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: isDarkTheme ? '#e2e8f0' : '#4b5563',
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${formatCurrency(context.parsed)}`
                        }
                    }
                }
            }
        });
    }
}

// "Private" helper functions
function filterAndRenderProjects(currentTheme) {
    const searchTerm = customerFilterInput.value.toLowerCase();
    const filteredProjects = savedProjectsData.filter(project =>
        project.customerName.toLowerCase().includes(searchTerm) ||
        project.projectName.toLowerCase().includes(searchTerm)
    );
    renderProjects(filteredProjects);
    updateCustomerTotalsChart(filteredProjects, currentTheme);
}

function renderProjects(projectsToRender) {
    if (!projectsList) return;
    projectsList.innerHTML = '';
    if (noProjectsMessage) noProjectsMessage.classList.toggle('hidden', projectsToRender.length > 0);


    projectsToRender.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <h3 class="font-semibold text-lg mb-2">${project.projectName}</h3>
            <p class="text-sm text-gray-600 dark:text-a0aec0">Customer: <strong>${project.customerName}</strong></p>
            <p class="text-sm text-gray-600 dark:text-a0aec0">Total: <strong>${formatCurrency(project.totalProposal)}</strong></p>
            <div class="flex items-center justify-between mt-4">
                <label for="status-${project.id}" class="text-sm text-gray-600 dark:text-a0aec0 mr-2">Status:</label>
                <select id="status-${project.id}" class="input-field status-select text-sm p-1">
                    <option value="Draft" ${project.status === 'Draft' ? 'selected' : ''}>Draft</option>
                    <option value="Pending Review" ${project.status === 'Pending Review' ? 'selected' : ''}>Pending Review</option>
                    <option value="Awarded" ${project.status === 'Awarded' ? 'selected' : ''}>Awarded</option>
                    <option value="Rejected" ${project.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </div>
            <div class="flex justify-end gap-2 mt-4">
                <button class="btn btn-primary btn-sm load-project-btn" data-id="${project.id}">Load</button>
                <button class="btn btn-red btn-sm delete-project-btn" data-id="${project.id}">Delete</button>
            </div>
        `;
        projectsList.appendChild(projectCard);
    });
}

function updateProjectStatus(projectId, newStatus) {
    const project = savedProjectsData.find(p => p.id === projectId);
    if (project) {
        project.status = newStatus;
        renderMessageBoxCallback(`Project "${project.projectName}" status updated to ${newStatus}.`);
        filterAndRenderProjects(isDarkTheme);
    }
}

function loadProject(projectId) {
    const projectToLoad = savedProjectsData.find(p => p.id === projectId);
    if (projectToLoad && projectToLoad.projectDetails) {
        try {
            const projectData = JSON.parse(projectToLoad.projectDetails);
            if (onLoadProjectCallback) {
                onLoadProjectCallback(projectData);
            } else {
                console.error("onLoadProject callback is not defined.");
                renderMessageBoxCallback("Error: Could not load project.");
            }
        } catch (e) {
            console.error("Error parsing project details:", e);
            renderMessageBoxCallback("Error: The selected project data is corrupt and cannot be loaded.");
        }
    } else {
        renderMessageBoxCallback("Could not find the selected project's details.");
    }
}


function deleteProject(projectId) {
    const projectToDelete = savedProjectsData.find(p => p.id === projectId);
    if (projectToDelete) {
        renderMessageBoxCallback(`Are you sure you want to delete "${projectToDelete.projectName}"?`, () => {
            savedProjectsData = savedProjectsData.filter(p => p.id !== projectId);
            filterAndRenderProjects(isDarkTheme);
            renderMessageBoxCallback('Project deleted.');
            if(closeMessageBoxCallback) closeMessageBoxCallback();
        }, true);
    }
}

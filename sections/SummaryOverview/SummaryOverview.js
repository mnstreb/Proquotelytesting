// src/sections/SummaryOverview/SummaryOverview.js

// Module-scoped variables (private)
let costDistributionPieChart;
let financialBuildupChart;
let efficiencyGaugeChart;
let changeOrderChart; // ✨ ADDED

// UI elements to update
let summaryTotalProposalElem, summaryOverallLaborHoursElem, summaryProjectCostElem,
    summaryProfitMarginValueElem, summaryEstimateSubtotalElem, summarySalesTaxValueElem,
    summaryMiscPercentValueElem, summaryOverheadValueElem, summaryMaterialMarkupValueElem,
    summaryAdditionalConsiderationsElem, laborPMTotalElem, laborSuperintendentTotalElem,
    laborGeneralForemanTotalElem, laborForemanTotalElem, laborJourneymanTotalElem,
    laborApprenticeTotalElem, breakdownLaborHoursTotalElem, breakdownProjectTotalElem,
    costDistributionPieChartCanvas, financialBuildupChartCanvas, efficiencyGaugeChartCanvas,
    changeOrderChartCanvas, // ✨ ADDED
    summaryProfitMarginFlowValueElem, finalProposalTotalElem,
    breakdownLaborTotalElem, breakdownMaterialTotalElem, breakdownEquipmentTotalElem,
    breakdownSubcontractorTotalElem, breakdownMiscCostLineItemsElem, breakdownDirectCostTotalElem,
    summaryMaterialMarkupPercentElem, summaryOverheadPercentElem, summaryMiscPercentElem,
    summaryProfitMarginPercentElem, summarySalesTaxPercentElem,
    gaugeValueElem, summaryOriginalContractElem, summaryChangeOrdersElem;

// Helper functions passed from app.js
let formatCurrency;
let formatHours;

/**
 * Initializes the SummaryOverview component by getting element references.
 * @param {object} config - Configuration object containing initial data and helper functions.
 */
export function init(config) {
    // BUG FIX: Destroy existing chart instances before re-initializing
    if (costDistributionPieChart) costDistributionPieChart.destroy();
    if (financialBuildupChart) financialBuildupChart.destroy();
    if (efficiencyGaugeChart) efficiencyGaugeChart.destroy();
    if (changeOrderChart) changeOrderChart.destroy(); // ✨ ADDED
    costDistributionPieChart = null;
    financialBuildupChart = null;
    efficiencyGaugeChart = null;
    changeOrderChart = null; // ✨ ADDED

    // Store helper functions
    formatCurrency = config.formatCurrency;
    formatHours = config.formatHours;

    // Get all element references from the DOM
    summaryTotalProposalElem = document.getElementById('summaryTotalProposal');
    summaryOverallLaborHoursElem = document.getElementById('summaryOverallLaborHours');
    summaryProjectCostElem = document.getElementById('summaryProjectCost');
    summaryProfitMarginValueElem = document.getElementById('summaryProfitMarginValue');
    summaryEstimateSubtotalElem = document.getElementById('summaryEstimateSubtotal');
    summarySalesTaxValueElem = document.getElementById('summarySalesTaxValue');
    summaryMiscPercentValueElem = document.getElementById('summaryMiscPercentValue');
    summaryOverheadValueElem = document.getElementById('summaryOverheadValue');
    summaryMaterialMarkupValueElem = document.getElementById('summaryMaterialMarkupValue');
    summaryAdditionalConsiderationsElem = document.getElementById('summaryAdditionalConsiderations');
    laborPMTotalElem = document.getElementById('laborPMTotal');
    laborSuperintendentTotalElem = document.getElementById('laborSuperintendentTotal');
    laborGeneralForemanTotalElem = document.getElementById('laborGeneralForemanTotal');
    laborForemanTotalElem = document.getElementById('laborForemanTotal');
    laborJourneymanTotalElem = document.getElementById('laborJourneymanTotal');
    laborApprenticeTotalElem = document.getElementById('laborApprenticeTotal');
    breakdownLaborHoursTotalElem = document.getElementById('breakdownLaborHoursTotal');
    breakdownProjectTotalElem = document.getElementById('breakdownProjectTotal');
    costDistributionPieChartCanvas = document.getElementById('costDistributionPieChart');
    financialBuildupChartCanvas = document.getElementById('financialBuildupChart');
    efficiencyGaugeChartCanvas = document.getElementById('efficiencyGaugeChart');
    changeOrderChartCanvas = document.getElementById('changeOrderChart'); // ✨ ADDED
    summaryProfitMarginFlowValueElem = document.getElementById('summaryProfitMarginFlowValue');
    finalProposalTotalElem = document.getElementById('finalProposalTotal');
    breakdownLaborTotalElem = document.getElementById('breakdownLaborTotal');
    breakdownMaterialTotalElem = document.getElementById('breakdownMaterialTotal');
    breakdownEquipmentTotalElem = document.getElementById('breakdownEquipmentTotal');
    breakdownSubcontractorTotalElem = document.getElementById('breakdownSubcontractorTotal');
    breakdownMiscCostLineItemsElem = document.getElementById('breakdownMiscCostLineItemsElem');
    breakdownDirectCostTotalElem = document.getElementById('breakdownDirectCostTotal');
    summaryMaterialMarkupPercentElem = document.getElementById('summaryMaterialMarkupPercent');
    summaryOverheadPercentElem = document.getElementById('summaryOverheadPercent');
    summaryMiscPercentElem = document.getElementById('summaryMiscPercent');
    summaryProfitMarginPercentElem = document.getElementById('summaryProfitMarginPercent');
    summarySalesTaxPercentElem = document.getElementById('summarySalesTaxPercent');
    gaugeValueElem = document.getElementById('gaugeValue');
    summaryOriginalContractElem = document.getElementById('summaryOriginalContract');
    summaryChangeOrdersElem = document.getElementById('summaryChangeOrders');


    // Event listener for the breakdown toggle
    const breakdownToggle = document.getElementById('breakdownToggle');
    if (breakdownToggle) {
        breakdownToggle.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const view = e.target.dataset.view;
                document.getElementById('costBreakdownView').classList.toggle('hidden', view !== 'costs');
                document.getElementById('laborBreakdownView').classList.toggle('hidden', view !== 'labor');
                document.getElementById('costBreakdownBtn').classList.toggle('active', view === 'costs');
                document.getElementById('laborBreakdownBtn').classList.toggle('active', view === 'labor');
            }
        });
    }

    const chartToggle = document.getElementById('chartToggle');
    if (chartToggle) {
        chartToggle.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const view = e.target.dataset.view;
                document.getElementById('costDistributionView').classList.toggle('hidden', view !== 'pie');
                document.getElementById('financialBuildupView').classList.toggle('hidden', view !== 'bar');
                document.getElementById('coAnalysisView').classList.toggle('hidden', view !== 'co'); // ✨ ADDED
                document.getElementById('efficiencyGaugeView').classList.toggle('hidden', view !== 'gauge');
                document.getElementById('pieChartBtn').classList.toggle('active', view === 'pie');
                document.getElementById('barChartBtn').classList.toggle('active', view === 'bar');
                document.getElementById('coChartBtn').classList.toggle('active', view === 'co'); // ✨ ADDED
                document.getElementById('gaugeChartBtn').classList.toggle('active', view === 'gauge');
            }
        });
    }

    // Initial update of summaries
    updateSummaries(config.projectSettings, config.isDarkTheme);
}

/**
 * REFACTORED: This function no longer performs calculations.
 * It now only displays the pre-calculated values from the projectSettings object.
 */
export function updateSummaries(projectSettings, isDarkTheme) {
    // --- Get pre-calculated values from projectSettings ---
    const {
        grandTotal = 0,
        originalContractTotal = 0, 
        changeOrderTotal = 0,
        overallLaborHoursSum = 0,
        totalProjectCostDirect = 0,
        totalProfitMarginAmount = 0,
        estimateSubtotalAmount = 0,
        salesTaxAmount = 0,
        totalMiscCostAmount = 0,
        totalOverheadCost = 0,
        materialMarkupAmount = 0,
        additionalConsiderationAmount = 0,
        laborHoursBreakdown = {},
        totalLaborCost = 0,
        totalMaterialCostRaw = 0,
        totalEquipmentCost = 0,
        totalSubcontractorCost = 0,
        totalMiscLineItemCosts = 0,
        materialMarkup = 0,
        overhead = 0,
        miscellaneous = 0,
        profitMargin = 0,
        salesTax = 0
    } = projectSettings;

    // --- Update UI Elements ---
    if (summaryTotalProposalElem) summaryTotalProposalElem.textContent = formatCurrency(grandTotal);
    if (summaryOverallLaborHoursElem) summaryOverallLaborHoursElem.textContent = formatHours(overallLaborHoursSum);
    if (summaryProjectCostElem) summaryProjectCostElem.textContent = formatCurrency(totalProjectCostDirect);
    if (summaryProfitMarginValueElem) summaryProfitMarginValueElem.textContent = formatCurrency(totalProfitMarginAmount);
    if (breakdownProjectTotalElem) breakdownProjectTotalElem.textContent = formatCurrency(totalProjectCostDirect);
    if (summaryMaterialMarkupValueElem) summaryMaterialMarkupValueElem.textContent = formatCurrency(materialMarkupAmount);
    if (summaryOverheadValueElem) summaryOverheadValueElem.textContent = formatCurrency(totalOverheadCost);
    if (summaryMiscPercentValueElem) summaryMiscPercentValueElem.textContent = formatCurrency(totalMiscCostAmount);
    if (summaryEstimateSubtotalElem) summaryEstimateSubtotalElem.textContent = formatCurrency(estimateSubtotalAmount);
    if (summaryProfitMarginFlowValueElem) summaryProfitMarginFlowValueElem.textContent = formatCurrency(totalProfitMarginAmount);
    if (summarySalesTaxValueElem) summarySalesTaxValueElem.textContent = formatCurrency(salesTaxAmount);
    if (summaryAdditionalConsiderationsElem) summaryAdditionalConsiderationsElem.textContent = formatCurrency(additionalConsiderationAmount);
    if(finalProposalTotalElem) finalProposalTotalElem.textContent = formatCurrency(grandTotal);
    if(summaryMaterialMarkupPercentElem) summaryMaterialMarkupPercentElem.textContent = `${materialMarkup.toFixed(2)}%`;
    if(summaryOverheadPercentElem) summaryOverheadPercentElem.textContent = `${overhead.toFixed(2)}%`;
    if(summaryMiscPercentElem) summaryMiscPercentElem.textContent = `${miscellaneous.toFixed(2)}%`;
    if(summaryProfitMarginPercentElem) summaryProfitMarginPercentElem.textContent = `${profitMargin.toFixed(2)}%`;
    if(summarySalesTaxPercentElem) summarySalesTaxPercentElem.textContent = `${salesTax.toFixed(2)}%`;
    if (breakdownLaborTotalElem) breakdownLaborTotalElem.textContent = formatCurrency(totalLaborCost);
    if (breakdownMaterialTotalElem) breakdownMaterialTotalElem.textContent = formatCurrency(totalMaterialCostRaw);
    if (breakdownEquipmentTotalElem) breakdownEquipmentTotalElem.textContent = formatCurrency(totalEquipmentCost);
    if (breakdownSubcontractorTotalElem) breakdownSubcontractorTotalElem.textContent = formatCurrency(totalSubcontractorCost);
    if (breakdownMiscCostLineItemsElem) breakdownMiscCostLineItemsElem.textContent = formatCurrency(totalMiscLineItemCosts);
    if (breakdownDirectCostTotalElem) breakdownDirectCostTotalElem.textContent = formatCurrency(totalProjectCostDirect);
    if (laborPMTotalElem) laborPMTotalElem.textContent = formatHours(laborHoursBreakdown["Project Manager"] || 0);
    if (laborSuperintendentTotalElem) laborSuperintendentTotalElem.textContent = formatHours(laborHoursBreakdown["Superintendent"] || 0);
    if (laborGeneralForemanTotalElem) laborGeneralForemanTotalElem.textContent = formatHours(laborHoursBreakdown["General Foreman"] || 0);
    if (laborForemanTotalElem) laborForemanTotalElem.textContent = formatHours(laborHoursBreakdown["Foreman"] || 0);
    if (laborJourneymanTotalElem) laborJourneymanTotalElem.textContent = formatHours(laborHoursBreakdown["Journeyman"] || 0);
    if (laborApprenticeTotalElem) laborApprenticeTotalElem.textContent = formatHours(laborHoursBreakdown["Apprentice"] || 0);
    if (breakdownLaborHoursTotalElem) breakdownLaborHoursTotalElem.textContent = formatHours(overallLaborHoursSum);
    if (summaryOriginalContractElem) summaryOriginalContractElem.textContent = formatCurrency(originalContractTotal);
    if (summaryChangeOrdersElem) summaryChangeOrdersElem.textContent = formatCurrency(changeOrderTotal);

    // --- Update Charts ---
    const totalOtherDirectCosts = totalEquipmentCost + totalSubcontractorCost + totalMiscLineItemCosts;
    const totalMarkups = materialMarkupAmount + totalOverheadCost + totalMiscCostAmount;
    const costPerHour = overallLaborHoursSum > 0 ? grandTotal / overallLaborHoursSum : 0;

    updateCostDistributionPieChart(totalLaborCost, totalMaterialCostRaw, totalOtherDirectCosts, isDarkTheme);
    updateFinancialBuildupChart(totalLaborCost, totalMaterialCostRaw, totalOtherDirectCosts, totalMarkups, totalProfitMarginAmount, isDarkTheme);
    updateChangeOrderChart(originalContractTotal, changeOrderTotal, isDarkTheme); // ✨ ADDED
    updateEfficiencyGaugeChart(costPerHour, isDarkTheme);
}

/**
 * Updates or creates the cost distribution pie chart.
 */
function updateCostDistributionPieChart(laborCost, materialCost, otherCost, isDarkTheme) {
    const data = [laborCost, materialCost, otherCost];
    const labels = ['Labor', 'Materials', 'Other Costs'];

    const backgroundColors = isDarkTheme ? ['#4299e1', '#63b3ed', '#90cdf4'] : ['#2563eb', '#3b82f6', '#60a5fa'];
    const borderColors = isDarkTheme ? ['#1e293b', '#1e293b', '#1e293b'] : ['#ffffff', '#ffffff', '#ffffff'];
    
    if (costDistributionPieChart) {
        costDistributionPieChart.data.datasets[0].data = data;
        costDistributionPieChart.options.plugins.legend.labels.color = isDarkTheme ? '#e2e8f0' : '#4b5563';
        costDistributionPieChart.update();
    } else {
        if (!costDistributionPieChartCanvas) return;
        const ctx = costDistributionPieChartCanvas.getContext('2d');
        costDistributionPieChart = new Chart(ctx, {
            type: 'pie',
            data: { labels, datasets: [{ data, backgroundColor: backgroundColors, borderColor: borderColors, borderWidth: 2 }] },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { color: isDarkTheme ? '#e2e8f0' : '#4b5563', font: { size: 14 }}},
                    tooltip: { callbacks: { label: (c) => `${c.label}: ${formatCurrency(c.parsed)}` }}
                }
            }
        });
    }
}

/**
 * Updates or creates the financial buildup bar chart.
 */
function updateFinancialBuildupChart(labor, materials, other, markups, profit, isDarkTheme) {
    const data = {
        labels: ['Proposal Buildup'],
        datasets: [
            { label: 'Direct Labor', data: [labor], backgroundColor: isDarkTheme ? '#2563eb' : '#2563eb' },
            { label: 'Direct Materials', data: [materials], backgroundColor: isDarkTheme ? '#3b82f6' : '#3b82f6' },
            { label: 'Other Direct Costs', data: [other], backgroundColor: isDarkTheme ? '#60a5fa' : '#60a5fa' },
            { label: 'Markups & Overhead', data: [markups], backgroundColor: isDarkTheme ? '#f59e0b' : '#f59e0b' },
            { label: 'Profit', data: [profit], backgroundColor: isDarkTheme ? '#10b981' : '#10b981' }
        ]
    };
    
    const options = {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        scales: { 
            x: { stacked: true, ticks: { callback: (v) => formatCurrency(v), color: isDarkTheme ? '#94a3b8' : '#64748b' }, grid: { color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}, 
            y: { stacked: true, ticks: { display: false }, grid: { display: false }} 
        },
        plugins: {
            legend: { position: 'bottom', labels: { color: isDarkTheme ? '#e2e8f0' : '#4b5563', usePointStyle: true, boxWidth: 8, padding: 20 }},
            tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${formatCurrency(c.raw)}` } }
        }
    };

    if (financialBuildupChart) {
        financialBuildupChart.data = data;
        financialBuildupChart.options = options;
        financialBuildupChart.update();
    } else {
        if (!financialBuildupChartCanvas) return;
        const ctx = financialBuildupChartCanvas.getContext('2d');
        financialBuildupChart = new Chart(ctx, { type: 'bar', data, options });
    }
}

/**
 * ✨ ADDED: Updates or creates the Change Order analysis bar chart.
 */
function updateChangeOrderChart(originalTotal, coTotal, isDarkTheme) {
    const grandTotal = originalTotal + coTotal;
    const coPercentage = grandTotal > 0 ? ((coTotal / grandTotal) * 100).toFixed(1) : 0;

    const data = {
        labels: ['Original Contract', 'Change Orders'],
        datasets: [{
            data: [originalTotal, coTotal],
            backgroundColor: [isDarkTheme ? '#2563eb' : '#2563eb', isDarkTheme ? '#f97316' : '#f97316'],
            borderWidth: 1,
            borderColor: isDarkTheme ? '#334155' : '#e2e8f0'
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
            x: { ticks: { callback: (v) => formatCurrency(v), color: isDarkTheme ? '#94a3b8' : '#64748b' }, grid: { color: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }},
            y: { ticks: { color: isDarkTheme ? '#94a3b8' : '#64748b', font: { size: 14 } }, grid: { display: false } }
        },
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => `${c.label}: ${formatCurrency(c.raw)}` } },
            title: {
                display: true,
                text: `Change Orders make up ${coPercentage}% of the new total`,
                color: isDarkTheme ? '#e2e8f0' : '#4b5563',
                font: { size: 14, weight: 'bold' },
                padding: { top: 10, bottom: 20 }
            }
        }
    };

    if (changeOrderChart) {
        changeOrderChart.data = data;
        changeOrderChart.options = options;
        changeOrderChart.update();
    } else {
        if (!changeOrderChartCanvas) return;
        const ctx = changeOrderChartCanvas.getContext('2d');
        changeOrderChart = new Chart(ctx, { type: 'bar', data, options });
    }
}


/**
 * Updates or creates the efficiency gauge chart.
 */
function updateEfficiencyGaugeChart(costPerHour, isDarkTheme) {
    const maxCost = 500; // An arbitrary max for the gauge scale
    const value = Math.min(costPerHour, maxCost); // Cap the value at the max

    // Update the text overlay
    if (gaugeValueElem) {
        gaugeValueElem.textContent = formatCurrency(costPerHour);
    }

    // Determine color based on value
    const getGaugeColor = (val, max) => {
        const ratio = val / max;
        if (ratio < 0.5) return isDarkTheme ? '#10b981' : '#10b981'; // Green
        if (ratio < 0.8) return isDarkTheme ? '#f59e0b' : '#f59e0b'; // Yellow
        return isDarkTheme ? '#ef4444' : '#ef4444'; // Red
    };

    const data = {
        datasets: [{
            data: [value, maxCost - value],
            backgroundColor: [getGaugeColor(value, maxCost), isDarkTheme ? '#334155' : '#e2e8f0'],
            borderColor: [isDarkTheme ? '#1e293b' : '#ffffff', isDarkTheme ? '#1e293b' : '#ffffff'],
            borderWidth: 2,
            circumference: 180,
            rotation: 270,
            cutout: '70%',
        }]
    };
    
    const options = {
        responsive: true, maintainAspectRatio: true,
        plugins: {
            tooltip: { enabled: false },
            legend: { display: false }
        }
    };

    if (efficiencyGaugeChart) {
        efficiencyGaugeChart.data = data;
        efficiencyGaugeChart.update();
    } else {
        if (!efficiencyGaugeChartCanvas) return;
        const ctx = efficiencyGaugeChartCanvas.getContext('2d');
        efficiencyGaugeChart = new Chart(ctx, { type: 'doughnut', data, options });
    }
}

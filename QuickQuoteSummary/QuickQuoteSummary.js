// src/sections/QuickQuoteSummary/QuickQuoteSummary.js

// Change to ES Module export
export default (function() {

    let projectSettings;
    let formatCurrency;
    let formatHours;
    let isDarkTheme;
    let quickQuoteItems = []; // Local array for quick quote items

    // UI Elements
    let totalProposalElem;
    let overheadInput, materialMarkupInput, profitMarginInput, additionalAdderInput;
    let addItemBtn, addItemMenu;
    let tableBody;

    function init(config) {
        projectSettings = config.projectSettings;
        formatCurrency = config.formatCurrency;
        formatHours = config.formatHours;
        isDarkTheme = config.isDarkTheme;

        // Get UI Element References
        totalProposalElem = document.getElementById('qqTotalProposal');
        overheadInput = document.getElementById('qqOverhead');
        materialMarkupInput = document.getElementById('qqMaterialMarkup');
        profitMarginInput = document.getElementById('qqProfitMargin');
        additionalAdderInput = document.getElementById('qqAdditionalAdder');
        addItemBtn = document.getElementById('qqAddItemDropdownBtn');
        addItemMenu = document.getElementById('qqAddItemDropdownMenu');
        tableBody = document.getElementById('qqEstimateTableBody');

        // Attach Event Listeners for financial settings
        [overheadInput, materialMarkupInput, profitMarginInput, additionalAdderInput].forEach(input => {
            if(input) input.addEventListener('input', calculateTotals);
        });

        // Attach Event Listener for the main "Add Item" button
        if(addItemBtn) {
            addItemBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                addItemMenu.classList.toggle('show');
            });
        }

        // Attach Event Listener for the dropdown menu items (using delegation)
        if(addItemMenu) {
            addItemMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdownItem = e.target.closest('.dropdown-item');
                if (dropdownItem) {
                    const type = dropdownItem.dataset.itemType;
                    addItem(type);
                    addItemMenu.classList.remove('show');
                }
            });
        }

        // Global click listener to close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (addItemMenu && addItemBtn && addItemMenu.classList.contains('show') &&
                !addItemBtn.contains(e.target) && !addItemMenu.contains(e.target)) {
                addItemMenu.classList.remove('show');
            }
        });

        // Event delegation for table inputs and buttons
        if (tableBody) {
            tableBody.addEventListener('input', (e) => {
                const target = e.target;
                const row = target.closest('tr');
                if (!row) return;
                const itemId = parseInt(row.dataset.id, 10);

                if (target.matches('input[data-field="description"]')) {
                    updateItem(itemId, 'description', target.value);
                } else if (target.matches('input[data-field="totalAmount"]')) {
                    updateItem(itemId, 'totalAmount', target.value);
                }
            });

            tableBody.addEventListener('click', (e) => {
                const button = e.target.closest('button[data-action="delete"]');
                if (button) {
                    const row = button.closest('tr');
                    if (!row) return;
                    const itemId = parseInt(row.dataset.id, 10);
                    deleteItem(itemId);
                }
            });
        }
        
        // Initial render of the table
        render();
    }

    function addItem(type) {
        const newItem = {
            id: Date.now(),
            type: type,
            description: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Item`,
            totalAmount: (type === 'labor') ? 600 : (type === 'material') ? 250 : (type === 'equipment') ? 150 : 100,
        };
        quickQuoteItems.push(newItem);
        render();
    }

    function deleteItem(id) {
        quickQuoteItems = quickQuoteItems.filter(item => item.id !== id);
        render();
    }
    
    function updateItem(id, field, value) {
        const item = quickQuoteItems.find(item => item.id === id);
        if (item) {
            if (field === 'description') {
                item[field] = value;
            } else if (field === 'totalAmount') {
                item[field] = parseFloat(value) || 0;
            }
        }
        // No need to re-render, just calculate totals
        calculateTotals();
    }

    function render() {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (quickQuoteItems.length === 0) {
            const noItemsRow = document.createElement('tr');
            noItemsRow.innerHTML = `<td colspan="4" class="text-center text-gray-500 italic py-4">No quick quote items added yet. Click "Add Item" to begin!</td>`;
            tableBody.appendChild(noItemsRow);
        } else {
            quickQuoteItems.forEach(item => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', item.id);
                
                row.innerHTML = `
                    <td><input type="text" class="input-field" value="${item.description}" data-field="description"></td>
                    <td><span>${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span></td>
                    <td><input type="number" class="input-field" value="${item.totalAmount}" data-field="totalAmount"></td>
                    <td class="text-center"><button class="btn btn-red btn-sm" data-action="delete">&times;</button></td>
                `;
                tableBody.appendChild(row);
            });
        }
        calculateTotals();
    }

    function calculateTotals() {
        projectSettings.overhead = parseFloat(overheadInput.value) || 0;
        projectSettings.materialMarkup = parseFloat(materialMarkupInput.value) || 0;
        projectSettings.profitMargin = parseFloat(profitMarginInput.value) || 0;
        projectSettings.miscellaneous = parseFloat(additionalAdderInput.value) || 0;

        let directLaborCost = 0, directMaterialCost = 0, directEquipmentCost = 0, directOtherCost = 0, totalHours = 0;

        quickQuoteItems.forEach(item => {
            if (item.type === 'labor') {
                directLaborCost += item.totalAmount;
                totalHours += item.totalAmount / (projectSettings.allTradeLaborRates?.General?.Journeyman || 75);
            } else if (item.type === 'material') {
                directMaterialCost += item.totalAmount;
            } else if (item.type === 'equipment') {
                directEquipmentCost += item.totalAmount;
            } else {
                directOtherCost += item.totalAmount;
            }
        });

        const materialMarkupAmount = directMaterialCost * (projectSettings.materialMarkup / 100);
        const totalDirectCost = directLaborCost + directMaterialCost + directEquipmentCost + directOtherCost;
        const baseForMarkups = totalDirectCost + materialMarkupAmount;
        const overheadAmount = baseForMarkups * (projectSettings.overhead / 100);
        const additionalAdderAmount = baseForMarkups * (projectSettings.miscellaneous / 100);
        const subtotal = baseForMarkups + overheadAmount + additionalAdderAmount;
        const profitAmount = subtotal * (projectSettings.profitMargin / 100);
        const grandTotal = subtotal + profitAmount;

        totalProposalElem.textContent = formatCurrency(grandTotal);

        // Update global projectSettings for AppHeader and saving
        projectSettings.grandTotal = grandTotal;
        projectSettings.totalLaborCost = directLaborCost;
        projectSettings.totalMaterialCostRaw = directMaterialCost;
        projectSettings.totalEquipmentCost = directEquipmentCost;
        projectSettings.totalSubcontractorCost = 0;
        projectSettings.totalMiscLineItemCosts = directOtherCost;
        projectSettings.overallLaborHoursSum = totalHours;
        projectSettings.materialMarkupAmount = materialMarkupAmount;
        projectSettings.totalOverheadCost = overheadAmount;
        projectSettings.totalMiscCostAmount = additionalAdderAmount;
        projectSettings.estimateSubtotalAmount = subtotal;
        projectSettings.totalProfitMarginAmount = profitAmount;
    }
    
    return {
        init: init,
        calculateTotals: calculateTotals,
        getQuickQuoteItems: () => quickQuoteItems,
        getQuickQuoteSettings: () => ({
            overhead: parseFloat(overheadInput.value) || 0,
            materialMarkup: parseFloat(materialMarkupInput.value) || 0,
            profitMargin: parseFloat(profitMarginInput.value) || 0,
            miscellaneous: parseFloat(additionalAdderInput.value) || 0,
        }),
    };

})();

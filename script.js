// Initialize data in localStorage if not exists
if (!localStorage.getItem('donors')) {
    localStorage.setItem('donors', JSON.stringify([]));
}

if (!localStorage.getItem('inventory')) {
    localStorage.setItem('inventory', JSON.stringify([]));
}

// DOM Content Loaded event
document.addEventListener('DOMContentLoaded', function() {
    // Update dashboard counts
    updateDashboard();
    
    // Load appropriate page functionality
    if (document.getElementById('donor-form')) {
        setupDonorPage();
    } else if (document.getElementById('inventory-form')) {
        setupInventoryPage();
    }
});

function updateDashboard() {
    const donors = JSON.parse(localStorage.getItem('donors'));
    const inventory = JSON.parse(localStorage.getItem('inventory'));
    
    // Calculate total units
    let totalUnits = 0;
    inventory.forEach(item => {
        totalUnits += parseInt(item.units);
    });
    
    // Update dashboard elements if they exist
    if (document.getElementById('total-donors')) {
        document.getElementById('total-donors').textContent = donors.length;
    }
    if (document.getElementById('total-units')) {
        document.getElementById('total-units').textContent = totalUnits;
    }
    if (document.getElementById('urgent-needs')) {
        // Simple logic for urgent needs - can be enhanced
        const urgentTypes = inventory.filter(item => item.units < 3).map(item => item.bloodType);
        document.getElementById('urgent-needs').textContent = urgentTypes.length > 0 ? urgentTypes.join(', ') : 'None';
    }
}

function setupDonorPage() {
    // Load existing donors
    loadDonors();
    
    // Handle form submission
    document.getElementById('donor-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const donor = {
            name: document.getElementById('name').value,
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value,
            bloodType: document.getElementById('blood-type').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            lastDonation: document.getElementById('last-donation').value,
            address: document.getElementById('address').value
        };
        
        // Get existing donors
        const donors = JSON.parse(localStorage.getItem('donors'));
        donors.push(donor);
        localStorage.setItem('donors', JSON.stringify(donors));
        
        // Reset form
        this.reset();
        
        // Reload donors
        loadDonors();
        
        // Update dashboard
        updateDashboard();
    });
}

function loadDonors() {
    const donors = JSON.parse(localStorage.getItem('donors'));
    const donorList = document.getElementById('donor-list');
    
    // Clear existing rows
    donorList.innerHTML = '';
    
    // Add each donor to the table
    donors.forEach((donor, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${donor.name}</td>
            <td>${donor.age}</td>
            <td>${donor.gender}</td>
            <td>${donor.bloodType}</td>
            <td>${donor.phone}</td>
            <td>${donor.lastDonation || 'N/A'}</td>
            <td>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </td>
        `;
        
        donorList.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteDonor(index);
        });
    });
}

function deleteDonor(index) {
    const donors = JSON.parse(localStorage.getItem('donors'));
    donors.splice(index, 1);
    localStorage.setItem('donors', JSON.stringify(donors));
    loadDonors();
    updateDashboard();
}

function setupInventoryPage() {
    // Load existing inventory
    loadInventory();
    
    // Handle form submission
    document.getElementById('inventory-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const inventoryItem = {
            bloodType: document.getElementById('inventory-blood-type').value,
            units: document.getElementById('units').value,
            expiryDate: document.getElementById('expiry-date').value
        };
        
        // Get existing inventory
        const inventory = JSON.parse(localStorage.getItem('inventory'));
        
        // Check if this blood type already exists
        const existingIndex = inventory.findIndex(item => item.bloodType === inventoryItem.bloodType);
        
        if (existingIndex >= 0) {
            // Update existing entry
            inventory[existingIndex].units = parseInt(inventory[existingIndex].units) + parseInt(inventoryItem.units);
            // Keep the earliest expiry date
            if (new Date(inventoryItem.expiryDate) < new Date(inventory[existingIndex].expiryDate)) {
                inventory[existingIndex].expiryDate = inventoryItem.expiryDate;
            }
        } else {
            // Add new entry
            inventory.push(inventoryItem);
        }
        
        localStorage.setItem('inventory', JSON.stringify(inventory));
        
        // Reset form
        this.reset();
        
        // Reload inventory
        loadInventory();
        
        // Update dashboard
        updateDashboard();
    });
}

function loadInventory() {
    const inventory = JSON.parse(localStorage.getItem('inventory'));
    const inventoryList = document.getElementById('inventory-list');
    
    // Clear existing rows
    inventoryList.innerHTML = '';
    
    // Add each inventory item to the table
    inventory.forEach((item, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.bloodType}</td>
            <td>${item.units}</td>
            <td>${item.expiryDate}</td>
            <td>
                <button class="delete-inventory-btn" data-index="${index}">Delete</button>
            </td>
        `;
        
        inventoryList.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-inventory-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteInventoryItem(index);
        });
    });
}

function deleteInventoryItem(index) {
    const inventory = JSON.parse(localStorage.getItem('inventory'));
    inventory.splice(index, 1);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    loadInventory();
    updateDashboard();
}
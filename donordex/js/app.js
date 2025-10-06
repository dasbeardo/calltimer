/**
 * DonorDex Main Application Controller
 * Initialization, stats updates, and coordination between modules
 */

const App = {
    /**
     * Initialize the application
     */
    async initialize() {
        try {
            // Initialize Dexie database
            await db.open();
            console.log('Database initialized successfully');

            // Update stats on load
            await this.updateStats();

            // Initialize UI event listeners
            UI.initializeEventListeners();

            console.log('DonorDex initialized successfully');
        } catch (error) {
            console.error('Error initializing DonorDex:', error);
            alert('Error initializing database. Please refresh the page.');
        }
    },

    /**
     * Update dashboard statistics
     */
    async updateStats() {
        const stats = await Database.getStats();

        document.getElementById('totalDonors').textContent = stats.uniqueContributors;
        document.getElementById('totalRecords').textContent = stats.totalRecords;
        document.getElementById('totalCandidates').textContent = stats.uniqueCommittees;
    },

    /**
     * Delete a single record
     * @param {string} id - Record ID to delete
     */
    async deleteRecord(id) {
        if (confirm('Are you sure you want to delete this record?')) {
            await Database.deleteRecord(id);
            await this.updateStats();

            // Refresh search if there's a search term
            const searchInput = document.getElementById('searchInput');
            if (searchInput && searchInput.value.trim()) {
                await Search.searchDonors();
            }

            // Refresh filters if they're active
            if (Filters.filteredRecords.length > 0) {
                await Filters.applyFilters();
            }
        }
    },

    /**
     * Clear all data from database
     */
    async clearAllData() {
        if (confirm('Are you sure you want to clear all DonorDex records? This cannot be undone.')) {
            await Database.clearAll();
            Filters.filteredRecords = [];
            await this.updateStats();

            document.getElementById('searchInput').value = '';
            document.getElementById('resultsContainer').innerHTML = '<div class="no-results">Enter a donor name to begin search</div>';
            document.getElementById('browseContainer').innerHTML = '<div class="no-results">Click "Apply Filters" to browse</div>';
            document.getElementById('browseCount').textContent = '0';
            document.getElementById('browseTotal').textContent = '';
            document.getElementById('pagination').style.display = 'none';

            alert('All records cleared successfully.');
        }
    }
};

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.initialize());
} else {
    App.initialize();
}

// Export for use in other modules
window.App = App;

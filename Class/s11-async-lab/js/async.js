const selector = document.getElementById('scientist-selector');
const display = document.getElementById('results-display');

async function fetchScientists() {
    try {
        const response = await fetch('data/scientists.json');
        if (!response.ok) {
            throw new Error(`Unable to load scientist registry (${response.status})`);
        }

        const scientists = await response.json();
        selector.innerHTML = '<option value="">-- Select a research director --</option>';

        scientists.forEach((scientist) => {
            const option = document.createElement('option');
            option.value = scientist.id;
            option.textContent = `${scientist.name} — ${scientist.specialty}`;
            selector.appendChild(option);
        });
    } catch (error) {
        console.error('Stream 1 Failed:', error);
        selector.innerHTML = '<option value="">Error loading scientists</option>';
    }
}

function simulateNetworkLag(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchMetricsForScientist(scientistId) {
    try {
        display.innerHTML = `
            <div class="d-flex flex-column align-items-center">
                <div class="spinner-border text-success mb-2" role="status"></div>
                <span class="text-muted small">Accessing cloud telemetry database... Please wait...</span>
            </div>
        `;

        await simulateNetworkLag(1000);

        const response = await fetch('data/metrics.json');
        if (!response.ok) {
            throw new Error(`Unable to load telemetry (${response.status})`);
        }

        const metrics = await response.json();
        const scientistMetrics = metrics.filter((metric) => metric.scientistId === scientistId);

        if (!scientistMetrics.length) {
            display.innerHTML = `
                <div class="alert alert-warning mb-0" role="alert">
                    No climate telemetry logs are available for this research director yet.
                </div>
            `;
            return;
        }

        display.innerHTML = `
            <div class="list-group">
                ${scientistMetrics
                    .map(
                        (metric) => `
                            <div class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <strong>${metric.region}</strong>
                                    <span class="badge bg-success metric-badge">${metric.offsetTons} tons</span>
                                </div>
                                <small class="text-muted">Confidence: ${metric.confidenceIndex}</small>
                            </div>
                        `
                    )
                    .join('')}
            </div>
        `;
    } catch (error) {
        console.error('Stream 2 Failed:', error);
        display.innerHTML = `<div class="alert alert-danger mb-0">Error fetching climate telemetry: ${error.message}</div>`;
    }
}

selector.addEventListener('change', (event) => {
    const selectedId = event.target.value;

    if (!selectedId) {
        display.innerHTML = `<p class="text-muted mb-0">Please select a research director from the registry above.</p>`;
        return;
    }

    fetchMetricsForScientist(selectedId);
});

fetchScientists();
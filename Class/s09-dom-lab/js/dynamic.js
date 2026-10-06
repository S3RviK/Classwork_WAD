const actionForm = document.getElementById('action-form');
const actionInput = document.getElementById('action-input');
const prioritySelect = document.getElementById('priority-select');
const actionList = document.getElementById('action-list');
const cardCounter = document.getElementById('card-counter');
const saveBtn = document.getElementById('save-btn');

const createActionCard = (text, priority, completed = false) => {
    const li = document.createElement('li');
    li.className = `list-group-item d-flex justify-content-between align-items-center impact-card priority-${priority}`;
    li.dataset.title = text;
    li.dataset.priority = priority;

    if (completed) {
        li.classList.add('completed');
    }

    const content = document.createElement('div');
    content.className = 'd-flex align-items-center';

    const title = document.createElement('span');
    title.className = 'card-title fw-semibold';
    title.textContent = text;

    const badge = document.createElement('span');
    badge.className = 'badge ms-2 text-capitalize';
    badge.textContent = priority;

    if (priority === 'high') badge.classList.add('bg-danger');
    else if (priority === 'medium') badge.classList.add('bg-warning', 'text-dark');
    else badge.classList.add('bg-success');

    content.append(title, badge);

    const controls = document.createElement('div');
    controls.className = 'btn-group btn-group-sm';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-outline-success';
    toggleBtn.dataset.action = 'toggle';
    toggleBtn.textContent = '✓';

    const upBtn = document.createElement('button');
    upBtn.className = 'btn btn-outline-secondary';
    upBtn.dataset.action = 'up';
    upBtn.textContent = '▲';

    const downBtn = document.createElement('button');
    downBtn.className = 'btn btn-outline-secondary';
    downBtn.dataset.action = 'down';
    downBtn.textContent = '▼';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-outline-danger';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.textContent = '🗑';

    controls.append(toggleBtn, upBtn, downBtn, deleteBtn);
    li.append(content, controls);

    return li;
};

const updateCounter = () => {
    const items = actionList.querySelectorAll('.impact-card');
    const completed = actionList.querySelectorAll('.impact-card.completed').length;
    const total = items.length;
    const countWord = total === 1 ? 'Item' : 'Items';
    cardCounter.textContent = `Total: ${total} ${countWord} • Completed: ${completed}`;
};

actionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const text = actionInput.value.trim();
    if (!text) return;

    const priority = prioritySelect.value;
    const card = createActionCard(text, priority);
    actionList.appendChild(card);

    actionForm.reset();
    prioritySelect.value = 'medium';
    updateCounter();
});

actionList.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;

    const currentCard = button.closest('.impact-card');
    if (!currentCard) return;

    const action = button.dataset.action;

    if (action === 'toggle') {
        currentCard.classList.toggle('completed');
    } else if (action === 'delete') {
        currentCard.remove();
    } else if (action === 'up') {
        const previous = currentCard.previousElementSibling;
        if (previous) {
            currentCard.parentNode.insertBefore(currentCard, previous);
        }
    } else if (action === 'down') {
        const next = currentCard.nextElementSibling;
        if (next) {
            currentCard.parentNode.insertBefore(next, currentCard);
        }
    }

    updateCounter();
});

if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        const items = Array.from(actionList.querySelectorAll('.impact-card')).map((card) => ({
            text: card.dataset.title,
            priority: card.dataset.priority,
            completed: card.classList.contains('completed')
        }));

        if (!items.length) {
            alert('There are no actions to save yet.');
            return;
        }

        const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const dateStamp = new Date().toISOString().slice(0, 10);

        link.href = url;
        link.download = `sdg-actions-${dateStamp}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    });
}

updateCounter();
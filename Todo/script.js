const itemForm = document.getElementById('itemForm');
const taskForm = document.getElementById('taskForm');
const itemTable = document.getElementById('itemTable');
const taskTable = document.getElementById('taskTable');
const categorySelect = document.getElementById('categorySelect');
const currentItemName = document.getElementById('currentItemName');
const yesImmediate = document.getElementById('yesImmediate');
const noImmediate = document.getElementById('noImmediate');
const dueDateContainer = document.getElementById('dueDateContainer');
const dueDateInput = document.getElementById('dueDate');

let items = [];
let currentItemIndex = null;

dueDateContainer.style.display = 'none';
yesImmediate.addEventListener('change', () => {
    dueDateContainer.style.display = 'block';
    dueDateInput.required = true;
    dueDateInput.value = '';
});

noImmediate.addEventListener('change', () => {
    dueDateContainer.style.display = 'none';
    dueDateInput.required = false;
    dueDateInput.value = 'N/A';
});

// Save items to local storage
function saveToLocalStorage() {
    localStorage.setItem('items', JSON.stringify(items));
}

// Load items from local storage
function loadFromLocalStorage() {
    const storedItems = localStorage.getItem('items');
    if (storedItems) {
        items = JSON.parse(storedItems);
        renderItems();
        populateCategoryDropdown();
        renderAllTasks();  // Show all tasks by default
    }
}

// Add new category (item)
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const itemName = document.getElementById('itemName').value;
    const isImmediate = document.querySelector('input[name="IsImmediate"]:checked').value;
    const dueDate = (isImmediate === 'true') ? document.getElementById('dueDate').value : 'N/A';

    items.push({ itemName, dueDate, isImmediate, tasks: [] });
    renderItems();
    populateCategoryDropdown(); // Update dropdown after adding a category
    saveToLocalStorage();
    dueDateContainer.style.display = 'none';
    itemForm.reset();
});

// Add new task to selected category or show a message if no category selected
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskName = document.getElementById('taskName').value;
    const selectedCategory = categorySelect.value;

    if (selectedCategory === "all") {
        alert("Please select a specific category to add the task.");
        return;
    }

    const categoryIndex = items.findIndex(item => item.itemName === selectedCategory);
    if (categoryIndex > -1) {
        items[categoryIndex].tasks.push(taskName);
        saveToLocalStorage();
        renderTasks(categoryIndex); // Re-render tasks for the selected category
        taskForm.reset();
    }
});

// Render items in the category table
function renderItems() {
    itemTable.innerHTML = '';
    items.forEach((item, index) => {
        itemTable.innerHTML += `
            <tr>
                <td><button onclick="selectItem(${index})">${item.itemName}</button></td>
                <td>${item.dueDate}</td>
                <td>${item.isImmediate === 'true' ? 'Yes' : 'No'}</td>
                <td><button onclick="deleteItem(${index})">Delete</button></td>
            </tr>`;
    });
}

// Render tasks for the selected category
function renderTasks(itemIndex) {
    taskTable.innerHTML = '';
    items[itemIndex].tasks.forEach((task, taskIndex) => {
        taskTable.innerHTML += `
            <tr>
                <td>${task}</td>
                <td>${items[itemIndex].itemName}</td>
                <td><button onclick="deleteTask(${itemIndex}, ${taskIndex})">Delete</button></td>
            </tr>`;
    });
}

// Render all tasks across categories
function renderAllTasks() {
    taskTable.innerHTML = '';
    items.forEach((item, itemIndex) => {
        item.tasks.forEach((task, taskIndex) => {
            taskTable.innerHTML += `
                <tr>
                    <td>${task}</td>
                    <td>${item.itemName}</td>
                    <td><button onclick="deleteTask(${itemIndex}, ${taskIndex})">Delete</button></td>
                </tr>`;
        });
    });
}

// Populate category dropdown for task tab
function populateCategoryDropdown() {
    categorySelect.innerHTML = '<option value="all" selected>All</option>';
    items.forEach(item => {
        categorySelect.innerHTML += `<option value="${item.itemName}">${item.itemName}</option>`;
    });
}

// Handle category dropdown change to show tasks for selected category
categorySelect.addEventListener('change', (e) => {
    const selectedCategory = e.target.value;

    if (selectedCategory === "all") {
        renderAllTasks();
        currentItemName.textContent = "All Categories";
    } else {
        const categoryIndex = items.findIndex(item => item.itemName === selectedCategory);
        if (categoryIndex > -1) {
            renderTasks(categoryIndex);
            currentItemName.textContent = items[categoryIndex].itemName;
        }
    }
});

// Select a category to add tasks to
function selectItem(index) {
    currentItemIndex = index;
    currentItemName.textContent = items[index].itemName;
    openTab('TasksTab');
    renderTasks(index);
}

// Delete category (item)
function deleteItem(index) {
    items.splice(index, 1);
    renderItems();
    populateCategoryDropdown(); // Update dropdown after deleting a category
    taskTable.innerHTML = '';
    currentItemName.textContent = '';
    saveToLocalStorage();
}

// Delete task from category
function deleteTask(itemIndex, taskIndex) {
    items[itemIndex].tasks.splice(taskIndex, 1);
    renderTasks(itemIndex);
    saveToLocalStorage();
}

// Switch between tabs
function openTab(tabName) {
    document.querySelectorAll('.tabcontent').forEach(tab => tab.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';

    if (tabName === 'TasksTab' && currentItemIndex !== null) {
        renderTasks(currentItemIndex);
    }
}

// Load items on page load
window.onload = function() {
    loadFromLocalStorage();
    openTab('ItemsTab');
};

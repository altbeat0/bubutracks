// Subjects List
const subjects = ['evidence', 'labour', 'arbitration', 'jurisprudence', 'competition'];

// Logging and Error Handling
function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
        console.log(`Saved ${key}: ${value}`);
    } catch (error) {
        console.error(`localStorage error setting ${key}:`, error);
    }
}

function safeLocalStorageGet(key, defaultValue = '0') {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
    } catch (error) {
        console.error(`localStorage error getting ${key}:`, error);
        return defaultValue;
    }
}

// Function to update attendance
function updateAttendance(subject, type) {
    const attendedElement = document.querySelector(`#${subject} .attended`);
    const totalElement = document.querySelector(`#${subject} .total`);
    const percentageElement = document.querySelector(`#${subject} .percentage`);

    let attendedCount = parseInt(attendedElement.textContent || '0');
    let totalCount = parseInt(totalElement.textContent || '0');

    if (type === 'present') {
        attendedCount++;
        totalCount++;
    } else if (type === 'absent') {
        totalCount++;
    }

    // Update local elements
    attendedElement.textContent = attendedCount;
    totalElement.textContent = totalCount;
    
    // Calculate percentage
    const percentage = totalCount > 0 
        ? Math.round((attendedCount / totalCount) * 100) 
        : 0;
    percentageElement.textContent = percentage;

    // Safe localStorage saving
    safeLocalStorageSet(`${subject}_attended`, attendedCount.toString());
    safeLocalStorageSet(`${subject}_total`, totalCount.toString());
    safeLocalStorageSet(`${subject}_percentage`, percentage.toString());

    // Update overall attendance
    updateOverallAttendance();
}

// Function to update overall attendance
function updateOverallAttendance() {
    let totalAttended = 0;
    let totalLectures = 0;

    subjects.forEach(subject => {
        const attendedElement = document.querySelector(`#${subject} .attended`);
        const totalElement = document.querySelector(`#${subject} .total`);
        
        totalAttended += parseInt(attendedElement.textContent || '0');
        totalLectures += parseInt(totalElement.textContent || '0');
    });

    const overallPercentage = totalLectures > 0 
        ? Math.round((totalAttended / totalLectures) * 100) 
        : 0;

    document.getElementById('overall-attendance').textContent = 
        `bubutendance: ${overallPercentage}%`;
}

// Function to restore attendance from localStorage
function restoreAttendance() {
    console.log("Restoring attendance data...");
    
    // Check localStorage support
    if (!window.localStorage) {
        console.error("localStorage is not supported");
        return;
    }

    subjects.forEach(subject => {
        const savedAttended = safeLocalStorageGet(`${subject}_attended`);
        const savedTotal = safeLocalStorageGet(`${subject}_total`);
        const savedPercentage = safeLocalStorageGet(`${subject}_percentage`);

        console.log(`Restored ${subject}: Attended=${savedAttended}, Total=${savedTotal}`);

        document.querySelector(`#${subject} .attended`).textContent = savedAttended;
        document.querySelector(`#${subject} .total`).textContent = savedTotal;
        document.querySelector(`#${subject} .percentage`).textContent = savedPercentage;
    });

    // Update overall attendance after restoring
    updateOverallAttendance();
}

// Event Listeners for Buttons
function setupEventListeners() {
    subjects.forEach(subject => {
        document.querySelector(`#${subject} .present`).addEventListener('click', () => updateAttendance(subject, 'present'));
        document.querySelector(`#${subject} .absent`).addEventListener('click', () => updateAttendance(subject, 'absent'));
        document.querySelector(`#${subject} .no-lecture`).addEventListener('click', () => updateAttendance(subject, 'no-lecture'));
        
        // Minus buttons for attended
        document.querySelector(`#${subject} .attended-minus`).addEventListener('click', () => {
            const attendedElement = document.querySelector(`#${subject} .attended`);
            let attendedCount = parseInt(attendedElement.textContent || '0');
            if (attendedCount > 0) {
                attendedCount--;
                attendedElement.textContent = attendedCount;
                safeLocalStorageSet(`${subject}_attended`, attendedCount.toString());
                updateOverallAttendance();
            }
        });

        // Minus buttons for total
        document.querySelector(`#${subject} .total-minus`).addEventListener('click', () => {
            const totalElement = document.querySelector(`#${subject} .total`);
            let totalCount = parseInt(totalElement.textContent || '0');
            if (totalCount > 0) {
                totalCount--;
                totalElement.textContent = totalCount;
                safeLocalStorageSet(`${subject}_total`, totalCount.toString());
                updateOverallAttendance();
            }
        });
    });
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing...");
    
    // Check localStorage support
    if (!window.localStorage) {
        console.error("localStorage is not supported in this browser");
        return;
    }

    // Setup event listeners
    setupEventListeners();

    // Restore previous attendance
    restoreAttendance();
});

// Add these functions at the end of the existing script, before the window.addEventListener('load', ...)

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
}

// Modify the existing window.addEventListener('load', ...) to include these:
window.addEventListener('load', () => {
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
    loadTheme();
    
    setupEventListeners();
    restoreAttendance();
});
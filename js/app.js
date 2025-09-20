
const APP_CONFIG = {
    apiBase: '/api',
    defaultImage: '/images/default-car.jpg'
};

// Authentication state
let currentUser = null;
let isAuthenticated = false;

// Initialize app
$(document).ready(function() {
    initializeApp();
});

// App initialization
function initializeApp() {
    checkAuthStatus();
    setupGlobalHandlers();
    updateNavigation();
}

// Authentication management
function checkAuthStatus() {
    const token = localStorage.getItem('jwtToken');
    const userData = localStorage.getItem('currentUser');

    isAuthenticated = !!token;

    if (isAuthenticated && userData) {
        try {
            currentUser = JSON.parse(userData);
        } catch (e) {
            clearAuthData();
            isAuthenticated = false;
        }
    } else {
        clearAuthData();
    }

    updateNavigation();
}

function updateNavigation() {
    const $authNav = $('#authNav');
    $authNav.empty();

    if (isAuthenticated && currentUser) {
        const isAdmin = currentUser.roles && currentUser.roles.includes('ROLE_ADMIN');

        let navHtml = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user-circle me-1"></i>${currentUser.username}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
        `;

        if (isAdmin) {
            navHtml += `
                <li><a class="dropdown-item" href="/admin.html">
                    <i class="fas fa-crown me-2"></i>Admin Dashboard
                </a></li>
                <li><hr class="dropdown-divider"></li>
            `;
        }

        navHtml += `
                    <li><a class="dropdown-item" href="/profile.html">
                        <i class="fas fa-user me-2"></i>Profile
                    </a></li>
                    <li><a class="dropdown-item" href="/my-bookings.html">
                        <i class="fas fa-list me-2"></i>My Bookings
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="logout()">
                        <i class="fas fa-sign-out-alt me-2"></i>Logout
                    </a></li>
                </ul>
            </li>
        `;

        $authNav.html(navHtml);
    } else {
        $authNav.html(`
            <li class="nav-item">
                <a class="nav-link" href="/login.html">
                    <i class="fas fa-sign-in-alt me-1"></i>Login
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="/register.html">
                    <i class="fas fa-user-plus me-1"></i>Register
                </a>
            </li>
        `);
    }
}

function loginUser(credentials) {
    return $.ajax({
        url: `${APP_CONFIG.apiBase}/auth/login`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(credentials)
    }).done(function(response) {
        localStorage.setItem('jwtToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify({
            username: response.username,
            roles: response.roles
        }));

        currentUser = {
            username: response.username,
            roles: response.roles
        };
        isAuthenticated = true;

        updateNavigation();
        return response;
    });
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        clearAuthData();
        updateNavigation();
        showAlert('You have been logged out successfully.', 'info');
        window.location.href = '/';
    }
}

function clearAuthData() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('currentUser');
    sessionStorage.clear();
    currentUser = null;
    isAuthenticated = false;
}

// API Utilities
function getAuthHeaders() {
    const token = localStorage.getItem('jwtToken');
    return token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : { 'Content-Type': 'application/json' };
}

function isAuthenticated() {
    return isAuthenticated && localStorage.getItem('jwtToken');
}

// UI Utilities
function showAlert(message, type = 'info', duration = 5000) {
    const alertTypes = {
        'success': 'alert-success',
        'info': 'alert-info',
        'warning': 'alert-warning',
        'danger': 'alert-danger'
    };

    const alertClass = alertTypes[type] || alertTypes.info;
    const alertIcon = getAlertIcon(type);

    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="${alertIcon} me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;

    $('#alert-container').length ?
        $('#alert-container').prepend(alertHtml) :
        $('.container').first().prepend(`<div id="alert-container" class="mb-3">${alertHtml}</div>`);

    // Auto-dismiss non-critical alerts
    if (type !== 'danger' && type !== 'warning' && duration > 0) {
        setTimeout(() => {
            $('.alert').first().alert('close');
        }, duration);
    }
}

function getAlertIcon(type) {
    const icons = {
        'success': 'fa-check-circle text-success',
        'info': 'fa-info-circle text-info',
        'warning': 'fa-exclamation-triangle text-warning',
        'danger': 'fa-exclamation-circle text-danger'
    };
    return icons[type] || icons.info;
}

function setLoadingState($element, isLoading = true) {
    if (isLoading) {
        $element.prop('disabled', true)
                .prepend('<span class="spinner-border spinner-border-sm me-2" role="status"></span>')
                .addClass('disabled');
    } else {
        $element.prop('disabled', false)
                .find('.spinner-border').remove()
                .removeClass('disabled');
    }
}

// Data Formatting (for your DTO fields)
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount || 0);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(dateString));
}

function formatVehicleName(vehicle) {
    if (!vehicle || !vehicle.model) return 'Unknown Vehicle';

    const parts = vehicle.model.split(' ');
    if (parts.length > 1) {
        return `${parts[0]} ${parts.slice(1).join(' ')}`;
    }
    return vehicle.model;
}

function getVehicleSpecs(vehicle) {
    if (!vehicle) return [];

    return [
        vehicle.year ? `${vehicle.year}` : '',
        vehicle.category ? vehicle.category : '',
        vehicle.fuelType ? vehicle.fuelType : '',
        vehicle.seats ? `${vehicle.seats} seats` : ''
    ].filter(Boolean).join(' • ');
}

// Form Validation
function validateForm($form, customRules = {}) {
    const isValid = $form[0].checkValidity();

    // Custom validation rules
    for (const [field, rule] of Object.entries(customRules)) {
        const $field = $form.find(`[name="${field}"]`);
        const value = $field.val();

        if (!rule.test(value)) {
            $field.addClass('is-invalid');
            isValid = false;
        } else {
            $field.removeClass('is-invalid');
        }
    }

    $form.addClass('was-validated');
    return isValid;
}

// Global Event Handlers
function setupGlobalHandlers() {
    // Global AJAX error handling
    $(document).ajaxError(function(event, xhr, settings) {
        // Don't handle errors for auth requests or if already handled
        if (settings.url.includes('auth') || $(event.target).hasClass('error-handled')) {
            return;
        }

        let message = 'An unexpected error occurred.';

        switch (xhr.status) {
            case 401:
                message = 'Session expired. Please login again.';
                logout();
                break;
            case 403:
                message = 'Access denied. You need additional permissions.';
                break;
            case 404:
                message = 'Resource not found.';
                break;
            case 500:
                message = 'Server error. Please try again later.';
                break;
            default:
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    message = xhr.responseJSON.message;
                }
        }

        showAlert(message, 'danger');
    });

    // Form validation enhancement
    $('form').on('submit', function(e) {
        const $form = $(this);
        if ($form.hasClass('needs-validation') && !validateForm($form)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    // Prevent double submission
    $('form').on('submit', function() {
        const $form = $(this);
        if ($form.data('submitted') === true) {
            return false;
        }
        $form.data('submitted', true);
    });
}

// Vehicle-specific utilities (for your VehicleDto)
function displayVehicleCard(vehicle, containerId = '#vehicleList') {
    if (!vehicle) return;

    const modelParts = vehicle.model ? vehicle.model.split(' ') : [];
    const make = modelParts[0] || 'Vehicle';
    const model = modelParts.slice(1).join(' ') || '';

    const vehicleHtml = `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100 shadow-sm vehicle-card">
                <img src="${vehicle.imageUrl || APP_CONFIG.defaultImage}"
                     class="card-img-top" alt="${vehicle.model || 'Vehicle'}"
                     style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="card-title mb-0">${make}</h5>
                            <small class="text-muted">${model}</small>
                        </div>
                        <span class="badge bg-success rounded-pill">${vehicle.status || 'Available'}</span>
                    </div>

                    <div class="small text-muted mb-3">
                        <div class="mb-1"><i class="fas fa-calendar me-1"></i>${vehicle.year || 'N/A'}</div>
                        <div class="mb-1"><i class="fas fa-couch me-1"></i>${vehicle.seats || 0} seats</div>
                        <div class="mb-1"><i class="fas fa-gas-pump me-1"></i>${vehicle.fuelType || 'N/A'}</div>
                        <div><i class="fas fa-palette me-1"></i>${vehicle.colour || 'N/A'}</div>
                    </div>

                    <div class="mt-auto">
                        <div class="h4 text-primary mb-2">${formatCurrency(vehicle.rentPrice)}</div>
                        <small class="text-muted mb-3">per day</small>
                        <button class="btn btn-primary w-100" onclick="selectVehicle(${vehicle.vehicleId})">
                            <i class="fas fa-calendar-check me-2"></i>Select Vehicle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    $(containerId).append(vehicleHtml);
}

function selectVehicle(vehicleId) {
    if (!isAuthenticated()) {
        showAlert('Please login to book a vehicle', 'warning');
        setTimeout(() => window.location.href = '/login.html', 1500);
        return false;
    }

    sessionStorage.setItem('selectedVehicleId', vehicleId);
    window.location.href = '/booking.html';
    return true;
}

// Booking utilities (for your RentDetailsDto)
function createBookingData(vehicleId, pickupDate, returnDate, requirements = '') {
    const today = new Date().toISOString().split('T')[0];

    return {
        date: today,
        pickupDate: pickupDate,
        returnDate: returnDate,
        vehicle: {
            vehicleId: vehicleId
        },
        requirements: requirements
    };
}

function calculateBookingCost(vehicle, pickupDate, returnDate) {
    if (!vehicle?.rentPrice || !pickupDate || !returnDate) {
        return { total: 0, days: 0 };
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const total = (vehicle.rentPrice || 0) * days;

    return { total, days };
}

// Export global functions
window.DriveNowApp = {
    // Auth
    checkAuthStatus,
    loginUser,
    logout,
    isAuthenticated,
    getAuthHeaders,

    // UI
    showAlert,
    setLoadingState,
    formatCurrency,
    formatDate,

    // Vehicle
    displayVehicleCard,
    selectVehicle,

    // Booking
    createBookingData,
    calculateBookingCost,

    // Forms
    validateForm
};

// Legacy support
window.app = window.DriveNowApp;
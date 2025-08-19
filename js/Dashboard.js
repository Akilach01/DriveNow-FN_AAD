$(document).ready(function() {
    // Check if user is authenticated
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = 'signin.html';
        return;
    }

    function makeAuthenticatedRequest(url, method, callback) {
        $.ajax({
            url: url,
            type: method,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + token);
            },
            success: function(response) {
                callback(response);
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    Swal.fire({
                        title: 'Session Expired',
                        text: 'Please login again',
                        icon: 'error'
                    }).then(() => {
                        localStorage.removeItem('jwtToken');
                        window.location.href = 'signin.html';
                    });
                } else if (xhr.status === 403) {
                    // Specifically handle 403 Forbidden (access denied)
                    $('#apiResponse').html(`
                        <div class="alert alert-danger">
                            <i class="fas fa-ban me-2"></i>
                            Access Denied: You don't have permission to access this resource
                        </div>
                    `);
                } else {
                    $('#apiResponse').html(`
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-circle me-2"></i>
                            ${xhr.responseJSON?.message || 'Request failed'}
                        </div>
                    `);
                }
            }
        });
    }

    function loadProtectedContent() {
        makeAuthenticatedRequest('http://localhost:8080/hello/user', 'GET', function(response) {
            $('#pageContent').html(`
            <div class="card dashboard-card">
                <div class="card-header">
                    <h5 class="card-title">
                        <i class="fas fa-tachometer-alt"></i>Welcome to Dashboard
                    </h5>
                </div>
                <div class="card-body">
                    <p class="card-text">
                        <i class="fas fa-info-circle me-2"></i>${response}
                    </p>
                    <div class="d-flex gap-3 flex-wrap action-buttons">
                        <button id="userBtn" class="btn btn-primary action-btn">
                            <i class="fas fa-user me-1"></i>User Endpoint
                        </button>
                        <button id="adminBtn" class="btn btn-warning action-btn">
                            <i class="fas fa-user-shield me-1"></i>Admin Endpoint
                        </button>
                        <button id="allBtn" class="btn btn-success action-btn">
                            <i class="fas fa-users me-1"></i>All Roles
                        </button>
                        <button id="logoutBtn" class="btn btn-danger action-btn">
                            <i class="fas fa-sign-out-alt me-1"></i>Logout
                        </button>
                    </div>
                    <div id="apiResponse" class="mt-4"></div>
                </div>
            </div>
        `);


            $('#userBtn').click(function() {
                makeAuthenticatedRequest('http://localhost:8080/hello/user', 'GET', function(response) {
                    $('#apiResponse').html(`
                        <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>${response}
                        </div>
                    `);
                });
            });

            $('#adminBtn').click(function() {
                console.log("Token: " + token);
                makeAuthenticatedRequest('http://localhost:8080/hello/admin', 'GET', function(response) {
                    console.log("Response: " + response);
                    $('#apiResponse').html(`
                        <div class="alert alert-warning">
                            <i class="fas fa-check-circle me-2"></i>${response}
                        </div>
                    `);
                });
            });

            $('#allBtn').click(function() {
                makeAuthenticatedRequest('http://localhost:8080/hello/all', 'GET', function(response) {
                    $('#apiResponse').html(`
                        <div class="alert alert-info">
                            <i class="fas fa-check-circle me-2"></i>${response}
                        </div>
                    `);
                });
            });

            $('#logoutBtn').click(function() {
                localStorage.removeItem('jwtToken');
                window.location.href = 'signin.html';
            });
        });
    }

    loadProtectedContent();
});
$(document).ready(function() {
    $('.btn-primary').click(function() {
        const username = $('#name').val();
        const password = $('#password').val();

        const authData = {
            username: username,
            password: password
        };

        $.ajax({
            url: 'http://localhost:8080/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(authData),
            success: function(response) {
                localStorage.setItem('jwtToken', response.data.accessToken);

                Swal.fire({
                    title: 'Success!',
                    text: 'Login successful',
                    icon: 'success'
                }).then(() => {
                    window.location.href = 'dashboard.html';
                });
            },
            error: function(xhr) {
                let errorMsg = xhr.responseJSON?.message || 'Login failed';
                if (xhr.status === 401) {
                    errorMsg = 'Invalid username or password';
                }

                Swal.fire({
                    title: 'Error!',
                    text: errorMsg,
                    icon: 'error'
                });
            }
        });
    });
});
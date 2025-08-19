$(document).ready(function() {
    $('#signup-form').submit(function(e) {
        e.preventDefault();

        const username = $('#name').val();
        const email = $('#email').val();
        const password = $('#password').val();

        const registerData = {
            username: username,
            email: email,
            password: password,
            role: "USER"
        };

        $.ajax({
            url: 'http://localhost:8080/auth/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(registerData),
            success: function(response) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Registration successful. Please sign in.',
                    icon: 'success'
                }).then(() => {
                    window.location.href = 'signin.html';
                });
            },
            error: function(xhr) {
                Swal.fire({
                    title: 'Error!',
                    text: xhr.responseJSON?.message || 'Registration failed',
                    icon: 'error'
                });
            }
        });
    });
});
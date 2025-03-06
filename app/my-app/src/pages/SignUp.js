import React from 'react';

function SignUp() {
    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#0d6efe',
        },
        formContainer: {
            backgroundColor: 'white',
            padding: '50px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            width: '420px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        formItem: {
            marginBottom: '20px',
            width: '100%',
        },
        label: {
            marginBottom: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'block',
        },
        input: {
            padding: '12px',
            fontSize: '18px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            width: '100%',
            boxSizing: 'border-box',
        },
        button: {
            width: '100%',
            padding: '15px',
            backgroundColor: '#0d6efe',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            transition: 'background 0.3s',
        },
        buttonHover: {
            backgroundColor: '#0b5ed7',
        },
        loginText: {
            marginTop: '15px',
            fontSize: '16px',
            textAlign: 'center',
        },
        loginLink: {
            color: '#0d6efe',
            textDecoration: 'none',
            fontWeight: 'bold',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h2>Create An Account</h2>
                <form style={{ width: '100%' }}>
                    <div style={styles.formItem}>
                        <label htmlFor="firstName" style={styles.label}>First Name</label>
                        <input type="text" id="firstName" name="firstName" required style={styles.input} />
                    </div>
                    <div style={styles.formItem}>
                        <label htmlFor="lastName" style={styles.label}>Last Name</label>
                        <input type="text" id="lastName" name="lastName" required style={styles.input} />
                    </div>
                    <div style={styles.formItem}>
                        <label htmlFor="email" style={styles.label}>Email</label>
                        <input type="email" id="email" name="email" required style={styles.input} />
                    </div>
                    <div style={styles.formItem}>
                        <label htmlFor="password" style={styles.label}>Password</label>
                        <input type="password" id="password" name="password" required style={styles.input} />
                    </div>
                    <div style={styles.formItem}>
                        <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" required style={styles.input} />
                    </div>
                    <div style={styles.formItem}>
                        <button type="submit" style={styles.button}>Sign Up</button>
                    </div>
                </form>
                <p style={styles.loginText}>Already have an account? <a href="/" style={styles.loginLink}>Log in</a></p>
            </div>
        </div>
    );
}

export default SignUp;

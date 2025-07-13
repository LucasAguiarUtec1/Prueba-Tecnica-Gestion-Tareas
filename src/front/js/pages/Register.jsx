import React, { useState, useContext, useRef } from "react";
import { Context } from "../store/appContext";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";


const Register = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const toastRef = useRef(null);
    const toastRefError = useRef(null);
    const [successRegister, setSuccessRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [username, setUsername] = useState("");
    const [messageSucces, setMessageSucces] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [errors, setErrors] = useState({
        "email": "", "password": "", "username": "", "repeatPassword": ""
    })

    const handleSubmitForm = async (e) => {
        e.preventDefault();
        const newErrors = {"email": "", "password": "", "username": "", "repeatPassword": ""}
        let valid = true;
        if (email.trim() === '') {
            newErrors.email = "Email es obligatorio";
            valid = false;
        }

        if (username.trim() === '') {
            newErrors.username = "Nombre de usuario es obligatorio";
            valid = false;
        }

        if (password.trim() === '') {
            newErrors.password = "Contraseña es obligatoria";
            valid = false;
        }

        if (repeatPassword.trim() === '') {
            newErrors.repeatPassword = "Es obligaotrio confirmar la contraseña";
            valid = false
        }

        if (password.trim() !== '' && repeatPassword.trim() !== '' && password.trim() !== repeatPassword.trim()) {
            newErrors.password = 'Las contraseñas deben coincidir';
            newErrors.repeatPassword = 'Las contraseñas deben coincidir';
        }

        setErrors(newErrors);

        if (valid) {
            try {
                const message = await actions.register(email, username, password);

                const toast = new bootstrap.Toast(toastRef.current);
                setMessageSucces(message);
                toast.show();
                setSuccessRegister(true);
            } catch (error) {
                console.error("Error en registro", error)
                setErrorMessage(error.message);
                const toast = new bootstrap.Toast(toastRefError.current);
                toast.show();
            }
        }

    }
    
    return (
        <div className="container-fluid bg-dark vh-100 vw-100 d-flex flex-column justify-content-center align-items-center">
                <div aria-live="polite" aria-atomic="true" className="position-fixed top-0 end-0 p-3" style={{zIndex: 1080}}>
                    <div ref={toastRef} className="toast bg-success shadow" role="alert" aria-live="assertive" aria-atomic="true">
                        <div className="toast-header">
                        <strong className="me-auto">Informacion</strong>
                        <small>ahora</small>
                        <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div className="toast-body">
                            {messageSucces}.
                        </div>
                    </div>
                </div>
                <div aria-live="polite" aria-atomic="true" className="position-fixed top-0 end-0 p-3" style={{zIndex: 1080}}>
                    <div ref={toastRefError} className="toast bg-danger shadow" role="alert" aria-live="assertive" aria-atomic="true">
                        <div className="toast-header">
                        <strong className="me-auto">Informacion</strong>
                        <small>ahora</small>
                        <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                        </div>
                        <div className="toast-body">
                            {errorMessage}.
                        </div>
                    </div>
                </div>
            <div className={`row w-100 ${!successRegister ? '' : 'd-none'}`}>
                <div className="shadow-lg col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 p-4 mb-5 bg-light rounded-3 mx-auto">
                    <form onSubmit={(e) => handleSubmitForm(e)}>
                        <div className="d-flex flex-column">
                            <div className="d-flex flex-column justify-content-center align-items-center">
                                <h1 className="h1 mt-2">Registrarme</h1>
                            </div>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`form-control ${errors.email !== '' ? 'is-invalid' : ''}`} id="email"></input>
                            <div id="validationEmail" className="invalid-feedback">
                                {errors.email}.
                            </div>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Nombre de Usuario</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={`form-control ${errors.username !== '' ? 'is-invalid' : ''}`} id="username"></input>
                            <div id="validationUsername" className="invalid-feedback">
                                {errors.username}.
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label" htmlFor="password">Contraseña</label>
                            <input type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} className={`form-control ${errors.password !== '' ? 'is-invalid': ''}`} id="password"></input>
                            <div id="validationPassword" className="invalid-feedback">
                                {errors.password}.
                            </div>
                        </div>
                        <div>
                            <label className="form-label" htmlFor="repeatPassword">Confirmar Contraseña</label>
                            <input type="password" autoComplete="off" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} className={`form-control ${errors.repeatPassword !== '' ? 'is-invalid': ''}`} id="repeatPassword"></input>
                            <div id="validationRepeatPassword" className="invalid-feedback">
                                {errors.repeatPassword}.
                            </div>
                        </div>
                        <button type="submit" className="btn btn-outline-primary mx-auto mt-3">Registrarme</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className={`row w-100 ${successRegister ? '' : 'd-none'}`}>
                <div className="shadow-lg col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 p-4 mb-5 bg-light rounded-3 mx-auto d-flex flex-column justify-content-center align-items-center">
                    <h2 className="h2">Registro completado</h2>
                    <button type="button" onClick={() => navigate("/login")} className="btn btn-outline-primary mx-auto mt-3">Ir a iniciar sesion</button>
                </div>
            </div>
        </div>
    )
}

export default Register;
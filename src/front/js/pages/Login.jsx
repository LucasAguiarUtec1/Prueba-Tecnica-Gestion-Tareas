import React, {useState, useContext, useRef} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

const Login = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const toastRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({
        "email": "", "password": ""
    })
    const [disabledButton, setDisabledButton] = useState(false);


    const handleSubmitForm = async (e) => {
        e.preventDefault();
        const newErrors = {"email": "", "password": ""}
        let valid = true;
        if (email.trim() === '') {
            newErrors.email = "Email es obligatorio";
            valid = false;
        }

        if (password.trim() === '') {
            newErrors.password = "Contraseña es obligatoria";
            valid = false;
        }

        setErrors(newErrors);

        if (valid) {
            setDisabledButton(true);
            try {
                const data = await actions.login(email, password);
                localStorage.setItem('acces_token', data.acces_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setDisabledButton(false);
                navigate('/tasks')
            } catch (error) {
                console.error("Error al iniciar sesion", error)
                setErrorMessage(error.message);
                const toast = new bootstrap.Toast(toastRef.current);
                toast.show();
                setDisabledButton(false);
            }
        }

    }
    
    return (
        <div className="container-fluid bg-dark vh-100 vw-100 d-flex justify-content-center align-items-center">
            <div aria-live="polite" aria-atomic="true" className="position-fixed top-0 end-0 p-3" style={{zIndex: 1080}}>
                    <div ref={toastRef} className="toast bg-danger shadow" role="alert" aria-live="assertive" aria-atomic="true">
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
            <div className="row w-100">
                <div className="shadow-lg col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4 p-4 mb-5 bg-light rounded-3 mx-auto">
                    <form onSubmit={(e) => handleSubmitForm(e)}>
                        <div className="d-flex flex-column">
                            <div className="d-flex flex-column justify-content-center align-items-center">
                                <FontAwesomeIcon icon={faUser} size="2xl" style={{color: "#006efd",}} />
                                <h3 className="h3 mt-2">Iniciar Sesion</h3>
                            </div>
                            <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`form-control ${errors.email !== '' ? 'is-invalid' : ''}`} id="email"></input>
                            <div id="validationServerUsernameFeedback" className="invalid-feedback">
                                {errors.email}.
                            </div>
                        </div>
                        <div className="mb-5">
                            <label className="form-label" htmlFor="password">Contraseña</label>
                            <input type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} className={`form-control ${errors.password !== '' ? 'is-invalid': ''}`} id="password"></input>
                            <div id="validationServerUsernameFeedback" className="invalid-feedback">
                                {errors.password}.
                            </div>
                        </div>
                        <button type="submit" disabled={disabledButton} className="btn btn-outline-primary mx-auto mb-2">Iniciar Sesion</button>
                        <a href="#" dis onClick={() => navigate('/register')} className="link-primary mx-auto mb-2">¿Aun no estas registrado? Registrate Aqui</a>
                        <a href="#" className="link-primary mx-auto mb-2">Olvide mi contraseña</a>
                        </div>
                    </form>
                </div>
            </div>

            
        </div>
    )
}

export default Login;
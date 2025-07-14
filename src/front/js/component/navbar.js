import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
    const navigate = useNavigate();
    const handleLogut = () => {
        localStorage.clear();
        navigate('/login');
    }
    
	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid d-flex">
                    <a className="navbar-brand" href="#">Mi Lista de tareas</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <div className="d-flex ms-auto mt-2">
                        <button onClick={handleLogut} className="btn btn-outline-danger">Cerrar Sesion</button>
                    </div>
                    </div>
                </div>
		</nav>
	);
};

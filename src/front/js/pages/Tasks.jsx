import React, {useEffect, useState, useContext, useRef} from "react";
import { Navbar } from "../component/navbar";
import { useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";


const Tasks = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(Context);
    const [tasks, setTasks] = useState([]);
    const [task, setTask] = useState("");
    const toastRef = useRef(null);
    const toastRefError = useRef(null);
    const [messageSucces, setMessageSucces] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [disableButton, setDisableButton] = useState(false);
    const [disableDeleteButton, setDisableDeleteButton] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingTask, setEditingTask] = useState(-1);
    const [actualTaskValue, setActualTaskValue] = useState("")
    const inputRef = useRef(null)
    const tasksPerPage = 5;
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
    const totalPage = Math.ceil(tasks.length / tasksPerPage);

    useEffect(() => {
        if ((!localStorage.getItem('acces_token') || localStorage.getItem('acces_token').trim() === '') || 
        (!localStorage.getItem('user') || localStorage.getItem('user').trim() === '')) {
            navigate('/login');
        }
    }, []);

    useEffect(()=> {
        const fetchTasks = async() => {
            try {
                const resp = await actions.getTasks(localStorage.getItem("acces_token"));
                setTasks(resp);
            } catch (error) {
                console.error("Error al obtener tareas", error);
                const toast = new bootstrap.Toast(toastRefError.current);
                setErrorMessage(error.message);
                toast.show();
            }
        }
        fetchTasks();
        
    }, [])

    useEffect(() => {
    const totalPages = Math.ceil(tasks.length / tasksPerPage);
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }
    }, [tasks]);

    useEffect(() => {
        if (editingTask === null || editingTask < 0 || actualTaskValue === "") return;
        const updatetask = async (refInput) => {
            refInput.current.disabled = true;
            try {
                const resp = await actions.updateTask(actualTaskValue, false, editingTask, localStorage.getItem('acces_token'));
                setTasks((prev) =>
                    prev.map((t) =>
                        t.id === editingTask ? { ...t, label: actualTaskValue } : t
                    )
                );
                const toast = new bootstrap.Toast(toastRef.current);
                setMessageSucces(resp);
                toast.show();
                refInput.current.disabled = false;
            } catch (error) {
                console.error("Error al actualizar tarea", error);
                const toast = new bootstrap.Toast(toastRefError.current);
                setErrorMessage(error.message);
                toast.show();
                refInput.current.disabled = false;
            } finally {
                setEditingTask(null);
                setActualTaskValue("");
            }
        };

        const handleClickOutsideInput = async (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                await updatetask(inputRef);
            }
        };

        document.addEventListener("mousedown", handleClickOutsideInput);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideInput);
        };
    }, [editingTask, actualTaskValue]);


    const handleCreateTask = async () => {
        if (task.trim() === '') {
            const toast = new bootstrap.Toast(toastRefError.current);
            setErrorMessage("No debe ingresar una tarea para poder agregarla")
            toast.show();
        }
        else {
            setDisableButton(true);
            try {
                const resp = await actions.addTask(JSON.parse(localStorage.getItem("user")).email, task, localStorage.getItem("acces_token"));

                setTasks((prev) => (
                    [...prev, resp]
                ));

                const toast = new bootstrap.Toast(toastRef.current);
                setMessageSucces("Tarea Agregada");
                toast.show()
                setTask("");
                setDisableButton(false);
            } catch (error) {
                console.error("Error al agregar la tarea", error);
                const toast = new bootstrap.Toast(toastRefError.current);
                setErrorMessage(error.message);
                toast.show();
                setDisableButton(false);
            }

        }
    }

    const handleDeleteTask = async(taskId) => {
        setDisableDeleteButton(true);
        try {
            const resp = await actions.deleteTask(taskId, localStorage.getItem('acces_token'));
            setTasks((prev) => (
                prev.filter((t) => t.id !== taskId)
            ));
            const toast = new bootstrap.Toast(toastRef.current);
            setMessageSucces(resp);
            toast.show();
            setDisableDeleteButton(false);
        } catch (error) {
            console.error("Error al eliminar tarea", error);
            const toast = new bootstrap.Toast(toastRefError.current);
            setErrorMessage(error.message);
            toast.show();
            setDisableDeleteButton(false);
        }
    }

    const handleUpdateTask = async (taskId) => {
        try {
            const resp = await actions.updateTask('' , true,taskId, localStorage.getItem('acces_token'));
            setTasks((prev) => (
                prev.map((t) => t.id === taskId ? {...t, completed: true} : t)
            ))
            const toast = new bootstrap.Toast(toastRef.current);
            setMessageSucces(resp);
            toast.show();
        } catch (error) {
            console.error("Error al actualizar tarea", error);
            const toast = new bootstrap.Toast(toastRefError.current);
            setErrorMessage(error.message);
            toast.show();
        }
    }

    const handleEditTask = (taskId, taskValue) => {
        setEditingTask(taskId)
        setActualTaskValue(taskValue)
    }

    return (
        <div>
            <Navbar />
            <div className="container-fluid bg-dark vh-100 d-flex flex-column align-items-center">
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
                <div className="row w-100 mt-4">
                        <form className="row w-100 justify-content-center align-items-center">
                            <div className="col-12 col-md-6">
                                <div className="form-floating">
                                <input type="text" className="form-control" value={task} onChange={(e) => setTask(e.target.value)} id="task" placeholder="Nueva Tarea" />
                                <label htmlFor="task">Nueva Tarea</label>
                                </div>
                            </div>
                            <div className="col-12 col-md-2 mt-2 mt-md-0">
                                <button disabled={disableButton} onClick={handleCreateTask} type="button" className="btn btn-success btn-lg w-100">Agregar Tarea</button>
                            </div>
                        </form>
                    </div>
                <div className="row w-100 mt-4 justify-content-center align-items-center">
                    <div className="col-12 col-md-10 col-lg-10 col-xl-8">
                        <table className="table table-striped table-light">
                            <thead>
                                <tr className="table-light">
                                    <th scope="col">#</th>
                                    <th scope="col">Tarea</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTasks && currentTasks.map((t) => (
                                    <tr key={t.id}>
                                    <th scope="row">{t.id}</th>
                                    <td>
                                        {editingTask !== t.id ? (
                                            <>
                                            <span
                                                style={{ cursor: "pointer" }}
                                                onClick={() => handleEditTask(t.id, t.label)}
                                            >
                                                {t.label}
                                            </span>
                                            </>
                                        ) : (
                                            <>
                                            <input
                                                type="text"
                                                ref={inputRef}
                                                className="form-control"
                                                value={actualTaskValue}
                                                onChange={(e) => setActualTaskValue(e.target.value)}
                                                placeholder="Nueva Tarea"
                                            />
                                            </>
                                        )}
                                    </td>
                                    <td>
                                        <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={`flexSwitchCheckDefault-${t.id}`}
                                            disabled={t.completed}
                                            checked={t.completed}
                                            onChange={() => handleUpdateTask(t.id)}
                                            style={{backgroundColor: t.completed ? '#198754' : '', borderColor: t.completed ? '#198754' : ''}}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor={`flexSwitchCheckDefault-${t.id}`}
                                        >
                                            {t.completed ? "Completada" : "No Completada"}
                                        </label>
                                        </div>
                                    </td>
                                    <td>
                                        <button disabled={disableDeleteButton} onClick={() => handleDeleteTask(t.id)} type="button" className="btn btn-outline-danger">
                                        Borrar Tarea
                                        </button>
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <nav>
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Anterior</button>
                                </li>

                                {[...Array(totalPage)].map((_, i) => (
                                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                </li>
                                ))}

                                <li className={`page-item ${currentPage === totalPage ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Siguiente</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Tasks;
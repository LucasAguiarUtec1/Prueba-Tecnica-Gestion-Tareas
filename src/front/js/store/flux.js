const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			]
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},
			register: async (email, username, password) => {
				const resp = await fetch(process.env.BACKEND_URL + "/api/register", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						"username": username,
						"email": email,
						"password": password
					})
				});

				const data = await resp.json();
				if (!resp.ok) {
					throw new Error(data.error);
				}
				return data.message
			},
			login: async(email, password) => {
				const resp = await fetch(process.env.BACKEND_URL + "/api/login", {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						"email": email,
						"password": password
					})
				});
				const data = await resp.json();

				if(!resp.ok) {
					throw new Error(data.error);
				}
				return data;
			},
			getTasks: async(token) => {
				const resp = await fetch(process.env.BACKEND_URL + `/api/tasks`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					}
				});

				const data = await resp.json();
				
				if (!resp.ok) {
					throw new Error(data.error);
				}
				return data.tasks;
			},
			addTask: async (email, label, token) => {
				const resp = await fetch(process.env.BACKEND_URL + `/api/tasks`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({
						"email": email,
						"label": label
					})
				});

				const data = await resp.json();
				if (!resp.ok) {
					throw new Error(data.error);
				}

				return data.task;
			}
			,
			deleteTask: async(taskId, token) => {
				const resp = await fetch(process.env.BACKEND_URL + `/api/tasks/${taskId}`, {
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					}
				});

				const data = await resp.json();
				if (!resp.ok) {
					throw new Error(data.error);
				}
				return data.message;
			}
			,
			updateTask: async (label, completed ,taskId, token) => {
				const resp = await fetch(process.env.BACKEND_URL + `/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({
						'label': label !== '' ? label : "",
						'completed': completed
					})
				});

				const data = await resp.json();
				if (!resp.ok) {
					throw new Error(data.error);
				}
				return data.message;
			}
			,
			logout: async (token) => {
				const resp = await fetch(process.env.BACKEND_URL + '/api/logout', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					}
				})

				const data = await resp.json();
				if (!resp.ok) {
					throw new Error("Ocurrio un error al cerrar la session");
				}
				return data.message;
			}
			,
			getMessage: async () => {
				try{
					// fetching data from the backend\
					console.log('URL BACKEND: ' + process.env.BACKEND_URL);
					const resp = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				}catch(error){
					console.log("Error loading message from backend", error)
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			}
		}
	};
};

export default getState;

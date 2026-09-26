import axios from "axios";// Note: Ensure you import from 'axios', not 'origin-axios' if that was a typo in your package.json, standard is just 'axios'

// Standard Axios import
// import axios from 'axios'; 

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
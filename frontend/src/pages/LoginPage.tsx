import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);
            alert('Login réussi ✅');
            navigate('/home'); // Redirection vers page d'accueil
        } catch (error) {
            alert('Erreur de login ❌');
        }
    };

    return (
        <div>
            <h2>Connexion</h2>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Se connecter</button>
        </div>
    );
};

export default LoginPage;

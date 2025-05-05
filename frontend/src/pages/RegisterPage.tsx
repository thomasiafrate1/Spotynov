import { useState } from 'react';
import api from '../api/api';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        try {
            await api.post('/auth/register', { username, password });
            alert('Inscription réussie ✅');
        } catch (error) {
            alert('Erreur d\'inscription ❌');
        }
    };

    return (
        <div>
            <h2>Inscription</h2>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleRegister}>S\'inscrire</button>
        </div>
    );
};

export default RegisterPage;

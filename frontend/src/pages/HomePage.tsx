import { useState, useEffect } from 'react';
import api from '../api/api';

const HomePage = () => {
    const [newGroupName, setNewGroupName] = useState('');
    const [groups, setGroups] = useState<string[]>([]);

    const handleJoinGroup = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Vous devez être connecté');
                return;
            }

            await api.post('/groups/join', { groupName: newGroupName }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            alert(`Vous avez rejoint le groupe : ${newGroupName}`);
            setNewGroupName('');
            fetchGroups(); // ➔ Rafraîchir la liste après rejoindre
        } catch (error) {
            alert('Erreur lors de la tentative de rejoindre un groupe');
        }
    };

    const fetchGroups = async () => {
        try {
            const response = await api.get('/groups');
            setGroups(response.data.groups);
        } catch (error) {
            console.error('Erreur en récupérant les groupes', error);
        }
    };

    useEffect(() => {
        fetchGroups(); // ➔ Charger les groupes au chargement de la page
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>Bienvenue sur SpotYnov 🎵</h1>

            {/* Formulaire pour rejoindre un groupe */}
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                width: '300px'
            }}>
                <h2>Rejoindre un Groupe</h2>
                <input
                    type="text"
                    placeholder="Nom du groupe"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
                />
                <button onClick={handleJoinGroup} style={{ width: '100%', padding: '8px' }}>
                    Rejoindre
                </button>
            </div>

            {/* Liste des groupes existants */}
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '20px',
                width: '300px'
            }}>
                <h2>Groupes existants :</h2>
                {groups.length > 0 ? (
                    <ul>
                        {groups.map((groupName) => (
                            <li key={groupName}>{groupName}</li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun groupe disponible.</p>
                )}
            </div>
        </div>
    );
};

export default HomePage;

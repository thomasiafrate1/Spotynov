import { useState, useEffect } from 'react';
import api from '../api/api';

const HomePage = () => {
    const [newGroupName, setNewGroupName] = useState('');
    const [groups, setGroups] = useState<string[]>([]);
    const [spotifyInfo, setSpotifyInfo] = useState<SpotifyInfo | null>(null);


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
            fetchGroups();
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
    
    const fetchSpotifyInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
    
            const response = await api.get('/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            console.log('🎯 Résultat de /auth/me :', response.data);
    
            if (response.data.spotify) {
                console.log('🎯 Spotify connecté :', response.data.spotify);
                setSpotifyInfo(response.data.spotify);
            } else {
                console.log('❌ Pas de compte Spotify connecté');
            }
        } catch (error) {
            console.error('Erreur en récupérant le profil Spotify', error);
        }
    };
    
    
    

    useEffect(() => {
        fetchGroups();
        fetchSpotifyInfo();
    }, []);

    const handleConnectSpotify = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vous devez être connecté pour lier Spotify.');
            return;
        }
        window.location.href = `http://localhost:5500/api/spotify/connect?token=${token}`;
    };
    

    return (
        <div style={{ padding: '20px' }}>
            <h1>Bienvenue sur SpotYnov 🎵</h1>
            {spotifyInfo && (
                <h1>Bienvenue, {spotifyInfo.displayName} 👋</h1>
            )}
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
            <div style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
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
            <div style={{
                border: '1px solid #1DB954',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                width: '300px'
            }}>
                <h2>Spotify</h2>
                <button onClick={handleConnectSpotify} style={{ width: '100%', padding: '8px', backgroundColor: '#1DB954', color: 'white', border: 'none' }}>
                    Connecter mon compte Spotify 🎵
                </button>
            </div>
        </div>
    );
};

export default HomePage;

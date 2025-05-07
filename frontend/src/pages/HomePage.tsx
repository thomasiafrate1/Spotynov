import { useState, useEffect } from 'react';

import api from '../api/api';
import "./HomePage.css"

interface SpotifyInfo {
    displayName: string;
}
interface UserInfo {
    username: string;
    group: {
        name: string;
        isAdmin: boolean;
    } | null;
    spotify: SpotifyInfo | null;
}
interface Track {
    name: string;
    artists: { name: string }[];
}
interface Artist {
    name: string;
}

const HomePage = () => {
    const [newGroupName, setNewGroupName] = useState('');
    const [groups, setGroups] = useState<string[]>([]);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [recentTracks, setRecentTracks] = useState<Track[]>([]);
    const [topTracks, setTopTracks] = useState<Track[]>([]);
    const [topArtists, setTopArtists] = useState<Artist[]>([]);
    const [topGenres, setTopGenres] = useState<string[]>([]);
    const [currentTrack, setCurrentTrack] = useState<{ name: string; artist: string; image: string; } | null>(null);

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
            fetchUserInfo();
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

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await api.get('/auth/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUserInfo(response.data);
        } catch (error) {
            console.error('Erreur en récupérant le profil utilisateur', error);
        }
    };

    const fetchSpotifyData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const [recentRes, topTracksRes, topArtistsRes] = await Promise.all([
                api.get('/spotify/recent-tracks', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                api.get('/spotify/top-tracks', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                api.get('/spotify/top-artists', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setRecentTracks(recentRes.data.map((item: any) => item.track));
            setTopTracks(topTracksRes.data);
            setTopArtists(topArtistsRes.data);
            const allGenres = topArtistsRes.data.flatMap((artist: any) => artist.genres);
            const uniqueGenres = Array.from(new Set(allGenres));
            setTopGenres(uniqueGenres.slice(0, 5));
        } catch (error) {
            console.error('Erreur lors du chargement des données Spotify', error);
        }
    };

    const fetchCurrentTrack = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await api.get('/spotify/current-track', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setCurrentTrack(response.data);
        } catch (error) {
            console.error('Erreur en récupérant la musique actuelle', error);
        }
    };
    
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (profileOpen) {
            fetchCurrentTrack();
            interval = setInterval(() => {
                fetchCurrentTrack(); 
            }, 5000);
        }
        return () => clearInterval(interval); 
    }, [profileOpen]);

    useEffect(() => {
        fetchGroups();
        fetchUserInfo();
    }, []);

    const handleConnectSpotify = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vous devez être connecté pour lier Spotify.');
            return;
        }
        window.location.href = `http://localhost:5500/api/spotify/connect?token=${token}`;
    };

    const toggleProfile = () => {
        setProfileOpen(!profileOpen);
        if (!profileOpen) {
            fetchSpotifyData();
        }
    };

    return (
        <div className="home-container">
            <h1 className="title-main">Bienvenue sur SpotYnov </h1>
            {userInfo?.spotify && (
                <h1 className="title-clickable" onClick={toggleProfile}>
                    Bienvenue, {userInfo.spotify.displayName}
                </h1>
            )}
            {profileOpen && userInfo && (
                <div className="profile-container">
                    <h2>Profil</h2>
                    <p><strong>Nom user :</strong> {userInfo.username}</p>
                    {userInfo.group ? (
                        <>
                            <p><strong>Groupe :</strong> {userInfo.group.name}</p>
                            <p><strong>Rôle :</strong> {userInfo.group.isAdmin ? 'Admin' : 'Membre'}</p>
                        </>
                    ) : (
                        <p><strong>Groupe :</strong> Aucun groupe</p>
                    )}
                    {userInfo.spotify && (
                        <p><strong>Compte Spotify :</strong> {userInfo.spotify.displayName}</p>
                    )}
                    <div className="profile-section">
                        <h3>10 Derniers Morceaux Écoutés :</h3>
                        <ul>
                            {recentTracks.map((track, index) => (
                                <li key={index}>
                                    {track.name} - {track.artists.map(artist => artist.name).join(', ')}
                                </li>
                            ))}
                        </ul>
                        <h3>Top 5 Musiques :</h3>
                        <ul>
                            {topTracks.map((track, index) => (
                                <li key={index}>
                                    {track.name} - {track.artists.map(artist => artist.name).join(', ')}
                                </li>
                            ))}
                        </ul>
                        <h3>Top 5 Artistes :</h3>
                        <ul>
                            {topArtists.map((artist, index) => (
                                <li key={index}>{artist.name}</li>
                            ))}
                        </ul>
                        <h3>Top Genres :</h3>
                        <ul>
                            {topGenres.length > 0 ? (
                                topGenres.map((genre, index) => (
                                    <li key={index}>{genre}</li>
                                ))
                            ) : (
                                <p>Aucun genre trouvé</p>
                            )}
                        </ul>
                        {currentTrack && (
                            <div style={{ marginTop: '20px' }}>
                                <h3>Musique en Cours :</h3>
                                <img className="album-image" src={currentTrack.image} alt="Album cover" />
                                <p><strong>{currentTrack.name}</strong> - {currentTrack.artist}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className="block-container">
                <h2>Rejoindre un Groupe</h2>
                <input type="text" placeholder="Nom du groupe" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}/>
                <button onClick={handleJoinGroup} style={{ width: '100%', padding: '8px' }}>Rejoindre</button>
            </div>
            <div className="block-container">
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
            <div className="block-spotify">
                <h2>Spotify</h2>
                <button onClick={handleConnectSpotify}>Connecter mon compte Spotify</button>
            </div>
        </div>
    );
};

export default HomePage;

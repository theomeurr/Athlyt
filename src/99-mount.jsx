// athlyt-mount.jsx — point d'entrée. Doit être chargé EN DERNIER (après tous les
// composants) : le rendu déclenche App qui référence tous les écrans/overlays.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);

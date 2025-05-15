import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // No longer directly needed for logout navigation if App.js handles it
import './MainPage.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// If your logo is in clientapp/src/img/logo.png, you should import it like this:
// import logoImage from '../../img/logo.png'; 
// And then use <img src={logoImage} ... />
// For this example, we'll assume the logo is in clientapp/public/img/logo.png

function MainPage({ onLogout }) { // Accept onLogout prop
  const [userName, setUserName] = useState('...');
  const [form, setForm] = useState({
    adresse_mission: '',
    adresse_destination: '',
    ville: '',
    type_mission: '',
    type_ambulance: '',
    etat_mission: '',
    date_mission: '',
    cause: '',
    bon_de_commande: '',
    demande_materiel: '',
    docteur: '',
    prix: '',
    mode_paiement: '',
    statut_paiement: '',
    nom_patient: '',
    prenom_patient: '',
    telephone_patient: '',
    adresse_patient: '',
    ville_patient: ''
  });
  const [interventions, setInterventions] = useState([]);
  const [patients, setPatients] = useState([]); // Nouvel état pour stocker les patients
  const [missions, setMissions] = useState([]); // Nouvel état pour stocker les missions

  // Exemples de listes statiques (à remplacer par des fetch API si besoin)
  const villes = ['Casablanca', 'Rabat', 'Marrakech'];
  const typesMission = ['Téléconsultation', 'Consultation à domicile', 'ambulance', 'acte infirmier'];
  const etatsMission = ['planifiée','urgente','Aller-Retour'];
  const causes = [
    'Perte de connaissance / personne inconsciente',
    'Douleur thoracique intense (suspicion de crise cardiaque)',
    'Difficulté respiratoire sévère',
    'Traumatisme grave (accident de la route, chute de hauteur, etc.)',
    'Hémorragie importante (saignement incontrôlable)',
    'Brûlures graves ou étendues',
    'AVC (paralysie soudaine, trouble de la parole, visage déformé)',
    'Convulsions (épilepsie ou crise inexpliquée)',
    'Alerte allergique grave (choc anaphylactique)',
    'Noyade ou quasi-noyade',
    'Intoxication volontaire ou accidentelle (médicaments, produits chimiques)',
    'Arrêt cardiaque présumé'
  ];
  const docteurs = ['Dr. Ait', 'Dr. Ben', 'Dr. Chen'];
  const modesPaiement = ['Espèces', 'Chèque', 'Virement'];
  const statutsPaiement = ['Non Payé', 'Payé'];
  const patientsData = [
    { id: 1, nom: 'Dupont', prenom: 'Jean' },
    { id: 2, nom: 'Martin', prenom: 'Claire' },
    { id: 3, nom: 'El Fassi', prenom: 'Youssef' }
  ];

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = jwtDecode(token);
        const userId = decoded.id || decoded.user_id || decoded.sub;
        if (!userId) return;
        const response = await axios.get(`https://regulation.omnidoc.ma:5000/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const nom = response.data.nom || response.data.name || '';
        const prenom = response.data.prenom || response.data.firstname || '';
        const fullName = (prenom + ' ' + nom).trim() || 'Utilisateur';
        setUserName(fullName);

        // Récupérer l'email de l'utilisateur
        const userEmail = response.data.email;
        if (userEmail) {
          console.log('1. Début de la récupération des clients...');
          const clientsResponse = await axios.get('https://regulation.omnidoc.ma:5000/clients', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('2. Tous les clients récupérés:', clientsResponse.data);
          
          const clientsFiltres = Array.isArray(clientsResponse.data) 
            ? clientsResponse.data.filter(client => client.email === userEmail)
            : [];
          
          console.log('3. Clients filtrés par email:', clientsFiltres);
          
          if (clientsFiltres.length > 0) {
            const clientTrouve = clientsFiltres[0];
            const idClient = clientTrouve.id;
            console.log('4. Client sélectionné:', {
              id: idClient,
              type: clientTrouve.type,
              email: clientTrouve.email,
              nom: clientTrouve.nom,
              prenom: clientTrouve.prenom
            });

            // Récupérer tous les patients
            console.log('5. Début de la récupération des patients...');
            const patientsResponse = await axios.get('https://regulation.omnidoc.ma:5000/patients', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('6. Tous les patients récupérés:', patientsResponse.data);

            // Filtrer les patients par client_id
            const patientsFiltres = Array.isArray(patientsResponse.data)
              ? patientsResponse.data.filter(patient => patient.client_id === idClient)
              : [];
            
            console.log('7. Patients filtrés par client_id:', patientsFiltres);
            setPatients(patientsFiltres); // Stocker les patients dans l'état

            // Extraire les IDs des patients
            const patientIds = patientsFiltres.map(patient => patient.id);
            console.log('8. Liste des IDs des patients:', patientIds);

            // Récupérer toutes les missions
            console.log('9. Début de la récupération des missions...');
            const missionsResponse = await axios.get('https://regulation.omnidoc.ma:5000/missions', {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('10. Toutes les missions récupérées:', missionsResponse.data);

            // Filtrer les missions pour chaque patient
            const missionsFiltrees = Array.isArray(missionsResponse.data)
              ? missionsResponse.data.filter(mission => patientIds.includes(mission.patient_id))
              : [];
            
            console.log('11. Missions filtrées par patient_id:', missionsFiltrees);
            setMissions(missionsFiltrees); // Stocker les missions dans l'état

            // Grouper les missions par patient
            const missionsParPatient = patientsFiltres.map(patient => ({
              patient: patient,
              missions: missionsFiltrees.filter(mission => mission.patient_id === patient.id)
            }));
            
            console.log('12. Missions groupées par patient:', missionsParPatient);

          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
    };
    fetchUserName();
  }, []);



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Token non trouvé. Veuillez vous reconnecter.");
      // Gérer l'absence de token, par exemple, rediriger vers la page de connexion
      return;
    }

    let userId = null;
    let userEmail = null; // Sera rempli par l'appel à /users/:id

    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id || decodedToken.user_id || decodedToken.sub; // On prend l'ID ici
      // ... gestion d'erreur si userId non trouvé ...
    } catch (error) {
      // ... gestion d'erreur de décodage ...
    }

    // 1. Récupérer l'email de l'utilisateur via son ID (en utilisant l'userId du token)
    if (userId) { // S'assurer qu'on a un userId avant de faire l'appel
        try {
            const userResponse = await axios.get(`https://regulation.omnidoc.ma:5000/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // C'est ICI qu'on récupère l'email depuis la réponse de /users/:id
            userEmail = userResponse.data.email || userResponse.data.user_email; 
            // ...
        } catch (error) {
            // ...
        }
    }

    let typeClient = null;
    let idClient = null;

    if (userEmail) {
      try {
        console.log('1. Début de la récupération des clients...');
        // Récupérer tous les clients
        const clientsResponse = await axios.get('https://regulation.omnidoc.ma:5000/clients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('2. Tous les clients récupérés:', clientsResponse.data);
        
        // Filtrer les clients par email
        const clientsFiltres = Array.isArray(clientsResponse.data) 
          ? clientsResponse.data.filter(client => client.email === userEmail)
          : [];
        
        console.log('3. Clients filtrés par email:', clientsFiltres);
        
        if (clientsFiltres.length > 0) {
          const clientTrouve = clientsFiltres[0];
          typeClient = clientTrouve.type;
          idClient = clientTrouve.id;
          console.log('4. Client sélectionné:', {
            id: idClient,
            type: typeClient,
            email: clientTrouve.email,
            nom: clientTrouve.nom,
            prenom: clientTrouve.prenom
          });

          // Récupérer tous les patients
          console.log('5. Début de la récupération des patients...');
          const patientsResponse = await axios.get('https://regulation.omnidoc.ma:5000/patients', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('6. Tous les patients récupérés:', patientsResponse.data);

          // Filtrer les patients par client_id
          const patientsFiltres = Array.isArray(patientsResponse.data)
            ? patientsResponse.data.filter(patient => patient.client_id === idClient)
            : [];
          
          console.log('7. Patients filtrés par client_id:', patientsFiltres);

          // Extraire les IDs des patients
          const patientIds = patientsFiltres.map(patient => patient.id);
          console.log('8. Liste des IDs des patients:', patientIds);

          // Récupérer toutes les missions
          console.log('9. Début de la récupération des missions...');
          const missionsResponse = await axios.get('https://regulation.omnidoc.ma:5000/missions', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('10. Toutes les missions récupérées:', missionsResponse.data);

          // Filtrer les missions pour chaque patient
          const missionsFiltrees = Array.isArray(missionsResponse.data)
            ? missionsResponse.data.filter(mission => patientIds.includes(mission.patient_id))
            : [];
          
          console.log('11. Missions filtrées par patient_id:', missionsFiltrees);
          setMissions(missionsFiltrees); // Stocker les missions dans l'état

          // Grouper les missions par patient
          const missionsParPatient = patientsFiltres.map(patient => ({
            patient: patient,
            missions: missionsFiltrees.filter(mission => mission.patient_id === patient.id)
          }));
          
          console.log('12. Missions groupées par patient:', missionsParPatient);

        } else {
          console.log('4. Aucun client trouvé avec l\'email:', userEmail);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      }
    }

    // 1. Création du patient
    let patientId = null;
    try {
      const patientPayload = {
        nom: form.nom_patient,
        prenom: form.prenom_patient,
        adresse: form.adresse_patient,
        ville: form.ville_patient,
        téléphone: form.telephone_patient,
        type_client: typeClient, // Utiliser les valeurs récupérées
        client_id: idClient      // Utiliser les valeurs récupérées
      };
      const patientRes = await axios.post('https://regulation.omnidoc.ma:5000/patients', patientPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      patientId = patientRes.data.id; 
    } catch (error) {
      console.error('Erreur lors de la création du patient :', error);
      return;
    }

    // 2. Création de la mission/intervention
    const payload = {
      etat_mission: form.etat_mission,
      statut: "créée",
      type_mission: form.type_mission,
      cause: form.cause,
      bon_de_commande: form.bon_de_commande,
      demande_materiel: form.demande_materiel,
      prix: null,
      paiement: null,
      paye: null,
      ville: form.ville,
      adresse: form.adresse_mission,
      adresse_destination: form.adresse_destination,
      date_mission: form.etat_mission === 'planifiée'
        ? form.date_mission
        : new Date().toISOString().slice(0, 16),
      urgence: form.etat_mission === 'urgente' ? 1 : 0,
      type_ambulance: form.type_ambulance || null,
      ambulancier_id: null,
      doctor_id: null,
      nurse_id: null,
      patient_id: patientId,
      heure_depart: null,
      heure_arrivee: null,
      heure_affectation: null,
      heure_redepart: null,
      heure_fin: null,
      temps_depart: null,
      temps_arrivee: null,
      temps_total: null,
      temps_redepart: null,
      temps_fin: null
    };

    try {
      await axios.post('https://regulation.omnidoc.ma:5000/missions', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({
        adresse_mission: '', adresse_destination: '', ville: '', type_mission: '', type_ambulance: '', etat_mission: '', date_mission: '', cause: '', bon_de_commande: '', demande_materiel: '', docteur: '', prix: '', mode_paiement: '', statut_paiement: '', nom_patient: '', prenom_patient: '', telephone_patient: '', adresse_patient: '', ville_patient: ''
      });
    } catch (error) {
      console.error('Erreur lors de la création de la mission :', error);
    }
  };

  // const navigate = useNavigate(); // Not strictly needed if App.js redirects after onLogout

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    // Navigation to /login will be handled by App.js due to isAuthenticated changing
  };

  // Fonction pour récupérer les missions
  const fetchMissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const missionsResponse = await axios.get('https://regulation.omnidoc.ma:5000/missions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (Array.isArray(missionsResponse.data)) {
        // Filtrer les missions pour les patients actuels
        const patientIds = patients.map(patient => patient.id);
        const missionsFiltrees = missionsResponse.data.filter(mission => 
          patientIds.includes(mission.patient_id)
        );
        setMissions(missionsFiltrees);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des missions:', error);
    }
  };

  // Effet pour le rafraîchissement automatique des missions
  useEffect(() => {
    const intervalId = setInterval(fetchMissions, 2000); // Rafraîchir toutes les 2 secondes
    return () => clearInterval(intervalId); // Nettoyer l'intervalle lors du démontage
  }, [patients]); // Dépendance sur patients pour s'assurer que les IDs sont à jour

  return (
    <div className="main-page-container">
      <nav className="navbar">
        <div className="navbar-left">
          <span className="navbar-logo-text">Omnidoc Sante</span>
        </div>
        <div className="navbar-right">
          <span className="user-info">{userName}</span>
          <button onClick={handleLogoutClick} className="logout-button">
            Logout
          </button>
        </div>
      </nav>
      <div className="main-content">
        <div className="intervention-form-container">
          <form onSubmit={handleSubmit} className="intervention-form">
            <h2>Nouvelle intervention</h2>
            <h3 className="form-section-title">Informations Mission</h3>
            <div className="form-field">
              <label>Adresse de Mission</label>
              <input name="adresse_mission" value={form.adresse_mission} onChange={handleChange} placeholder="Entrez l'adresse de la mission" required />
            </div>
            <div className="form-field">
              <label>Adresse de Destination</label>
              <input name="adresse_destination" value={form.adresse_destination} onChange={handleChange} placeholder="Entrez l'adresse de destination" required />
            </div>
            <div className="form-field">
              <label>Ville</label>
              <select name="ville" value={form.ville} onChange={handleChange} required>
                <option value="">Sélectionner une ville</option>
                {villes.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Type de Mission</label>
              <select name="type_mission" value={form.type_mission} onChange={handleChange} required>
                <option value="">Sélectionner un type</option>
                {typesMission.map(t => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {form.type_mission === 'ambulance' && (
              <div className="form-field">
                <label>Type d'Ambulance</label>
                <select name="type_ambulance" value={form.type_ambulance} onChange={handleChange} required>
                  <option value="">Sélectionner un type d'ambulance</option>
                  <option value="VSL">VSL</option>
                  <option value="TAS">TAS</option>
                  <option value="TAM">TAM</option>
                </select>
              </div>
            )}
            <div className="form-field">
              <label>État de Mission</label>
              <select name="etat_mission" value={form.etat_mission} onChange={handleChange} required>
                <option value="">Sélectionner un état</option>
                {etatsMission.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            {form.etat_mission === 'planifiée' && (
              <div className="form-field">
                <label>Date de Mission</label>
                <input type="datetime-local" name="date_mission" value={form.date_mission} onChange={handleChange} required />
              </div>
            )}
            <div className="form-field">
              <label>Cause</label>
              <select name="cause" value={form.cause} onChange={handleChange} required>
                <option value="">Sélectionner une cause</option>
                {causes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Bon de Commande</label>
              <input name="bon_de_commande" value={form.bon_de_commande} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Demande Matériel</label>
              <input name="demande_materiel" value={form.demande_materiel} onChange={handleChange} />
            </div>

            <hr className="form-divider" />
            <h3 className="form-section-title">Informations Patient</h3>
            <div className="form-field">
              <label>Nom</label>
              <input name="nom_patient" value={form.nom_patient} onChange={handleChange} placeholder="Nom du patient" required />
            </div>
            <div className="form-field">
              <label>Prénom</label>
              <input name="prenom_patient" value={form.prenom_patient} onChange={handleChange} placeholder="Prénom du patient" required />
            </div>
            <div className="form-field">
              <label>Téléphone</label>
              <input name="telephone_patient" value={form.telephone_patient} onChange={handleChange} placeholder="Téléphone du patient" required />
            </div>
            <div className="form-field">
              <label>Adresse</label>
              <input name="adresse_patient" value={form.adresse_patient} onChange={handleChange} placeholder="Adresse du patient" required />
            </div>
            <div className="form-field">
              <label>Ville</label>
              <input name="ville_patient" value={form.ville_patient} onChange={handleChange} placeholder="Ville du patient" required />
            </div>
            <button type="submit">Envoyer</button>
          </form>
        </div>
        <div className="interventions-table-container">
          <h2>Mes interventions</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Adresse</th>
                <th>Date Mission</th>
                <th>Type Mission</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((mission) => (
                <tr key={mission.id}>
                  <td>{mission.id}</td>
                  <td>{mission.adresse}</td>
                  <td>{new Date(mission.date_mission).toLocaleString()}</td>
                  <td>{mission.type_mission}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      color: 'white',
                      backgroundColor: 
                        mission.statut === 'créée' ? '#2196F3' : // bleu
                        mission.statut === 'en cours' ? '#FF9800' : // orange
                        mission.statut === 'terminée' ? '#4CAF50' : // vert
                        '#757575', // gris par défaut
                      fontWeight: 'bold'
                    }}>
                      {mission.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MainPage; 
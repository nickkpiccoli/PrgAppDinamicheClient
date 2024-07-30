import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getOrders } from '../../Services/OrderService';
import Navbar from '../Common/Navbar';
import ManageOrders from './Table/ManageOrders';
import Statistics from './Graph/Statistics';
import '../../styles/Dashboard.css';
import { parseISO, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

/**
 * Il componente Dashboard è la pagina principale dove gli utenti possono visualizzare
 * e gestire i loro ordini e vedere le statistiche.
 */
const Dashboard = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userCode, setUserCode] = useState(null);
  const token = localStorage.getItem('jwtToken');

  const navigate = useNavigate();

  /**
   * Decodifica il token JWT per ottenere il ruolo e il codice utente,
   * quindi chiama fetchData per ottenere i dati degli ordini.
   */
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.userRole);
        setUserCode(decodedToken.userCode);
        fetchData(decodedToken.userRole);
      } catch (error) {
        console.error('Errore nella decodifica del JWT:', error);
        setError('Errore nella decodifica del token');
        setLoading(false);
      }
    } else {
      setError('Token non trovato');
      setLoading(false);
    }
  }, [token]);

  /**
   * Funzione per ottenere i dati degli ordini in base al ruolo dell'utente.
   *
   * @param {string} role - Il ruolo dell'utente.
   */
  const fetchData = async (role) => {
    if (!role) return;

    setLoading(true);
    try {
      const data = await getOrders(token, role);
      if (data && Array.isArray(data.orders)) {
        setTableData(data.orders);
      } else {
        console.error('Struttura dei dati inaspettata:', data);
        setError('Errore nella struttura dei dati');
      }
    } catch (error) {
      console.error('Errore nel recupero dei dati', error);
      setError('Errore nel recupero dei dati');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Trasforma i dati degli ordini per essere utilizzati nel grafico.
   *
   * @param {Array} orders - Gli ordini da trasformare.
   * @returns {Array} - Gli ordini trasformati.
   */
  const transformDataForChart = (orders) => {
    return orders.map((order) => {
      const parsedDate = parseISO(order.ord_date);
      return {
        ord_date: isNaN(parsedDate)
          ? 'Data non valida'
          : format(parsedDate, 'dd/MM/yyyy'),
        ord_amount: parseFloat(order.ord_amount),
        advance_amount: parseFloat(order.advance_amount),
        outstanding_amt: parseFloat(order.outstanding_amt),
      };
    });
  };

  const chartData = transformDataForChart(tableData);

  if (loading) {
    return <p>Caricamento in corso...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  /**
   * Gestisce l'aggiornamento dei dati richiamando fetchData.
   */
  const handleUpdate = async () => {
    setLoading(true);
    await fetchData(userRole);
  };

  return (
    <div className="dashboard-app" aria-label="Dashboard principale">
      <Navbar
        user={userCode}
        onLogout={() => {
          localStorage.removeItem('jwtToken');
          navigate('/login');
        }}
        aria-label="Barra di navigazione con opzioni di logout"
      />
      <header
        className="dashboard-header"
        aria-label="Intestazione della dashboard"
      >
        <h1 tabIndex={0} aria-label="Titolo: Benvenuto nella tua dashboard">
          Benvenuto nella tua dashboard
        </h1>
        <h3
          tabIndex={0}
          aria-label="Sottotitolo: Gestisci i tuoi ordini e visualizza le statistiche"
        >
          Gestisci i tuoi ordini e visualizza le statistiche
        </h3>
        <div
          className="dashboard-content"
          aria-label="Contenuto della dashboard"
        >
          <div
            className="dashboard-card"
            aria-label="Sezione per la gestione degli ordini"
          >
            <ManageOrders
              tableData={tableData}
              userRole={userRole}
              userCode={userCode}
              onUpdate={handleUpdate}
              aria-label="Gestione degli ordini"
            />
          </div>
          <div
            className="dashboard-card"
            aria-label="Sezione per la visualizzazione delle statistiche"
          >
            <Statistics
              chartData={chartData}
              aria-label="Statistiche degli ordini"
            />
          </div>
        </div>
      </header>
    </div>
  );
};

export default Dashboard;

'use client';

import { useState, useEffect } from 'react';
import { Container, Box, Tabs, Tab, Typography, Paper, CircularProgress, IconButton } from '@mui/material';
import es from 'date-fns/locale/es';
import CompaneroPanel from '../components/CompaneroPanel';
import GestionCompañeros from '../components/GestionCompañeros';
import Providers from '../components/Providers';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

function Home() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [compañeros, setCompañeros] = useState([]);
  const [saldos, setSaldos] = useState({});
  const [showGestionCompañeros, setShowGestionCompañeros] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/viajes');
        const { data, config } = await response.json();
        if (config) {
          setCompañeros(config);
          // Inicializar saldos
          const newSaldos = {};
          config.forEach(comp => {
            newSaldos[comp.id] = data?.[comp.id]?.saldo || 0;
          });
          setSaldos(newSaldos);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSaldoChange = (companeroId, nuevoSaldo) => {
    setSaldos(prev => ({
      ...prev,
      [companeroId]: nuevoSaldo
    }));
  };

  const handleAddCompañero = async (nombre) => {
    try {
      const response = await fetch('/api/viajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addCompañero',
          nombre
        })
      });
      
      if (response.ok) {
        // Recargar datos
        const newResponse = await fetch('/api/viajes');
        const { data, config } = await newResponse.json();
        setCompañeros(config);
        // Actualizar saldos
        const newSaldos = {};
        config.forEach(comp => {
          newSaldos[comp.id] = data?.[comp.id]?.saldo || 0;
        });
        setSaldos(newSaldos);
      }
    } catch (error) {
      console.error('Error al añadir compañero:', error);
    }
  };

  const handleEditCompañero = async (id, nuevoNombre) => {
    try {
      const response = await fetch('/api/viajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'editCompañero',
          id,
          nuevoNombre
        })
      });
      
      if (response.ok) {
        // Recargar datos
        const newResponse = await fetch('/api/viajes');
        const { data, config } = await newResponse.json();
        setCompañeros(config);
        // Actualizar saldos
        const newSaldos = {};
        config.forEach(comp => {
          newSaldos[comp.id] = data?.[comp.id]?.saldo || 0;
        });
        setSaldos(newSaldos);
      }
    } catch (error) {
      console.error('Error al editar compañero:', error);
    }
  };

  const handleDeleteCompañero = async (id) => {
    try {
      const response = await fetch('/api/viajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteCompañero',
          id
        })
      });
      
      if (response.ok) {
        // Recargar datos
        const newResponse = await fetch('/api/viajes');
        const { data, config } = await newResponse.json();
        setCompañeros(config);
        // Actualizar saldos
        const newSaldos = {};
        config.forEach(comp => {
          newSaldos[comp.id] = data?.[comp.id]?.saldo || 0;
        });
        setSaldos(newSaldos);
        // Si el compañero eliminado era el seleccionado, volver al primero
        if (selectedTab >= config.length) {
          setSelectedTab(0);
        }
      }
    } catch (error) {
      console.error('Error al eliminar compañero:', error);
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          flexDirection: 'column',
          gap: 2,
          bgcolor: '#f8f9fa'
        }}
      >
        <CircularProgress size={80} />
        <Typography variant="h5" color="text.secondary">
          Iniciando aplicación...
        </Typography>
      </Box>
    );
  }

  return (
    <Providers>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            backgroundColor: '#f8f9fa',
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{
                fontWeight: 'bold',
                color: '#1976d2',
                flexGrow: 1
              }}
            >
              Gestor de Viajes Compartidos
            </Typography>
            <IconButton 
              color="primary" 
              onClick={() => setShowGestionCompañeros(true)}
              sx={{ 
                ml: 2,
                '&:hover': {
                  backgroundColor: '#e3f2fd'
                }
              }}
            >
              <PersonAddIcon />
            </IconButton>
          </Box>
          
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange} 
            centered
            sx={{
              '& .MuiTab-root': {
                fontSize: '1.1rem',
                fontWeight: 'bold',
                minWidth: 120,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                  borderRadius: 1
                }
              }
            }}
          >
            {compañeros.map((compañero, index) => (
              <Tab key={compañero.id} label={compañero.nombre} />
            ))}
          </Tabs>
        </Paper>

        {compañeros.map((compañero, index) => (
          <Box 
            key={compañero.id}
            role="tabpanel" 
            hidden={selectedTab !== index}
          >
            {selectedTab === index && (
              <CompaneroPanel 
                nombre={compañero.id}
                saldo={saldos[compañero.id] || 0}
                onSaldoChange={(nuevoSaldo) => handleSaldoChange(compañero.id, nuevoSaldo)}
              />
            )}
          </Box>
        ))}

        <GestionCompañeros
          open={showGestionCompañeros}
          onClose={() => setShowGestionCompañeros(false)}
          compañeros={compañeros}
          onAdd={handleAddCompañero}
          onEdit={handleEditCompañero}
          onDelete={handleDeleteCompañero}
        />
      </Container>
    </Providers>
  );
}

export default Home;

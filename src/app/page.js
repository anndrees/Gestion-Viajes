'use client';

import { useState, useEffect } from 'react';
import { Container, Box, Tabs, Tab, Typography, Paper, CircularProgress, IconButton, Button } from '@mui/material';
import es from 'date-fns/locale/es';
import CompaneroPanel from '../components/CompaneroPanel';
import GestionCompañeros from '../components/GestionCompañeros';
import Providers from '../components/Providers';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function Home() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compañeros, setCompañeros] = useState([]);
  const [saldos, setSaldos] = useState({});
  const [showGestionCompañeros, setShowGestionCompañeros] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar compañeros
        const response = await fetch('/api/viajes');
        if (!response.ok) {
          throw new Error('Error al cargar los datos');
        }
        const { data, config } = await response.json();
        
        setCompañeros(config);
        // Inicializar saldos
        const newSaldos = {};
        config.forEach(comp => {
          newSaldos[comp.id] = data?.[comp.id]?.saldo || 0;
        });
        setSaldos(newSaldos);
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar los datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box 
        sx={{ 
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #f3f4f6 0%, #fff 100%)'
        }}
      >
        <CircularProgress 
          sx={{ 
            color: '#1976d2'
          }} 
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #f3f4f6 0%, #fff 100%)',
          p: 3
        }}
      >
        <ErrorOutlineIcon 
          sx={{ 
            fontSize: 64, 
            color: '#d32f2f',
            mb: 2
          }} 
        />
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#1a1a1a',
            fontWeight: 600,
            textAlign: 'center',
            mb: 1
          }}
        >
          Error al cargar la aplicación
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#637381',
            textAlign: 'center',
            mb: 3
          }}
        >
          {error}
        </Typography>
        <Button
          onClick={() => window.location.reload()}
          variant="contained"
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            px: 4,
            py: 1,
            background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }
          }}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

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

  return (
    <Providers>
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(145deg, #f6f8fa 0%, #ffffff 100%)',
          py: 4
        }}
      >
        <Container maxWidth="lg">
          <Paper 
            elevation={2} 
            sx={{ 
              p: 4, 
              mb: 4, 
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)'
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              position: 'relative'
            }}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  flexGrow: 1,
                  letterSpacing: '-0.5px'
                }}
              >
                Gestor de Viajes Compartidos
              </Typography>
              <IconButton 
                color="primary" 
                onClick={() => setShowGestionCompañeros(true)}
                sx={{ 
                  ml: 2,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
                  border: '1px solid rgba(25,118,210,0.1)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px 0 rgba(0,0,0,0.15)',
                    background: 'linear-gradient(145deg, #e3f2fd 0%, #ffffff 100%)'
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
                '& .MuiTabs-indicator': {
                  height: '3px',
                  borderRadius: '3px',
                  background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)'
                },
                '& .MuiTab-root': {
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  minWidth: 120,
                  transition: 'all 0.3s ease',
                  color: '#637381',
                  textTransform: 'none',
                  borderRadius: '8px',
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(25,118,210,0.08)',
                    color: '#1976d2'
                  },
                  '&.Mui-selected': {
                    color: '#1976d2',
                    fontWeight: 700
                  }
                }
              }}
            >
              {compañeros.map((compañero, index) => (
                <Tab 
                  key={compañero.id} 
                  label={compañero.nombre}
                  sx={{
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      width: '0%',
                      height: '3px',
                      background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                      transition: 'all 0.3s ease',
                      opacity: 0,
                      transform: 'translateX(-50%)'
                    },
                    '&:hover::after': {
                      width: '80%',
                      opacity: 0.5
                    },
                    '&.Mui-selected::after': {
                      width: '80%',
                      opacity: 1
                    }
                  }}
                />
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
        </Container>
      </Box>
      <GestionCompañeros
        open={showGestionCompañeros}
        onClose={() => setShowGestionCompañeros(false)}
        compañeros={compañeros}
        onAdd={handleAddCompañero}
        onEdit={handleEditCompañero}
        onDelete={handleDeleteCompañero}
      />
    </Providers>
  );
}

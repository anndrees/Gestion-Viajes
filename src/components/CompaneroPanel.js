import { useState, useEffect } from 'react';
import { 
  Paper, 
  Grid, 
  Typography, 
  Button,
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  Stack,
  Chip,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  Fab,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addDays, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import GestionPagos from './GestionPagos';

export default function CompaneroPanel({ nombre, saldo, onSaldoChange }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viajes, setViajes] = useState({});
  const [pagos, setPagos] = useState([]);
  const [compañeros, setCompañeros] = useState([]);
  const [nuevoPago, setNuevoPago] = useState('');
  const [totalDeuda, setTotalDeuda] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPagos, setShowPagos] = useState(false);

  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const diasSemana = eachDayOfInterval({
    start: startDate,
    end: endDate
  }).filter(dia => {
    const diaSemana = getDay(dia);
    return diaSemana !== 0 && diaSemana !== 6; // Excluir domingo (0) y sábado (6)
  });

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/viajes');
        const { data, config } = await response.json();
        if (data && data[nombre]) {
          setViajes(data[nombre].viajes || {});
          setPagos(data[nombre].pagos || []);
          onSaldoChange(data[nombre].saldo || 0);
        }
        setCompañeros(config || []);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar los datos',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [nombre]);

  useEffect(() => {
    calcularDeuda();
  }, [viajes, saldo]);

  const calcularDeuda = () => {
    let totalViajes = 0;
    Object.values(viajes).forEach(dia => {
      if (dia.ida) totalViajes += 1.5;
      if (dia.vuelta) totalViajes += 1.5;
    });
    setTotalDeuda(totalViajes - saldo);
  };

  const handleViajeChange = async (fecha, tipo, valor, includeAmbos = false) => {
    setSaving(true);
    const fechaStr = format(fecha, 'yyyy-MM-dd');
    const nuevosViajes = {
      ...viajes,
      [fechaStr]: {
        ...viajes[fechaStr],
        [tipo]: valor !== undefined ? valor : !viajes[fechaStr]?.[tipo]
      }
    };

    if (includeAmbos) {
      nuevosViajes[fechaStr] = {
        ...nuevosViajes[fechaStr],
        ida: valor !== undefined ? valor : !viajes[fechaStr]?.ida,
        vuelta: valor !== undefined ? valor : !viajes[fechaStr]?.vuelta
      };
    }
    
    try {
      const response = await fetch('/api/viajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateViajes',
          nombre,
          viajes: nuevosViajes
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar viajes');
      }

      setViajes(nuevosViajes);
      calcularDeuda();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNuevoPago = async () => {
    const cantidad = parseFloat(nuevoPago);
    if (!isNaN(cantidad)) {
      setSaving(true);
      
      try {
        const response = await fetch('/api/viajes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'addPago',
            nombre,
            cantidad,
            fecha: new Date().toISOString()
          })
        });
        
        const { success } = await response.json();
        if (success) {
          // Recargar datos
          const newResponse = await fetch('/api/viajes');
          const { data } = await newResponse.json();
          setPagos(data[nombre].pagos || []);
          onSaldoChange(data[nombre].saldo || 0);
          setNuevoPago('');
          setSnackbar({
            open: true,
            message: 'Pago registrado correctamente',
            severity: 'success'
          });
        } else {
          throw new Error('Error al guardar');
        }
      } catch (error) {
        console.error('Error al registrar pago:', error);
        setSnackbar({
          open: true,
          message: 'Error al registrar el pago',
          severity: 'error'
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleEditPago = async (pagoId, { cantidad, fecha, nota }) => {
    setSaving(true);
    try {
      const response = await fetch('/api/viajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'editPago',
          nombre,
          pagoId,
          cantidad,
          fecha,
          nota
        })
      });
      
      const { success } = await response.json();
      if (success) {
        // Recargar datos
        const newResponse = await fetch('/api/viajes');
        const { data } = await newResponse.json();
        setPagos(data[nombre].pagos || []);
        onSaldoChange(data[nombre].saldo || 0);
        setSnackbar({
          open: true,
          message: 'Pago actualizado correctamente',
          severity: 'success'
        });
      } else {
        throw new Error('Error al actualizar');
      }
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      setSnackbar({
        open: true,
        message: 'Error al actualizar el pago',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePago = async (pagoId) => {
    setSaving(true);
    try {
      const response = await fetch('/api/viajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deletePago',
          nombre,
          pagoId
        })
      });
      
      const { success } = await response.json();
      if (success) {
        // Recargar datos
        const newResponse = await fetch('/api/viajes');
        const { data } = await newResponse.json();
        setPagos(data[nombre].pagos || []);
        onSaldoChange(data[nombre].saldo || 0);
        setSnackbar({
          open: true,
          message: 'Pago eliminado correctamente',
          severity: 'success'
        });
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el pago',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTransferPago = async (pagoId, nombreDestino) => {
    setSaving(true);
    try {
      const response = await fetch('/api/viajes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'transferirPago',
          nombreOrigen: nombre,
          nombreDestino,
          pagoId
        })
      });
      
      const { success } = await response.json();
      if (success) {
        // Recargar datos
        const newResponse = await fetch('/api/viajes');
        const { data } = await newResponse.json();
        setPagos(data[nombre].pagos || []);
        onSaldoChange(data[nombre].saldo || 0);
        setSnackbar({
          open: true,
          message: 'Pago transferido correctamente',
          severity: 'success'
        });
      } else {
        throw new Error('Error al transferir');
      }
    } catch (error) {
      console.error('Error al transferir pago:', error);
      setSnackbar({
        open: true,
        message: 'Error al transferir el pago',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Cargando datos...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              mb: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <DatePicker
                label="Semana"
                value={selectedDate}
                onChange={setSelectedDate}
                format="dd/MM/yyyy"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(25,118,210,0.04)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(25,118,210,0.2)'
                    }
                  }
                }}
              />
            </Stack>

            {diasSemana.map((fecha) => {
              const fechaStr = format(fecha, 'yyyy-MM-dd');
              const viajesDia = viajes[fechaStr] || {};
              return (
                <Paper
                  key={fechaStr}
                  elevation={1}
                  onClick={() => {
                    const shouldActivate = !viajesDia.ida && !viajesDia.vuelta;
                    handleViajeChange(fecha, 'ida', shouldActivate, true);
                  }}
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    borderRadius: '12px',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)',
                      backgroundColor: 'rgba(25,118,210,0.04)'
                    },
                    ...(viajesDia.ida && viajesDia.vuelta ? {
                      background: 'linear-gradient(145deg, rgba(25,118,210,0.08) 0%, rgba(25,118,210,0.04) 100%)',
                      border: '1px solid rgba(25,118,210,0.1)'
                    } : {})
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography 
                      sx={{ 
                        minWidth: 100,
                        fontWeight: 600,
                        color: '#637381'
                      }}
                    >
                      {format(fecha, "EEEE d", { locale: es })}
                    </Typography>
                    <Stack 
                      direction={{ xs: 'column', sm: 'row' }} 
                      spacing={2} 
                      alignItems="center" 
                      justifyContent="space-between"
                      sx={{ 
                        flexGrow: 1,
                        width: '100%'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 2,
                        flexGrow: 1,
                        justifyContent: { xs: 'center', sm: 'flex-start' }
                      }}>
                        <Button
                          variant={viajesDia.ida ? "contained" : "outlined"}
                          onClick={() => handleViajeChange(fecha, 'ida')}
                          startIcon={<DirectionsCarIcon />}
                          sx={{ 
                            borderRadius: '10px',
                            textTransform: 'none',
                            minWidth: '120px',
                            background: viajesDia.ida ? 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)' : 'transparent',
                            '&:hover': {
                              background: viajesDia.ida ? 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)' : 'rgba(25,118,210,0.08)'
                            }
                          }}
                        >
                          Ida
                        </Button>
                        <Button
                          variant={viajesDia.vuelta ? "contained" : "outlined"}
                          onClick={() => handleViajeChange(fecha, 'vuelta')}
                          startIcon={<DirectionsCarIcon />}
                          sx={{ 
                            borderRadius: '10px',
                            textTransform: 'none',
                            minWidth: '120px',
                            background: viajesDia.vuelta ? 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)' : 'transparent',
                            '&:hover': {
                              background: viajesDia.vuelta ? 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)' : 'rgba(25,118,210,0.08)'
                            }
                          }}
                        >
                          Vuelta
                        </Button>
                      </Box>
                      {(viajesDia.ida || viajesDia.vuelta) && (
                        <Chip 
                          label={`${((viajesDia.ida ? 1.5 : 0) + (viajesDia.vuelta ? 1.5 : 0)).toFixed(2)}€`}
                          color="primary"
                          sx={{
                            borderRadius: '8px',
                            background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                            color: 'white',
                            fontWeight: 600,
                            minWidth: '80px'
                          }}
                        />
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              mb: 3,
              background: totalDeuda < 0 
                ? 'linear-gradient(145deg, #ffffff 0%, #ffebee 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #e8f5e9 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  p: 1,
                  borderRadius: '12px',
                  background: totalDeuda < 0 
                    ? 'linear-gradient(145deg, #ef5350 0%, #ff1744 100%)'
                    : 'linear-gradient(145deg, #4caf50 0%, #00c853 100%)',
                  color: 'white'
                }}
              >
                <AccountBalanceWalletIcon />
              </Box>
              <Box>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    color: '#2b3445'
                  }}
                >
                  Saldo actual: {saldo.toFixed(2)}€
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: totalDeuda < 0 ? '#d32f2f' : '#2e7d32',
                    fontWeight: 600
                  }}
                >
                  {totalDeuda < 0 ? "Debes: " : "A favor: "}
                  {Math.abs(totalDeuda).toFixed(2)}€
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper 
            elevation={2}
            sx={{ 
              p: 3,
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontWeight: 700,
                color: '#2b3445',
                mb: 2
              }}
            >
              Registrar nuevo pago
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Cantidad"
                type="number"
                value={nuevoPago}
                onChange={(e) => setNuevoPago(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        mr: 1,
                        color: '#637381'
                      }}
                    >
                      <PaymentsIcon />
                    </Box>
                  ),
                  endAdornment: '€'
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(25,118,210,0.04)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 0 0 2px rgba(25,118,210,0.2)'
                    }
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleNuevoPago}
                disabled={!nuevoPago || isNaN(parseFloat(nuevoPago))}
                startIcon={<PaymentsIcon />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  py: 1.5,
                  background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)'
                  },
                  '&.Mui-disabled': {
                    background: '#e0e0e0'
                  }
                }}
              >
                Registrar pago
              </Button>
            </Stack>
          </Paper>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => setShowPagos(true)}
              startIcon={<HistoryIcon />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                py: 1.5,
                px: 3,
                background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px 0 rgba(0,0,0,0.15)'
                }
              }}
            >
              Ver historial de pagos
            </Button>
          </Box>
        </Grid>
      </Grid>

      <GestionPagos
        open={showPagos}
        onClose={() => setShowPagos(false)}
        pagos={pagos}
        compañeros={compañeros}
        compañeroActual={nombre}
        onEdit={handleEditPago}
        onDelete={handleDeletePago}
        onTransfer={handleTransferPago}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{
            borderRadius: '12px',
            boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backdropFilter: 'blur(4px)'
        }}
        open={saving}
      >
        <CircularProgress 
          color="inherit" 
          size={60}
          thickness={4}
        />
        <Typography
          sx={{
            fontWeight: 600,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          Guardando cambios...
        </Typography>
      </Backdrop>
    </Box>
  );
}

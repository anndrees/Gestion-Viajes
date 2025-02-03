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
        setViajes(data[nombre].viajes || {});
        setPagos(data[nombre].pagos || []);
        setCompañeros(config.compañeros || []);
        onSaldoChange(data[nombre].saldo || 0);
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
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <DatePicker
                label="Seleccionar semana"
                value={selectedDate}
                onChange={setSelectedDate}
                format="'Semana del' d 'de' MMMM"
                sx={{ width: '100%' }}
              />
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              Viajes de la semana
            </Typography>

            {diasSemana.map((dia) => {
              const fechaStr = format(dia, 'yyyy-MM-dd');
              const viajesDia = viajes[fechaStr] || {};

              return (
                <Paper 
                  key={fechaStr} 
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <Typography variant="subtitle1">
                    {format(dia, "EEEE d 'de' MMMM", { locale: es })}
                  </Typography>
                  <Stack direction="row" spacing={2} mt={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!viajesDia.ida}
                          onChange={() => handleViajeChange(dia, 'ida')}
                          icon={<DirectionsCarIcon />}
                          checkedIcon={<DirectionsCarIcon />}
                        />
                      }
                      label="Ida"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!viajesDia.vuelta}
                          onChange={() => handleViajeChange(dia, 'vuelta')}
                          icon={<DirectionsCarIcon />}
                          checkedIcon={<DirectionsCarIcon />}
                        />
                      }
                      label="Vuelta"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const newValue = !viajesDia.ida && !viajesDia.vuelta;
                        handleViajeChange(dia, 'ida', newValue, true);
                      }}
                      startIcon={<DirectionsCarIcon />}
                      sx={{ 
                        display: { 
                          xs: 'none', 
                          sm: 'flex'  
                        }
                      }}
                    >
                      {(!viajesDia.ida && !viajesDia.vuelta) ? "Ida y vuelta" : "Ninguno"}
                    </Button>
                    {(viajesDia.ida || viajesDia.vuelta) && (
                      <Chip 
                        label={`${((viajesDia.ida ? 1.5 : 0) + (viajesDia.vuelta ? 1.5 : 0)).toFixed(2)}€`}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Paper>
              );
            })}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3,
              backgroundColor: totalDeuda < 0 ? '#ffebee' : '#e8f5e9',
              transition: 'background-color 0.3s ease'
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <AccountBalanceWalletIcon color={totalDeuda < 0 ? "error" : "success"} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  Saldo actual: {saldo.toFixed(2)}€
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: totalDeuda < 0 ? 'error.main' : 'success.main',
                    fontWeight: 'bold'
                  }}
                >
                  {totalDeuda < 0 ? "Debes: " : "Deuda actual: "}
                  {Math.abs(totalDeuda).toFixed(2)}€
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Registrar nuevo pago
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Cantidad"
                type="number"
                value={nuevoPago}
                onChange={(e) => setNuevoPago(e.target.value)}
                InputProps={{
                  startAdornment: <PaymentsIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: '€'
                }}
              />
              <Button
                variant="contained"
                onClick={handleNuevoPago}
                disabled={!nuevoPago || isNaN(parseFloat(nuevoPago))}
                startIcon={<PaymentsIcon />}
              >
                Registrar pago
              </Button>
            </Stack>
          </Paper>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Fab
              color="primary"
              variant="extended"
              onClick={() => setShowPagos(true)}
              sx={{ gap: 1 }}
            >
              <HistoryIcon />
              Ver historial de pagos
            </Fab>
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
        open={saving}
      >
        <CircularProgress color="inherit" />
        <Typography>
          Guardando cambios...
        </Typography>
      </Backdrop>
    </Box>
  );
}

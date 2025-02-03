import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogContentText,
  IconButton
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';

export default function GestionPagos({ 
  open, 
  onClose, 
  pagos, 
  compañeros,
  compañeroActual,
  onEdit,
  onDelete,
  onTransfer 
}) {
  const [editandoPago, setEditandoPago] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [transferDialog, setTransferDialog] = useState(null);
  const [nuevaCantidad, setNuevaCantidad] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState(null);
  const [nuevaNota, setNuevaNota] = useState('');
  const [compañeroDestino, setCompañeroDestino] = useState('');

  const handleStartEdit = (pago) => {
    setEditandoPago(pago);
    setNuevaCantidad(pago.cantidad.toString());
    setNuevaFecha(new Date(pago.fecha));
    setNuevaNota(pago.nota || '');
  };

  const handleEdit = () => {
    onEdit(editandoPago.id, {
      cantidad: parseFloat(nuevaCantidad),
      fecha: nuevaFecha.toISOString(),
      nota: nuevaNota
    });
    setEditandoPago(null);
    resetForm();
  };

  const handleDelete = () => {
    onDelete(confirmDelete.id);
    setConfirmDelete(null);
  };

  const handleTransfer = () => {
    onTransfer(transferDialog.id, compañeroDestino);
    setTransferDialog(null);
    setCompañeroDestino('');
  };

  const resetForm = () => {
    setNuevaCantidad('');
    setNuevaFecha(null);
    setNuevaNota('');
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
          color: 'white',
          py: 2,
          px: 3,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          Historial de Pagos
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <List sx={{ py: 0 }}>
            {pagos.length === 0 ? (
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 8,
                  px: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#637381',
                    mb: 1,
                    textAlign: 'center',
                    fontWeight: 600
                  }}
                >
                  No hay pagos registrados
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#637381',
                    textAlign: 'center',
                    opacity: 0.8
                  }}
                >
                  Los pagos que registres aparecerán aquí
                </Typography>
              </Box>
            ) : (
              pagos.map((pago) => (
                <ListItem
                  key={pago.id}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    mb: 2,
                    mt: 2,
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.06)',
                    p: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%', 
                    mb: 1 
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        flexGrow: 1,
                        background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 700
                      }}
                    >
                      {pago.cantidad.toFixed(2)}€
                    </Typography>
                  </Box>
                  
                  <Box sx={{ width: '100%' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#637381',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        mb: 0.5
                      }}
                    >
                      Fecha: {format(new Date(pago.fecha), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                    </Typography>
                    {pago.nota && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#637381',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        Nota: {pago.nota}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    mt: 2,
                    justifyContent: 'flex-end'
                  }}>
                    <IconButton 
                      onClick={() => handleStartEdit(pago)}
                      sx={{
                        color: '#1976d2',
                        backgroundColor: 'rgba(25,118,210,0.08)',
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: 'rgba(25,118,210,0.16)'
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => setTransferDialog(pago)}
                      sx={{
                        color: '#1976d2',
                        backgroundColor: 'rgba(25,118,210,0.08)',
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: 'rgba(25,118,210,0.16)'
                        }
                      }}
                    >
                      <SwapHorizIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => setConfirmDelete(pago)}
                      sx={{
                        color: '#d32f2f',
                        backgroundColor: 'rgba(211,47,47,0.08)',
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: 'rgba(211,47,47,0.16)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              borderColor: 'rgba(25,118,210,0.5)',
              '&:hover': {
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25,118,210,0.08)',
                transition: 'all 0.3s ease-in-out'
              },
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog 
        open={!!editandoPago} 
        onClose={() => setEditandoPago(null)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
          color: 'white',
          py: 2,
          px: 3,
          fontWeight: 700
        }}>
          Editar Pago
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <TextField
            fullWidth
            label="Cantidad"
            type="number"
            value={nuevaCantidad}
            onChange={(e) => setNuevaCantidad(e.target.value)}
            margin="normal"
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
          <DateTimePicker
            label="Fecha y hora"
            value={nuevaFecha}
            onChange={setNuevaFecha}
            format="dd/MM/yyyy HH:mm"
            sx={{ 
              mt: 2, 
              width: '100%',
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
          <TextField
            fullWidth
            label="Nota (opcional)"
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            margin="normal"
            multiline
            rows={2}
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
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setEditandoPago(null)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleEdit} 
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)'
              }
            }}
          >
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog 
        open={!!confirmDelete} 
        onClose={() => setConfirmDelete(null)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(90deg, #ef5350 0%, #ff1744 100%)',
          color: 'white',
          py: 2,
          px: 3,
          fontWeight: 700
        }}>
          Confirmar eliminación
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <DialogContentText sx={{ color: '#637381' }}>
            ¿Estás seguro de que quieres eliminar este pago de {confirmDelete?.cantidad.toFixed(2)}€?
            <br />Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setConfirmDelete(null)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(90deg, #ef5350 0%, #ff1744 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #d32f2f 0%, #d50000 100%)'
              }
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de transferencia */}
      <Dialog 
        open={!!transferDialog} 
        onClose={() => setTransferDialog(null)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
          color: 'white',
          py: 2,
          px: 3,
          fontWeight: 700
        }}>
          Transferir Pago
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          <DialogContentText sx={{ mb: 2, color: '#637381' }}>
            Selecciona el compañero al que quieres transferir este pago de {transferDialog?.cantidad.toFixed(2)}€
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>Compañero destino</InputLabel>
            <Select
              value={compañeroDestino}
              onChange={(e) => setCompañeroDestino(e.target.value)}
              label="Compañero destino"
            >
              {compañeros
                .filter(c => c.id !== compañeroActual)
                .map((compañero) => (
                  <MenuItem key={compañero.id} value={compañero.id}>
                    {compañero.nombre}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setTransferDialog(null)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleTransfer} 
            variant="contained"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)'
              }
            }}
            disabled={!compañeroDestino}
          >
            Transferir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  Slide,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';

export default function GestionCompañeros({ open, onClose, compañeros, onAdd, onEdit, onDelete }) {
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [editando, setEditando] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, compañero: null });

  const getRobohashUrl = (nombre) => {
    return `https://robohash.org/${nombre}?set=set4`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (editando) {
      const nombreExists = compañeros.some(comp => 
        comp.nombre.toLowerCase() === nuevoNombre.toLowerCase() && 
        comp.id !== editando.id
      );

      if (nombreExists) {
        setSnackbar({
          open: true,
          message: 'Ya existe un compañero con ese nombre',
          severity: 'error'
        });
        setSaving(false);
        return;
      }
    } else {
      const nombreExists = compañeros.some(comp => 
        comp.nombre.toLowerCase() === nuevoNombre.toLowerCase()
      );

      if (nombreExists) {
        setSnackbar({
          open: true,
          message: 'Ya existe un compañero con ese nombre',
          severity: 'error'
        });
        setSaving(false);
        return;
      }
    }

    try {
      if (editando) {
        await onEdit(editando.id, nuevoNombre);
        setSnackbar({
          open: true,
          message: 'Compañero editado correctamente',
          severity: 'success'
        });
        setEditando(null);
      } else {
        await onAdd(nuevoNombre);
        setSnackbar({
          open: true,
          message: 'Compañero añadido correctamente',
          severity: 'success'
        });
      }
      setNuevoNombre('');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al guardar los cambios',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (compañero) => {
    setEditando(compañero);
    setNuevoNombre(compañero.nombre);
  };

  const handleDelete = async (compañero) => {
    setDeleteDialog({ open: true, compañero });
  };

  const confirmDelete = async () => {
    const compañero = deleteDialog.compañero;
    setDeleteDialog({ open: false, compañero: null });
    setSaving(true);
    try {
      await onDelete(compañero.id);
      setSnackbar({
        open: true,
        message: 'Compañero eliminado correctamente',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error al eliminar el compañero',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditando(null);
    setNuevoNombre('');
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
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
          fontWeight: 700
        }}>
          {editando ? 'Editar Compañero' : 'Gestionar Compañeros'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          {compañeros.length === 0 ? (
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
                No hay compañeros registrados
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#637381',
                  textAlign: 'center',
                  opacity: 0.8
                }}
              >
                Añade compañeros para empezar a compartir gastos
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {compañeros.map((compañero) => (
                <ListItem
                  key={compañero.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
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
                  <ListItemAvatar>
                    <Avatar 
                      src={getRobohashUrl(compañero.nombre)}
                      alt={compañero.nombre}
                    >
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={compañero.nombre}
                    secondary={editando?.id === compañero.id ? 'Editando...' : null}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEdit(compañero)}
                      disabled={saving}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(compañero)}
                      disabled={saving}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}

          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label={editando ? 'Nuevo nombre' : 'Nombre del compañero'}
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
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
              onClick={handleSubmit}
              variant="contained"
              fullWidth
              disabled={!nuevoNombre.trim() || saving}
              sx={{
                mt: 2,
                borderRadius: '12px',
                textTransform: 'none',
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
              {editando ? 'Guardar cambios' : 'Añadir compañero'}
            </Button>
            {editando && (
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
                sx={{
                  mt: 2,
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 3,
                  borderColor: 'rgba(25,118,210,0.5)',
                  '&:hover': {
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(25,118,210,0.08)'
                  }
                }}
              >
                Cancelar
              </Button>
            )}
          </Box>
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
                backgroundColor: 'rgba(25,118,210,0.08)'
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, compañero: null })}
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
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
            ¿Estás seguro de que quieres eliminar a {deleteDialog.compañero?.nombre}?
            <br />
            Esta acción no se puede deshacer y se perderán todos los datos asociados.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, compañero: null })}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDelete}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

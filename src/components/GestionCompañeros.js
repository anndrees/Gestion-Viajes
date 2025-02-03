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
  Slide
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
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editando ? 'Editar Compañero' : 'Gestionar Compañeros'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={editando ? 'Nuevo nombre' : 'Nombre del compañero'}
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              required
              error={!!snackbar.message && snackbar.severity === 'error'}
              helperText={snackbar.severity === 'error' ? snackbar.message : ''}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={!nuevoNombre.trim() || saving}
                startIcon={saving ? <CircularProgress size={20} /> : editando ? <EditIcon /> : <PersonAddIcon />}
              >
                {editando ? 'Guardar cambios' : 'Añadir compañero'}
              </Button>
              {editando && (
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              )}
            </Box>
          </Box>

          <List sx={{ mt: 3 }}>
            {compañeros.map((compañero) => (
              <ListItem
                key={compañero.id}
                secondaryAction={
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
                }
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
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, compañero: null })}
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar a <strong>{deleteDialog.compañero?.nombre}</strong>?
            <br />
            Esta acción no se puede deshacer y se perderán todos los datos asociados.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, compañero: null })}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            startIcon={saving ? <CircularProgress size={20} /> : <DeleteIcon />}
            disabled={saving}
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

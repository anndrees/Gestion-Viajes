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
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Historial de Pagos</DialogTitle>
        <DialogContent>
          <List>
            {pagos.map((pago) => (
              <ListItem
                key={pago.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  mb: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                  <Typography variant="h6" color="primary" sx={{ flexGrow: 1 }}>
                    {pago.cantidad.toFixed(2)}€
                  </Typography>
                </Box>
                
                <Box sx={{ width: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha: {format(new Date(pago.fecha), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                  </Typography>
                  {pago.nota && (
                    <Typography variant="body2" color="text.secondary">
                      Nota: {pago.nota}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <IconButton 
                    onClick={() => handleStartEdit(pago)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => setTransferDialog(pago)}
                    color="primary"
                  >
                    <SwapHorizIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => setConfirmDelete(pago)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={!!editandoPago} onClose={() => setEditandoPago(null)}>
        <DialogTitle>Editar Pago</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Cantidad"
            type="number"
            value={nuevaCantidad}
            onChange={(e) => setNuevaCantidad(e.target.value)}
            margin="normal"
          />
          <DateTimePicker
            label="Fecha y hora"
            value={nuevaFecha}
            onChange={setNuevaFecha}
            format="dd/MM/yyyy HH:mm"
            sx={{ mt: 2, width: '100%' }}
          />
          <TextField
            fullWidth
            label="Nota (opcional)"
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditandoPago(null)}>Cancelar</Button>
          <Button onClick={handleEdit} variant="contained">
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar este pago de {confirmDelete?.cantidad.toFixed(2)}€?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de transferencia */}
      <Dialog open={!!transferDialog} onClose={() => setTransferDialog(null)}>
        <DialogTitle>Transferir Pago</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
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
        <DialogActions>
          <Button onClick={() => setTransferDialog(null)}>Cancelar</Button>
          <Button 
            onClick={handleTransfer} 
            variant="contained"
            disabled={!compañeroDestino}
          >
            Transferir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

import { NextResponse } from 'next/server';
import {
  getData,
  getConfig,
  updateViajes,
  addCompanero,
  editCompañero,
  deleteCompanero,
  addPago,
  updatePago,
  deletePago,
  transferirPago
} from '@/services/dataService';

export async function GET() {
  try {
    const [data, config] = await Promise.all([getData(), getConfig()]);
    return NextResponse.json({ data, config });
  } catch (error) {
    console.error('Error en GET /api/viajes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'updateViajes': {
        const { nombre: companeroId, viajes } = body;
        // Procesar cada viaje individualmente
        for (const [fecha, estado] of Object.entries(viajes)) {
          await updateViajes(companeroId, fecha, estado.ida, estado.vuelta);
        }
        break;
      }

      case 'addCompañero': {
        const { nombre } = body;
        const id = nombre.toUpperCase().replace(/\s+/g, '_');
        await addCompanero(id, nombre);
        break;
      }

      case 'editCompañero': {
        const { id, nuevoNombre } = body;
        await editCompañero(id, nuevoNombre);
        break;
      }

      case 'deleteCompañero': {
        const { id } = body;
        await deleteCompanero(id);
        break;
      }

      case 'addPago': {
        const { nombre: companeroId, cantidad, fecha, nota } = body;
        await addPago(companeroId, cantidad, fecha, nota);
        break;
      }

      case 'editPago': {
        const { pagoId, cantidad, fecha, nota } = body;
        await updatePago(pagoId, { cantidad, fecha, nota });
        break;
      }

      case 'deletePago': {
        const { pagoId } = body;
        await deletePago(pagoId);
        break;
      }

      case 'transferirPago': {
        const { pagoId, nombreDestino: nuevoCompaneroId } = body;
        await transferirPago(pagoId, nuevoCompaneroId);
        break;
      }

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

    // Obtener datos actualizados
    const [data, config] = await Promise.all([getData(), getConfig()]);
    return NextResponse.json({ success: true, data, config });
  } catch (error) {
    console.error('Error en POST /api/viajes:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

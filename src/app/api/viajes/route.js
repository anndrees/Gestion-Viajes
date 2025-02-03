import { 
  getData, 
  getConfig,
  updateViajes, 
  addCompañero,
  editCompañero,
  deleteCompañero,
  addPago,
  editPago,
  deletePago,
  transferirPago
} from '../../../services/dataService';
import { NextResponse } from 'next/server';

export async function GET() {
  const [data, config] = await Promise.all([getData(), getConfig()]);
  return NextResponse.json({ data, config });
}

export async function POST(request) {
  const body = await request.json();
  let success = false;

  switch (body.action) {
    case 'updateViajes':
      success = await updateViajes(body.nombre, body.datos);
      break;

    case 'addCompañero':
      success = await addCompañero(body.nombre);
      break;

    case 'editCompañero':
      success = await editCompañero(body.id, body.nombre);
      break;

    case 'deleteCompañero':
      success = await deleteCompañero(body.id);
      break;

    case 'addPago':
      success = await addPago(body.nombre, body.cantidad, body.fecha, body.nota);
      break;

    case 'editPago':
      success = await editPago(body.nombre, body.pagoId, {
        cantidad: body.cantidad,
        fecha: body.fecha,
        nota: body.nota
      });
      break;

    case 'deletePago':
      success = await deletePago(body.nombre, body.pagoId);
      break;

    case 'transferirPago':
      success = await transferirPago(body.nombreOrigen, body.nombreDestino, body.pagoId);
      break;

    default:
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  }

  return NextResponse.json({ success });
}

import { supabase } from '../lib/supabase'

const DATA_FILE = 'viajes';
const CONFIG_FILE = 'config';

// Asegurarse de que los archivos existen
async function ensureFiles() {
  // No es necesario verificar la existencia de archivos con Supabase
}

export async function getData() {
  try {
    await ensureFiles();
    const { data, error } = await supabase
      .from('companions')
      .select('*')
      .order('nombre')
    
    if (error) throw error
    
    const companions = {}
    data.forEach(companion => {
      companions[companion.id] = {
        viajes: {},
        pagos: [],
        saldo: 0
      }
    })
    
    return companions;
  } catch (error) {
    console.error('Error al leer los datos:', error);
    return {
      MOI: { viajes: {}, pagos: [], saldo: 0 },
      JOSEMI: { viajes: {}, pagos: [], saldo: 0 }
    };
  }
}

export async function getConfig() {
  try {
    await ensureFiles();
    const { data, error } = await supabase
      .from('companions')
      .select('*')
      .order('nombre')
    
    if (error) throw error
    
    return {
      compañeros: data.map(companion => ({ id: companion.id, nombre: companion.nombre }))
    };
  } catch (error) {
    console.error('Error al leer la configuración:', error);
    return {
      compañeros: [
        { id: 'MOI', nombre: 'MOI' },
        { id: 'JOSEMI', nombre: 'JOSEMI' }
      ]
    };
  }
}

export async function saveData(data) {
  try {
    // No es necesario guardar datos con Supabase
    return true;
  } catch (error) {
    console.error('Error al guardar los datos:', error);
    return false;
  }
}

export async function saveConfig(config) {
  try {
    // No es necesario guardar configuración con Supabase
    return true;
  } catch (error) {
    console.error('Error al guardar la configuración:', error);
    return false;
  }
}

export async function updateViajes(nombre, viajes) {
  const data = await getData();
  data[nombre].viajes = viajes;
  return saveData(data);
}

export async function addCompañero(nombre) {
  const config = await getConfig();
  const data = await getData();
  
  const id = nombre.toUpperCase().replace(/\s+/g, '_');
  
  // Actualizar configuración
  config.compañeros.push({ id, nombre });
  await saveConfig(config);
  
  // Actualizar datos
  data[id] = { viajes: {}, pagos: [], saldo: 0 };
  return saveData(data);
}

export async function editCompañero(id, nuevoNombre) {
  const config = await getConfig();
  
  const index = config.compañeros.findIndex(c => c.id === id);
  if (index !== -1) {
    config.compañeros[index].nombre = nuevoNombre;
    return saveConfig(config);
  }
  return false;
}

export async function deleteCompañero(id) {
  const config = await getConfig();
  const data = await getData();
  
  // Eliminar de la configuración
  config.compañeros = config.compañeros.filter(c => c.id !== id);
  await saveConfig(config);
  
  // Eliminar datos
  delete data[id];
  return saveData(data);
}

export async function addPago(nombre, cantidad, fecha, nota = '') {
  const data = await getData();
  const pago = {
    id: uuidv4(),
    cantidad: parseFloat(cantidad),
    fecha,
    nota
  };
  
  data[nombre].pagos.push(pago);
  data[nombre].saldo += pago.cantidad;
  
  return saveData(data);
}

export async function editPago(nombre, pagoId, { cantidad, fecha, nota }) {
  const data = await getData();
  const pagoIndex = data[nombre].pagos.findIndex(p => p.id === pagoId);
  
  if (pagoIndex !== -1) {
    const diferencia = parseFloat(cantidad) - data[nombre].pagos[pagoIndex].cantidad;
    data[nombre].pagos[pagoIndex] = {
      ...data[nombre].pagos[pagoIndex],
      cantidad: parseFloat(cantidad),
      fecha,
      nota
    };
    data[nombre].saldo += diferencia;
    return saveData(data);
  }
  return false;
}

export async function deletePago(nombre, pagoId) {
  const data = await getData();
  const pagoIndex = data[nombre].pagos.findIndex(p => p.id === pagoId);
  
  if (pagoIndex !== -1) {
    const cantidad = data[nombre].pagos[pagoIndex].cantidad;
    data[nombre].pagos = data[nombre].pagos.filter(p => p.id !== pagoId);
    data[nombre].saldo -= cantidad;
    return saveData(data);
  }
  return false;
}

export async function transferirPago(nombreOrigen, nombreDestino, pagoId) {
  const data = await getData();
  const pagoIndex = data[nombreOrigen].pagos.findIndex(p => p.id === pagoId);
  
  if (pagoIndex !== -1) {
    const pago = data[nombreOrigen].pagos[pagoIndex];
    
    // Eliminar del origen
    data[nombreOrigen].pagos = data[nombreOrigen].pagos.filter(p => p.id !== pagoId);
    data[nombreOrigen].saldo -= pago.cantidad;
    
    // Añadir al destino
    data[nombreDestino].pagos.push({
      ...pago,
      id: uuidv4() // Nuevo ID para evitar conflictos
    });
    data[nombreDestino].saldo += pago.cantidad;
    
    return saveData(data);
  }
  return false;
}

export async function getCompaneros() {
  const { data, error } = await supabase
    .from('companions')
    .select('*')
    .order('nombre')
  
  if (error) throw error
  return data
}

export async function addCompanero(id, nombre) {
  const { data, error } = await supabase
    .from('companions')
    .insert([{ id, nombre }])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function deleteCompanero(id) {
  const { error } = await supabase
    .from('companions')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getViajes(companeroId) {
  const { data: trips, error: tripsError } = await supabase
    .from('trips')
    .select('*')
    .eq('companion_id', companeroId)
  
  if (tripsError) throw tripsError

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .eq('companion_id', companeroId)
  
  if (paymentsError) throw paymentsError

  // Convertir los viajes a formato actual
  const viajes = {}
  trips.forEach(trip => {
    viajes[trip.fecha] = {
      ida: trip.ida,
      vuelta: trip.vuelta
    }
  })

  // Calcular saldo total
  const saldo = payments.reduce((acc, payment) => acc + Number(payment.cantidad), 0)

  return {
    viajes,
    pagos: payments,
    saldo
  }
}

export async function updateViajes(companeroId, fecha, ida, vuelta) {
  // Primero intentamos actualizar
  const { data, error } = await supabase
    .from('trips')
    .update({ ida, vuelta })
    .eq('companion_id', companeroId)
    .eq('fecha', fecha)
    .select()

  if (error) throw error

  // Si no existe, lo creamos
  if (data.length === 0) {
    const { error: insertError } = await supabase
      .from('trips')
      .insert([{ companion_id: companeroId, fecha, ida, vuelta }])
    
    if (insertError) throw insertError
  }
}

export async function addPago(companeroId, cantidad, fecha, nota = '') {
  const { data, error } = await supabase
    .from('payments')
    .insert([{
      companion_id: companeroId,
      cantidad,
      fecha,
      nota
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updatePago(id, { cantidad, fecha, nota }) {
  const { data, error } = await supabase
    .from('payments')
    .update({ cantidad, fecha, nota })
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function deletePago(id) {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function transferirPago(pagoId, nuevoCompaneroId) {
  const { error } = await supabase
    .from('payments')
    .update({ companion_id: nuevoCompaneroId })
    .eq('id', pagoId)
  
  if (error) throw error
}

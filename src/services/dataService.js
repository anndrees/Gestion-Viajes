import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'viajes.json');
const CONFIG_FILE = path.join(process.cwd(), 'src', 'data', 'config.json');

// Asegurarse de que los archivos existen
async function ensureFiles() {
  const exists = await fs.pathExists(DATA_FILE);
  if (!exists) {
    const initialData = {
      MOI: { viajes: {}, pagos: [], saldo: 0 },
      JOSEMI: { viajes: {}, pagos: [], saldo: 0 }
    };
    await fs.outputJson(DATA_FILE, initialData, { spaces: 2 });
  }

  const configExists = await fs.pathExists(CONFIG_FILE);
  if (!configExists) {
    const initialConfig = {
      compañeros: [
        { id: 'MOI', nombre: 'MOI' },
        { id: 'JOSEMI', nombre: 'JOSEMI' }
      ]
    };
    await fs.outputJson(CONFIG_FILE, initialConfig, { spaces: 2 });
  }
}

export async function getData() {
  try {
    await ensureFiles();
    return await fs.readJson(DATA_FILE);
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
    return await fs.readJson(CONFIG_FILE);
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
    await fs.outputJson(DATA_FILE, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error al guardar los datos:', error);
    return false;
  }
}

export async function saveConfig(config) {
  try {
    await fs.outputJson(CONFIG_FILE, config, { spaces: 2 });
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

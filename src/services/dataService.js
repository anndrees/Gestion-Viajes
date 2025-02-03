import { supabase } from '../lib/supabase'

export async function getCompaneros() {
  const { data, error } = await supabase
    .from('companions')
    .select('*')
    .order('nombre')
  
  if (error) {
    console.error('Error en getCompaneros:', error);
    throw error;
  }
  return data;
}

export async function getData() {
  const { data: companions, error: companionsError } = await supabase
    .from('companions')
    .select('*')
    .order('nombre');
  
  if (companionsError) {
    console.error('Error al obtener compañeros:', companionsError);
    throw companionsError;
  }
  
  const result = {};
  for (const companion of companions) {
    // Obtener viajes
    const { data: viajes, error: viajesError } = await supabase
      .from('trips')
      .select('*')
      .eq('companion_id', companion.id);
    
    if (viajesError) {
      console.error('Error al obtener viajes:', viajesError);
      throw viajesError;
    }

    // Obtener pagos
    const { data: pagos, error: pagosError } = await supabase
      .from('payments')
      .select('*')
      .eq('companion_id', companion.id)
      .order('fecha', { ascending: false });
    
    if (pagosError) {
      console.error('Error al obtener pagos:', pagosError);
      throw pagosError;
    }

    // Formatear viajes en el formato esperado
    const viajesFormateados = {};
    viajes.forEach(viaje => {
      viajesFormateados[viaje.fecha] = {
        ida: viaje.ida,
        vuelta: viaje.vuelta
      };
    });

    // Calcular saldo
    const saldo = pagos.reduce((acc, pago) => acc + pago.cantidad, 0);
    
    result[companion.id] = {
      viajes: viajesFormateados,
      pagos: pagos,
      saldo: saldo
    };
  }
  
  return result;
}

export async function getConfig() {
  const { data, error } = await supabase
    .from('companions')
    .select('*')
    .order('nombre');
  
  if (error) {
    console.error('Error en getConfig:', error);
    throw error;
  }
  
  return data.map(companion => ({ 
    id: companion.id, 
    nombre: companion.nombre 
  }));
}

export async function addCompanero(id, nombre) {
  const { data, error } = await supabase
    .from('companions')
    .insert([{ id, nombre }])
    .select();
  
  if (error) {
    console.error('Error en addCompanero:', error);
    throw error;
  }
  return data[0];
}

export async function editCompañero(id, nuevoNombre) {
  const { data, error } = await supabase
    .from('companions')
    .update({ nombre: nuevoNombre })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error en editCompañero:', error);
    throw error;
  }
  return data[0];
}

export async function deleteCompanero(id) {
  // Primero eliminamos los pagos y viajes asociados
  const { error: pagosError } = await supabase
    .from('payments')
    .delete()
    .eq('companion_id', id);
  
  if (pagosError) {
    console.error('Error al eliminar pagos:', pagosError);
    throw pagosError;
  }

  const { error: viajesError } = await supabase
    .from('trips')
    .delete()
    .eq('companion_id', id);
  
  if (viajesError) {
    console.error('Error al eliminar viajes:', viajesError);
    throw viajesError;
  }

  // Finalmente eliminamos el compañero
  const { error } = await supabase
    .from('companions')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error en deleteCompanero:', error);
    throw error;
  }
  return true;
}

export async function getViajes(companeroId) {
  const { data: viajes, error: viajesError } = await supabase
    .from('trips')
    .select('*')
    .eq('companion_id', companeroId);
  
  if (viajesError) {
    console.error('Error al obtener viajes:', viajesError);
    throw viajesError;
  }

  const { data: pagos, error: pagosError } = await supabase
    .from('payments')
    .select('*')
    .eq('companion_id', companeroId)
    .order('fecha', { ascending: false });
  
  if (pagosError) {
    console.error('Error al obtener pagos:', pagosError);
    throw pagosError;
  }

  // Formatear viajes
  const viajesFormateados = {};
  viajes.forEach(viaje => {
    viajesFormateados[viaje.fecha] = {
      ida: viaje.ida,
      vuelta: viaje.vuelta
    };
  });

  return {
    viajes: viajesFormateados,
    pagos: pagos,
    saldo: pagos.reduce((acc, pago) => acc + pago.cantidad, 0)
  };
}

export async function updateViajes(companeroId, fecha, ida, vuelta) {
  // Intentar actualizar primero
  const { data, error: updateError } = await supabase
    .from('trips')
    .update({ ida, vuelta })
    .eq('companion_id', companeroId)
    .eq('fecha', fecha)
    .select();

  if (updateError) {
    console.error('Error al actualizar viaje:', updateError);
    throw updateError;
  }

  // Si no se actualizó ningún registro, insertar uno nuevo
  if (!data || data.length === 0) {
    const { error: insertError } = await supabase
      .from('trips')
      .insert([{ companion_id: companeroId, fecha, ida, vuelta }]);

    if (insertError) {
      console.error('Error al insertar viaje:', insertError);
      throw insertError;
    }
  }

  return true;
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
    .select();
  
  if (error) {
    console.error('Error en addPago:', error);
    throw error;
  }
  return data[0];
}

export async function updatePago(id, { cantidad, fecha, nota }) {
  const { data, error } = await supabase
    .from('payments')
    .update({ cantidad, fecha, nota })
    .eq('id', id)
    .select();
  
  if (error) {
    console.error('Error en updatePago:', error);
    throw error;
  }
  return data[0];
}

export async function deletePago(id) {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error en deletePago:', error);
    throw error;
  }
  return true;
}

export async function transferirPago(pagoId, nuevoCompaneroId) {
  const { data, error } = await supabase
    .from('payments')
    .update({ companion_id: nuevoCompaneroId })
    .eq('id', pagoId)
    .select();
  
  if (error) {
    console.error('Error en transferirPago:', error);
    throw error;
  }
  return data[0];
}

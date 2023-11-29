function editRole(userId) {
    // Oculta el texto y muestra el campo de entrada
    document.getElementById(`role_${userId}`).style.display = 'none';
    document.getElementById(`editRole_${userId}`).style.display = 'block';
  
    // Muestra el botón de guardar
    document.querySelector(`button[onclick="editRole('${userId}')"]`).style.display = 'none';
    document.querySelector(`button[onclick="saveRole('${userId}')"]`).style.display = 'block';
  }
  
  async function saveRole(userId) {
    // Obtiene el nuevo valor del campo role
    const newRole = document.getElementById(`editRole_${userId}`).value;
  
    // Realiza una solicitud al servidor para actualizar el role en la base de datos
    const response = await fetch(`/update-role/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: newRole }),
    });
  
    if (response.ok) {
      // Si la actualización fue exitosa, actualiza la vista
      document.getElementById(`role_${userId}`).textContent = newRole;
  
      // Oculta el campo de entrada y muestra el texto
      document.getElementById(`role_${userId}`).style.display = 'inline';
      document.getElementById(`editRole_${userId}`).style.display = 'none';
  
      // Muestra el botón de editar
      document.querySelector(`button[onclick="editRole('${userId}')"]`).style.display = 'block';
      document.querySelector(`button[onclick="saveRole('${userId}')"]`).style.display = 'none';
    } else {
      alert('Error al guardar el rol. Por favor, inténtalo de nuevo.');
    }
  }  
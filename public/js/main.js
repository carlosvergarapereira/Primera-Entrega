const socket = io();

// Escucha el evento de actualización de productos
socket.on('updateProducts', (products) => {
    updateProductList(products); // Llama a una función para actualizar la vista
});

// Función para actualizar la lista de productos en la vista
function updateProductList(products) {
    const productList = document.getElementById('product-list'); 
    productList.innerHTML = ''; 

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.innerHTML = `
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <button onclick="deleteProduct(${product.id})">Eliminar</button>
        `;
        productList.appendChild(productElement);
    });
}

// Función para eliminar un producto
function deleteProduct(productId) {
    fetch(`/api/products/${productId}`, {
        method: 'DELETE'
    }).then(response => response.json())
      .then(data => {
          console.log(data.message);
      }).catch(error => {
          console.error('Error al eliminar el producto:', error);
      });
}


const socket = io();

// Actualizar la lista de productos cuando se recibe un mensaje del servidor
socket.on('updateProducts', (products) => {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    products.forEach(product => {
        const listItem = document.createElement('li');
        listItem.className = 'product-item';
        listItem.innerHTML = `
            <h2>${product.title}</h2>
            <p>${product.description}</p>
            <p>Precio: $${product.price}</p>
            <p>Categoría: ${product.category}</p>
            <button onclick="deleteProduct(${product.id})">Eliminar</button>
        `;
        productList.appendChild(listItem);
    });
});

// Emitir un evento para eliminar un producto
function deleteProduct(productId) {
    socket.emit('deleteProduct', productId);
}

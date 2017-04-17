class Product {
    constructor(options) {
        const { id, emoji, description, price, inStock, children } = options;
        this.id = id;
        this.emoji = emoji;
        this.description = description;
        this.price = price;
        this.inStock = inStock;
        this.children = children;
    }
    render(inCart = false) {
        if (this.inStock) {
            const { id, emoji, description, price, inStock, children, ...cartProps} = this;
            const html =
                `<div>
					<h3>${description}</h3>
					${inCart
                    ? ''
                    : `<p class="emoji">${emoji}</p>`
                    }
					<p>
						<span class="price">${price}</span>
					</p>
					${cartProps.quantity > 1
                    ? `<p>${cartProps.quantity} x <span class="price">${cartProps.pricePerUnit}</span></p>`
                    : ''
                    }
					${inCart
                    ? `<a href="#" onClick="cart.removeItem(${id});">Remove</a>`
                    : `<a href="#" data-id="${id}">Add to Cart</a>`
                    }
				</div>`;
            return html;
        }
        return '';
    }
}

class Cart {
    constructor(items = []) {
        this.items = items;
    }
    mandatory() {
        throw new Error('Missing parameter');
    }
    addItem(item = this.mandatory()) {

        const existingCartItem = this.items.find(cartItem => cartItem.id === item.id);

        if(existingCartItem) {
            const { pricePerUnit } = existingCartItem;
            existingCartItem.quantity++;
            existingCartItem.price = existingCartItem.quantity * pricePerUnit;
            this.updateCart();
        } else {
            const cartItem = new ProductInCart(item);
            this.items.push(cartItem);
            this.updateCart();
        }
    }
    removeItem(id = this.mandatory()) {
        const matchingItem = this.items.find(item => item.id === id);
        if(matchingItem) {
            const matchingItemIndex = this.items.indexOf(matchingItem);
            this.items.splice(matchingItemIndex, 1);
            this.updateCart();
        }
    }
    updateCart() {
        // called whenever an item is added or removed
        const cart = document.getElementById('cart');
        cart.innerHTML = '';
        this.items.forEach(item => cart.innerHTML += item.render(true));
        this.updateTotal();
    }
    updateTotal() {
        const total = this.items.reduce((sum, item) => sum + item.price, 0);
        document.getElementById('cart-total').innerText = total;
    }
}

class ProductInCart extends Product {
    constructor(options) {
        super(options);
        this.pricePerUnit = options.price;
        this.quantity = 1;
    }
}

// Application initialization
const url = 'https://api.myjson.com/bins/6r3ev';
const productContainer = document.getElementById('products');
const cart = new Cart();
fetch(url)
    .then(response => response.json())
.then(data => {
    const products = data.map(product => {
        const newProduct = new Product(product);
        productContainer.innerHTML += newProduct.render();
        return newProduct;
    });
    productContainer.querySelectorAll('a').forEach(addButton => {
        addButton.addEventListener('click', evt => {
            evt.preventDefault();
            const button = evt.target;
            const id = parseInt(button.getAttribute('data-id'), 10);
            const product = products.find(obj => obj.id === id);
            cart.addItem(product);
        });
    });
});
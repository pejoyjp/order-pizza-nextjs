import { create } from 'zustand';
import { persist } from 'zustand/middleware';


const useCart = create(persist((set) => ({
    carts: [],
    totalPrices: 0,

    // 添加商品到购物车
    addItem: (pizza) => {
        set(state => {
            const cart = [...state.carts];
            const existingItemIndex = cart.findIndex(item => item.id === pizza.id && item.sizeandcrust === pizza.sizeandcrust );
            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += 1;  // 已存在，增加数量
            } else {
                cart.push({ ...pizza, quantity: 1, toppings: [], createAt: Date.now() });  // 不存在，添加新商品
            }
            return {
                carts: cart,
                totalPrices: calculateTotalPrices(cart)  // Update total prices
            };
        });
    },
    
    // 从购物车中移除商品
    removeItem: (pizza) => {
        set(state => {
            const cart = [...state.carts];
            const itemIndex = cart.findIndex(item => item.id === pizza.id && item.sizeandcrust === pizza.sizeandcrust );
            if (itemIndex === -1) return state;  // 商品不存在于购物车中

            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;  // 数量大于1，减少数量
            } else {
                cart.splice(itemIndex, 1);  // 数量为1，移除商品
            }
            return {
                carts: cart,
                totalPrices: calculateTotalPrices(cart)  // Update total prices
            };
        });
    },

    // 更新购物车中商品的数量
    initializeToppingToPizza: (pizzaId, topping) => {
        set(state => {
            const cart = [...state.carts];
            const pizza = cart.find(item => item.id === pizzaId);
            if (pizza) {
                if (!pizza.toppings) {
                    pizza.toppings = []; // Initialize toppings array if it doesn't exist
                }
                const existingToppingIndex = pizza.toppings.findIndex(t => t.name === topping.name);
                if (existingToppingIndex !== -1) {
                    // If topping already exists, increment its quantity
                    pizza.toppings[existingToppingIndex].quantity += 1;
                } else {
                    // If topping doesn't exist, add it to the toppings array
                    pizza.toppings.push(topping);
                }
                console.log("Updated cart:", cart);
                return {
                    carts: cart,
                    totalPrices: state.totalPrices
                };
            }
            return state;
        });
    },
    

    // 向披萨添加配料
    addToppingToPizza: (pizzaId, topping) => {
        set(state => {
            const cart = [...state.carts];
            const pizza = cart.find(item => item.id === pizzaId);
            if (pizza) {
                if (!pizza.toppings) {
                    pizza.toppings = []; // Initialize toppings array if it doesn't exist
                }
                const existingToppingIndex = pizza.toppings.findIndex(t => t.name === topping.name);
                if (existingToppingIndex !== -1) {
                    // If topping already exists, increment its quantity
                    pizza.toppings[existingToppingIndex].quantity += 1;
                } else {
                    // If topping doesn't exist, add it to the toppings array
                    pizza.toppings.push(topping);
                }
                console.log("Added cart:", cart);
                // Calculate the price of the newly added topping only
                const addedToppingPrice = topping.price * topping.quantity;
                // Calculate the total price including the newly added topping
                const totalPrices = state.totalPrices + addedToppingPrice;
                return {
                    carts: cart,
                    totalPrices: totalPrices
                };
            }
            return state;
        });
    },
    
    

    // 从披萨中移除配料
    removeToppingFromPizza: (pizzaId, topping) => {
        set(state => {
            const cart = [...state.carts];
            const pizza = cart.find(item => item.id === pizzaId);
            if (pizza && pizza.toppings) {
                const toppingToRemove = pizza.toppings.find(t => t.name === topping.name);
                if (toppingToRemove) {
                    if (toppingToRemove.quantity > 0) {
                        // If topping quantity is greater than 0, decrement the quantity
                        toppingToRemove.quantity -= 1;
                        // Calculate the price of the removed topping only
                        const removedToppingPrice = topping.price;
                        // Calculate the total price after removing the topping
                        const totalPrices = state.totalPrices - removedToppingPrice;
                        if (toppingToRemove.quantity === 0) {
                            // If topping quantity becomes 0, remove the topping from the toppings array
                            const toppingIndex = pizza.toppings.indexOf(toppingToRemove);
                            pizza.toppings.splice(toppingIndex, 1);
                        }
                        console.log("Updated cart:", cart);
                        return {
                            carts: cart,
                            totalPrices: totalPrices  // Update total prices
                        };
                    }
                }
            }
            return state;
        });
    },
    // 清空购物车
    clearCart: () => set({ carts: [], totalPrices: 0 }),

  

}), {
    name: 'cart-storage',  // 使用LocalStorage存储的key
    // getStorage: () => localStorage  // 定义使用的存储方式
}));

export default useCart;

// 计算购物车中的总价格
function calculateTotalPrices(cart) {
    return cart.reduce((acc, item) => {
        // Calculate total price for each pizza including toppings
        const pizzaPrice = item.price + (item.toppings ? item.toppings.reduce((toppingAcc, topping) => toppingAcc + topping.price * topping.quantity, 0) : 0);
        return acc + pizzaPrice * item.quantity;
    }, 0);
}
import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const getCartItemId = (item) => {
    const pid = item._id || item.id;
    return `${pid}-${item.selectedPricing || 'default'}-${item.selectedSize || ''}-${item.selectedColor || ''}`;
};

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const newItemId = getCartItemId(action.payload);
            const existingIndex = state.items.findIndex(item => getCartItemId(item) === newItemId);
            
            if (existingIndex >= 0) {
                const updatedItems = [...state.items];
                updatedItems[existingIndex] = {
                    ...updatedItems[existingIndex],
                    quantity: updatedItems[existingIndex].quantity + (action.payload.quantity || 1)
                };
                return { ...state, items: updatedItems };
            }
            return { ...state, items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1, cartItemId: newItemId }] };
        }
        case 'REMOVE_FROM_CART':
            return { ...state, items: state.items.filter(item => item.cartItemId !== action.payload) };
        case 'UPDATE_QUANTITY': {
            if (action.payload.quantity <= 0) {
                return { ...state, items: state.items.filter(item => item.cartItemId !== action.payload.cartItemId) };
            }
            return {
                ...state,
                items: state.items.map(item =>
                    item.cartItemId === action.payload.cartItemId ? { ...item, quantity: action.payload.quantity } : item
                )
            };
        }
        case 'CLEAR_CART':
            return { ...state, items: [] };
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    const addToCart = (product, quantity = 1, selectedPricing = 'default', selectedSize = '', selectedColor = '') => {
        let finalPrice = product.price;
        if (selectedPricing !== 'default' && product.pricings) {
            const pricingOpt = product.pricings.find(p => p.label === selectedPricing);
            if (pricingOpt) finalPrice = pricingOpt.price;
        }

        dispatch({ 
            type: 'ADD_TO_CART', 
            payload: { 
                ...product, 
                price: finalPrice, 
                quantity,
                selectedPricing, 
                selectedSize, 
                selectedColor 
            } 
        });
    };
    const removeFromCart = (cartItemId) => dispatch({ type: 'REMOVE_FROM_CART', payload: cartItemId });
    const updateQuantity = (cartItemId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } });
    const clearCart = () => dispatch({ type: 'CLEAR_CART' });

    const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart: state.items, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};

import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
   const storagedCart =  localStorage.getItem('@BinaryShoes:cart');

   if (storagedCart) {
     return JSON.parse(storagedCart); //  JSON.parse() convert string to object
   }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const updatedCart = [...cart]; // a new array with the same elements of cart
      const productExists = updatedCart.find(product => product.id === productId); // find the product in the cart
      const stock = await api.get(`/stock/${productId}`); // get the stock of the product
      const stockAmount = stock.data.amount; // get the amount of the stock
      const currentAmount = productExists ? productExists.amount : 0; // get the current amount of the product in the cart
      const amount = currentAmount + 1; // calculate the new amount of the product in the cart
      
      if (amount > stockAmount) {
         // if the amount of the product in the cart is greater than the stock
        toast.error('Out of stock'); // show a toast error
        return; // stop the function
      }
      if (productExists) { // if the product exists in the cart
        productExists.amount = amount; // update the amount of the product in the cart
      }
      else {
        const product = await api.get(`/products/${productId}`); // get the product
        const newProduct ={
          ...product.data, // get the product data
          amount: 1 // set the amount of the product to 1
        }
        updatedCart.push(newProduct); // add the product to the cart
      }
      setCart(updatedCart ); // update the cart
      localStorage.setItem('@BinaryShoes:cart', JSON.stringify(updatedCart)); 
      // update the local storage 
    } catch {
     toast.error('Error adding product to cart');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart]; // a new array with the same elements of cart
      const productIndex = updatedCart.findIndex(product => product.id === productId); // find the product in the cart
      if (productIndex >= 0) {
        updatedCart.splice(productIndex, 1); // remove the product from the cart
        setCart(updatedCart); // update the cart
        localStorage.setItem('@BinaryShoes:cart', JSON.stringify(updatedCart)); // update the local storage
      }else{
        throw Error();
      }
    } catch {
      toast.error('Error removing product from cart');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
     if (amount <= 0) {
       return;
     }
     const stock = await api.get(`/stock/${productId}`); // get the stock of the product
      const stockAmount = stock.data.amount; // get the amount of the stock
      if (amount > stockAmount) {
        toast.error('Out of stock'); // show a toast error
        return; // stop the function
      }
      const updatedCart = [...cart]; // a new array with the same elements of cart
      const productExists = updatedCart.find(product => product.id === productId); // find the product in the cart
      if (productExists) { // if the product exists in the cart
        productExists.amount = amount; // update the amount of the product in the cart
        setCart(updatedCart); // update the cart
        localStorage.setItem('@BinaryShoes:cart', JSON.stringify(updatedCart));
      }else{
      throw Error();
      }
    
    } catch {
    toast.error('Error updating product amount');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}

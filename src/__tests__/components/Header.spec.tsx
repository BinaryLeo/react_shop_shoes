import { render } from '@testing-library/react';
import { ReactNode } from 'react';
import Header from '../../components/Header';

jest.mock('react-router-dom', () => {
  return {
    Link: ({ children }: { children: ReactNode }) => children,
  };
});

jest.mock('../../hooks/useCart', () => {
  return {
    useCart: () => ({
      cart: [
        {
          amount: 2,
          id: 1,
          image:
            'public/assets/archfit.jpg',
          price: 219.9,
          title: 'Sk  Arch Fit - Vibrant Step Navy',
        },
        {
          amount: 1,
          id: 2,
          image:
            'public/assets/237304_BLYL.jpg',
          price: 115.0,
          title: 'Max Protect - Fast Track',
        },
      ],
    }),
  };
});

describe('Header Component', () => {
  it('should be able to render the amount of products added to cart', () => {
    const { getByTestId } = render(<Header />);

    const cartSizeCounter = getByTestId('cart-size');
    expect(cartSizeCounter).toHaveTextContent('2 itens');
  });
});

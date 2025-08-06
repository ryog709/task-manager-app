import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders task manager title', () => {
    render(<App />);
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
  });

  it('renders category tabs', () => {
    render(<App />);
    expect(screen.getByText('仕事')).toBeInTheDocument();
    expect(screen.getByText('プライベート')).toBeInTheDocument();
    expect(screen.getByText('勉強')).toBeInTheDocument();
  });

  it('renders task input form', () => {
    render(<App />);
    expect(
      screen.getByPlaceholderText('新しいタスクを入力...')
    ).toBeInTheDocument();
    expect(screen.getByText('追加')).toBeInTheDocument();
  });
});

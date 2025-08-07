import React, { useState } from 'react';
import { TaskProvider } from './contexts/TaskContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import TabNavigation from './components/TabNavigation/TabNavigation';
import TaskManager from './components/TaskManager/TaskManager';
import LoginButton from './components/LoginButton/LoginButton';
import { CATEGORIES } from './utils/constants';
import './styles/globals.css';

function App() {
  const [currentCategory, setCurrentCategory] = useState('work');

  return (
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          <div className="app">
            <Header />
            <main className="main">
              <div className="container">
                <div className="sync-section">
                  <LoginButton />
                </div>
                <TabNavigation
                  currentCategory={currentCategory}
                  onCategoryChange={setCurrentCategory}
                />
                <TaskManager category={currentCategory} />
              </div>
            </main>
          </div>
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

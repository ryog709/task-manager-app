import React, { useState } from 'react';
import { TaskProvider } from './contexts/TaskContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header/Header';
import TabNavigation from './components/TabNavigation/TabNavigation';
import TaskManager from './components/TaskManager/TaskManager';
import { CATEGORIES } from './utils/constants';
import './styles/globals.css';

function App() {
  const [currentCategory, setCurrentCategory] = useState('work');

  return (
    <ThemeProvider>
      <TaskProvider>
        <div className="app">
          <Header />
          <main className="main">
            <div className="container">
              <TabNavigation 
                currentCategory={currentCategory}
                onCategoryChange={setCurrentCategory}
              />
              <TaskManager category={currentCategory} />
            </div>
          </main>
        </div>
      </TaskProvider>
    </ThemeProvider>
  );
}

export default App;

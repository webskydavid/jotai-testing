import React from 'react';
import './styles.css';
import List from './List';
import StaticList from './StaticList';

export default function App() {
  return (
    <div className="App">
      <List />
      <hr />
      <StaticList />
    </div>
  );
}

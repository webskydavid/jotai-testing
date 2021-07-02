import React from 'react';
import './styles.css';
import List from './List';
import StaticList from './StaticList';
import DynamicList from './DynamicList';
import ObjectList from './ObjectList';

export default function App() {
  return (
    <div className="App">
      {/* <List /> */}
      <hr />
      {/* <StaticList /> */}
      <hr />
      <DynamicList />
      <hr />
      {/* <ObjectList /> */}
    </div>
  );
}

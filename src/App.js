import React, { Component } from "react";
import "./App.css";
import { render } from "react-dom";

import EmployeeFileReader from "./components/EmployeeFileReader";
import DataGrid  from "./components/DataGrid";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
    };
  }

  onAddItems(newDataGrid) {
   this.myRef.current.addItems(newDataGrid);
  }
  
  render() {
    return (
      <div className="container">
            <EmployeeFileReader addItems={this.onAddItems.bind(this)}/> 
            <DataGrid ref={this.myRef}/> 
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));

export default App;

import React, { Component } from "react";
import "../App.css";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

 class DataGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
        modules: AllCommunityModules,
        columnDefs: [ 
                      { headerName: "Employee ID #1", field: "firstEmployeeId" },
                      { headerName: "Employee ID #2", field: "secondEmployeeId" },
                      { headerName: "Project ID", field: "projectId" },
                      { headerName: "Days worked", field: "daysWrokedTogether"}
                    ],
        rowData: [],
        defaultColDef: { flex: 1 },
        rowSelection: "multiple"
       
    };
  };
  
 setRecordForMostWorkTogether(arrInfo) {
    this.state.mostWorkTogetherEmployees.push(arrInfo[0]);
  }

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  addItems = (data) => {
    this.gridApi.setRowData([]); // clean data in data grid
    let res = this.gridApi.updateRowData({ add: data }); // set new record
    this.printResult(res); // add it to data grid
  }

  printResult(res) {
    if (res.add) {
      res.add.forEach(function (rowNode) {
      });
    }
  }
  render() {
    return (
      <div className="ag-theme-alpine" style={{ height: "300px", width: "100%", marginTop: "30px" }} >
          <h2> Employees who had worked together the most on the same projects:</h2>
          <AgGridReact
            modules={this.state.modules}
            rowData={this.state.rowData}
            columnDefs={this.state.columnDefs}
            defaultColDef={this.state.defaultColDef}
            rowSelection={this.state.rowSelection}
            animateRows={true}
            onGridReady={this.onGridReady}
          />
      </div>
    );
  }
}

export default DataGrid;
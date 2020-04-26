import React, { Component } from "react";
import "./App.css";
import { render } from "react-dom";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModules } from "@ag-grid-community/all-modules";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

// parse a date in yyyy-mm-dd format
function parseDate(input) {
  let parts = input.match(/(\d+)/g);
  // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
  return new Date(parts[0], parts[1] - 1, parts[2]); // months are 0-based
}

function calculateDaysBetweenTwoDates(date1, date2) {
  let diffInTimes = date2.getTime() - date1.getTime();
  let diffInDays = diffInTimes / (1000 * 3600 * 24);

  return diffInDays + 1; //get dates work together including the last one
}

function calculateMostWorkedTogether(employeesInfo) {
  let arrayWithWorkedTimeInfo = [];
  let firstRecordWorkTogether = true;

  for (let i = 0; i < employeesInfo.length; i++) {
    for (let j = i + 1; j < employeesInfo.length; j++) {
      // if employers are diff and project is the same
      if ( employeesInfo[i].employeeId !== employeesInfo[j].employeeId &&
           employeesInfo[i].projectId === employeesInfo[j].projectId) {
        //if they worked together
        if (parseDate(employeesInfo[i].startDate).getTime() <= parseDate(employeesInfo[j].endDate).getTime() &&
            parseDate(employeesInfo[i].endDate).getTime() >= parseDate(employeesInfo[j].startDate).getTime() ) {
          //calculate work together time
          //find range when they work t ogether
          const startDate = parseDate(employeesInfo[i].startDate).getTime() > parseDate(employeesInfo[j].startDate).getTime()
                          ? employeesInfo[i].startDate
                          : employeesInfo[j].startDate;
                          
          const endDate = parseDate(employeesInfo[i].endDate).getTime() < parseDate(employeesInfo[j].endDate).getTime()
                        ? employeesInfo[i].endDate
                        : employeesInfo[j].endDate;

          //calculate how many days between dates
          const curentDaysWorkedTogether = calculateDaysBetweenTwoDates(parseDate(startDate),parseDate(endDate));

          let shouldWeAddNewElement = true;
          
          //if first time just push new record
          if (firstRecordWorkTogether) {
            firstRecordWorkTogether = false;
          } else { // else check if there is alredy record for those employee and update there work together time
            for (let z = 0; z < arrayWithWorkedTimeInfo.lenght; z++) {
              //if we alredy have this employee pair for this project
              if ( arrayWithWorkedTimeInfo[z].projectId === employeesInfo[i].projectId) {
                if ((arrayWithWorkedTimeInfo[z].firstEmployeeId === employeesInfo[i].employeeId &&
                    arrayWithWorkedTimeInfo[z].secondEmployeeId === employeesInfo[j].employeeId) 
                    ||  //in case of different order of employee one and employee two
                  (arrayWithWorkedTimeInfo[z].firstEmployeeId === employeesInfo[j].employeeId &&
                    arrayWithWorkedTimeInfo[z].secondEmployeeId === employeesInfo[i].employeeId) ) {


                  arrayWithWorkedTimeInfo[z].daysWorkedTogether += curentDaysWorkedTogether;
                  shouldWeAddNewElement = false;
                  break;
                }
              }
            }
          }

          if (shouldWeAddNewElement) {
            arrayWithWorkedTimeInfo.push({
                                          firstEmployeeId: employeesInfo[i].employeeId,
                                          secondEmployeeId: employeesInfo[j].employeeId,
                                          projectId: employeesInfo[i].projectId,
                                          daysWrokedTogether: curentDaysWorkedTogether,
                                          });
          }
        }
      }
    }
  }

  return arrayWithWorkedTimeInfo; 
}

function createArrayFromEmployeeInfo(arr) {
  let objs = [];

  for (let index = 0; index < arr.length; index++) {
    const empoleIdElement = arr[index][0];
    const projectIdElement = arr[index][1];
    const startDateElement = arr[index][2];
    let endDateElement = "";

    if (arr[index][3].toLowerCase() === "null") {
      let today = new Date();
      let dd = today.getDate();
      let mm = today.getMonth() + 1;
      let yyyy = today.getFullYear();

      endDateElement = yyyy + "-" + mm + "-" + dd;
    } else {
      endDateElement = arr[index][3];
    }

    objs.push({ employeeId: empoleIdElement,
                projectId: projectIdElement,
                startDate: startDateElement,
                endDate: endDateElement,
              });
  }

  return objs;
}

function createNewRowData(firstEmployeeId, secondEmployeeId, projectId, daysWrokedTogether) {
  let newData = { 
                  employeeOne: firstEmployeeId,
                  employeeTwo: secondEmployeeId,
                  projectId: projectId,
                  workedTime: daysWrokedTogether,
                };
                
  return newData;
}

let calculatedDataFromFile = [];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modules: AllCommunityModules,
      columnDefs: [ 
                    { headerName: "Employee ID #1,", field: "employeeOne" },
                    { headerName: "Employee ID #2,", field: "employeeTwo" },
                    { headerName: "Project ID,", field: "projectId" },
                    { headerName: "Days worked,", field: "workedTime", sort: "desc",sortable: true,},
                  ],
      rowData: [],
      defaultColDef: { flex: 1 },
      rowSelection: "multiple",
    };
  }

  onGridReady = (params) => {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  };

  showFile = () => {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      let preview = document.getElementById("text-from-file");
      let file = document.querySelector("input[type=file]").files[0];
      let reader = new FileReader();
      let allElementsFromFile = [];
      let textFile = /text.*/;

      if (file.type.match(textFile)) {
        reader.onload = function (event) {
          let text = reader.result;
          let linesFromText = text.split("\r\n"); // values in lines[0], lines[1]...

          for (let i = 0; i < linesFromText.length; i++) {
            let str = linesFromText[i].replace(/\s/g, "");
            allElementsFromFile.push(str.split(","));
          }
          
          let employeesInfo = createArrayFromEmployeeInfo(allElementsFromFile);

          // calculate work together on the same projects
          let workTheMostTogetherInfo = calculateMostWorkedTogether(employeesInfo);

          // add data for data grid
          for (var i = 0; i < workTheMostTogetherInfo.length; i++) {
            calculatedDataFromFile.push(
              createNewRowData(
                                workTheMostTogetherInfo[i].firstEmployeeId,
                                workTheMostTogetherInfo[i].secondEmployeeId,
                                workTheMostTogetherInfo[i].projectId,
                                workTheMostTogetherInfo[i].daysWrokedTogether
                              )
            );
          }

          preview.innerHTML = event.target.result;
        };
      } else {
        preview.innerHTML = "<span class='error'>It doesn't seem to be a text file!</span>";
      }

      reader.readAsText(file);
    } else {
      alert("Your browser is too old to support HTML5 File API");
    }
  };

  addItems = () => {
    var res = this.gridApi.updateRowData({ add: calculatedDataFromFile });
    printResult(res);
  };

  render() {
    return (
      <div style={{ height: "calc(100% - 60px)" }}>
        <h1> First choose file then click on the button bellow</h1>
        <div  className="ag-theme-alpine" style={{ height: "600px", width: "100%" }} >

          <input type="file" onChange={this.showFile} />
          <h4> Data from the choosen file: </h4>
          <div id="text-from-file"></div>

         
          <div style={{ marginTop: "25px" }}>
            <button class="btn btn-2 btn-2h"onClick={() => this.addItems()}>
              Show Employees who worked together
            </button>
          </div>


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
      </div>
    );
  }
}

function printResult(res) {
  if (res.add) {
    res.add.forEach(function (rowNode) {
    });
  }
}

render(<App />, document.getElementById("root"));

export default App;

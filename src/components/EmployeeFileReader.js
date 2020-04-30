import React, { Component } from "react";
import "../App.css";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";

class EmployeeFileReader extends Component {
  constructor(props) {
    super(props);
    this.showFile = this.showFile.bind(this)
    this.state = {
      mostWorkTogetherEmployees: [],
    };
  }

  setRecordForMostWorkTogether (arrInfo) {
    this.state.mostWorkTogetherEmployees.push(arrInfo[0]);
    this.props.addItems(this.state.mostWorkTogetherEmployees);
  };

  showFile = (e) => {
    e.preventDefault();
    this.state.mostWorkTogetherEmployees = []; // clean array in case of re importing file

    if (window.File && window.FileReader && window.FileList && window.Blob) {
      let preview = document.getElementById("text-from-file");
      let file = document.querySelector("input[type=file]").files[0];
      let reader = new FileReader();

      let allElementsFromFile = [];
      let accesFunctions = this;

      if (file.name.match('/*.txt')) {
        reader.onload =  async (event) =>  {
          let text = reader.result;
          let linesFromText = text.split("\r\n"); // values in linesFromText[0], [1]...

          for (let i = 0; i < linesFromText.length; i++) {
            let str = linesFromText[i].replace(/\s/g, "");
            allElementsFromFile.push(str.split(","));
          }
          let employeesInfo = accesFunctions.createArrayFromEmployeeInfo(allElementsFromFile);
          // calculate work together on the same projects
          let workTheMostTogetherInfo = accesFunctions.calculateMostWorkedTogether(employeesInfo);
          // add data for data grid
          accesFunctions.setRecordForMostWorkTogether(workTheMostTogetherInfo);
          
        };
      } else {
        preview.innerHTML =
          "<span class='error'>It doesn't seem to be a text file!</span>";
      }
      reader.readAsText(file);
    } else {
      alert("Your browser is too old to support HTML5 File API");
    }
  };

  // parse a date in yyyy-mm-dd format
  parseDate(input) {
    let parts = input.match(/(\d+)/g);

    return new Date(parts[0], parts[1] - 1, parts[2]); // months are 0-based
  }

  calculateDaysBetweenTwoDates(date1, date2) {
    let diffInTimes = this.parseDate(date2).getTime() - this.parseDate(date1).getTime();
    let diffInDays = diffInTimes / (1000 * 3600 * 24);

    return diffInDays + 1; //get dates work together including the last one
  }

  doesEmployeesWorkTogether(empFirst, empSecond) {
    if ( empFirst.employeeId !== empSecond.employeeId && empFirst.projectId === empSecond.projectId) {
      if (this.parseDate(empFirst.startDate).getTime() <= this.parseDate(empSecond.endDate).getTime() &&
          this.parseDate(empFirst.endDate).getTime() >=  this.parseDate(empSecond.startDate).getTime()
      ) {
        return true;
      }
    }

    return false;
  }

  getTimeEmployesWorkedTogether(empFirst, empSecond) {
    //find range when they work together
    const startDate = this.parseDate(empFirst.startDate).getTime() > this.parseDate(empSecond.startDate).getTime()
        ? empFirst.startDate
        : empSecond.startDate;

    const endDate = this.parseDate(empFirst.endDate).getTime() < this.parseDate(empSecond.endDate).getTime()
        ? empFirst.endDate
        : empSecond.endDate;

    //calculate how many days between dates
    return this.calculateDaysBetweenTwoDates(startDate, endDate);
  }

  setDataToWorkedTimeArray(arr, empFirst, empSecond, curentDaysWorkedTogether) {
    let shouldWeAddNewElement = true;

    //  check if there is alredy record for those employee and update there work together time
    for (let z = 0; z < arr.lenght; z++) {
      //if we alredy have this employee pair for this project
      if (arr.projectId === empFirst.projectId) {
        if ( (arr.firstEmployeeId === empFirst.employeeId && arr.secondEmployeeId === empSecond.employeeId) || //in case of different order of employee one and employee two
             (arr.firstEmployeeId === empSecond.employeeId && arr.secondEmployeeId === empFirst.employeeId) ) {
          arr.daysWorkedTogether += curentDaysWorkedTogether;
          shouldWeAddNewElement = false;
          break;
        }
      }
    }

    if (shouldWeAddNewElement) {
      arr.push({
        firstEmployeeId: empFirst.employeeId,
        secondEmployeeId: empSecond.employeeId,
        projectId: empFirst.projectId,
        daysWrokedTogether: curentDaysWorkedTogether,
      });
    }

    return arr;
  }

  calculateMostWorkedTogether(employeesInfo) {
    let arrayWithWorkedTimeInfo = [];

    for (let i = 0; i < employeesInfo.length; i++) {
      for (let j = i + 1; j < employeesInfo.length; j++) {
        // if employers are diff and project is the same
        //if they worked together
        if (this.doesEmployeesWorkTogether(employeesInfo[i], employeesInfo[j])) {
          //calculate work together time
          //find range when they work t ogether
          const curentDaysWorkedTogether = this.getTimeEmployesWorkedTogether(employeesInfo[i], employeesInfo[j]);

          if (arrayWithWorkedTimeInfo.length > 0) {
            arrayWithWorkedTimeInfo = this.setDataToWorkedTimeArray(
                                        arrayWithWorkedTimeInfo,
                                        employeesInfo[i],
                                        employeesInfo[j],
                                        curentDaysWorkedTogether
                                      );
          } else {
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
    //sorting employees based on who worked the most
    arrayWithWorkedTimeInfo.sort((a, b) => a.daysWrokedTogether < b.daysWrokedTogether ? 1 : -1
    );

    return arrayWithWorkedTimeInfo;
  }

  createArrayFromEmployeeInfo(arr) {
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

      objs.push({
        employeeId: empoleIdElement,
        projectId: projectIdElement,
        startDate: startDateElement,
        endDate: endDateElement,
      });
    }

    return objs;
  }

  onAddItemsEmp() {
    this.props.addItems(this.state.mostWorkTogetherEmployees);
  }
  render() {
    return (
      <div className="row"> 
        <h1> Choose a text file </h1>
        <div className="col-sm-12">
            <input type="file" onChange={this.showFile} />
            <div id="text-from-file"></div>
      </div>
     </div>
    );
  }
}


export default EmployeeFileReader;
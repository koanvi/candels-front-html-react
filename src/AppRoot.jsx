import React from 'react';

import {LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip} from 'recharts';

export default class Candles extends React.Component {

  constructor(props) {
    super(props);

    this.sourseLst = {
      OPEN: {text: "цена на момент открытия", key:"OPEN"},
      CLOSE: {text: "цена на момент закрытия", key: "CLOSE"},
      HIGH: {text: "максимальная цена", key: "HIGH"},
    };

    this.state = {
      startDt: new Date("2021-01-01"),
      endDt: new Date("2023-01-01"),
      sourceID: this.sourseLst.OPEN.key,
      report: null,
      isUpdating: false,
      comment: "",
    };
  }

  onClickBtnUpdate(e) {

    this.setState((state, props) => ({
      isUpdating: true,
      report: null,
      comment: "данные обновляются",
    }));
    //fetch!!!

    fetch(`http://localhost:1234/candles/?startDt=${this.state.startDt.toISOString().slice(0, 10)}&endDt=${this.state.endDt.toISOString().slice(0, 10)}`)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState((state, props) => ({
            isUpdating: false,
            report: result,
            comment: "данные получены",
          }));
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState((state, props) => ({
            isUpdating: false,
            // report: result,
            comment: "ошибка получения данных",
          }));
        }
      )
  }

  onReportFetched() {
    //fetched!!!
    this.setState((state, props) => ({
      isUpdating: false,
      report: {},
      comment: "данные получены",
    }));

  }

  onClickBtnFillDB() {

    this.setState((state, props) => ({
      isUpdating: true,
      comment: "данные запрошены у стороннего сервиса",
    }));

  }

  onChangeSelectSource(e) {
    this.setState((state, props) => ({
      sourceID: e.target.value,
      comment: `выбран тип данных ${this.sourseLst[e.target.value].text}`,
    }));

  }

  componentDidMount() {
    this.onClickBtnUpdate();
  }

  renderReport() {
    // {"id":1,"MTS":1667606400000,"OPEN":21165,"CLOSE":21337,"HIGH":21470,"LOW":21100,"VOLUME":1453.66566158,"createdAt":"2022-11-05T17:00:18.245Z","updatedAt":"2022-11-05T17:00:18.245Z"}
    //new Date(timestamp);
    
    if (!this.state.report) {return null;}
    
    const data = this.state.report.map((item) => {
      let record = {};
      record.name = new Date(item.MTS).toISOString().slice(0, 10);
      record.uv = item[this.state.sourceID];
      return (record);
    })
    
    const renderLineChart = (
      <LineChart width={window.innerWidth*0.9} height={400} data={data}>
        <Line type="monotone" dataKey="uv" stroke="#8884d8" />
        <XAxis dataKey="name" />
        <YAxis />
      </LineChart>
    );

    return (renderLineChart);
  }

  onChangeInputStart(e) { 
    this.setState((state, props) => ({
      startDt: new Date(e.target.valueAsNumber),
      comment: `выбрана начальная дата ${e}`,
    }));

  }
  
  onChangeInputEnd(e) {
    this.setState((state, props) => ({
      endDt: new Date(e.target.valueAsNumber),
      comment: `выбрана начальная дата ${e}`,
    }));

   }

  render() {
    let spinner = null;
    if (this.state.isUpdating) {

      spinner = (
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      );

    }

    let optionTags = Object.keys(this.sourseLst).map((key) => {
      return (<option key={key} value={key}>{this.sourseLst[key].text}</option>);
    });

    let el =

      <div className="card">
        <div className="card-header">Данные торгов</div>
        <div className="card-body">

          <h5 className="card-title">Тестовые данные торгов</h5>
          <p className="card-text">Ниже отображается график тестовых торгов с биржи bitfinex</p>

          {/* дата */}
          <div className="btn-group" role="group" aria-label="Basic example">
            <div className="input-group input-group-sm mb-3">
              <span className="input-group-text" id="inputGroup-sizing-sm">дата с</span>
              <input type="date" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" defaultValue={this.state.startDt.toISOString().slice(0, 10)} onChange={this.onChangeInputStart.bind(this)}></input>
            </div>
            <div className="input-group input-group-sm mb-3">
              <span className="input-group-text" id="inputGroup-sizing-sm">дата по</span>
              <input type="date" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" defaultValue={this.state.endDt.toISOString().slice(0, 10)} onChange={this.onChangeInputEnd.bind(this)}></input>
            </div>
            
          </div>
          <p></p>
          <button type="button" className="btn btn-primary btn-sm" onClick={this.onClickBtnUpdate.bind(this)}>Обновить данные</button>

          {/* график */}
          <div>
            {/* {JSON.stringify(this.state.report)} */}
            {this.renderReport()}
          </div>


          {/* кнопки */}
          <div className="btn-group" role="group" aria-label="Basic example">
            <button type="button" className="btn btn-danger" onClick={this.onClickBtnFillDB.bind(this)}>Получить данные с внешнего сервиса API</button>

          </div>

          <select className="form-select" aria-label="Default select example" defaultValue="0" onChange={this.onChangeSelectSource.bind(this)}>
            {optionTags}
          </select>

          <p></p>
          <div className="badge text-bg-secondary" >{this.state.comment}</div>
          {spinner}
        </div>
      </div>

    return el;
  }
}
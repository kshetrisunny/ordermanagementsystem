import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { jqxGridComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxgrid';

import { OrderService } from './order.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  @ViewChild('myGrid') myGrid: jqxGridComponent;
  @ViewChild('myWindow') myWindow: ElementRef;
  @ViewChild('personForm') personForm;

  modalRef: any;
  modalTitle = 'Edit Person';
  source: any;
  dataAdapter: any;
  columns: any[];
  editrow: number = -1;
  columnmenuopening: any;
  editPersonData = {};
  errorMsg: any;
  isDelete = false;
  deletePersonData = {};

  constructor(public orderService: OrderService ,private modalService: NgbModal) { }

  ngOnInit() {
    this.getPersonData();
  }

  getPersonData() {
    this.orderService.getPersonData().subscribe((res) => {
      this.initGrid(res);
    });
  }

initGrid(data: Array<JSON>) {
    this.source = {
      datatype: 'json',
      datafields: [
        { name: '_id', type: 'string' },
        { name: 'Name', type: 'string' },
        { name: 'Gender', type: 'string' },
        { name: 'Age', type: 'string' },
        { name: 'Mobile', type: 'string' },
      ],
      localdata: data,
      rownumbers: true,
    };
    this.dataAdapter = new jqx.dataAdapter(this.source);
    this.columns = [{
      text: '#',
      sortable: false,
      filterable: false,
      editable: false,
      groupable: false,
      draggable: false,
      resizable: false,
      datafield: '',
      columntype: 'number',
      width: '5%',
      pinned: true,
      cellrenderer: (row: number, column: any, value: number): string => {
        return '<div style="margin:4px">' + (value + 1) + '</div>';
      },
    },
      { text: 'id', datafield: '_id', hidden: true },
      { text: 'Name', datafield: 'Name' },
      { text: 'Gender', datafield: 'Gender' },
      { text: 'Age', datafield: 'Age' },
      { text: 'Mobile', datafield: 'Mobile' },
      {
        text: 'Edit',
        datafield: 'Edit',
        width: '5%',
        columntype: 'button',
        sortable: false,
        groupable: false,
        filterable: false,
        cellsrenderer: (): string => {
          return 'Edit';
        },
        buttonclick: (row: number) => {
          this.editrow = row;
          this.errorMsg = '';
          this.isDelete = false;
          const dataRecord = this.myGrid.getrowdata(this.editrow);
          this.editPersonData['_id'] = dataRecord['_id'];
          this.editPersonData['Name'] = dataRecord['Name'];
          this.editPersonData['Gender'] = dataRecord['Gender'];
          this.editPersonData['Age'] = dataRecord['Age'];
          this.editPersonData['Mobile'] = dataRecord['Mobile'];
          this.modalTitle = 'Edit Person';
          this.modalRef = this.modalService.open(this.myWindow, { size: 'lg' });
        },
      },

      {
        text: 'Delete',
        datafield: 'Delete',
        width: '5%',
        columntype: 'button',
        sortable: false,
        groupable: false, filterable: false,
        cellsrenderer: (): string => {
          return 'Delete';
        },
        buttonclick: (row: number) => {
          // get the data and append in to the inputs
          this.editrow = row;
          this.errorMsg = '';
          this.isDelete = true;
          const dataRecord = this.myGrid.getrowdata(this.editrow);
          this.deletePersonData['_id'] = dataRecord['_id'];
          this.deletePersonData['Name'] = dataRecord['Name'];
          // show the popup window.
          this.modalTitle = 'Delete Person';
          this.modalRef = this.modalService.open(this.myWindow, { size: 'lg' });
        },
      },
    ];

    this.columnmenuopening = (menu: any, datafield: any, height: any) => {
      if (datafield !== undefined) {
        menu.height(85);
      }
    };
  }

  getWidth(): string {
    return '100%';
  }

  insertNewPerson(f?: NgForm) {
    if (f) {
      f.form.reset();
    }
    this.editrow = -1;
    this.errorMsg = '';
    this.isDelete = false;
    this.editPersonData = {};
    // show the popup window.
    this.modalTitle = 'Add New User Details';
    this.modalRef = this.modalService.open(this.myWindow, { size: 'lg' });
  }

  trimInputJSON(object: JSON | any): JSON {
    return JSON.parse(JSON.stringify(object).replace(/"\s+|\s+"/g, '"'));
  }

  saveBtn(f?: NgForm) {
    this.editPersonData = this.trimInputJSON(this.editPersonData);
    const id = this.editPersonData['_id'];
    const Name = this.editPersonData['Name'];
    const Gender = this.editPersonData['Gender'];
    const Age = this.editPersonData['Age'];
    const Mobile = this.editPersonData['Mobile'];
    if (this.editrow >= 0) {
      const row = {
        '_id': id,
        'Name': Name,
        'Gender': Gender,
        'Age': Age,
        'Mobile': Mobile,
      };
      const rowID = this.myGrid.getrowid(this.editrow);
      this.orderService.updatePerson(row).subscribe((res: any) => {
        this.myGrid.updaterow(rowID, row);
        this.closeForm(f);
      });
    } else {
      const row = {
        'Name': Name,
        'Gender': Gender,
        'Age': Age,
        'Mobile': Mobile,
      };
      this.orderService.insertPerson(row).subscribe((res: any) => {
        this.getPersonData();
        this.myGrid.updatebounddata('cells');
        this.closeForm(f);
      });
    }
  }

  closeForm(f?: NgForm) {
    if (f) {
      f.form.reset();
    }
    this.modalRef.close();
  }

  onSubmit(f: NgForm) {
    this.saveBtn(f);
  }

  cancelDeletePerson() {
    this.deletePersonData = {};
    this.closeForm();
  }

  deletePerson(personId: string) {
    this.orderService.deletePerson(personId).subscribe((res) => {
      this.getPersonData();
      this.cancelDeletePerson();
      console.log(res);
    });
  }



}

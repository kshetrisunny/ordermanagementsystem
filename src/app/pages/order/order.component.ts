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
  @ViewChild('orderForm') orderForm;

  modalRef: any;
  modalTitle = 'Edit Order';
  source: any;
  dataAdapter: any;
  columns: any[];
  editrow: number = -1;
  columnmenuopening: any;
  editOrderData = {};
  errorMsg: any;
  isDelete = false;
  deleteOrderData = {};

  constructor(public orderService: OrderService ,private modalService: NgbModal) { }

  ngOnInit() {
    this.getOrderData();
  }

  getOrderData() {
    this.orderService.getOrderData().subscribe((res) => {
      this.initGrid(res);
    });
  }

initGrid(data: Array<JSON>) {
    this.source = {
      datatype: 'json',
      datafields: [
        { name: '_id', type: 'string' },
        { name: 'orderNumber', type: 'string' },
        { name: 'orderDueDate', type: 'string' },
        { name: 'customerName', type: 'string' },
        { name: 'customerAddress', type: 'string' },
        { name: 'customerPhone', type: 'string' },
        { name: 'orderTotal', type: 'string' },


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
      { text: 'Order Number', datafield: 'orderNumber' },
        { text: 'Order Due Date', datafield: 'orderDueDate' },
        { text: 'Customer Name', datafield: 'customerName' },
        { text: 'Customer Address', datafield: 'customerAddress' },
        { text: 'Customer Phone', datafield: 'customerPhone' },
        { text: 'Order Total', datafield: 'orderTotal' },
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
          this.editOrderData['_id'] = dataRecord['_id'];
          this.editOrderData['orderNumber'] = dataRecord['orderNumber'];
          this.editOrderData['orderDueDate'] = dataRecord['orderDueDate'];
          this.editOrderData['customerName'] = dataRecord['customerName'];
          this.editOrderData['customerAddress'] = dataRecord['customerAddress'];
          this.editOrderData['customerPhone'] = dataRecord['customerPhone'];
          this.editOrderData['orderTotal'] = dataRecord['orderTotal'];
          this.modalTitle = 'Edit Order';
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
          this.deleteOrderData['_id'] = dataRecord['_id'];
          this.deleteOrderData['customerName'] = dataRecord['customerName'];
          // show the popup window.
          this.modalTitle = 'Delete Order';
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

  insertNewOrder(f?: NgForm) {
    if (f) {
      f.form.reset();
    }
    this.editrow = -1;
    this.errorMsg = '';
    this.isDelete = false;
    this.editOrderData = {};
    // show the popup window.
    this.modalTitle = 'Add New Order Details';
    this.modalRef = this.modalService.open(this.myWindow, { size: 'lg' });
  }

  trimInputJSON(object: JSON | any): JSON {
    return JSON.parse(JSON.stringify(object).replace(/"\s+|\s+"/g, '"'));
  }

  saveBtn(f?: NgForm) {
    this.editOrderData = this.trimInputJSON(this.editOrderData);
    const id = this.editOrderData['_id'];
    const orderNumber = this.editOrderData['orderNumber'];
    const orderDueDate = this.editOrderData['orderDueDate'];
    const customerName = this.editOrderData['customerName'];
    const customerAddress = this.editOrderData['customerAddress'];
    const customerPhone = this.editOrderData['customerPhone'];
    const orderTotal = this.editOrderData['orderTotal'];
    
    if (this.editrow >= 0) {
      const row = {
        '_id': id,
        'orderNumber' : orderNumber,
        'orderDueDate' : orderDueDate,
        'customerName' : customerName,
        'customerAddress' : customerAddress,
        'customerPhone' : customerPhone,
        'orderTotal' : orderTotal,
      };
      const rowID = this.myGrid.getrowid(this.editrow);
      this.orderService.updateOrder(row).subscribe((res: any) => {
        this.myGrid.updaterow(rowID, row);
        this.closeForm(f);
      });
    } else {
      const row = {
        'orderNumber' : orderNumber,
        'orderDueDate' : orderDueDate,
        'customerName' : customerName,
        'customerAddress' : customerAddress,
        'customerPhone' : customerPhone,
        'orderTotal' : orderTotal,
      };
      this.orderService.insertOrder(row).subscribe((res: any) => {
        this.getOrderData();
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

  cancelDeleteOrder() {
    this.deleteOrderData = {};
    this.closeForm();
  }

  deleteOrder(orderId: string) {
    this.orderService.deleteOrder(orderId).subscribe((res) => {
      this.getOrderData();
      this.cancelDeleteOrder();
      console.log(res);
    });
  }



}

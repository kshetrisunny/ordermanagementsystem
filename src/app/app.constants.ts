import { Injectable } from '@angular/core';

@Injectable()
export class AppConstants {

    public serverUrl = 'http://localhost:3000/api/';

    public OrderCrudUrl = this.serverUrl + 'orders';
}

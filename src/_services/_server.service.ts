import 'rxjs/add/operator/map';
import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Configuration } from '../_api/api.constants';
import { ParentService } from './_parent.service';
import { Server } from '../_models/server.model';
 
@Injectable()
export class ServerService extends ParentService {
    protected actionUrl: string;
    protected headers: Headers;
 
    constructor(protected _http: Http, protected configuration: Configuration) {
        super(_http, configuration);
        this.actionUrl = this.configuration.serverWithApiUrl + 'server/';
    }

    public getCapabilities(serv: Server, options: any): Observable<string> {
        let actionUrl: string
        switch(serv.serverType) {
            case "Geoserver": 
                actionUrl = serv.serverURL + '/wms?request=getCapabilities&service=WMS'; 
                break;
            case "ArcGIS": 
                actionUrl = serv.serverURL + 'f=pjson'; 
                break;
        }
        return this._http.get(actionUrl, options)
            .map((response: Response) => response.text());
    }

    public getFolders(serv: Server, path: string, type: string, options: any): Observable<string> {
        let actionUrl: string
        switch(serv.serverType) {
            case "Geoserver": 
                actionUrl = serv.serverURL + '/wms?request=getCapabilities&service=WMS'; 
                break;
            case "ArcGIS": 
                if (type=="layer") {path += "/MapServer"}
                actionUrl = serv.serverURL + path + '?f=pjson'; 
                break;
        }     
        return this._http.get(actionUrl, options)
            .map((response: Response) => response.text());
    }
}